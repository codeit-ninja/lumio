<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "tailwind-variants";
    import { useMovie } from "./context.svelte";

    type Props = {
        keys: {
            key: keyof ReturnType<typeof useMovie>;
            value: (
                movie: ReturnType<typeof useMovie>,
            ) => string | number | undefined;
        }[];
    } & HTMLAttributes<HTMLSpanElement>;

    const { keys, ...restProps }: Props = $props();
    const movie = useMovie();
</script>

<span {...restProps} class={cn("inline-block", restProps.class)}>
    {#each keys as { key, value }, i (key)}
        <span>{value(movie)}</span>
        {#if i !== keys.length - 1}
            <span>&nbsp;•&nbsp;&nbsp;</span>
        {/if}
    {/each}
</span>
