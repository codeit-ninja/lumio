<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { tv } from "tailwind-variants";
    import { cn } from "$lib/utils";

    type Props = {
        variant?: keyof (typeof variants)["variants"]["variant"];
        size?: keyof (typeof variants)["variants"]["size"];
        type?: "button" | "submit" | "reset";
        loading?: boolean;
    } & HTMLAttributes<HTMLButtonElement>;

    const variants = tv({
        base: cn(
            "w-fit rounded-full flex items-center gap-2 justify-center [&_svg]:size-5 hover:cursor-pointer",
            "transition-colors duration-150 backdrop-blur-sm active:scale-98",
            "border border-gray-400/10",
        ),
        variants: {
            variant: {
                primary: cn(
                    "bg-linear-to-br from-secondary-200/20 to-primary-400/30 text-white active:opacity-95",
                    "hover:bg-linear-to-br hover:from-secondary-200/20 hover:to-primary-400/40",
                ),
                secondary: cn(
                    "bg-linear-to-br from-gray-400/20 to-gray-700/30 text-gray-100 active:opacity-95",
                    "hover:bg-linear-to-br hover:from-gray-400/20 hover:to-gray-700/60",
                ),
                lumio: "bg-linear-to-tr from-primary-500 to-secondary-500 text-white active:opacity-95",
                ghost: "bg-transparent text-gray-100 hover:bg-gray-800/50 active:bg-gray-800/50",
            },
            size: {
                sm: "text-sm py-2 px-4",
                md: "py-3 px-6 text-base",
                lg: "py-4 px-8 text-lg",
                icon: "size-8",
                "icon-lg": "size-12",
            },
        },
    });

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
    class={cn(variants({ variant, size }), restProps.class)}
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
