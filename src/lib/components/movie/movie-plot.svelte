<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "tailwind-variants";
    import { useMovie } from "./context.svelte";

    const { ...restProps }: HTMLAttributes<HTMLParagraphElement> = $props();
    const movie = useMovie();
</script>

<p {...restProps} class={cn("max-w-xl", restProps.class)}>
    {movie.overview}
</p>
