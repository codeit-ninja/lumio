<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { useMovie } from "./context.svelte";
    import { cn } from "$lib/utils";

    type Props = HTMLAttributes<HTMLDivElement>;

    const { ...restProps }: Props = $props();
    const movie = useMovie();
</script>

<div
    {...restProps}
    class={cn("flex items-center text-xs flex-wrap gap-2", restProps.class)}
>
    <span class="text-gray-200 me-2">Countries</span>
    {#each movie.imdb.originCountries as country (country.code)}
        <span class="px-3 py-2 bg-gray-900 rounded text-gray-100">
            {country.name}
        </span>
    {/each}
</div>
