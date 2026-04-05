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
        stroke-width="1.5"
        d="m19 9l-7 6l-7-6"
    /></svg
>
