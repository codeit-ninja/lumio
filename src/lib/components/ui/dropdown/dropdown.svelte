<script lang="ts">
    import type { WithoutChild } from "bits-ui";
    import type { Snippet } from "svelte";
    import { DropdownMenu } from "bits-ui";
    import { ScrollArea } from "../scroll-area";

    type Props = {
        trigger: Snippet<[{ props: Record<string, unknown> }]>;
    } & WithoutChild<DropdownMenu.RootProps>;

    let { open = $bindable(), trigger, children }: Props = $props();
</script>

<DropdownMenu.Root bind:open>
    <DropdownMenu.Trigger>
        {#snippet child({ props })}
            {@render trigger({ props })}
        {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
        <DropdownMenu.Content
            side="top"
            align="end"
            sideOffset={8}
            class="rounded-lg backdrop-blur-md bg-gray-900/80 text-white shadow-xl overflow-hidden z-50"
        >
            <ScrollArea class="max-h-80 min-w-36 max-w-36" hideScrollbar>
                {@render children?.()}
            </ScrollArea>
        </DropdownMenu.Content>
    </DropdownMenu.Portal>
</DropdownMenu.Root>
