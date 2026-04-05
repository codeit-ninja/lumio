import type { UnlistenFn } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export interface TorrentFile {
    name: string;
    path: string;
    length: number;
    streamUrl: string;
}

export interface TorrentInfo {
    infoHash: string;
    port: number;
    files: TorrentFile[];
}

export interface SubtitleTrack {
    index: number;
    language: string;
    title: string;
    codec: string;
    url: string;
}

export interface TorrentProgress {
    infoHash: string;
    progress: number;
    downloadSpeed: number;
    uploadSpeed: number;
    timeRemaining: number;
}

export const webtorrent = {
    async add(magnet: string): Promise<TorrentInfo> {
        return invoke("add_torrent", { magnet });
    },

    async remove(infoHash: string): Promise<void> {
        return invoke("remove_torrent", { infoHash });
    },

    async stopAndRemove(infoHash: string): Promise<void> {
        return invoke("stop_and_remove", { infoHash });
    },

    async get(infoHash: string): Promise<TorrentInfo | null> {
        return invoke("get_torrent", { infoHash });
    },

    async probe(
        streamUrl: string,
    ): Promise<{ needsTranscode: boolean; duration: number }> {
        return invoke("probe", { streamUrl });
    },

    async seek(streamUrl: string, seekTime: number): Promise<string> {
        return invoke("seek", { streamUrl, seekTime });
    },

    async transcode(streamUrl: string): Promise<string> {
        return invoke("transcode", { streamUrl });
    },

    async subtitles(streamUrl: string): Promise<SubtitleTrack[]> {
        return invoke("subtitles", { streamUrl });
    },

    onProgress(callback: (data: TorrentProgress) => void): () => void {
        let unlisten: UnlistenFn | null = null;
        listen<TorrentProgress>("webtorrent:progress", (event) => {
            callback(event.payload);
        }).then((fn_) => {
            unlisten = fn_;
        });
        return () => {
            if (unlisten) unlisten();
        };
    },
};
