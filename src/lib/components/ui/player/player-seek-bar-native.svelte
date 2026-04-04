<script>
    import { cn } from "$lib/utils";
</script>

<media-time-slider
    class="group relative inline-flex h-2 w-full cursor-pointer touch-none select-none items-center outline-none"
>
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <time-slider-track
        class={cn(
            "absolute inset-0 bg-gray-400/20 backdrop-blur-md rounded-full",
            "group-hover:scale-y-[1.25]",
        )}
    />

    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <time-slider-track-fill
        class="absolute inset-y-0 left-0 bg-primary-500 rounded-full will-change-[width] w-(--slider-fill)"
    />

    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <time-slider-track-progress
        class={cn(
            "absolute inset-y-0 left-0 bg-primary-500/20 rounded-full will-change-[width] w-(--slider-pointer) opacity-0",
            "group-data-pointing:opacity-100",
        )}
    />
</media-time-slider>
