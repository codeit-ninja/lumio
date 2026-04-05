<script lang="ts">
    import type { HTMLButtonAttributes } from "svelte/elements";
    import { cn } from "tailwind-variants";
    import { useMovie } from "./context.svelte";
    import { useApp } from "$lib/app";
    import { PlayIcon, SpinnerIcon } from "$lib/icons";

    type Props = {
        size?: "sm" | "md" | "lg";
        isLoading?: boolean;
    } & HTMLButtonAttributes;

    let {
        size = "md",
        isLoading = $bindable(false),
        ...restProps
    }: Props = $props();

    const RADIUS = 4;
    const app = useApp();
    const movie = useMovie();

    let buttonEl = $state<HTMLButtonElement | null>(null);
    let x = $state(RADIUS);
    let y = $state(RADIUS);

    function onmousemove(e: MouseEvent) {
        if (!buttonEl) return;
        const rect = buttonEl.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        x = Math.min(Math.max(relX, RADIUS), rect.width - RADIUS);
        y = Math.min(Math.max(relY, RADIUS), rect.height - RADIUS);
    }

    function watchMovie() {
        isLoading = true;
        app.watchMovie(movie).finally(() => {
            isLoading = false;
        });
    }
</script>

<button
    bind:this={buttonEl}
    {...restProps}
    {onmousemove}
    onclick={() => watchMovie()}
    type="button"
    class={cn(
        "relative overflow-hidden inline-flex items-center cursor-pointer transition-transform duration-35",
        "bg-linear-to-br from-primary-300/30 to-primary-300/40",
        "border border-white/10 shadow-xs backdrop-blur-lg rounded-4xl corner-squircle",
        "active:scale-98",
        size === "sm" && "text-xs gap-2 px-3 py-1 font-normal",
        size === "md" && "text-base px-4 py-2 gap-2 font-medium",
        size === "lg" && "text-lg px-6 py-4 gap-4 font-medium",
        restProps.class,
    )}
>
    {#if isLoading}
        <SpinnerIcon
            class={cn(
                "text-primary-300",
                size === "sm" && "size-4",
                size === "md" && "size-5",
                size === "lg" && "size-6",
            )}
        />
    {:else}
        <PlayIcon
            class={cn(
                "text-primary-300",
                size === "sm" && "size-4",
                size === "md" && "size-5",
                size === "lg" && "size-6",
            )}
        />
    {/if}
    <span>Watch movie</span>
    <span
        class="absolute rounded-full bg-primary-100/90 size-16 pointer-events-none blur-3xl"
        style="transform: translate(-40%, -40%); top: {y}px; left: {x}px;"
    ></span>
</button>
