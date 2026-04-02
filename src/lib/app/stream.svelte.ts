import type { MovieContext } from "$lib/components/movie-details";
import type { Player } from "$lib/components/ui/player";
import type { WyzieSubtitle } from "$lib/subtitles";
import type {
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

    externalTracks: Record<string, WyzieSubtitle[]> = $state.raw({});

    seeking = $state(false);

    movie: MovieContext = $state.raw()!;

    constructor(movie: MovieContext, options: StreamOption) {
        this.torrent = options.torrent;
        this.video = options.video;
        this.needTranscode = options.needTranscode;
        this.metadata = options.metadata;
        this.tracks = options.tracks;
        this.movie = movie;

        if (!this.needTranscode) {
            this.canPlay = true;
        } else {
            webtorrent.transcode(this.video!.streamUrl).then((url) => {
                this.streamUrl = url;
                this.canPlay = true;
            });
        }

        console.log(this);

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
                () => $state.snapshot(this.tracks),
                async () => {
                    const wyzie = createWyzie(PUBLIC_WYZIE_API_KEY);

                    wyzie
                        .search({
                            id:
                                this.movie.imdb.id ||
                                this.movie.omdb.imdbId ||
                                this.movie.tmdb.id,
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
}

export async function createStream(torrent: TorrentInfo, movie: MovieContext) {
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

    return new Stream(movie, {
        torrent,
        video,
        needTranscode: needsTranscode,
        metadata: { duration },
        tracks,
    });
}

export async function createStreamFromFile(path: string, movie: MovieContext) {
    const { needsTranscode, duration } = await webtorrent.probe(path);
    const mockTorrent: TorrentInfo = {
        infoHash: "",
        port: 0,
        files: [
            {
                name: path.split("/").pop()!,
                path,
                length: 0,
                streamUrl: path,
            },
        ],
    };
    const tracks = await webtorrent.subtitles(path);

    return new Stream(movie, {
        torrent: mockTorrent,
        video: mockTorrent.files[0],
        needTranscode: needsTranscode,
        metadata: { duration },
        tracks,
    });
}
