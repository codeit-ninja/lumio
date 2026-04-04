<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { useMovie } from "./context.svelte";
    import { cn } from "$lib/utils";

    type Props = HTMLAttributes<HTMLDivElement>;

    const { ...restProps }: Props = $props();
    const movie = useMovie();
</script>

{#if movie.imdb.originCountries?.length}
    <div
        {...restProps}
        class={cn(
            "flex items-center text-xs flex-wrap gap-2 text-gray-200",
            restProps.class,
        )}
    >
        <span>Countries:</span>
        {movie.imdb.originCountries
            .map((country) => `${country.name}`)
            .join(", ")}
    </div>
{/if}
