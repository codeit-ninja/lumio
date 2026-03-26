<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { useMovies } from "$lib/resources";
    import { cn } from "$lib/utils";
    import { useMovie } from "./context.svelte";

    type Props = {} & HTMLAttributes<HTMLUListElement>;

    const { ...restProps }: Props = $props();

    const movie = useMovie();
    const movies = useMovies();
    const genres = $derived(
        movies.genres.current?.filter((genre) =>
            movie.genre_ids.includes(genre.id),
        ),
    );
</script>

<ul
    {...restProps}
    class={cn("flex gap-1 flex-wrap text-xs shadow", restProps.class)}
>
    {#each genres as genre (genre.id)}
        <li class="px-2 py-1 bg-gray-800 rounded">{genre.name}</li>
    {/each}
</ul>
