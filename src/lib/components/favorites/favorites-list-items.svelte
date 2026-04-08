<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { draggable } from "@thisux/sveltednd";
    import { fromAction } from "svelte/attachments";
    import { cn } from "tailwind-variants";
    import { CardMovie } from "../cards";
    import { useFavoriteList } from "./context.svelte";

    type Props = {
        dropContainer: string;
    } & HTMLAttributes<HTMLDivElement>;

    const { dropContainer, ...restProps }: Props = $props();
    const list = useFavoriteList();
    const previewItems = $derived(list.current.items.slice(0, 5));
    const items = $derived(
        list.current.items.slice(5, list.current.items.length),
    );
</script>

<div
    {...restProps}
    class={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4",
        restProps.class,
    )}
>
    {#if previewItems.length}
        {#each previewItems as item, index (item.id)}
            <CardMovie
                movie={item.movie}
                animated
                animatedDelay={index * 150}
                class="animate-duration-fast movie-card"
                {@attach fromAction(draggable, () => ({
                    container: dropContainer,
                    dragData: item,
                }))}
            />
        {/each}
        {#if list.isExpanded}
            {#each items as item, index (item.id)}
                <CardMovie
                    movie={item.movie}
                    animated
                    animatedDelay={index * 150}
                    class="animate-duration-fast movie-card"
                    {@attach fromAction(draggable, () => ({
                        container: dropContainer,
                        dragData: item,
                    }))}
                />
            {/each}
        {/if}
    {:else}
        <p class="text-gray-500 italic col-span-full">
            No items in this list yet.
        </p>
    {/if}
</div>
