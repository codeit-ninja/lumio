<script lang="ts">
    import type { MovieContext } from "./context.svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { createMovie } from "./context.svelte";

    type Props = {
        movie: MovieContext;
    } & HTMLAttributes<HTMLDivElement>;

    const { movie, children, ...restProps }: Props = $props();
    createMovie(() => movie);
</script>

<div {...restProps}>{@render children?.()}</div>
