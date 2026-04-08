<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "tailwind-variants";
    import { useFavoriteList } from "./context.svelte";
    import { PlusRoundedIcon } from "$lib/icons";

    type Props = {
        size?: "sm" | "md" | "lg";
    } & HTMLAttributes<HTMLButtonElement>;

    const { size = "lg", ...restProps }: Props = $props();
    const list = useFavoriteList();
</script>

{#if list.current.items.length > 4}
    <button
        {...restProps}
        class={cn(
            "flex items-center gap-2 cursor-pointer transition-all",
            "hover:translate-x-0.5",
            size === "sm" && "text-sm",
            size === "md" && "text-base",
            size === "lg" && "text-lg",
            restProps.class,
        )}
        onclick={() => (list.isExpanded = !list.isExpanded)}
    >
        <PlusRoundedIcon
            class={cn(
                size === "sm" && "w-4 h-4",
                size === "md" && "w-6 h-6",
                size === "lg" && "w-8 h-8",
            )}
        />
        {#if list.isExpanded}
            <span>Show Less</span>
        {:else}
            <span>Show More</span>
        {/if}
    </button>
{/if}
