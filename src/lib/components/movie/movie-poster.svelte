<script lang="ts">
    import type { HTMLImgAttributes } from "svelte/elements";
    import { AspectRatio } from "bits-ui";
    import { useMovie } from "./context.svelte";
    import { cn, getTMDBImageURL } from "$lib/utils";

    type Props = {
        size?: "w200" | "w500" | "original";
    } & Omit<HTMLImgAttributes, "src" | "alt">;

    const { size = "w500", ...restProps }: Props = $props();
    const movie = useMovie();
</script>

<AspectRatio.Root ratio={2 / 3} class="w-full overflow-clip">
    <img
        {...restProps}
        src={getTMDBImageURL(movie.poster_path, size)}
        alt={movie.title}
        class={cn("h-full w-full object-cover", restProps.class)}
    />
</AspectRatio.Root>
