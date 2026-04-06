import type { Movie } from "$lib/resources/movies.svelte";
import type { Stream } from "./stream.svelte";
import type { Video } from "tmdb-ts/dist/types";
import { createContext } from "svelte";
import { getNetworkInfo, getDisplayInfo } from "tauri-plugin-device-info-api";
import { createStream } from "./stream.svelte";
import { PUBLIC_WYZIE_API_KEY } from "$env/static/public";
import { createWyzie } from "$lib/subtitles";
import { TMDb } from "$lib/tmdb";
import { sortTorrents } from "$lib/torrents/sort";
import { getTorrents } from "$lib/torrents/thepiratebay";
import { createMagnetURI } from "$lib/utils";
import { webtorrent } from "$lib/webtorrent";

export class AppContext {
    category = $state<"movies" | "tv-shows">("movies");

    stream = $state<Stream>();

    trailer = $state<Video>();
    movie = $state<Movie>();

    subtitles = createWyzie(PUBLIC_WYZIE_API_KEY);

    networkInfo = $derived.by(() => getNetworkInfo());
    displayInfo = $derived.by(() => getDisplayInfo());

    mousePosition = $state({ x: 0, y: 0 });

    constructor() {
        const trackingMouseMove = (event: MouseEvent) => {
            this.mousePosition = { x: event.clientX, y: event.clientY };
        };

        $effect.root(() => {
            window.addEventListener("mousemove", trackingMouseMove);

            return () => {
                window.removeEventListener("mousemove", trackingMouseMove);
            };
        });
    }

    async findBestStream(movie: Movie) {
        const [torrents, display, network] = await Promise.all([
            getTorrents(movie),
            this.displayInfo,
            this.networkInfo,
        ]);

        const sorted = sortTorrents(torrents, display, network);
        const best = sorted.at(0);

        console.log(sorted);

        if (!best) {
            // TODO: Handle no torrents found (show message, or error etc ...)
            return;
        }

        const magnet = createMagnetURI(best.info_hash, best.name);

        return webtorrent
            .add(magnet)
            .then(async (torrent) => {
                this.stream = await createStream(torrent, movie);
                this.stream.isLoading = true;
            })
            .catch((error) => {
                console.error("Error adding torrent:", error);
            });
    }

    async watchMovie(movie: Movie) {
        return this.findBestStream(movie);
    }

    async watchTrailer(movie: Movie) {
        if (!movie.id) {
            return;
        }

        const videos = await TMDb.movies
            .videos(movie.tmdbId)
            .then((response) =>
                response.results.filter(
                    (video) =>
                        video.site === "YouTube" && video.type === "Trailer",
                ),
            );

        if (videos.length === 0) {
            return;
        }

        this.movie = movie;
        this.trailer = videos[0];
    }

    closeTrailer() {
        this.trailer = undefined;
        this.movie = undefined;
    }

    stopStream() {
        this.stream?.stop();
        this.stream = undefined;
    }
}

const [get, set] = createContext<AppContext>();
export const createApp = () => set(new AppContext());
export const useApp = get;
