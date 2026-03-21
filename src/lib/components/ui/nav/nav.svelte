<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    
    type Props = HTMLAttributes<HTMLElement>;

    let { children, ...restProps }: Props = $props();
</script>

<nav {...restProps}>
    {@render children?.()}
</nav>