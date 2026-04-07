<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "tailwind-variants";

    type Props = {
        shimmer?: boolean;
    } & HTMLAttributes<HTMLDivElement>;

    const { shimmer = true, ...restProps }: Props = $props();
</script>

<div
    {...restProps}
    class={cn("bg-gray-700 rounded-lg overflow-clip relative", restProps.class)}
>
    {#if shimmer}
        <div class="shimmer"></div>
    {/if}
</div>

<style>
    .shimmer {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            105deg,
            transparent 20%,
            rgba(255, 255, 255, 0.02) 40%,
            rgba(255, 255, 255, 0.04) 50%,
            rgba(255, 255, 255, 0.02) 60%,
            transparent 80%
        );
        background-size: 200% 100%;
        animation: shimmer 1.8s ease-in-out infinite;
    }

    @keyframes shimmer {
        from {
            background-position: 200% center;
        }
        to {
            background-position: -200% center;
        }
    }
</style>
