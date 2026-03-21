<script lang="ts">
    import type { Component } from "svelte";
    import type { HTMLAnchorAttributes } from "svelte/elements";

    import { resolve } from "$app/paths";
    import { page } from "$app/state";
    import { cn } from "$lib/utils";


    type Props = {
        icon?: Component;
    } & HTMLAnchorAttributes;

    let { icon: Icon, children, ...restProps }: Props = $props();
    // @ts-expect-error - this is a bit hacky, but it works
    let route = $derived(resolve(restProps.href));
</script>

<a {...restProps} class={cn(
    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-900',
    (route + '/').replace('//', '/') === page.url.pathname ? 'bg-gray-900' : ''
)}>
    {#if Icon}
        <Icon class="size-5" weight="bold" />
    {/if}
    {@render children?.()}
</a>