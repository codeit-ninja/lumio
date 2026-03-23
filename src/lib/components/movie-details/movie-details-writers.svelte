<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { useMovie } from "./context.svelte";

    type Props = {} & HTMLAttributes<HTMLDivElement>;

    const { ...restProps }: Props = $props();
    const movie = useMovie();
</script>

<div {...restProps}>
    <span class="text-primary-100 mb-4 inline-block font-heading">
        Writers
    </span>
    <div class="flex flex-col items-start gap-2">
        {#each movie.imdb.writers as writer (writer.id)}
            <span>
                - {writer.displayName}
            </span>
        {/each}
    </div>
</div>
