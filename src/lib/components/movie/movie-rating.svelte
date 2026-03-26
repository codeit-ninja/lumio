<script lang="ts">
    import StarIcon from "phosphor-svelte/lib/StarIcon";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "$lib/utils";
    import { useMovie } from "./context.svelte";

    type Props = {} & HTMLAttributes<HTMLSpanElement>;

    const { ...restProps }: Props = $props();
    const movie = useMovie();
</script>

<span
    {...restProps}
    class={cn(
        "text-rating inline-flex items-center gap-2 text-shadow-sm",
        restProps.class,
    )}
>
    <StarIcon class="size-6 drop-shadow-md" weight="fill" />
    <span class="font-bold text-white">{movie.vote_average.toFixed(1)}</span>
</span>
