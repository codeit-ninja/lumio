<script lang="ts">
    import type { WithoutChildren } from "bits-ui";
    import { Select } from "bits-ui";
    import { cn } from "tailwind-variants";
    import { CaretDownIcon } from "$lib/icons";

    type Props = {
        items: { value: string; label: string; disabled?: boolean }[];
        label?: string;
    } & WithoutChildren<Select.RootProps>;

    let { value = $bindable(""), label, items, ...restProps }: Props = $props();
    let selectedLabel = $derived(
        items.find((item) => item.value === value)?.label ??
            label ??
            "Select an optio Select an optionSelect an optionSelect an optionSelect an optionn",
    );
</script>

<Select.Root {...restProps} bind:value={value as never}>
    <Select.Trigger
        class={cn(
            "flex items-center overflow-clip w-full px-6 py-4 gap-2",
            "bg-gray-800 rounded-3xl corner-squircle shadow-sm",
        )}
    >
        <span class="truncate">{selectedLabel}</span>
        <CaretDownIcon class="min-w-6 ms-auto" />
    </Select.Trigger>
    <Select.Portal>
        <Select.Content
            class={cn(
                "z-50 w-(--bits-floating-anchor-width) rounded-2xl bg-gray-800 mt-2 p-2 text-white shadow-sm",
            )}
        >
            <Select.ScrollUpButton />
            <Select.Viewport>
                {#each items as item (item.value)}
                    <Select.Item
                        value={item.value}
                        disabled={item.disabled}
                        class={cn(
                            "px-4 py-3 hover:bg-gray-700 rounded-xl outline-hidden select-none cursor-pointer transition-colors",
                            "data-highlighted:bg-gray-700 data-highlighted:text-primary-100",
                        )}
                    >
                        {item.label}
                    </Select.Item>
                {/each}
                <Select.ScrollDownButton />
            </Select.Viewport>
        </Select.Content>
    </Select.Portal>
</Select.Root>
