<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { useMovie } from "./context.svelte";
    import { cn } from "$lib/utils";

    type Props = HTMLAttributes<HTMLDivElement>;

    const { ...restProps }: Props = $props();
    const movie = useMovie();

    console.log(movie.imdb);
</script>

{#if movie.imdb.spokenLanguages}
    <div
        {...restProps}
        class={cn(
            "flex gap-2 items-center text-sm text-gray-200",
            restProps.class,
        )}
    >
        <span>Languages:</span>
        <span
            >{movie.imdb.spokenLanguages
                .map((language) => `${language.name}`)
                .join(", ")}</span
        >
    </div>
{/if}
