<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import StarIcon from "phosphor-svelte/lib/StarIcon";
    import { useMovie } from "./context.svelte";
    import { cn } from "$lib/utils";

    type Props = {} & HTMLAttributes<HTMLSpanElement>;

    const { ...restProps }: Props = $props();
    const movie = useMovie();
</script>

<span
    {...restProps}
    class={cn("inline-flex items-center gap-2 text-shadow-sm", restProps.class)}
>
    <StarIcon class="relative top-px text-xl text-secondary-400" />
    <span class="text-white flex items-end">
        <span class="text-2xl text-primary-100">
            {movie.vote_average.toFixed(1)}
        </span>
    </span>
</span>
