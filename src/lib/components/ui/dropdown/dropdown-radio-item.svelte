<script lang="ts">
    import type { WithoutChildren } from "bits-ui";
    import type { Snippet } from "svelte";
    import { DropdownMenu } from "bits-ui";
    import { cn } from "$lib/utils";

    type Props = {
        children: Snippet;
    } & WithoutChildren<DropdownMenu.RadioItemProps>;

    let { value, children: child, ...restProps }: Props = $props();
</script>

<DropdownMenu.RadioItem
    {...restProps}
    {value}
    class={cn(
        "grid grid-cols-[auto_10px] items-center gap-2",
        "px-4 py-3 text-sm cursor-pointer rounded-md",
        "hover:bg-primary-100/5 transition-all",
        "data-[state=checked]:bg-primary-500/10",
        restProps.class,
    )}
>
    {#snippet children({ checked })}
        <span class="truncate">{@render child()}</span>
        {#if checked}
            <span class="size-2 rounded-full bg-primary-500"></span>
        {/if}
    {/snippet}
</DropdownMenu.RadioItem>
