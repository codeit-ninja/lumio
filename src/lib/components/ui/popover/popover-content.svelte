<script lang="ts">
    import type { WithoutChild } from "bits-ui";
    import { Popover } from "bits-ui";
    import { cn } from "tailwind-variants";

    type Props = {} & WithoutChild<Popover.ContentProps>;

    let { children, ...restProps }: Props = $props();
</script>

<Popover.Content
    {...restProps}
    class={cn(
        "z-50 bg-linear-(--gradient-liquid-100) backdrop-blur-xl rounded-lg text-white min-w-md text-sm",
        "border border-white/10 shadow-sm",
        restProps.class,
    )}
>
    {@render children?.()}
</Popover.Content>
