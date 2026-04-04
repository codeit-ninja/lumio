<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { useMovie } from "./context.svelte";
    import { useMovies } from "$lib/resources";
    import { cn } from "$lib/utils";

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

<ul {...restProps} class={cn("flex gap-1 flex-wrap text-xs", restProps.class)}>
    {#each genres as genre (genre.id)}
        <li
            class={cn("p-px bg-gray-100/20 rounded-full flex backdrop-blur-sm")}
        >
            <span
                class="px-4 pt-1 pb-1.5 bg-linear-to-br from-gray-950/20 to-gray-700/20 rounded-full text-gray-100"
            >
                {genre.name}
            </span>
        </li>
    {/each}
</ul>
