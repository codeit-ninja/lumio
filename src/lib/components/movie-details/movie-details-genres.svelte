<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { useMovie } from "./context.svelte";
    import { cn } from "$lib/utils";

    type Props = {} & HTMLAttributes<HTMLDivElement>;

    const { ...restProps }: Props = $props();
    const movie = useMovie();
</script>

<div {...restProps} class={cn("flex gap-1 flex-wrap text-sm", restProps.class)}>
    {#each movie.tmdb.genres as genre (genre.id)}
        <span
            class={cn(
                "px-5 py-2 bg-linear-to-br from-gray-100/30 to-gray-200/20 flex backdrop-blur-sm",
                "border border-white/10 rounded-full shadow-sm",
            )}
        >
            {genre.name}
        </span>
    {/each}
</div>
