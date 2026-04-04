<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import type { Movie } from "tmdb-ts";
    import { createMovie } from "./context.svelte";

    type Props = {
        movie: Movie;
        children: Snippet;
    } & HTMLAttributes<HTMLDivElement>;

    let { movie, children, ...restProps }: Props = $props();
    createMovie(() => movie);
</script>

{#if restProps.class}
    <div {...restProps}>{@render children?.()}</div>
{:else}
    {@render children?.()}
{/if}
