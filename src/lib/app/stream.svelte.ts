import type { Player } from "$lib/components/ui/player";
import type {
    SubtitleTrack,
    TorrentFile,
    TorrentInfo,
    TorrentProgress,
} from "$lib/webtorrent";
import maxBy from "lodash-es/maxBy";
import { watch } from "runed";
import { VIDEO_EXTENSIONS } from "$lib/utils";
import { webtorrent } from "$lib/webtorrent";

export type Metadata = {
    duration: number;
};

export type StreamOption = {
    torrent: TorrentInfo;
    video: TorrentFile;
    needTranscode: boolean;
    metadata: Metadata;
    tracks: SubtitleTrack[];
};

export class Stream {
    torrent = $state.raw<TorrentInfo>();

    video = $state<TorrentFile>();

    needTranscode = $state<boolean>(false);

    canPlay = $state<boolean>(false);

    metadata = $state<Metadata>();

    progress = $state<TorrentProgress>();

    streamUrl = $derived<string>(this.video!.streamUrl);

    tracks: SubtitleTrack[] = $state.raw([]);

    seeking = $state(false);

    constructor(options: StreamOption) {
        this.torrent = options.torrent;
        this.video = options.video;
        this.needTranscode = options.needTranscode;
        this.metadata = options.metadata;
        this.tracks = options.tracks;

        if (!this.needTranscode) {
            this.canPlay = true;
        } else {
            webtorrent.transcode(this.video.streamUrl).then((url) => {
                this.streamUrl = url;
                this.canPlay = true;
            });
        }

        $effect.root(() => {
            watch(
                () => this.torrent,
                () => {
                    const unsubscribe = webtorrent.onProgress((data) => {
                        if (
                            this.torrent &&
                            data.infoHash === this.torrent.infoHash
                        ) {
                            this.progress = data;
                        }
                    });
                    return unsubscribe;
                },
            );
        });
    }

    async seek(player: Player, time: number) {
        if (this.seeking) {
            return;
        }

        this.seeking = true;

        try {
            const newUrl = await webtorrent.seek(this.streamUrl, time);
            this.streamUrl = newUrl;
            // Apply imperatively so the <Player> component does not unmount
            player.seek(newUrl, time);
        } finally {
            this.seeking = false;
        }
    }
}

export async function createStream(torrent: TorrentInfo) {
    const video = maxBy(
        torrent.files.filter((f) => VIDEO_EXTENSIONS.test(f.name)),
        "length",
    );

    if (!video) {
        throw new Error("No video file found in torrent");
    }

    const { needsTranscode, duration } = await webtorrent.probe(
        video.streamUrl,
    );
    const tracks = await webtorrent.subtitles(video.streamUrl);

    return new Stream({
        torrent,
        video,
        needTranscode: needsTranscode,
        metadata: { duration },
        tracks,
    });
}
