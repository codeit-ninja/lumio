<script lang="ts">
    import type { Movie as MovieType } from "$lib/resources/movies.svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "tailwind-variants";
    import { Button } from "../ui/button";
    import { resolve } from "$app/paths";
    import * as Movie from "$lib/components/movie";

    type Props = {
        movie: MovieType;
        animated?: boolean;
        animatedDelay?: number;
    } & HTMLAttributes<HTMLDivElement>;

    const { movie, animated, animatedDelay, ...restProps }: Props = $props();
</script>

<Movie.Root
    {...restProps}
    {movie}
    class={cn(
        "group relative rounded-4xl overflow-clip",
        animated && "animate-zoom-in",
        restProps.class,
    )}
    style="animation-delay: {animatedDelay}ms"
>
    <Movie.Poster
        class="opacity-80 group-hover:scale-105 transition-all group-hover:opacity-100 group-hover:blur-xs"
    />
    <div class="absolute inset-0 flex flex-col">
        <Movie.Genres size="sm" class="p-4" />
        <div class="absolute inset-0 z-10 flex flex-col">
            <Movie.Genres size="sm" class="p-4" />
            <div
                class="mt-auto px-4 pb-4 pt-12 bg-linear-to-t from-primary-950/40 to-transparent"
            >
                <Movie.Favorites />
                <Movie.Rating size="sm" class="mt-4" />
                <Movie.Title level="4" />
            </div>
            <Button
                href={resolve(`/movies/[id]`, {
                    id: movie.id,
                })}
                variant="primary"
                size="sm"
                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                View
            </Button>
        </div>
    </div>
</Movie.Root>
