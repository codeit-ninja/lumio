<script lang="ts">
    import type { HTMLAnchorAttributes } from "svelte/elements";
    import { resolve } from "$app/paths";
    import { cn } from "$lib/utils";

    let { ...restProps }: HTMLAnchorAttributes = $props();
</script>

<a
    href={resolve("/")}
    {...restProps}
    class={cn("flex items-center gap-3", restProps.class)}
>
    <img src="/logo.png" alt="Lumio Logo" class="h-9 w-auto" />
    <span class="font-medium text-3xl font-heading">LUMIO</span>
</a>
