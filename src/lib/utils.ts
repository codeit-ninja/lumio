import type { ClassValue } from "svelte/elements";
import { twMerge } from "tailwind-merge";
import { env } from "$env/dynamic/public";

export const cn = (...classes: (ClassValue | null | undefined | false)[]) => {
    return twMerge(...(classes.filter(Boolean) as string[]));
};

export const getTMDBImageURL = (path: string, size: string = "original") => {
    return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getOMDBPostURL = (imdbId: string, h: number = 500) => {
    return `https://img.omdbapi.com/?i=${imdbId}&h=${h}&apikey=${env.PUBLIC_OMDB_API_KEY}`;
};

const TRACKERS = [
    // WebRTC (wss) trackers
    "wss://tracker.openwebtorrent.com",
    "wss://tracker.webtorrent.dev",
    "wss://tracker.btorrent.xyz",
    "wss://tracker.fastcast.nz",
    // UDP/HTTP trackers
    "udp://tracker.opentrackr.org:1337/announce",
    "udp://tracker.openbittorrent.com:6969/announce",
    "udp://open.demonii.com:1337/announce",
    "udp://open.stealth.si:80/announce",
];

export const createMagnetURI = (hash: string, name: string) => {
    const trackerParams = TRACKERS.map(
        (t) => `&tr=${encodeURIComponent(t)}`,
    ).join("");
    return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(name)}${trackerParams}`;
};

export const VIDEO_EXTENSIONS = /\.(mp4|mkv|avi|mov|webm|m4v|ts)$/i;

export function formatTime(s: number): string {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0
        ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
        : `${m}:${String(sec).padStart(2, "0")}`;
}

export function srt2vtt(srt: string): string {
    let vtt = "WEBVTT\n\n" + srt.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    vtt = vtt.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");

    return vtt;
}

export function fetchSRT(url: string): Promise<string> {
    return fetch(url)
        .then((res) => res.text())
        .then(srt2vtt)
        .catch(() => {
            throw new Error("Failed to fetch subtitles");
        });
}

export const formatNumber = (num: number): string => {
    const formatter = Intl.NumberFormat("en", { notation: "compact" });
    return formatter.format(num);
};

export function preventDefault(handler: (e: Event) => void) {
    return (e: Event) => {
        e.preventDefault();
        handler(e);
    };
}
