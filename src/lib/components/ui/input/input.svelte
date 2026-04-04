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
        "px-5 py-2 bg-linear-to-br from-gray-200/5 to-gray-300/5 rounded-lg text-gray-100",
        "border border-white/10 outline-none transition-colors duration-75",
        "focus:border-white/15 focus:from-gray-500/5 focus:to-gray-600/5",
        restProps.class,
    )}
/>
