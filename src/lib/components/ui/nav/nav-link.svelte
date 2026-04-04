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
        (page.route.id?.startsWith(restProps.href!) &&
            restProps.href !== "/") ||
            restProps.href + "/" === page.url.pathname,
    );
</script>

<a
    {...restProps}
    class={cn(
        "p-px bg-linear-to-br gap-2 rounded-full text-sm backdrop-blur-xs",
        isActive && "from-gray-500/20 to-gray-600/20",
        restProps.class,
    )}
>
    <span
        class={cn(
            "flex items-center gap-2 rounded-full px-5 py-2 bg-linear-to-br",
            isActive && "from-gray-100/10 to-gray-200/10",
        )}
    >
        {#if Icon}
            <Icon class="size-5" weight="bold" />
        {/if}
        {@render children?.()}
    </span>
</a>
