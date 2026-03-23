<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { useMovie } from "./context.svelte";
    import { cn } from "$lib/utils";

    type Props = {} & HTMLAttributes<HTMLDivElement>;

    const { ...restProps }: Props = $props();
    const movie = useMovie();
</script>

<div
    {...restProps}
    class={cn("flex items-center text-xs flex-wrap gap-2", restProps.class)}
>
    {#each movie.tmdb.genres as genre (genre.id)}
        <span class="px-3 py-2 bg-gray-800 rounded text-sm">
            {genre.name}
        </span>
    {/each}
</div>
