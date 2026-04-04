<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import StarIcon from "phosphor-svelte/lib/StarIcon";
    import { useMovie } from "./context.svelte";
    import { cn } from "$lib/utils";

    type Props = {} & HTMLAttributes<HTMLSpanElement>;

    const { ...restProps }: Props = $props();
    const movie = useMovie();
    const rating = $derived.by(() => {
        if (movie.imdb.rating?.aggregateRating) {
            return (
                Math.round(movie.imdb.rating.aggregateRating * 10) / 10
            ).toFixed(1);
        }

        return (Math.round(movie.tmdb.vote_average * 10) / 10).toFixed(1);
    });
    const votes = $derived.by(() => {
        const formatter = Intl.NumberFormat("en", { notation: "compact" });

        if (movie.imdb.rating?.voteCount) {
            return formatter.format(movie.imdb.rating.voteCount);
        }

        return formatter.format(movie.tmdb.vote_count);
    });
</script>

<span
    {...restProps}
    class={cn("inline-flex items-center gap-2 text-shadow-sm", restProps.class)}
>
    <StarIcon class="size-6 drop-shadow-md text-secondary-400" />
    <span class="flex gap-2 items-center">
        <span class="flex items-center">
            <span class="text-2xl text-gray-200">{rating}</span>
        </span>
        <span class="text-gray-400 text-xs relative top-0.5">
            <b class="font-semibold">{votes}</b> votes
        </span>
    </span>
</span>
