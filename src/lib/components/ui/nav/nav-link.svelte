<script lang="ts">
    import type { Component } from "svelte";
    import type { HTMLAnchorAttributes } from "svelte/elements";
    import { page } from "$app/state";
    import { cn } from "$lib/utils";

    type Props = {
        icon?: Component;
    } & HTMLAnchorAttributes;

    let { icon: Icon, children, ...restProps }: Props = $props();
    let isActive = $derived(
        (restProps.href === "/" && page.route.id === "/") ||
            (page.route.id?.startsWith(restProps.href!) &&
                restProps.href !== "/") ||
            restProps.href + "/" === page.url.pathname,
    );

    console.log(restProps.href);
</script>

<a
    {...restProps}
    class={cn(
        "flex items-center gap-3 text-gray-400",
        isActive && "text-gray-50",
    )}
>
    {#if Icon}
        <Icon class="size-5" weight="bold" />
    {/if}
    {@render children?.()}
</a>
