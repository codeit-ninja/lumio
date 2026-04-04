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
        <span class="p-px bg-gray-100/20 rounded-full flex backdrop-blur-sm">
            <span
                class="px-5 py-2 bg-linear-to-br from-gray-950/20 to-gray-700/20 rounded-full text-gray-100"
            >
                {genre.name}
            </span>
        </span>
    {/each}
</div>
