<script lang="ts">
    import type { ComponentProps } from "svelte";
    import { H } from "../ui/h";
    import { useMovie } from "./context.svelte";

    type Props = {} & Partial<ComponentProps<typeof H>>

    const { level = 3, ...restProps }: Props = $props();
    const movie = useMovie();
</script>

<H level={level} {...restProps}>{movie.title}</H>