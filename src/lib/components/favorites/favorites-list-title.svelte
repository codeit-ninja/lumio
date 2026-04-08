<script lang="ts">
    import type { ComponentProps } from "svelte";
    import { H } from "../ui/h";
    import { useFavoriteList } from "./context.svelte";

    type Props = ComponentProps<typeof H>;

    const { ...restProps }: Props = $props();
    const list = useFavoriteList();
</script>

<H {...restProps}>
    {list.current.name}
</H>
