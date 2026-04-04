use crate::state::AppState;
use regex::Regex;
use std::process::{Command, Stdio};
use std::sync::Arc;
use tauri::State;

/// Codecs the browser can play natively (no transcode needed).
const BROWSER_VIDEO_CODECS: &[&str] = &["h264", "vp8", "vp9", "av1", "theora"];
const BROWSER_AUDIO_CODECS: &[&str] = &["aac", "mp3", "mp2", "opus", "vorbis", "flac"];

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProbeResult {
    pub needs_transcode: bool,
    pub duration: f64,
}

/// Probe a media file using ffmpeg to determine codec info and duration.
#[tauri::command]
pub async fn probe(
    state: State<'_, Arc<AppState>>,
    stream_url: String,
) -> Result<ProbeResult, String> {
    let ffmpeg = state
        .ffmpeg_path
        .as_ref()
        .ok_or("ffmpeg not available")?
        .clone();

    tokio::task::spawn_blocking(move || {
        let output = Command::new(&ffmpeg)
            .args([
                "-probesize",
                "10000000",
                "-analyzeduration",
                "0",
                "-i",
                &stream_url,
            ])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .map_err(|e| format!("Failed to run ffmpeg: {e}"))?;

        let stderr = String::from_utf8_lossy(&output.stderr);

        let video_re = Regex::new(r"Video:\s+(\w+)").unwrap();
        let video_codec = video_re
            .captures(&stderr)
            .and_then(|c| c.get(1))
            .map(|m| m.as_str().to_lowercase())
            .unwrap_or_default();

        let audio_re = Regex::new(r"Audio:\s+(\w+)").unwrap();
        let audio_codec = audio_re
            .captures(&stderr)
            .and_then(|c| c.get(1))
            .map(|m| m.as_str().to_lowercase())
            .unwrap_or_default();

        let needs_transcode = (!video_codec.is_empty()
            && !BROWSER_VIDEO_CODECS.contains(&video_codec.as_str()))
            || (!audio_codec.is_empty() && !BROWSER_AUDIO_CODECS.contains(&audio_codec.as_str()));

        let dur_re = Regex::new(r"Duration:\s+(\d+):(\d+):([\d.]+)").unwrap();
        let duration = dur_re
            .captures(&stderr)
            .map(|c| {
                let h: f64 = c[1].parse().unwrap_or(0.0);
                let m: f64 = c[2].parse().unwrap_or(0.0);
                let s: f64 = c[3].parse().unwrap_or(0.0);
                h * 3600.0 + m * 60.0 + s
            })
            .unwrap_or(0.0);

        log::info!(
            "[probe] video={} audio={} duration={:.1}s needs_transcode={}",
            if video_codec.is_empty() {
                "none"
            } else {
                &video_codec
            },
            if audio_codec.is_empty() {
                "none"
            } else {
                &audio_codec
            },
            duration,
            needs_transcode,
        );

        Ok::<ProbeResult, String>(ProbeResult {
            needs_transcode,
            duration,
        })
    })
    .await
    .map_err(|e| format!("Probe task failed: {e}"))?
}

/// Start an ffmpeg transcode process and return the stream URL.
#[tauri::command]
pub async fn transcode(
    state: State<'_, Arc<AppState>>,
    stream_url: String,
) -> Result<String, String> {
    let ffmpeg = state
        .ffmpeg_path
        .as_ref()
        .ok_or("ffmpeg not available")?
        .clone();

    kill_all_transcodes(&state).await;

    let session = start_transcode(&ffmpeg, &stream_url, 0.0)?;
    let url = format!(
        "http://localhost:{}/transcode/{}",
        state.server_port.load(std::sync::atomic::Ordering::SeqCst), session.id
    );

    wait_for_bytes(&session.temp_file, 65536, &session.is_done).await;

    state
        .transcode_sessions
        .lock()
        .await
        .insert(stream_url, session);

    Ok(url)
}

/// Seek: kill existing transcode, start a new one from seek offset.
#[tauri::command]
pub async fn seek(
    state: State<'_, Arc<AppState>>,
    stream_url: String,
    seek_time: f64,
) -> Result<String, String> {
    let ffmpeg = state
        .ffmpeg_path
        .as_ref()
        .ok_or("ffmpeg not available")?
        .clone();

    kill_all_transcodes(&state).await;

    let session = start_transcode(&ffmpeg, &stream_url, seek_time)?;
    let url = format!(
        "http://localhost:{}/transcode/{}",
        state.server_port.load(std::sync::atomic::Ordering::SeqCst), session.id
    );

    wait_for_bytes(&session.temp_file, 65536, &session.is_done).await;

    state
        .transcode_sessions
        .lock()
        .await
        .insert(stream_url, session);

    Ok(url)
}

async fn kill_all_transcodes(state: &AppState) {
    let mut sessions = state.transcode_sessions.lock().await;
    for (_, session) in sessions.drain() {
        if let Some(tx) = session.kill_tx {
            let _ = tx.send(());
        }
        let dir = session.temp_dir;
        std::thread::spawn(move || {
            let _ = std::fs::remove_dir_all(dir);
        });
    }
}

/// Start an ffmpeg transcode process. The Child is owned by a background
/// thread that waits for exit and signals completion via AtomicBool.
fn start_transcode(
    ffmpeg: &std::path::Path,
    src: &str,
    seek_time: f64,
) -> Result<crate::state::TranscodeSession, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let temp_dir = std::env::temp_dir().join(format!("lumio-{}", &id[..8]));
    std::fs::create_dir_all(&temp_dir).map_err(|e| format!("Failed to create temp dir: {e}"))?;
    let temp_file = temp_dir.join("out.mp4");

    let mut args: Vec<String> = Vec::new();
    if seek_time > 0.0 {
        args.extend(["-ss".into(), format!("{seek_time}")]);
    }
    args.extend(["-i".into(), src.into()]);
    args.extend([
        "-map".into(),
        "0:v:0".into(),
        "-map".into(),
        "0:a:0?".into(),
        "-c:v".into(),
        "libx264".into(),
        "-preset".into(),
        "ultrafast".into(),
        "-tune".into(),
        "zerolatency".into(),
        "-crf".into(),
        "23".into(),
        "-c:a".into(),
        "aac".into(),
        "-b:a".into(),
        "192k".into(),
    ]);
    if seek_time > 0.0 {
        args.extend(["-output_ts_offset".into(), format!("{seek_time}")]);
    }
    args.extend([
        "-movflags".into(),
        "frag_keyframe+empty_moov+default_base_moof".into(),
        "-f".into(),
        "mp4".into(),
        temp_file.to_str().unwrap().into(),
    ]);

    let mut child = Command::new(ffmpeg)
        .args(&args)
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn ffmpeg: {e}"))?;

    log::info!("[transcode] started ffmpeg pid={} id={}", child.id(), id);

    let is_done = Arc::new(std::sync::atomic::AtomicBool::new(false));
    let is_done_clone = is_done.clone();

    let (kill_tx, kill_rx) = std::sync::mpsc::channel::<()>();

    // Background thread owns the Child, waits for exit or kill signal
    std::thread::spawn(move || {
        loop {
            if kill_rx.try_recv().is_ok() {
                let _ = child.kill();
                let _ = child.wait();
                break;
            }
            match child.try_wait() {
                Ok(Some(_)) => break,
                Ok(None) => {}
                Err(_) => break,
            }
            std::thread::sleep(std::time::Duration::from_millis(100));
        }
        is_done_clone.store(true, std::sync::atomic::Ordering::SeqCst);
    });

    Ok(crate::state::TranscodeSession {
        id,
        temp_dir,
        temp_file,
        is_done,
        kill_tx: Some(kill_tx),
    })
}

async fn wait_for_bytes(
    path: &std::path::Path,
    min_bytes: u64,
    is_done: &std::sync::atomic::AtomicBool,
) {
    loop {
        if let Ok(meta) = tokio::fs::metadata(path).await {
            if meta.len() >= min_bytes {
                return;
            }
        }
        if is_done.load(std::sync::atomic::Ordering::SeqCst) {
            return;
        }
        tokio::time::sleep(std::time::Duration::from_millis(100)).await;
    }
}

/// Get the server port for the frontend to construct URLs.
#[tauri::command]
pub async fn get_server_port(state: State<'_, Arc<AppState>>) -> Result<u16, String> {
    Ok(state.server_port.load(std::sync::atomic::Ordering::SeqCst))
}
