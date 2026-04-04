<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "$lib/utils";

    type Props = { title: string } & HTMLAttributes<HTMLDivElement>;

    let { title, children, ...restProps }: Props = $props();
</script>

<div {...restProps} class={cn("mt-2", restProps.class)}>
    <h5 class="mb-2 uppercase text-gray-500 font-semibold px-3 font-heading">
        {title}
    </h5>
    <div class="grid gap-1">
        {@render children?.()}
    </div>
</div>
