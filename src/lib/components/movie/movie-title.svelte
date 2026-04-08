<script lang="ts">
    import type { ComponentProps } from "svelte";
    import { cn } from "tailwind-variants";
    import { H } from "../ui/h";
    import { useMovie } from "./context.svelte";

    type Props = {
        hideOriginalTitle?: boolean;
    } & Partial<ComponentProps<typeof H>>;

    const {
        level = 1,
        hideOriginalTitle = false,
        ...restProps
    }: Props = $props();
    const movie = useMovie();
</script>

<H
    {level}
    {...restProps}
    class={cn("font-medium flex flex-col", restProps.class)}
>
    <span
        class={cn(
            "text-gray-300",
            level == 1 && "text-3xl",
            level == 2 && "text-2xl",
            level == 3 && "text-xl",
            level == 4 && "text-lg",
        )}
    >
        {#if !hideOriginalTitle && movie.originalTitle !== movie.primaryTitle}
            {movie.originalTitle}
        {/if}
    </span>
    <span class="block truncate">{movie.primaryTitle}</span>
</H>
