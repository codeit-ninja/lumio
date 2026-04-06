<script lang="ts">
    import { resolve } from "$app/paths";
    import * as Movie from "$lib/components/movie";
    import { Button } from "$lib/components/ui/button";
    import * as Carousel from "$lib/components/ui/carousel";
    import { useMovies } from "$lib/resources";

    const movies = useMovies();

    $inspect(movies.trending.current);
</script>

<div class="relative w-full">
    {#if movies.trending.current}
        <h1 class="my-8 text-3xl font-semibold">Trending Movies</h1>
        <Carousel.Root
            options={{
                slidesToScroll: "auto",
                containScroll: "trimSnaps",
                align: "start",
            }}
        >
            <Carousel.Container class="flex gap-4 touch-pinch-zoom select-none">
                {#each movies.trending.current as movie (movie.id)}
                    <Carousel.Item class="basis-1/5 shrink-0">
                        <Movie.Root
                            {movie}
                            class="group relative rounded-4xl overflow-clip"
                        >
                            <Movie.Poster
                                class="opacity-80 group-hover:scale-105 transition-all group-hover:opacity-100 group-hover:blur-xs"
                            />
                            <div class="absolute inset-0 z-10 flex flex-col">
                                <Movie.Genres size="sm" class="p-4" />
                                <div
                                    class="mt-auto px-4 pb-4 pt-12 bg-linear-to-t from-primary-950/40 to-transparent"
                                >
                                    <Movie.Rating size="sm" />
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
                        </Movie.Root>
                    </Carousel.Item>
                {/each}
            </Carousel.Container>
            <Carousel.ButtonPrev />
            <Carousel.ButtonNext />
        </Carousel.Root>
    {/if}
</div>
