<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { format, intervalToDuration } from "date-fns";
    import { useMovie } from "./context.svelte";

    const { ...restProps }: HTMLAttributes<HTMLSpanElement> = $props();
    const movie = useMovie();
</script>

<span {...restProps} class={restProps.class}>
    {#if movie.release_date}
        {format(new Date(movie.release_date), "yyyy")}
    {/if}
    {#if movie.runtimeSeconds}
        {#if movie.release_date}
            &nbsp;•&nbsp;
        {/if}
        {#if movie.runtimeSeconds}
            {@const duration = intervalToDuration({
                start: 0,
                end: movie.runtimeSeconds * 1000,
            })}
            {duration.hours}h {duration.minutes}m
        {/if}
    {/if}
</span>
