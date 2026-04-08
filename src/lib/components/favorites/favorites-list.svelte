<script lang="ts">
    import type { FavoriteListWithItems } from "$lib/database/favorites";
    import type { HTMLAttributes } from "svelte/elements";
    import { createFavoriteList } from "./context.svelte";

    type Props = {
        list: FavoriteListWithItems;
    } & HTMLAttributes<HTMLDivElement>;

    let { list, children, ...restProps }: Props = $props();
    createFavoriteList(() => list);
</script>

<div {...restProps}>
    {@render children?.()}
</div>
