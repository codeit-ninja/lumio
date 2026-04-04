use crate::state::{AppState, SubtitleTrack};
use regex::Regex;
use std::process::{Command, Stdio};
use std::sync::Arc;
use tauri::State;

/// Probe a media file for subtitle streams (fast metadata-only probe).
fn probe_subtitle_streams(ffmpeg: &std::path::Path, url: &str) -> Vec<SubtitleTrackMeta> {
    let output = Command::new(ffmpeg)
        .args(["-probesize", "5000000", "-analyzeduration", "0", "-i", url])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output();

    let stderr = match output {
        Ok(o) => String::from_utf8_lossy(&o.stderr).to_string(),
        Err(_) => return Vec::new(),
    };

    let re = Regex::new(r"Stream #\d+:\d+(?:\((\w+)\))?: Subtitle: (\w+)(.*)").unwrap();
    let title_re = Regex::new(r"(?i)title\s*:\s*([^,\n]+)").unwrap();

    let mut tracks = Vec::new();
    let mut idx = 0usize;

    for caps in re.captures_iter(&stderr) {
        let language = caps.get(1).map(|m| m.as_str()).unwrap_or("").to_string();
        let codec = caps.get(2).map(|m| m.as_str()).unwrap_or("").to_string();
        let rest = caps.get(3).map(|m| m.as_str()).unwrap_or("");
        let title = title_re
            .captures(rest)
            .map(|c| c[1].trim().to_string())
            .unwrap_or_else(|| {
                if !language.is_empty() {
                    language.clone()
                } else {
                    format!("Track {}", idx + 1)
                }
            });

        tracks.push(SubtitleTrackMeta {
            index: idx,
            language,
            title,
            codec,
        });
        idx += 1;
    }

    log::info!(
        "[probe-subs] {} subtitle stream(s) in {}",
        tracks.len(),
        url
    );
    tracks
}

#[derive(Debug, Clone)]
struct SubtitleTrackMeta {
    index: usize,
    language: String,
    title: String,
    codec: String,
}

/// Extract subtitles from a media stream and return track info with URLs.
#[tauri::command]
pub async fn subtitles(
    state: State<'_, Arc<AppState>>,
    stream_url: String,
) -> Result<Vec<SubtitleTrack>, String> {
    // Check cache first
    {
        let cache = state.subtitle_track_cache.lock().await;
        if let Some(cached) = cache.get(&stream_url) {
            return Ok(cached.clone());
        }
    }

    let ffmpeg = match &state.ffmpeg_path {
        Some(p) => p.clone(),
        None => return Ok(Vec::new()),
    };

    let url_clone = stream_url.clone();
    let tracks = tokio::task::spawn_blocking(move || probe_subtitle_streams(&ffmpeg, &url_clone))
        .await
        .map_err(|e| format!("Subtitle probe failed: {e}"))?;

    if tracks.is_empty() {
        let mut cache = state.subtitle_track_cache.lock().await;
        cache.insert(stream_url, Vec::new());
        return Ok(Vec::new());
    }

    // Schedule background extraction
    let ffmpeg_path = state.ffmpeg_path.as_ref().unwrap().clone();
    let server_port = state.server_port.load(std::sync::atomic::Ordering::SeqCst);
    let stream_url_clone = stream_url.clone();
    let tracks_clone = tracks.clone();
    let sessions_mutex = state.inner().clone();

    tokio::task::spawn_blocking(move || {
        schedule_extract_subtitles(
            &ffmpeg_path,
            &stream_url_clone,
            &tracks_clone,
            &sessions_mutex,
        );
    })
    .await
    .map_err(|e| format!("Subtitle extraction scheduling failed: {e}"))?;

    // Build result with URLs
    let sessions = state.subtitle_sessions.lock().await;
    let result: Vec<SubtitleTrack> = tracks
        .iter()
        .map(|t| {
            let key = format!("{}::{}", stream_url, t.index);
            let id = sessions.get(&key).map(|s| s.id.clone()).unwrap_or_default();
            SubtitleTrack {
                index: t.index,
                language: t.language.clone(),
                title: t.title.clone(),
                codec: t.codec.clone(),
                url: format!("http://localhost:{}/subtitles/{}", server_port, id),
            }
        })
        .collect();

    // Cache the result
    {
        let mut cache = state.subtitle_track_cache.lock().await;
        cache.insert(stream_url, result.clone());
    }

    Ok(result)
}

/// Fire-and-forget: spawn ffmpeg to extract all subtitle tracks as VTT.
fn schedule_extract_subtitles(
    ffmpeg: &std::path::Path,
    src: &str,
    tracks: &[SubtitleTrackMeta],
    state: &Arc<AppState>,
) {
    let batch_dir = std::env::temp_dir().join(format!(
        "lumio-sub-{}",
        uuid::Uuid::new_v4().to_string().split('-').next().unwrap()
    ));
    let _ = std::fs::create_dir_all(&batch_dir);

    let mut args: Vec<String> = vec![
        "-probesize".into(),
        "5000000".into(),
        "-analyzeduration".into(),
        "0".into(),
        "-i".into(),
        src.into(),
        "-vn".into(),
        "-an".into(),
        "-dn".into(),
    ];

    let mut pending: Vec<(String, crate::state::SubtitleSession)> = Vec::new();

    for track in tracks {
        let id = uuid::Uuid::new_v4().to_string();
        let temp_file = batch_dir.join(format!("{}.vtt", id));

        args.extend([
            "-map".into(),
            format!("0:s:{}", track.index),
            "-c:s".into(),
            "webvtt".into(),
            "-f".into(),
            "webvtt".into(),
            temp_file.to_str().unwrap().to_string(),
        ]);

        let is_done = Arc::new(std::sync::atomic::AtomicBool::new(false));

        pending.push((
            format!("{}::{}", src, track.index),
            crate::state::SubtitleSession {
                id,
                temp_dir: batch_dir.clone(),
                temp_file,
                is_done,
            },
        ));
    }

    let mut process = match Command::new(ffmpeg)
        .args(&args)
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .spawn()
    {
        Ok(p) => p,
        Err(e) => {
            log::error!("[ffmpeg-sub] Failed to spawn: {e}");
            return;
        }
    };

    // Register sessions synchronously
    let sessions_lock = state.subtitle_sessions.blocking_lock();
    let mut sessions = sessions_lock;
    // Collect done flags to signal when process ends
    let done_flags: Vec<_> = pending.iter().map(|(_, s)| s.is_done.clone()).collect();

    for (key, session) in pending {
        sessions.insert(key, session);
    }
    drop(sessions);

    // Background thread to wait for exit and signal completion
    std::thread::spawn(move || {
        let _ = process.wait();
        for is_done in done_flags {
            is_done.store(true, std::sync::atomic::Ordering::SeqCst);
        }
    });
}
