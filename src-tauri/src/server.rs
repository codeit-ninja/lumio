use crate::state::AppState;
use axum::{
    body::Body,
    extract::{Path, State as AxumState},
    http::{header, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use std::sync::Arc;
use tokio::io::{AsyncReadExt, AsyncSeekExt};
use tower_http::cors::CorsLayer;

/// Create the axum router with all streaming routes.
pub fn create_router(state: Arc<AppState>) -> Router {
    Router::new()
        .route(
            "/stream/{torrent_id}/{file_index}",
            get(stream_torrent_file),
        )
        .route("/transcode/{id}", get(stream_transcode))
        .route("/subtitles/{id}", get(stream_subtitle))
        .layer(CorsLayer::permissive())
        .with_state(state)
}

/// Start the HTTP server on a random port and return the port.
pub async fn start_server(state: Arc<AppState>) -> anyhow::Result<u16> {
    let router = create_router(state);
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await?;
    let port = listener.local_addr()?.port();

    tokio::spawn(async move {
        axum::serve(listener, router).await.ok();
    });

    log::info!("[server] HTTP server listening on port {}", port);
    Ok(port)
}

/// Stream a torrent file using librqbit's built-in streaming.
/// FileStream implements AsyncRead + AsyncSeek with automatic piece
/// prioritization — it waits for pieces to download before serving them.
async fn stream_torrent_file(
    AxumState(state): AxumState<Arc<AppState>>,
    Path((torrent_id, file_index)): Path<(usize, usize)>,
    headers: axum::http::HeaderMap,
) -> impl IntoResponse {
    let id = librqbit::api::TorrentIdOrHash::Id(torrent_id);

    let handle = match state.torrent_session.get(id) {
        Some(h) => h,
        None => return StatusCode::NOT_FOUND.into_response(),
    };

    // Get filename for content-type detection (borrows handle via Deref)
    let filename = handle
        .with_metadata(|meta| {
            meta.info
                .iter_file_details()
                .ok()
                .and_then(|mut iter| iter.nth(file_index))
                .map(|fd| {
                    fd.filename
                        .to_string()
                        .unwrap_or_else(|_| format!("file_{file_index}"))
                })
        })
        .ok()
        .flatten()
        .unwrap_or_else(|| format!("file_{file_index}"));

    let content_type = if filename.ends_with(".mp4") {
        "video/mp4"
    } else if filename.ends_with(".mkv") {
        "video/x-matroska"
    } else if filename.ends_with(".avi") {
        "video/x-msvideo"
    } else if filename.ends_with(".webm") {
        "video/webm"
    } else {
        "application/octet-stream"
    };

    // Create the torrent file stream (consumes the Arc<ManagedTorrent>)
    let mut file_stream = match handle.stream(file_index) {
        Ok(s) => s,
        Err(e) => {
            log::error!("[stream] failed to create file stream: {e}");
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    let total_len = file_stream.len();
    if total_len == 0 {
        return StatusCode::NOT_FOUND.into_response();
    }

    // Parse Range header for video seeking
    let range = headers
        .get(header::RANGE)
        .and_then(|v| v.to_str().ok())
        .and_then(|s| {
            let s = s.strip_prefix("bytes=")?;
            let mut parts = s.splitn(2, '-');
            let start = parts.next()?.parse::<u64>().ok()?;
            let end = parts
                .next()
                .and_then(|e| if e.is_empty() { None } else { e.parse::<u64>().ok() });
            Some((start, end))
        });

    let (start, end) = match range {
        Some((s, e)) => (s, e.unwrap_or(total_len - 1).min(total_len - 1)),
        None => (0, total_len - 1),
    };
    let content_length = end - start + 1;

    // Seek to start position if needed
    if start > 0 {
        if let Err(e) = file_stream.seek(std::io::SeekFrom::Start(start)).await {
            log::error!("[stream] seek to {start} failed: {e}");
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    }

    // Stream bytes — FileStream automatically waits for pieces to download
    let stream = async_stream::stream! {
        let mut remaining = content_length;
        let mut buf = vec![0u8; 64 * 1024];

        while remaining > 0 {
            let to_read = (remaining as usize).min(buf.len());
            match file_stream.read(&mut buf[..to_read]).await {
                Ok(0) => break,
                Ok(n) => {
                    remaining -= n as u64;
                    yield Ok::<_, std::io::Error>(bytes::Bytes::copy_from_slice(&buf[..n]));
                }
                Err(e) => {
                    log::error!("[stream] read error: {e}");
                    yield Err(e);
                    break;
                }
            }
        }
    };

    let mut builder = Response::builder()
        .header(header::CONTENT_TYPE, content_type)
        .header(header::CONTENT_LENGTH, content_length)
        .header(header::ACCEPT_RANGES, "bytes")
        .header(header::CACHE_CONTROL, "no-store");

    if range.is_some() {
        builder = builder
            .status(StatusCode::PARTIAL_CONTENT)
            .header(
                header::CONTENT_RANGE,
                format!("bytes {start}-{end}/{total_len}"),
            );
    }

    builder
        .body(Body::from_stream(stream))
        .unwrap()
        .into_response()
}

/// Stream a transcoded file (growing file written by ffmpeg).
async fn stream_transcode(
    AxumState(state): AxumState<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let (temp_file, is_done) = {
        let sessions = state.transcode_sessions.lock().await;
        let session = sessions.values().find(|s| s.id == id);
        match session {
            Some(s) => (s.temp_file.clone(), s.is_done.clone()),
            None => return StatusCode::NOT_FOUND.into_response(),
        }
    };

    let stream = async_stream::stream! {
        let mut offset = 0u64;
        loop {
            let size = match tokio::fs::metadata(&temp_file).await {
                Ok(m) => m.len(),
                Err(_) => 0,
            };

            if size > offset {
                let to_read = (size - offset) as usize;
                match tokio::fs::File::open(&temp_file).await {
                    Ok(mut file) => {
                        use tokio::io::AsyncSeekExt;
                        if file.seek(std::io::SeekFrom::Start(offset)).await.is_ok() {
                            let mut buf = vec![0u8; to_read];
                            match file.read_exact(&mut buf).await {
                                Ok(_) => {
                                    offset += to_read as u64;
                                    yield Ok::<_, std::io::Error>(bytes::Bytes::from(buf));
                                },
                                Err(_) => {}
                            }
                        }
                    }
                    Err(_) => {}
                }
            } else if is_done.load(std::sync::atomic::Ordering::SeqCst) {
                break;
            } else {
                tokio::time::sleep(std::time::Duration::from_millis(200)).await;
            }
        }
    };

    Response::builder()
        .header(header::CONTENT_TYPE, "video/mp4")
        .header(header::CACHE_CONTROL, "no-store")
        .header("Access-Control-Allow-Origin", "*")
        .body(Body::from_stream(stream))
        .unwrap()
        .into_response()
}

/// Stream a subtitle VTT file (may be growing while ffmpeg extracts).
async fn stream_subtitle(
    AxumState(state): AxumState<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let (temp_file, is_done) = {
        let sessions = state.subtitle_sessions.lock().await;
        let session = sessions.values().find(|s| s.id == id);
        match session {
            Some(s) => (s.temp_file.clone(), s.is_done.clone()),
            None => return StatusCode::NOT_FOUND.into_response(),
        }
    };

    let stream = async_stream::stream! {
        let mut offset = 0u64;
        loop {
            let size = match tokio::fs::metadata(&temp_file).await {
                Ok(m) => m.len(),
                Err(_) => 0,
            };

            if size > offset {
                let to_read = (size - offset) as usize;
                match tokio::fs::File::open(&temp_file).await {
                    Ok(mut file) => {
                        use tokio::io::AsyncSeekExt;
                        if file.seek(std::io::SeekFrom::Start(offset)).await.is_ok() {
                            let mut buf = vec![0u8; to_read];
                            match file.read_exact(&mut buf).await {
                                Ok(_) => {
                                    offset += to_read as u64;
                                    yield Ok::<_, std::io::Error>(bytes::Bytes::from(buf));
                                },
                                Err(_) => {}
                            }
                        }
                    }
                    Err(_) => {}
                }
            } else if is_done.load(std::sync::atomic::Ordering::SeqCst) {
                break;
            } else {
                tokio::time::sleep(std::time::Duration::from_millis(200)).await;
            }
        }
    };

    Response::builder()
        .header(header::CONTENT_TYPE, "text/plain; charset=utf-8")
        .header(header::CACHE_CONTROL, "no-store")
        .header("Access-Control-Allow-Origin", "*")
        .body(Body::from_stream(stream))
        .unwrap()
        .into_response()
}


