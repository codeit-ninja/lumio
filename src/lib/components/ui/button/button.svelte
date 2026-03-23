<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "$lib/utils";

    type Props = {
        variant?: "primary" | "secondary" | "ghost" | "link" | "special";
        type?: "button" | "submit" | "reset";
    } & HTMLAttributes<HTMLButtonElement>;

    const {
        variant = "secondary",
        type,
        children,
        ...restProps
    }: Props = $props();
</script>

<button
    class={cn(
        "w-fit py-3 px-6 rounded-lg flex items-center gap-2",
        "[&_svg]:size-5 hover:cursor-pointer transition-all duration-75",
        "active:scale-98",
        variant === "primary" && "bg-primary-500 text-white active:opacity-95",
        variant === "secondary" &&
            "bg-gray-500/60 text-gray-100 hover:bg-gray-500/50 active:opacity-95",
        variant === "special" &&
            "bg-linear-to-r from-primary-500 to-secondary-500 text-white active:opacity-95",
        variant === "ghost" &&
            "bg-transparent text-gray-100 hover:bg-gray-800/50",
        restProps.class,
    )}
    {...restProps}
    type={type || "button"}
>
    {@render children?.()}
</button>
