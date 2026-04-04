use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::atomic::AtomicU16;
use std::sync::Arc;
use tokio::sync::Mutex;

/// Metadata for a torrent file that the frontend can play.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TorrentFile {
    pub name: String,
    pub path: String,
    pub length: u64,
    pub stream_url: String,
}

/// Info returned to the frontend after adding a torrent.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TorrentInfo {
    pub id: usize,
    pub info_hash: String,
    pub name: String,
    pub port: u16,
    pub files: Vec<TorrentFile>,
}

/// A subtitle track detected via ffprobe.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SubtitleTrack {
    pub index: usize,
    pub language: String,
    pub title: String,
    pub codec: String,
    pub url: String,
}

/// Download progress for a torrent.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TorrentProgress {
    pub info_hash: String,
    pub progress: f64,
    pub download_speed: u64,
    pub upload_speed: u64,
    pub time_remaining: f64,
}

/// An active FFmpeg transcode session.
/// The `Child` process is owned by a background watcher thread.
/// We only keep the temp paths and completion signal here.
pub struct TranscodeSession {
    pub id: String,
    pub temp_dir: PathBuf,
    pub temp_file: PathBuf,
    pub is_done: Arc<std::sync::atomic::AtomicBool>,
    /// Send to kill the ffmpeg process from the watcher thread.
    pub kill_tx: Option<std::sync::mpsc::Sender<()>>,
}

/// An active subtitle extraction session.
pub struct SubtitleSession {
    pub id: String,
    pub temp_dir: PathBuf,
    pub temp_file: PathBuf,
    pub is_done: Arc<std::sync::atomic::AtomicBool>,
}

/// Shared application state managed by Tauri.
pub struct AppState {
    /// Port the embedded HTTP server (axum) is listening on.
    pub server_port: AtomicU16,
    /// The librqbit session for BitTorrent operations.
    pub torrent_session: Arc<librqbit::Session>,
    /// The output directory where torrents are downloaded.
    pub torrent_output_dir: PathBuf,
    /// Active transcode sessions keyed by source stream URL.
    pub transcode_sessions: Mutex<HashMap<String, TranscodeSession>>,
    /// Active subtitle sessions keyed by `{stream_url}::{track_index}`.
    pub subtitle_sessions: Mutex<HashMap<String, SubtitleSession>>,
    /// Cached subtitle track metadata per source URL.
    pub subtitle_track_cache: Mutex<HashMap<String, Vec<SubtitleTrack>>>,
    /// Path to the ffmpeg binary (sidecar or system).
    pub ffmpeg_path: Option<PathBuf>,
}
