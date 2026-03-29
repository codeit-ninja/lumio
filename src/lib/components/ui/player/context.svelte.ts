import type { SubtitleTrack } from "$lib/webtorrent";
import { createContext } from "svelte";
import { SvelteMap } from "svelte/reactivity";

// ─── VTT streaming utilities ──────────────────────────────────────────────────

function parseVTTTime(t: string): number {
    const parts = t.trim().split(":");
    if (parts.length === 3)
        return (
            parseInt(parts[0]) * 3600 +
            parseInt(parts[1]) * 60 +
            parseFloat(parts[2])
        );
    return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
}

function parseVTTCue(block: string, offset: number): VTTCue | null {
    const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
    const timingIdx = lines.findIndex((l) => l.includes("-->"));
    if (timingIdx === -1) return null;
    const m = lines[timingIdx].match(/^([\d:.]+)\s*-->\s*([\d:.]+)/);
    if (!m) return null;
    const start = parseVTTTime(m[1]) - offset;
    const end = parseVTTTime(m[2]) - offset;
    if (end <= 0) return null;
    const text = lines.slice(timingIdx + 1).join("\n");
    if (!text) return null;
    const cue = new VTTCue(Math.max(0, start), end, text);
    cue.line = -3; // lift cues 2 lines up from the bottom edge
    return cue;
}

async function streamVTT(
    url: string,
    track: TextTrack,
    signal: AbortSignal,
    offset: number,
) {
    let resp: Response;
    try {
        resp = await fetch(url, { signal });
    } catch {
        return;
    }
    if (!resp.body) return;

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        let done: boolean, value: Uint8Array | undefined;
        try {
            ({ done, value } = await reader.read());
        } catch {
            break;
        }
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split(/\n\n+/);
        buffer = parts.pop()!;
        for (const block of parts) {
            const cue = parseVTTCue(block, offset);
            if (cue)
                try {
                    track.addCue(cue);
                } catch {
                    /* duplicate */
                }
        }
    }

    if (buffer.trim()) {
        const cue = parseVTTCue(buffer, offset);
        if (cue)
            try {
                track.addCue(cue);
            } catch {
                /* duplicate */
            }
    }
}

// ─── Player context ───────────────────────────────────────────────────────────

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

    // DOM refs — not reactive, managed by the action
    playerEl: HTMLElement | null = null;
    videoEl: HTMLVideoElement | null = null;

    private rafId = 0;
    readonly nativeTracks = new SvelteMap<number, TextTrack>();
    readonly fetchControllers = new SvelteMap<number, AbortController>();

    readonly fillPct = $derived(
        this.duration && this.duration > 0
            ? Math.min(100, (this.displayTime / this.duration) * 100)
            : 0,
    );

    // ── Subtitle management ──────────────────────────────────────────────────

    attachSubtitleTracks(video: HTMLVideoElement, offset: number) {
        for (const st of this.tracks) {
            if (this.nativeTracks.has(st.index)) continue;
            const nt = video.addTextTrack(
                "subtitles",
                st.title,
                st.language || "und",
            );
            nt.mode =
                st.index.toString() === this.activeTrackIndex
                    ? "showing"
                    : "hidden";
            this.nativeTracks.set(st.index, nt);
            const ac = new AbortController();
            this.fetchControllers.set(st.index, ac);
            streamVTT(st.url, nt, ac.signal, offset);
        }
    }

    setActiveTrack(index: number | undefined) {
        this.activeTrackIndex = index !== undefined ? index.toString() : "off";
        this.showTrackMenu = false;
        for (const [idx, nt] of this.nativeTracks) {
            nt.mode =
                idx.toString() === this.activeTrackIndex ? "showing" : "hidden";
        }
    }

    togglePlay() {
        if (this.videoEl?.paused) {
            if (this.needTranscode && this.pausedAt > 0) {
                // Re-transcode from the saved pause position so the video
                // resumes at the right timestamp instead of restarting at 0.
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

    /**
     * Imperatively seek to `atTime`. Wipes all in-flight subtitle fetches and
     * native tracks so they are re-streamed with the new time offset on the
     * next RAF tick after Vidstack loads `newSrc`.
     */
    seek(newSrc: string, atTime: number) {
        this.seekOffset = atTime;
        this.displayTime = atTime;
        this.seeking = false;

        for (const nt of this.nativeTracks.values()) {
            nt.mode = "hidden";
        }

        for (const ac of this.fetchControllers.values()) {
            ac.abort();
        }

        this.fetchControllers.clear();
        this.nativeTracks.clear();
        // Setting videoEl = null causes the next tick to treat the new video
        // element as fresh and re-attach subtitle tracks with the new offset.
        this.videoEl = null;
        this.playerEl?.setAttribute("src", newSrc);
    }

    // ── RAF loop ─────────────────────────────────────────────────────────────

    private tick = () => {
        if (this.playerEl) {
            const video =
                this.playerEl.querySelector<HTMLVideoElement>("video");
            if (video) {
                if (this.videoEl !== video) {
                    this.videoEl = video;

                    if (this.tracks.length > 0) {
                        this.attachSubtitleTracks(video, this.seekOffset);
                    }

                    this.videoEl.addEventListener("loadeddata", () => {
                        this.videoEl?.play();
                    });
                }

                if (!this.dragging && !this.seeking) {
                    this.displayTime = video.currentTime + this.seekOffset;
                } else {
                    this.videoEl?.pause();
                }

                this.paused = video.paused;
                this.volume = video.volume * 100;
            }
        }

        this.rafId = requestAnimationFrame(this.tick);
    };

    // ── Svelte action ────────────────────────────────────────────────────────

    /** Attach to the root `<media-player>` element via `use:ctx.action`. */
    action = (el: HTMLElement) => {
        this.playerEl = el;
        this.rafId = requestAnimationFrame(this.tick);
        return {
            destroy: () => {
                cancelAnimationFrame(this.rafId);
                for (const ac of this.fetchControllers.values()) ac.abort();
                this.fetchControllers.clear();
                this.nativeTracks.clear();
                this.playerEl = null;
                this.videoEl = null;
            },
        };
    };
}

const [get, set] = createContext<PlayerContext>();
export const createPlayer = () => set(new PlayerContext());
export const usePlayer = () => get();
