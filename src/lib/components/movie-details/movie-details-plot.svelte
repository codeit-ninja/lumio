<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { useMovie } from "./context.svelte";
    import { cn } from "$lib/utils";

    type Props = HTMLAttributes<HTMLDivElement>;

    const { ...restProps }: Props = $props();
    const movie = useMovie();
</script>

<div {...restProps} class={cn("max-w-xl", restProps.class)}>
    {movie.omdb.plot}
</div>
