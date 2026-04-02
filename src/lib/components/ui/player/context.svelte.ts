import type { WyzieSubtitle } from "$lib/subtitles";
import type { SubtitleTrack } from "$lib/webtorrent";
import { getName } from "@cospired/i18n-iso-languages";
import { createContext } from "svelte";
import { attachTrack } from "./utils";

export type Track = {
    label: string;
    src: string;
    language: string;
};

export class PlayerContext {
    // Props — synced from player.svelte via $effect
    src = $state("");
    poster = $state<string | undefined>();
    duration = $state<number | undefined>();
    onseek = $state.raw<((time: number) => void) | undefined>(undefined);
    disabled = $state(false);
    tracks = $state.raw<SubtitleTrack[]>([]);
    needTranscode = $state(false);

    // Playback state
    paused = $state(true);
    displayTime = $state(0);
    dragging = $state(false);
    seeking = $state(false);
    seekOffset = $state(0);

    // Subtitle UI state
    showTrackMenu = $state(false);
    activeTrackIndex = $state<string | "">("");

    volume = $state(100);
    pausedAt = $state(0);
    track: Track | null = $state(null);

    // DOM refs — set by the attachment, not reactive
    playerEl: HTMLElement | null = null;
    videoEl: HTMLVideoElement | null = null;

    readonly fillPct = $derived(
        this.duration && this.duration > 0
            ? Math.min(100, (this.displayTime / this.duration) * 100)
            : 0,
    );

    togglePlay() {
        if (this.videoEl?.paused) {
            if (this.needTranscode && this.pausedAt > 0) {
                const t = this.pausedAt;
                this.pausedAt = 0;
                this.onseek?.(t);
            } else {
                this.videoEl.play().catch(() => {});
            }
        } else {
            this.pausedAt = this.displayTime;
            this.videoEl?.pause();
        }
    }

    seek(newSrc: string, atTime: number) {
        this.seekOffset = atTime;
        this.displayTime = atTime;
        this.seeking = false;
        this.playerEl?.setAttribute("src", newSrc);
    }

    async setTrack(subtitle: SubtitleTrack | WyzieSubtitle) {
        const track: Track = {
            label: getName(subtitle.language, "en") ?? subtitle.language,
            language: subtitle.language,
            src: subtitle.url,
        };
        this.track = track;
        if (this.videoEl) {
            await attachTrack(
                this.videoEl,
                track,
                this.needTranscode ? this.seekOffset : undefined,
            );
        }
    }

    /** Attach to the root `<media-player>` element via `{@attach ctx.action}`. */
    action = (el: HTMLElement): (() => void) => {
        this.playerEl = el;
        let videoCleanup: (() => void) | null = null;

        const setupVideo = (video: HTMLVideoElement) => {
            videoCleanup?.();
            this.videoEl = video;

            const onTime = () => {
                if (!this.dragging && !this.seeking) {
                    this.displayTime = video.currentTime + this.seekOffset;
                }
            };
            const onPlay = () => {
                this.paused = false;
            };
            const onPause = () => {
                this.paused = true;
            };
            const onVolume = () => {
                this.volume = video.volume * 100;
            };
            const onLoaded = () => {
                if (this.track) {
                    attachTrack(
                        video,
                        this.track,
                        this.needTranscode ? this.seekOffset : undefined,
                    );
                }
                video.play().catch(() => {});
            };

            video.addEventListener("timeupdate", onTime);
            video.addEventListener("play", onPlay);
            video.addEventListener("pause", onPause);
            video.addEventListener("volumechange", onVolume);
            video.addEventListener("loadeddata", onLoaded);

            videoCleanup = () => {
                video.removeEventListener("timeupdate", onTime);
                video.removeEventListener("play", onPlay);
                video.removeEventListener("pause", onPause);
                video.removeEventListener("volumechange", onVolume);
                video.removeEventListener("loadeddata", onLoaded);
            };
        };

        // Vidstack renders <video> asynchronously — watch for it via MutationObserver
        const observer = new MutationObserver(() => {
            const v = el.querySelector<HTMLVideoElement>("video");
            if (v && v !== this.videoEl) setupVideo(v);
        });
        observer.observe(el, { subtree: true, childList: true });

        // In case the video element is already present (e.g. on hot reload)
        const existing = el.querySelector<HTMLVideoElement>("video");
        if (existing) setupVideo(existing);

        return () => {
            videoCleanup?.();
            observer.disconnect();
            this.playerEl = null;
            this.videoEl = null;
        };
    };
}

const [get, set] = createContext<PlayerContext>();
export const createPlayer = () => set(new PlayerContext());
export const usePlayer = () => get();
