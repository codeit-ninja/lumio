<script lang="ts">
    import type { WithoutChildren } from "bits-ui";
    import { ToggleGroup } from "bits-ui";
    import { cn } from "tailwind-variants";
    import * as Carousel from "$lib/components/ui/carousel";

    type Props = {
        items: {
            value: string;
            label: string;
        }[];
    } & WithoutChildren<ToggleGroup.RootProps>;

    let { value = $bindable(), items, ...restProps }: Props = $props();
</script>

<ToggleGroup.Root {...restProps} bind:value={value as any}>
    <Carousel.Root
        options={{
            slidesToScroll: "auto",
            containScroll: "trimSnaps",
            align: "start",
        }}
    >
        <Carousel.Container class="flex gap-2 touch-pinch-zoom select-none">
            {#each items as item (item.value)}
                <Carousel.Item class="basis-auto shrink-0">
                    <ToggleGroup.Item
                        value={item.value}
                        class={cn(
                            "rounded-full bg-gray-800 px-6 py-4 transition-colors cursor-pointer outline-none shadow-sm",
                            "data-[state=on]:bg-white data-[state=on]:text-black",
                        )}
                    >
                        {item.label}
                    </ToggleGroup.Item>
                </Carousel.Item>
            {/each}
        </Carousel.Container>
    </Carousel.Root>
</ToggleGroup.Root>
