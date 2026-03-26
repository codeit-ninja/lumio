<script lang="ts">
    import { format } from "@std/fmt/duration";
    import PauseIcon from "phosphor-svelte/lib/PauseIcon";
    import PlayIcon from "phosphor-svelte/lib/PlayIcon";
    import { useApp } from "$lib/app";
    import { cn } from "$lib/utils";

    type Props = {
        src: string;
        poster?: string;
        duration?: number;
        onseek?: (time: number) => void;
        disabled?: boolean;
    };

    let { src, poster, duration, onseek, disabled = false }: Props = $props();
    let app = useApp();

    let dragging = $state(false);
    let seeking = $state(false);
    let displayTime = $state(0);
    let paused = $state(true);
    let seekOffset = $state(0);

    let playerEl: HTMLElement | null = null;
    let videoEl: HTMLVideoElement | null = null;
    let rafId: number;

    function playerAction(el: HTMLElement) {
        playerEl = el;
        function tick() {
            const video = el.querySelector<HTMLVideoElement>("video");
            if (video) {
                videoEl = video;
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
                playerEl = null;
                videoEl = null;
            },
        };
    }

    $effect(() => {
        playerEl?.setAttribute("src", src);
    });

    export function seek(newSrc: string, atTime: number) {
        seeking = false;
        seekOffset = atTime;
        displayTime = atTime;
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
                    <span>{format(displayTime)}</span>
                    <span>{format(duration!)}</span>
                </div>
            {/if}

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
        </div>
    </media-player>
{/if}
