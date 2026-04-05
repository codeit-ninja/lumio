<script lang="ts">
    import type { ComponentProps } from "svelte";
    import { cn } from "tailwind-variants";
    import { Img } from "../ui/img";
    import { useMovie } from "./context.svelte";
    import { getTMDBImageURL } from "$lib/utils";

    let { ...restProps }: Omit<ComponentProps<typeof Img>, "src"> = $props();
    let movie = useMovie();
</script>

<Img
    {...restProps}
    src={getTMDBImageURL(movie.backdrop_path)}
    class={cn("rounded-4xl corner-squircle", restProps.class)}
/>
