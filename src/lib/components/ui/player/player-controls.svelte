<script lang="ts">
    import CornersInIcon from "phosphor-svelte/lib/CornersInIcon";
    import CornersOutIcon from "phosphor-svelte/lib/CornersOutIcon";
    import PauseIcon from "phosphor-svelte/lib/PauseIcon";
    import PlayIcon from "phosphor-svelte/lib/PlayIcon";
    import SpeakerHighIcon from "phosphor-svelte/lib/SpeakerHighIcon";
    import SpeakerLowIcon from "phosphor-svelte/lib/SpeakerLowIcon";
    import SpeakerNoneIcon from "phosphor-svelte/lib/SpeakerXIcon";
    import { usePlayer } from "./context.svelte";
    import PlayerAudioTracks from "./player-audio-tracks.svelte";
    import PlayerSeekBar from "./player-seek-bar.svelte";
    import PlayerSubtitles from "./player-subtitles.svelte";
    import { cn } from "$lib/utils";

    const ctx = usePlayer();
</script>

<div
    class={cn(
        "flex items-center flex-col gap-4 [&_svg]:size-8",
        "text-white absolute left-0 right-0 -bottom-40 p-6 z-20",
        "transition-[bottom] duration-200",
        "group-data-controls/media:bottom-0 group-data-paused/media:bottom-0",
        ctx.showTrackMenu && "bottom-0!",
    )}
>
    <PlayerSeekBar />

    <div class="grid grid-cols-[1fr_1fr_1fr] items-center w-full gap-4">
        <div class="flex justify-start gap-4">
            <media-mute-button
                class={cn(
                    "group cursor-pointer min-w-14 size-14 grid place-items-center rounded-full backdrop-blur-sm",
                    "bg-linear-(--gradient-liquid-100) text-gray-200 border border-white/10 shadow-sm",
                )}
            >
                <SpeakerHighIcon class="hidden group-data-[state=high]:block" />
                <SpeakerLowIcon class="hidden group-data-[state=low]:block" />
                <SpeakerNoneIcon
                    class="hidden group-data-[state=muted]:block"
                />
            </media-mute-button>
            <div class="flex items-center w-full">
                <media-volume-slider
                    class={cn(
                        "inline-flex group relative w-full max-w-34 h-2",
                        "cursor-pointer touch-none select-none items-center outline-none",
                    )}
                >
                    <!-- svelte-ignore element_invalid_self_closing_tag -->
                    <media-volume-track
                        class="absolute w-full h-full rounded-full bg-gray-900"
                    />
                    <!-- svelte-ignore element_invalid_self_closing_tag -->
                    <media-volume-track-fill
                        class="absolute rounded-full bg-primary-500 w-(--slider-fill) h-full will-change-[width]"
                    />
                    <!-- svelte-ignore element_invalid_self_closing_tag -->
                    <media-volume-progress
                        class="opacity-0 group-hover:opacity-100 absolute rounded-full bg-primary-500/20 w-(--slider-pointer) h-full will-change-[width]"
                    />
                    <!-- svelte-ignore element_invalid_self_closing_tag -->
                    <media-volume-track-thumb
                        class={cn(
                            "absolute left-(--slider-fill) -translate-x-2 bg-primary-500 size-4 rounded-full will-change-[left]",
                            "opacity-0 scale-0 transition-opacity duration-75",
                            "group-hover:opacity-100 group-hover:scale-100",
                        )}
                    />
                </media-volume-slider>
            </div>
        </div>

        <div class="flex justify-center">
            {#if ctx.needTranscode}
                <button
                    class={cn(
                        "cursor-pointer rounded-full size-18 backdrop-blur-md grid place-items-center",
                        "bg-linear-to-br from-gray-100/40 to-gray-100/35 text-gray-200",
                        "border border-white/10 shadow-sm",
                    )}
                    onclick={() => {
                        ctx.togglePlay();
                    }}
                    type="button"
                >
                    {#if ctx.paused}
                        <PlayIcon weight="light" />
                    {:else}
                        <PauseIcon weight="light" />
                    {/if}
                </button>
            {:else}
                <media-play-button
                    class={cn(
                        "cursor-pointer rounded-full size-18 backdrop-blur-md grid place-items-center",
                        "bg-linear-to-br from-gray-100/40 to-gray-100/35 text-gray-200",
                        "border border-white/10 shadow-sm",
                    )}
                >
                    <PlayIcon
                        weight="light"
                        class="hidden group-data-paused/media:block"
                    />
                    <PauseIcon
                        weight="light"
                        class="hidden group-data-playing/media:block"
                    />
                </media-play-button>
            {/if}
        </div>

        <div class="flex gap-4 justify-end items-center">
            <PlayerAudioTracks />
            <PlayerSubtitles />
            <media-fullscreen-button
                class={cn(
                    "group cursor-pointer rounded-full size-14 backdrop-blur-md grid place-items-center [&_svg]:size-5 [&_svg]:transition-transform",
                    "bg-linear-(--gradient-liquid-200) text-gray-200 border border-white/10 shadow-sm",
                    "data-active:bg-gray-100/20",
                    "hover:[&_svg]:scale-115",
                )}
            >
                <CornersOutIcon
                    weight="light"
                    class="hidden group-aria-[pressed=false]:block"
                />
                <CornersInIcon
                    weight="light"
                    class="hidden group-aria-pressed:block"
                />
            </media-fullscreen-button>
        </div>
    </div>
</div>
