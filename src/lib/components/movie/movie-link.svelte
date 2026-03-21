<script lang="ts">
    import type { HTMLAnchorAttributes } from "svelte/elements";

    import { useMovie } from "./context.svelte";

    import { resolve } from "$app/paths";

    type Props = Omit<HTMLAnchorAttributes, "href">

    let { children, ...restProps }: Props = $props();
    let movie = useMovie();
</script>

<a {...restProps} href={resolve(`/movies/[id]`, { id: movie.id.toString() })} class="block w-full h-full">
    {@render children?.()}
</a>