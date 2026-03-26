<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";

    type Props = {} & HTMLAttributes<HTMLDivElement>;

    let { children, ...restProps }: Props = $props();
</script>

<div {...restProps}>
    {@render children?.()}
</div>
