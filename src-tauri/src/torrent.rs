use crate::ffmpeg::kill_all_transcodes;
use crate::state::{AppState, TorrentFile, TorrentInfo, TorrentProgress};
use librqbit::api::TorrentIdOrHash;
use librqbit_core::hash_id::Id;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, State};

/// Convert an Id<20> to a hex string.
fn id20_to_hex(id: &Id<20>) -> String {
    id.0.iter().map(|b| format!("{b:02x}")).collect()
}

/// Parse a hex info_hash string into a TorrentIdOrHash.
fn parse_info_hash(hex: &str) -> Result<TorrentIdOrHash, String> {
    if hex.len() != 40 {
        return Err(format!(
            "Invalid info hash length: {} (expected 40)",
            hex.len()
        ));
    }
    let mut arr = [0u8; 20];
    for i in 0..20 {
        arr[i] = u8::from_str_radix(&hex[i * 2..i * 2 + 2], 16)
            .map_err(|e| format!("Invalid hex: {e}"))?;
    }
    Ok(TorrentIdOrHash::Hash(Id(arr)))
}

#[tauri::command]
pub async fn add_torrent(
    state: State<'_, Arc<AppState>>,
    magnet: String,
) -> Result<TorrentInfo, String> {
    let session = &state.torrent_session;

    let add_result = session
        .add_torrent(
            librqbit::AddTorrent::from_url(&magnet),
            Some(librqbit::AddTorrentOptions {
                overwrite: true,
                ..Default::default()
            }),
        )
        .await
        .map_err(|e| format!("Failed to add torrent: {e}"))?;

    let (id, handle) = match add_result {
        librqbit::AddTorrentResponse::Added(id, h)
        | librqbit::AddTorrentResponse::AlreadyManaged(id, h) => (id, h),
        librqbit::AddTorrentResponse::ListOnly(_) => {
            return Err("Torrent was list-only".into());
        }
    };

    // Wait for metadata to be fetched
    handle
        .wait_until_initialized()
        .await
        .map_err(|e| format!("Failed to initialize torrent: {e}"))?;

    let info_hash = id20_to_hex(&handle.info_hash());
    let name = handle.name().unwrap_or_else(|| "Unknown".into());

    // Build file list from metadata
    let port = state.server_port.load(std::sync::atomic::Ordering::SeqCst);
    let files = handle
        .with_metadata(|meta| match meta.info.iter_file_details() {
            Ok(iter) => iter
                .enumerate()
                .map(|(i, fd)| {
                    let fname = fd.filename.to_string().unwrap_or_else(|_| "unknown".into());
                    TorrentFile {
                        name: fname.clone(),
                        path: fname,
                        length: fd.len,
                        stream_url: format!("http://localhost:{}/stream/{}/{}", port, id, i),
                    }
                })
                .collect::<Vec<_>>(),
            Err(_) => Vec::new(),
        })
        .unwrap_or_else(|_| Vec::new());

    Ok(TorrentInfo {
        id,
        info_hash,
        name,
        port,
        files,
    })
}

#[tauri::command]
pub async fn remove_torrent(
    state: State<'_, Arc<AppState>>,
    info_hash: String,
) -> Result<(), String> {
    let id = parse_info_hash(&info_hash)?;
    state
        .torrent_session
        .delete(id, true)
        .await
        .map_err(|e| format!("Failed to remove torrent: {e}"))?;
    Ok(())
}

#[tauri::command]
pub async fn stop_and_remove(
    state: State<'_, Arc<AppState>>,
    info_hash: String,
) -> Result<(), String> {
    kill_all_transcodes(&state).await;
    let id = parse_info_hash(&info_hash)?;
    state
        .torrent_session
        .delete(id, true)
        .await
        .map_err(|e| format!("Failed to remove torrent: {e}"))?;
    Ok(())
}

#[tauri::command]
pub async fn get_torrent(
    state: State<'_, Arc<AppState>>,
    info_hash: String,
) -> Result<Option<TorrentInfo>, String> {
    let id = parse_info_hash(&info_hash)?;

    match state.torrent_session.get(id) {
        Some(handle) => {
            let torrent_id = handle.id();
            let hash_str = id20_to_hex(&handle.info_hash());
            let name = handle.name().unwrap_or_default();

            let port = state.server_port.load(std::sync::atomic::Ordering::SeqCst);
            let files = handle
                .with_metadata(|meta| match meta.info.iter_file_details() {
                    Ok(iter) => iter
                        .enumerate()
                        .map(|(i, fd)| {
                            let fname =
                                fd.filename.to_string().unwrap_or_else(|_| "unknown".into());
                            TorrentFile {
                                name: fname.clone(),
                                path: fname,
                                length: fd.len,
                                stream_url: format!(
                                    "http://localhost:{}/stream/{}/{}",
                                    port, torrent_id, i
                                ),
                            }
                        })
                        .collect::<Vec<_>>(),
                    Err(_) => Vec::new(),
                })
                .unwrap_or_else(|_| Vec::new());

            Ok(Some(TorrentInfo {
                id: torrent_id,
                info_hash: hash_str,
                name,
                port: state.server_port.load(std::sync::atomic::Ordering::SeqCst),
                files,
            }))
        }
        None => Ok(None),
    }
}

/// Background task emitting torrent progress to the frontend.
pub fn start_progress_emitter(app: AppHandle, state: Arc<AppState>) {
    tauri::async_runtime::spawn(async move {
        let last_bytes: std::sync::Mutex<std::collections::HashMap<String, u64>> =
            std::sync::Mutex::new(std::collections::HashMap::new());

        loop {
            tokio::time::sleep(std::time::Duration::from_secs(1)).await;

            state.torrent_session.with_torrents(|iter| {
                let mut lb = last_bytes.lock().unwrap();
                for (_, handle) in iter {
                    let stats = handle.stats();
                    let info_hash = id20_to_hex(&handle.info_hash());

                    let total = stats.total_bytes.max(1) as f64;
                    let downloaded = stats.progress_bytes as f64;

                    // Estimate speed from bytes delta over 1 second
                    let prev = lb.get(&info_hash).copied().unwrap_or(0);
                    let speed = stats.progress_bytes.saturating_sub(prev);
                    lb.insert(info_hash.clone(), stats.progress_bytes);

                    let progress = TorrentProgress {
                        info_hash,
                        progress: downloaded / total,
                        download_speed: speed,
                        upload_speed: 0, // upload tracking not available in TorrentStats
                        time_remaining: if speed > 0 && downloaded < total {
                            (total - downloaded) / speed as f64
                        } else {
                            0.0
                        },
                    };
                    let _ = app.emit("webtorrent:progress", &progress);
                }
            });
        }
    });
}
