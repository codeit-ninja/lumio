<script lang="ts">
    import type { WithoutChildren } from "bits-ui";
    import type { Snippet } from "svelte";
    import { ScrollArea } from "bits-ui";
    import { cn } from "$lib/utils";

    type Props = {
        children: Snippet;
        hideScrollbar?: boolean;
    } & WithoutChildren<ScrollArea.ViewportProps>;

    let { children, hideScrollbar = false, ...restProps }: Props = $props();
</script>

<ScrollArea.Root>
    <ScrollArea.Viewport {...restProps}>
        {@render children?.()}
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar
        orientation="vertical"
        class={cn(
            !hideScrollbar && "bg-gray-900/20",
            "flex w-1 touch-none select-none rounded-full",
            "data-[state=visible]:animate-in data-[state=hidden]:animate-out",
            "data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0",
        )}
    >
        <ScrollArea.Thumb
            class={cn(
                !hideScrollbar && "bg-gray-600/40",
                "flex-1 rounded-full",
            )}
        />
    </ScrollArea.Scrollbar>
    <ScrollArea.Scrollbar orientation="horizontal">
        <ScrollArea.Thumb />
    </ScrollArea.Scrollbar>
    <ScrollArea.Corner />
</ScrollArea.Root>
