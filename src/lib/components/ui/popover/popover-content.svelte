<script lang="ts">
    import type { WithoutChild } from "bits-ui";
    import { Popover } from "bits-ui";
    import { cn } from "tailwind-variants";

    type Props = {
        variant?: "light" | "dark";
    } & WithoutChild<Popover.ContentProps>;

    let { variant = "dark", children, ...restProps }: Props = $props();
</script>

<Popover.Content
    {...restProps}
    class={cn(
        "z-50 backdrop-blur-xl text-white text-sm",
        "border border-white/10 shadow-sm rounded-4xl corner-squircle",
        variant === "light" && "bg-linear-(--gradient-liquid-100)",
        variant === "dark" && "bg-linear-to-br from-gray-800/80 to-gray-800/70",
        restProps.class,
    )}
>
    {@render children?.()}
</Popover.Content>
