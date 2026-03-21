<script lang="ts">
    import type { HTMLImgAttributes } from "svelte/elements";

    import { useMovie } from "./context.svelte";

    import { getTMDBImageURL } from "$lib/utils";

    type Props = {
        size?: "w200" | "w500" | "original";
    } & Omit<HTMLImgAttributes, "src" | "alt">;

    const { size = "w500", ...restProps }: Props = $props();
    const movie = useMovie();
</script>

<img {...restProps} src={getTMDBImageURL(movie.poster_path, size)} alt={movie.title} class="w-full h-auto rounded-lg" />