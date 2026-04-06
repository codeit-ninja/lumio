<script lang="ts">
    import type { WithoutChild } from "bits-ui";
    import type { Snippet } from "svelte";
    import { Popover } from "bits-ui";

    type Props = {
        trigger: Snippet<[{ props: Record<string, unknown> }]>;
    } & WithoutChild<Popover.RootProps>;

    let {
        open = $bindable(true),
        children,
        trigger,
        ...restProps
    }: Props = $props();
</script>

<Popover.Root {...restProps} bind:open>
    <Popover.Trigger>
        {#snippet child({ props })}
            {@render trigger({ props })}
        {/snippet}
    </Popover.Trigger>
    <Popover.Portal>
        {@render children?.()}
    </Popover.Portal>
</Popover.Root>
