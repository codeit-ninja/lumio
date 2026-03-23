<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { useMovie } from "./context.svelte";
    import { getOMDBPostURL, getTMDBImageURL } from "$lib/utils";

    type Props = {} & HTMLAttributes<HTMLImageElement>;

    const { ...restProps }: Props = $props();
    const movie = useMovie();
</script>

{#if movie.tmdb.poster_path}
    <img
        {...restProps}
        src={getTMDBImageURL(movie.tmdb.poster_path, "w400")}
        alt={`${movie.tmdb.title} poster`}
        class="w-full rounded-xl object-cover"
    />
{:else}
    <img
        {...restProps}
        src={getOMDBPostURL(movie.omdb.imdbId, 500)}
        alt={`${movie.omdb.title} poster`}
        class="w-full rounded-xl object-cover"
    />
{/if}
