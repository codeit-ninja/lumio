<script lang="ts">
    import { usePlayer } from "./context.svelte";
    import { cn, formatTime } from "$lib/utils";

    const ctx = usePlayer();
</script>

<div class="relative w-full h-2 cursor-pointer group">
    <!-- Track -->
    <time-slider-track
        class={cn(
            "absolute inset-0 bg-gray-400/20 backdrop-blur-md rounded-full",
            "group-hover:scale-y-[1.25]",
        )}
    ></time-slider-track>
    <!-- Fill -->
    <time-slider-track-fill
        class="absolute inset-y-0 left-0 bg-primary-500 rounded-full will-change-[width]"
        style="width: {ctx.fillPct}%"
    ></time-slider-track-fill>
    <!-- Thumb -->
    <time-slider-track-thumb
        class={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-primary-500 will-change-[left]",
            "group-hover:scale-[1.25]",
        )}
        style="left: {ctx.fillPct}%"
    ></time-slider-track-thumb>
    <!-- Transparent range input overlaid on top -->
    <input
        type="range"
        min="0"
        max={ctx.duration}
        step="1"
        bind:value={ctx.displayTime}
        disabled={ctx.disabled}
        class={cn(
            "absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed",
        )}
        oninput={() => (ctx.dragging = true)}
        onchange={(e) => {
            ctx.dragging = false;
            ctx.seeking = true;
            ctx.displayTime = parseFloat(e.currentTarget.value);
            ctx.onseek?.(ctx.displayTime);
        }}
    />
</div>

<div class="flex justify-between w-full text-xs text-gray-300/70 select-none">
    <span>{formatTime(ctx.displayTime)}</span>
    <span>{formatTime(ctx.duration ?? 0)}</span>
</div>
