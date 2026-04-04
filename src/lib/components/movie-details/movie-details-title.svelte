<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { useMovie } from "./context.svelte";
    import { cn } from "$lib/utils";

    type Props = {} & HTMLAttributes<HTMLHeadingElement>;

    const { ...restProps }: Props = $props();
    const movie = useMovie();
</script>

<h1 {...restProps} class={cn("text-4xl font-light", restProps.class)}>
    {movie.tmdb.title}
</h1>
