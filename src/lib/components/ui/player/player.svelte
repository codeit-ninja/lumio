<script module lang="ts">
    // VTT parsing utilities — pure functions, live outside the component instance

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

    /** Parse a VTT cue block and return a VTTCue with timestamps offset by `offset` seconds */
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
        if (end <= 0) return null; // cue is entirely before the seek point
        const text = lines.slice(timingIdx + 1).join("\n");
        if (!text) return null;
        return new VTTCue(Math.max(0, start), end, text);
    }

    /** Stream a VTT file into a TextTrack, adjusting all timestamps by `offset` seconds */
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
</script>

<script lang="ts">
    import type { SubtitleTrack } from "$lib/webtorrent";
    import PauseIcon from "phosphor-svelte/lib/PauseIcon";
    import PlayIcon from "phosphor-svelte/lib/PlayIcon";
    import SubtitlesIcon from "phosphor-svelte/lib/SubtitlesIcon";
    import { SvelteMap } from "svelte/reactivity";
    import { useApp } from "$lib/app";
    import { cn, formatTime } from "$lib/utils";

    type Props = {
        src: string;
        poster?: string;
        duration?: number;
        onseek?: (time: number) => void;
        disabled?: boolean;
        tracks?: SubtitleTrack[];
    };

    let {
        src,
        poster,
        duration,
        onseek,
        disabled = false,
        tracks = [],
    }: Props = $props();
    let app = useApp();

    // Playback state
    let paused = $state(true);
    let displayTime = $state(0);
    let dragging = $state(false);
    let seeking = $state(false);
    let seekOffset = $state(0);

    // Subtitle UI state
    let showTrackMenu = $state(false);
    let activeTrackIndex = $state<number | null>(null);

    // DOM references — not reactive, managed by the playerAction
    let playerEl: HTMLElement | null = null;
    let videoEl: HTMLVideoElement | null = null;
    let rafId: number;

    // Subtitle track state — SvelteMap required by the linter; not used reactively in template
    const nativeTracks = new SvelteMap<number, TextTrack>();
    const fetchControllers = new SvelteMap<number, AbortController>();

    function attachSubtitleTracks(video: HTMLVideoElement, offset: number) {
        for (const st of tracks) {
            if (nativeTracks.has(st.index)) continue;
            const nt = video.addTextTrack(
                "subtitles",
                st.title,
                st.language || "und",
            );
            // Restore the user's active track selection across seeks
            nt.mode = st.index === activeTrackIndex ? "showing" : "hidden";
            nativeTracks.set(st.index, nt);
            const ac = new AbortController();
            fetchControllers.set(st.index, ac);
            streamVTT(st.url, nt, ac.signal, offset);
        }
    }

    function setActiveTrack(index: number | null) {
        activeTrackIndex = index;
        showTrackMenu = false;
        for (const [idx, nt] of nativeTracks) {
            nt.mode = idx === index ? "showing" : "hidden";
        }
    }

    function playerAction(el: HTMLElement) {
        playerEl = el;

        function tick() {
            const video = el.querySelector<HTMLVideoElement>("video");
            if (video) {
                if (videoEl !== video) {
                    videoEl = video;
                    if (tracks.length > 0)
                        attachSubtitleTracks(video, seekOffset);
                }
                if (!dragging && !seeking)
                    displayTime = video.currentTime + seekOffset;
                paused = video.paused;
            }
            rafId = requestAnimationFrame(tick);
        }

        rafId = requestAnimationFrame(tick);
        return {
            destroy() {
                cancelAnimationFrame(rafId);
                for (const ac of fetchControllers.values()) ac.abort();
                fetchControllers.clear();
                nativeTracks.clear();
                playerEl = null;
                videoEl = null;
            },
        };
    }

    $effect(() => {
        playerEl?.setAttribute("src", src);
    });

    export function seek(newSrc: string, atTime: number) {
        seekOffset = atTime;
        displayTime = atTime;
        seeking = false;
        // Hide old tracks immediately so stale cues don't flash during the load
        for (const nt of nativeTracks.values()) nt.mode = "hidden";
        // Abort in-flight VTT fetches and wipe state. Setting videoEl=null makes
        // tick() treat the very next frame as a new video element, re-running
        // attachSubtitleTracks with the updated seekOffset and active track mode.
        for (const ac of fetchControllers.values()) ac.abort();
        fetchControllers.clear();
        nativeTracks.clear();
        videoEl = null;
        playerEl?.setAttribute("src", newSrc);
    }

    const fillPct = $derived(
        duration && duration > 0
            ? Math.min(100, (displayTime / duration) * 100)
            : 0,
    );

    function togglePlay() {
        if (videoEl?.paused) videoEl.play().catch(() => {});
        else videoEl?.pause();
    }
</script>

{#if app.stream}
    <media-player
        {src}
        class="block! relative group/media overflow-clip"
        use:playerAction
    >
        <media-provider>
            {#if poster}
                <media-poster
                    class="absolute inset-0 block h-full w-full rounded-md bg-black opacity-0 transition-opacity data-visible:opacity-100 [&>img]:h-full [&>img]:w-full [&>img]:object-cover"
                    src={poster}
                >
                </media-poster>
            {/if}
        </media-provider>

        <!-- Custom controls overlay -->
        <div
            class={cn(
                "flex items-center flex-col gap-4 [&_svg]:size-8",
                "text-white absolute left-0 right-0 p-6 z-20",
                "transition-[bottom] duration-200",
                paused ? "bottom-0" : "-bottom-40 group-hover/media:bottom-0",
            )}
        >
            {#if app.stream.needTranscode}
                <!-- Custom seek slider -->
                <div class="relative w-full h-2 cursor-pointer group/slider">
                    <!-- Track -->
                    <div
                        class="absolute inset-0 bg-gray-400/20 backdrop-blur-md rounded-full"
                    ></div>
                    <!-- Fill -->
                    <div
                        class="absolute inset-y-0 left-0 bg-primary-500 rounded-full will-change-[width]"
                        style="width: {fillPct}%"
                    ></div>
                    <!-- Thumb -->
                    <div
                        class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-primary-500 will-change-[left]"
                        style="left: {fillPct}%"
                    ></div>
                    <!-- Transparent range input -->
                    <input
                        type="range"
                        min="0"
                        max={duration}
                        step="1"
                        bind:value={displayTime}
                        {disabled}
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        oninput={() => (dragging = true)}
                        onchange={(e) => {
                            dragging = false;
                            seeking = true;
                            displayTime = parseFloat(e.currentTarget.value);
                            onseek!(displayTime);
                        }}
                    />
                </div>
                <div
                    class="flex justify-between w-full text-xs text-gray-300/70 select-none"
                >
                    <span>{formatTime(displayTime)}</span>
                    <span>{formatTime(duration!)}</span>
                </div>
            {/if}

            <div class="flex items-center gap-4">
                <!-- Play/pause button -->
                <button
                    class={cn(
                        "cursor-pointer rounded-full size-18 backdrop-blur-md grid place-items-center",
                        "bg-gray-400/50 text-gray-200",
                    )}
                    onclick={togglePlay}
                >
                    {#if paused}
                        <PlayIcon weight="light" />
                    {:else}
                        <PauseIcon weight="light" />
                    {/if}
                </button>

                <!-- Subtitle picker -->
                {#if tracks.length > 0}
                    <div class="relative">
                        <button
                            class={cn(
                                "cursor-pointer rounded-full size-10 backdrop-blur-md grid place-items-center [&_svg]:size-5",
                                activeTrackIndex !== null
                                    ? "bg-primary-500/80 text-white"
                                    : "bg-gray-400/50 text-gray-200",
                            )}
                            onclick={() => (showTrackMenu = !showTrackMenu)}
                        >
                            <SubtitlesIcon weight="light" />
                        </button>

                        {#if showTrackMenu}
                            <div
                                class="absolute bottom-12 left-1/2 -translate-x-1/2 min-w-36 rounded-lg backdrop-blur-md bg-gray-900/80 text-sm text-white shadow-xl overflow-hidden"
                            >
                                <button
                                    class={cn(
                                        "w-full px-4 py-2 text-left hover:bg-white/10 transition-colors",
                                        activeTrackIndex === null &&
                                            "text-primary-400",
                                    )}
                                    onclick={() => setActiveTrack(null)}
                                >
                                    Off
                                </button>
                                {#each tracks as track (track.index)}
                                    <button
                                        class={cn(
                                            "w-full px-4 py-2 text-left hover:bg-white/10 transition-colors",
                                            activeTrackIndex === track.index &&
                                                "text-primary-400",
                                        )}
                                        onclick={() =>
                                            setActiveTrack(track.index)}
                                    >
                                        {track.title ||
                                            track.language ||
                                            `Track ${track.index + 1}`}
                                    </button>
                                {/each}
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
    </media-player>
{/if}
