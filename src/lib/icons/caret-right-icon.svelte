<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";

    const { ...restProps }: HTMLAttributes<SVGElement> = $props();
</script>

<svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    {...restProps}
    ><path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m11 4l3 8l-3 8"
    /></svg
>
