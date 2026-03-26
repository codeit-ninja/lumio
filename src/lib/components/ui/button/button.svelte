<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "$lib/utils";

    type Props = {
        variant?: "primary" | "secondary" | "ghost" | "link" | "lumio";
        type?: "button" | "submit" | "reset";
        size?: "sm" | "md" | "lg" | "icon";
        loading?: boolean;
    } & HTMLAttributes<HTMLButtonElement>;

    const {
        variant = "secondary",
        type,
        size = "md",
        loading = false,
        children,
        ...restProps
    }: Props = $props();
</script>

<button
    class={cn(
        "w-fit rounded-lg flex items-center gap-2 justify-center",
        "[&_svg]:size-5 hover:cursor-pointer transition-all duration-75",
        "active:scale-98",
        variant === "primary" && "bg-primary-500 text-white active:opacity-95",
        variant === "secondary" &&
            "bg-gray-500/60 text-gray-100 hover:bg-gray-500/50 active:opacity-95",
        variant === "lumio" &&
            "bg-linear-to-tr from-primary-500 to-secondary-500 text-white active:opacity-95",
        variant === "ghost" &&
            "bg-transparent text-gray-100 hover:bg-gray-800/50",
        size === "sm" && "text-sm py-2 px-4",
        size === "md" && "py-3 px-6 text-base",
        size === "lg" && "py-4 px-8 text-lg",
        size === "icon" && "size-8",
        restProps.class,
    )}
    {...restProps}
    type={type || "button"}
>
    {#if loading}
        <span
            class="size-4 border-2 border-primary-300 border-r-primary-500 animate-spin rounded-full"
        ></span>
    {:else}
        {@render children?.()}
    {/if}
</button>
