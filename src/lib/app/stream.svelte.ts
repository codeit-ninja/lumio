import type { Player, PlayerContext } from "$lib/components/ui/player";
import type { Movie } from "$lib/resources/movies.svelte";
import type { WyzieSubtitle } from "$lib/subtitles";
import type {
    AudioTrack,
    SubtitleTrack,
    TorrentFile,
    TorrentInfo,
    TorrentProgress,
} from "$lib/webtorrent";
import { groupBy } from "lodash-es";
import maxBy from "lodash-es/maxBy";
import { resource, watch } from "runed";
import { PUBLIC_WYZIE_API_KEY } from "$env/static/public";
import { createWyzie } from "$lib/subtitles";
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
    subtitleTracks: SubtitleTrack[];
    audioTracks: AudioTrack[];
};

export class Stream {
    torrent = $state.raw<TorrentInfo>();

    video = $state<TorrentFile>();

    needTranscode = $state<boolean>(false);

    canPlay = $state<boolean>(false);

    metadata = $state<Metadata>();

    progress = $state<TorrentProgress>();

    streamUrl = $derived<string>(this.video!.streamUrl);

    audioTracks: AudioTrack[] = $state.raw([]);
    subtitleTracks: SubtitleTrack[] = $state.raw([]);
    externalTracks: Record<string, WyzieSubtitle[]> = $state.raw({});
    activeAudioTrack = $state.raw<AudioTrack | undefined>(undefined);

    selectedExternalLang = $derived.by(() =>
        Object.keys(this.externalTracks).length > 0
            ? Object.keys(this.externalTracks)[0]
            : "",
    );

    seeking = $state(false);

    movie: Movie = $state.raw()!;

    isLoading = $state(false);

    constructor(movie: Movie, options: StreamOption) {
        this.torrent = options.torrent;
        this.video = options.video;
        this.needTranscode = options.needTranscode;
        this.metadata = options.metadata;
        this.subtitleTracks = options.subtitleTracks;
        this.audioTracks = options.audioTracks;
        this.movie = movie;

        if (!this.needTranscode) {
            this.canPlay = true;
        } else {
            webtorrent.transcode(this.video!.streamUrl).then((url) => {
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

            resource(
                () => $state.snapshot(this.subtitleTracks),
                async () => {
                    const wyzie = createWyzie(PUBLIC_WYZIE_API_KEY);

                    wyzie
                        .search({
                            id:
                                this.movie.id ||
                                this.movie.tmdbId.toString() ||
                                `${this.movie.title} (${this.movie.startYear})`,
                        })
                        .then((results) => {
                            console.log(results);
                            this.externalTracks = groupBy(results, "language");
                        });
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
            const newUrl = await webtorrent.seek(this.video!.streamUrl, time);
            this.streamUrl = newUrl;
            // Apply imperatively so the <Player> component does not unmount
            player.seek(newUrl, time);
        } finally {
            this.seeking = false;
        }
    }

    async setAudioTrack(
        ctx: PlayerContext,
        track: AudioTrack,
        currentTime: number,
    ) {
        if (this.seeking) {
            return;
        }

        this.seeking = true;

        try {
            // Always re-transcode from the current position with the selected
            // audio stream — this works whether we were already transcoding or
            // playing natively (native HTML5 video has no audio-track API).
            const newUrl = await webtorrent.seek(
                this.video!.streamUrl,
                currentTime,
                track.index,
            );
            this.streamUrl = newUrl;
            this.needTranscode = true;
            this.activeAudioTrack = track;
            ctx.seek(newUrl, currentTime);
        } finally {
            this.seeking = false;
        }
    }

    stop() {
        if (!this.torrent) {
            // TODO: Handle error here, this should never happen but just in case
            return;
        }

        webtorrent.stopAndRemove(this.torrent.infoHash);
    }
}

export async function createStream(torrent: TorrentInfo, movie: Movie) {
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
    const subtitleTracks = await webtorrent.subtitles(video.streamUrl);
    const audioTracks = await webtorrent.getAudioTracks(video.streamUrl);

    return new Stream(movie, {
        torrent,
        video,
        needTranscode: needsTranscode,
        metadata: { duration },
        subtitleTracks,
        audioTracks,
    });
}
