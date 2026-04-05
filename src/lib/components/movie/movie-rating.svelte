<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { useMovie } from "./context.svelte";
    import { StarIcon } from "$lib/icons";
    import { cn } from "$lib/utils";

    type Props = {
        size?: "sm" | "md" | "lg";
    } & HTMLAttributes<HTMLSpanElement>;

    const { size = "md", ...restProps }: Props = $props();
    const movie = useMovie();

    const votes = $derived.by(() => {
        const formatter = Intl.NumberFormat("en", { notation: "compact" });

        if (movie.rating?.voteCount) {
            return formatter.format(movie.rating.voteCount);
        }

        return formatter.format(movie.vote_count);
    });
</script>

<span
    {...restProps}
    class={cn("inline-flex items-center gap-2 text-shadow-sm", restProps.class)}
>
    <StarIcon
        class={cn(
            "text-rating",
            size === "sm" ? "size-4" : size === "md" ? "size-8" : "size-12",
        )}
    />
    <span class="text-white flex items-center gap-2">
        <span
            class={cn(
                size === "sm"
                    ? "text-sm"
                    : size === "md"
                      ? "text-2xl"
                      : "text-3xl",
            )}
        >
            {movie.rating?.aggregateRating?.toFixed(1)}
        </span>
        <span
            class={cn(
                "text-primary-100",
                size === "sm"
                    ? "text-[11px]"
                    : size === "md"
                      ? "text-sm"
                      : "text-base",
            )}
        >
            {votes}
        </span>
    </span>
</span>
