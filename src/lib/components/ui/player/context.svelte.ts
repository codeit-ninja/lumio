import type { Stream } from "$lib/app/stream.svelte";
import type { WyzieSubtitle } from "$lib/subtitles";
import type { AudioTrack, SubtitleTrack } from "$lib/webtorrent";
import type { Track } from "./utils";
import { getName } from "@cospired/i18n-iso-languages";
import { watch } from "runed";
import { createContext } from "svelte";
import { attachTrack } from "./utils";

export class PlayerContext {
    // Stream reference — set from player.svelte via $effect
    stream = $state<Stream>();
    poster = $state<string | undefined>();

    // Playback state
    paused = $derived<boolean>(this.stream?.seeking || true);
    displayTime = $state(0);
    dragging = $state(false);
    seeking = $state(false);
    seekOffset = $state(0);

    // Subtitle UI state
    showTrackMenu = $state(false);
    activeTrackIndex = $state<string | "">("");
    selectedExternalLang = $state("");

    showAudioTrackMenu = $state(false);

    volume = $state(100);
    pausedAt = $state(0);
    track: Track | null = $state(null);
    audioTrack: AudioTrack | null = $state(null);

    // DOM refs — set by the attachment, not reactive
    playerEl: HTMLElement | null = null;
    videoEl: HTMLVideoElement | null = null;

    // Derived from stream
    readonly needTranscode = $derived(this.stream?.needTranscode ?? false);
    readonly duration = $derived(this.stream?.metadata?.duration);
    readonly src = $derived(this.stream?.streamUrl ?? "");
    readonly disabled = $derived(this.stream?.seeking ?? false);
    readonly audioTracks = $derived(this.stream?.audioTracks ?? []);
    readonly subtitleTracks = $derived(this.stream?.subtitleTracks ?? []);
    readonly externalTracks = $derived(this.stream?.externalTracks ?? {});

    readonly fillPct = $derived(
        this.duration && this.duration > 0
            ? Math.min(100, (this.displayTime / this.duration) * 100)
            : 0,
    );

    constructor() {
        watch(
            () => this.stream?.seeking,
            () => {
                if (this.stream?.seeking) {
                    this.videoEl?.pause();
                }
            },
        );
    }

    togglePlay() {
        if (this.videoEl?.paused) {
            if (this.needTranscode && this.pausedAt > 0) {
                const t = this.pausedAt;
                this.pausedAt = 0;
                this.handleSeek(t);
            } else {
                this.videoEl.play().catch(() => {});
            }
        } else {
            this.pausedAt = this.displayTime;
            this.videoEl?.pause();
        }
    }

    async handleSeek(time: number) {
        if (!this.stream) return;
        const newUrl = await this.stream.seek(time);
        this.seekOffset = time;
        this.displayTime = time;
        this.seeking = false;
        this.playerEl?.setAttribute("src", newUrl);
    }

    async setTrack(subtitle: SubtitleTrack | WyzieSubtitle) {
        this.track = {
            label: getName(subtitle.language, "en") ?? subtitle.language,
            language: subtitle.language,
            src: subtitle.url,
        };

        if (this.videoEl) {
            await attachTrack(
                this.videoEl,
                this.track,
                this.needTranscode ? this.seekOffset : undefined,
            );
        }
    }

    async setAudioTrack(track: AudioTrack) {
        this.showAudioTrackMenu = false;

        if (!this.stream) {
            return;
        }

        const newUrl = await this.stream.setAudioTrack(track, this.displayTime);

        this.audioTrack = track;
        this.seekOffset = this.displayTime;
        this.seeking = false;
        this.playerEl?.setAttribute("src", newUrl);
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
