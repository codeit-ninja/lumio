<script lang="ts">
    import FastForwardIcon from "phosphor-svelte/lib/FastForwardIcon";
    import PauseIcon from "phosphor-svelte/lib/PauseIcon";
    import PlayIcon from "phosphor-svelte/lib/PlayIcon";
    import RewindIcon from "phosphor-svelte/lib/RewindIcon";
    import type { HTMLIframeAttributes } from "svelte/elements";
    import { cn } from "$lib/utils";

    type Props = {
        title: string;
        videoId: string;
    } & HTMLIframeAttributes;

    let { videoId }: Props = $props();
</script>

<media-player
    src={`youtube/${videoId}`}
    class="block! relative group/media max-w-300 max-h-125 overflow-clip"
>
    <media-provider>
        <media-poster
            class="absolute inset-0 block h-full w-full rounded-md bg-black opacity-0 transition-opacity data-visible:opacity-100 [&>img]:h-full [&>img]:w-full [&>img]:object-cover"
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
        >
        </media-poster>
    </media-provider>
    <media-controls
        class={cn(
            "flex items-center flex-col gap-6 [&_svg]:size-8",
            "text-white absolute -bottom-40 left-0 right-0 p-6 z-20",
            "animate-out fade-out transition-all",
            "group-data-controls/media:bottom-0 group-data-controls/media:animate-in group-data-controls/media:fade-in",
            "group-data-paused/media:bottom-0 group-data-paused/media:animate-in group-data-paused/media:fade-in",
        )}
    >
        <media-controls-group class="block w-full">
            <media-time-slider class="group relative w-full z-50">
                <div
                    class={cn(
                        "cursor-pointer bg-gray-400/20 backdrop-blur-md rounded-full h-2",
                        "group-data-hover:scale-y-[1.3] transition-transform will-change-transform",
                    )}
                >
                    <!-- Track Fill -->
                    <div
                        class="absolute h-full w-(--slider-fill) rounded-sm bg-primary-500 will-change-[width]"
                    ></div>
                    <!-- Progress -->
                    <div
                        class="absolute z-10 h-full w-(--slider-progress) rounded-sm bg-gray-200/10 will-change-[width]"
                    ></div>
                    <!-- Thumb -->
                    <div
                        class={cn(
                            "bg-primary-500 opacity-100",
                            "absolute left-(--slider-fill) top-1/2 z-20 h-4 w-4 rounded-full",
                            "-translate-x-1/2 -translate-y-1/2 transition-opacity will-change-[left]",
                            "group-data-active:opacity-100 group-data-hover:scale-x-[1.3]",
                        )}
                    ></div>
                </div>
            </media-time-slider>
        </media-controls-group>
        <media-controls-group class="flex items-center gap-12">
            <media-seek-button seconds={-5}>
                <RewindIcon
                    data-slot="rewind"
                    weight="light"
                    class="group-data-pressed/media-seek-button:hidden text-gray-200 cursor-pointer active:scale-[1.1] transition-transform duration-75"
                />
            </media-seek-button>
            <media-play-button
                class={cn(
                    "group/media-play-button",
                    "cursor-pointer rounded-full size-18 backdrop-blur-md grid place-items-center",
                    "bg-gray-400/50 text-gray-200",
                )}
            >
                <PlayIcon
                    data-slot="play"
                    weight="light"
                    class="group-data-pressed/media-play-button:hidden"
                />
                <PauseIcon
                    data-slot="pause"
                    weight="light"
                    class="group-data-paused/media-play-button:hidden"
                />
            </media-play-button>
            <media-seek-button seconds={5}>
                <FastForwardIcon
                    data-slot="fast-forward"
                    weight="light"
                    class="group-data-pressed/media-seek-button:hidden text-gray-200 cursor-pointer active:scale-[1.1] transition-transform duration-75"
                />
            </media-seek-button>
            <!-- <media-volume-slider class="w-36">
                <div
                    class="block relative z-0 h-[12px] w-full rounded-full border-2 border-gray-400/40 bg-gray-400/20 backdrop-blur-md"
                >
                    <div
                        class="absolute h-full w-(--slider-fill) rounded-sm bg-primary-500 will-change-[width]"
                    ></div>
                </div>
            </media-volume-slider> -->
        </media-controls-group>
    </media-controls>
</media-player>
