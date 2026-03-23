<script lang="ts">
    import type { EmblaOptionsType, EmblaCarouselType } from 'embla-carousel';
    import type { HTMLAttributes } from 'svelte/elements';
    import EmblaCarousel  from 'embla-carousel'
    import { onMount } from 'svelte';
    import { cn } from '$lib/utils';

    type Props = {
        ref?: HTMLDivElement;
        embla?: EmblaCarouselType;
        options?: EmblaOptionsType;
    } & HTMLAttributes<HTMLDivElement>;

    let { options, embla = $bindable(), ref = $bindable(), children, ...restProps }: Props = $props();

    onMount(() => {
        if (!ref) {
            return;
        }

        embla = EmblaCarousel(ref, options);
    })
</script>

<div>
    <div bind:this={ref} {...restProps} class={cn("overflow-hidden", restProps.class)}>
        {@render children?.()}
    </div>
</div>