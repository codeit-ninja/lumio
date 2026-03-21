<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";

    import { cn } from "$lib/utils";


    type Props = {
        level: 1 | 2 | 3 | 4 | 5 | 6 | "1" | "2" | "3" | "4" | "5" | "6";
    } & HTMLAttributes<HTMLHeadingElement>;

    let { level, children, ...restProps }: Props = $props();
</script>
<svelte:element this={`h${level}`} {...restProps} class={cn(
    'font-heading font-bold',
    level == 1 && 'text-4xl',
    level == 2 && 'text-3xl',
    level == 3 && 'text-2xl',
    level == 4 && 'text-xl',
    level == 5 && 'text-lg',
    level == 6 && 'text-base',
    restProps.class
)}>
    {@render children?.()}
</svelte:element>