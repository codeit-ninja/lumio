<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { getName } from "@cospired/i18n-iso-languages";
    import { useMovie } from "./context.svelte";

    const { ...restProps }: HTMLAttributes<HTMLSpanElement> = $props();
    const movie = useMovie();
</script>

<span {...restProps} class={restProps.class}>
    {getName(movie.original_language, "en")}
</span>
