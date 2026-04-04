mod ffmpeg;
mod server;
mod state;
mod subtitles;
mod torrent;

use state::AppState;
use std::collections::HashMap;
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::Mutex;

/// Locate ffmpeg: check for Tauri sidecar binary first, then fall back to system PATH.
fn find_ffmpeg(app: &tauri::AppHandle) -> Option<std::path::PathBuf> {
    // Check Tauri sidecar location
    use tauri::Manager;
    let resource_dir = app.path().resource_dir().ok();
    if let Some(dir) = resource_dir {
        let sidecar = if cfg!(target_os = "windows") {
            dir.join("binaries").join("ffmpeg.exe")
        } else {
            dir.join("binaries").join("ffmpeg")
        };
        if sidecar.exists() {
            log::info!("ffmpeg found as sidecar at {:?}", sidecar);
            return Some(sidecar);
        }
    }

    // Check system PATH
    if let Ok(output) = std::process::Command::new("ffmpeg")
        .arg("-version")
        .output()
    {
        if output.status.success() {
            log::info!("ffmpeg found on system PATH");
            return Some(std::path::PathBuf::from("ffmpeg"));
        }
    }
    log::warn!("ffmpeg not found on PATH or as sidecar");
    None
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }

            let handle = app.handle().clone();

            // Initialize in an async block within Tauri's runtime
            tauri::async_runtime::block_on(async move {
                // Find ffmpeg
                let ffmpeg_path = find_ffmpeg(&handle);
                if ffmpeg_path.is_some() {
                    log::info!("ffmpeg found");
                } else {
                    log::warn!("ffmpeg not found — transcode/subtitle features will be disabled");
                }

                // Initialize librqbit torrent session
                let torrent_output_dir = std::env::temp_dir().join("lumio-torrents");
                let torrent_session = librqbit::Session::new(torrent_output_dir.clone())
                    .await
                    .expect("Failed to start torrent session");

                // Create shared app state
                let state = Arc::new(AppState {
                    server_port: std::sync::atomic::AtomicU16::new(0),
                    torrent_session: torrent_session,
                    torrent_output_dir: torrent_output_dir.clone(),
                    transcode_sessions: Mutex::new(HashMap::new()),
                    subtitle_sessions: Mutex::new(HashMap::new()),
                    subtitle_track_cache: Mutex::new(HashMap::new()),
                    ffmpeg_path,
                });

                // Start the HTTP streaming server and update the port
                let port = server::start_server(state.clone())
                    .await
                    .expect("Failed to start HTTP server");
                state.server_port.store(port, std::sync::atomic::Ordering::SeqCst);

                // Start progress emitter
                torrent::start_progress_emitter(handle.clone(), state.clone());

                // Register state with Tauri
                handle.manage(state);
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            torrent::add_torrent,
            torrent::remove_torrent,
            torrent::get_torrent,
            ffmpeg::probe,
            ffmpeg::transcode,
            ffmpeg::seek,
            ffmpeg::get_server_port,
            subtitles::subtitles,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
