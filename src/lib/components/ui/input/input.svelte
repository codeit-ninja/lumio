<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";
    import { useId } from "bits-ui";
    import { cn } from "$lib/utils";

    type Props = {
        ref?: HTMLElement;
    } & HTMLInputAttributes;

    let {
        value = $bindable<string>(),
        type = "text",
        id = useId(),
        ref = $bindable<HTMLElement>(),
        ...restProps
    }: Props = $props();
</script>

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
