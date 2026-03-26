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

declare global {
    interface Window {
        webtorrent: {
            add(magnet: string): Promise<TorrentInfo>;
            remove(infoHash: string): Promise<void>;
            get(infoHash: string): Promise<TorrentInfo | null>;
            probe(
                streamUrl: string,
            ): Promise<{ needsTranscode: boolean; duration: number }>;
            seek(streamUrl: string, seekTime: number): Promise<string>;
            transcode(streamUrl: string): Promise<string>;
            subtitles(streamUrl: string): Promise<SubtitleTrack[]>;
            onProgress(callback: (data: TorrentProgress) => void): () => void;
        };
    }
}

export const webtorrent = window.webtorrent;
