<script lang="ts">
    import type { HTMLImgAttributes } from "svelte/elements";
    import { useMovie } from "./context.svelte";
    import { getTMDBImageURL } from "$lib/utils";

    type Props = {} & HTMLImgAttributes;

    const { ...restProps }: Props = $props();
    const movie = useMovie();
</script>

<img
    src={getTMDBImageURL(movie.tmdb.backdrop_path, "original")}
    {...restProps}
/>
