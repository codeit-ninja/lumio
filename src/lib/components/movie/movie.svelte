<script lang="ts">
    import type { Snippet } from "svelte";
    import type { Movie } from "tmdb-ts";
    import { createMovie } from "./context.svelte";

    type Props = {
        movie: Movie;
        children: Snippet;
    }

    let { movie, children }: Props = $props();
    createMovie(() => movie);
</script>

{@render children?.()}