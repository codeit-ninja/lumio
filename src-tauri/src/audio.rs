/// Assigns a unique audio session grouping GUID to all audio sessions that
/// belong to this process and its WebView2 child processes.
///
/// Without this, Windows lumps all WebView2-based apps under the same
/// `msedgewebview2.exe` entry in the Volume Mixer, meaning changing the
/// output device for Lumio would affect every other WebView2 app.
pub fn init() {
    #[cfg(target_os = "windows")]
    std::thread::spawn(|| {
        // Initial scan: catch sessions that open during the first ~60 s of
        // app startup (e.g. UI sounds, early WebView2 init).
        for i in 0..12 {
            if i > 0 {
                std::thread::sleep(std::time::Duration::from_secs(5));
            }
            imp::apply_grouping();
        }
    });
}

/// Tauri command — call this from the frontend the moment video playback
/// starts so the WebView2 audio session gets tagged immediately.
#[tauri::command]
pub fn refresh_audio_session() {
    #[cfg(target_os = "windows")]
    imp::apply_grouping();
}

#[cfg(target_os = "windows")]
mod imp {
    use windows::core::{GUID, HSTRING, Interface, PCWSTR};
    use windows::Win32::{
        Foundation::CloseHandle,
        Media::Audio::{
            eConsole, eRender, IAudioSessionControl, IAudioSessionControl2,
            IAudioSessionManager2, IMMDeviceEnumerator, MMDeviceEnumerator,
        },
        System::Com::{CoCreateInstance, CoInitializeEx, CLSCTX_ALL, COINIT_MULTITHREADED},
        System::Diagnostics::ToolHelp::{
            CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W,
            TH32CS_SNAPPROCESS,
        },
    };

    // Unique GUID for Lumio — generated once, never changes.
    // Windows uses this to group audio sessions under a single Volume Mixer entry.
    const LUMIO_AUDIO_GUID: GUID =
        GUID::from_u128(0x6a8b9c0d_1e2f_3a4b_5c6d_7e8f90a1b2c3u128);

    /// Returns the PID of this process plus all descendant PIDs (breadth-first).
    fn descendant_pids(root: u32) -> Vec<u32> {
        let mut result = vec![root];

        unsafe {
            let Ok(snap) = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0) else {
                return result;
            };

            let mut entry: PROCESSENTRY32W = std::mem::zeroed();
            entry.dwSize = std::mem::size_of::<PROCESSENTRY32W>() as u32;

            let mut all: Vec<(u32, u32)> = Vec::new();
            if Process32FirstW(snap, &mut entry).is_ok() {
                loop {
                    all.push((entry.th32ProcessID, entry.th32ParentProcessID));
                    if Process32NextW(snap, &mut entry).is_err() {
                        break;
                    }
                }
            }
            let _ = CloseHandle(snap);

            // BFS expansion
            let mut queue = vec![root];
            while let Some(parent) = queue.pop() {
                for &(pid, ppid) in &all {
                    if ppid == parent && !result.contains(&pid) {
                        result.push(pid);
                        queue.push(pid);
                    }
                }
            }
        }

        result
    }

    pub fn apply_grouping() {
        // Build exe path HSTRING once so the pointer stays alive for the whole call.
        let exe_hstring: Option<HSTRING> = std::env::current_exe()
            .ok()
            .and_then(|p| p.to_str().map(HSTRING::from));
        let icon_pcwstr = exe_hstring
            .as_ref()
            .map(|h| PCWSTR(h.as_ptr()))
            .unwrap_or(PCWSTR::null());

        let display_name = HSTRING::from("Lumio");

        unsafe {
            // Each thread needs its own COM initialisation.
            let _ = CoInitializeEx(None, COINIT_MULTITHREADED);

            let Ok(enumerator) = CoCreateInstance::<_, IMMDeviceEnumerator>(
                &MMDeviceEnumerator,
                None,
                CLSCTX_ALL,
            ) else {
                return;
            };

            let Ok(device) = enumerator.GetDefaultAudioEndpoint(eRender, eConsole) else {
                return;
            };

            let Ok(manager) = device.Activate::<IAudioSessionManager2>(CLSCTX_ALL, None) else {
                return;
            };

            let Ok(session_enum) = manager.GetSessionEnumerator() else {
                return;
            };

            let Ok(count) = session_enum.GetCount() else {
                return;
            };

            let pids = descendant_pids(std::process::id());

            for i in 0..count {
                let Ok(control) = session_enum.GetSession(i) else {
                    continue;
                };
                let Ok(control2) = control.cast::<IAudioSessionControl2>() else {
                    continue;
                };
                let Ok(pid): Result<u32, _> = control2.GetProcessId() else {
                    continue;
                };
                if pids.contains(&pid) {
                    let _ = control2.SetGroupingParam(&LUMIO_AUDIO_GUID, &GUID::zeroed());
                    // Cast back to base interface to set display name and icon.
                    if let Ok(ctrl1) = control2.cast::<IAudioSessionControl>() {
                        let _ = ctrl1.SetDisplayName(
                            PCWSTR(display_name.as_ptr()),
                            &GUID::zeroed(),
                        );
                        if !icon_pcwstr.is_null() {
                            let _ = ctrl1.SetIconPath(icon_pcwstr, &GUID::zeroed());
                        }
                    }
                }
            }
        }
    }
}
