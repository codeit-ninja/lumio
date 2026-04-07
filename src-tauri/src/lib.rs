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
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_device_info::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        // librqbit peer/DHT churn logs ERROR for routine
                        // network failures — silence the entire crate except
                        // our own app_lib logs.
                        .level_for("librqbit", log::LevelFilter::Off)
                        .level_for("librqbit_dht", log::LevelFilter::Off)
                        .level_for("tracing", log::LevelFilter::Off)
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

                let torrent_session = librqbit::Session::new_with_opts(
                    torrent_output_dir.clone(),
                    librqbit::SessionOptions {
                        // Open a TCP listen port so peers can connect inbound.
                        // Without this librqbit can only dial out, which severely
                        // limits how many peers it finds and how fast it connects.
                        listen_port_range: Some(6881..6891),

                        // Ask the router to forward the listen port via UPnP so
                        // peers on the internet can reach us.
                        enable_upnp_port_forwarding: true,

                        // Seed well-known public trackers so we get an initial
                        // peer list immediately instead of waiting for DHT.
                        trackers: [
                            "udp://tracker.opentrackr.org:1337/announce",
                            "udp://open.stealth.si:80/announce",
                            "udp://tracker.torrent.eu.org:451/announce",
                            "udp://exodus.desync.com:6969/announce",
                        ]
                        .iter()
                        .filter_map(|u| u.parse().ok())
                        .collect(),

                        // Short timeouts so dead peers are dropped quickly and
                        // don't hog connection slots while we wait for OS TCP.
                        peer_opts: Some(librqbit::PeerConnectionOptions {
                            connect_timeout: Some(std::time::Duration::from_secs(5)),
                            read_write_timeout: Some(std::time::Duration::from_secs(10)),
                            ..Default::default()
                        }),

                        ..Default::default()
                    },
                )
                .await
                .expect("Failed to start torrent session");

                // Create shared app state
                let state = Arc::new(AppState {
                    server_port: std::sync::atomic::AtomicU16::new(0),
                    torrent_session: torrent_session,
                    torrent_output_dir: torrent_output_dir.clone(),
                    transcode_sessions: Mutex::new(HashMap::new()),
                    subtitle_sessions: Mutex::new(HashMap::new()),
                    audio_track_cache: Mutex::new(HashMap::new()),
                    subtitle_track_cache: Mutex::new(HashMap::new()),
                    ffmpeg_path,
                });

                // Start the HTTP streaming server and update the port
                let port = server::start_server(state.clone())
                    .await
                    .expect("Failed to start HTTP server");
                state
                    .server_port
                    .store(port, std::sync::atomic::Ordering::SeqCst);

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
            torrent::stop_and_remove,
            ffmpeg::probe,
            ffmpeg::transcode,
            ffmpeg::seek,
            ffmpeg::get_audio_tracks,
            ffmpeg::get_server_port,
            subtitles::subtitles,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
