<script lang="ts">
    import type { EmblaOptionsType } from "embla-carousel";
    import type { HTMLAttributes } from "svelte/elements";
    import { createEmblaCarousel } from "./context.svelte";
    import { cn } from "$lib/utils";

    type Props = {
        options?: EmblaOptionsType;
    } & HTMLAttributes<HTMLDivElement>;

    let { options, children, ...restProps }: Props = $props();
    let emble = createEmblaCarousel();
</script>

<div>
    <div
        {@attach emble.init(options)}
        {...restProps}
        class={cn("overflow-hidden relative", restProps.class)}
    >
        {@render children?.()}
    </div>
</div>
