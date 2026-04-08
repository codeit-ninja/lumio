<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";
    import { useId } from "bits-ui";
    import { cn } from "$lib/utils";

    type Props = {
        ref?: HTMLElement;
        label?: string;
        error?: string;
    } & HTMLInputAttributes;

    let {
        value = $bindable<string>(),
        type = "text",
        id = useId(),
        ref = $bindable<HTMLElement>(),
        label,
        error,
        ...restProps
    }: Props = $props();
</script>

{#if label}
    <label
        for={id}
        class="uppercase text-gray-500 mb-2 font-medium inline-block"
        >{label}</label
    >
{/if}
<input
    bind:this={ref}
    bind:value
    {id}
    {type}
    {...restProps}
    class={cn(
        "px-5 py-4 bg-gray-800 rounded-3xl corner-squircle outline-hidden w-full",
        "focus:bg-gray-700/70 shadow-sm",
        restProps.class,
    )}
/>
{#if error}
    <p class="text-xs uppercase text-destructive-500 mt-2 font-medium">
        {error}
    </p>
{/if}
