<script lang="ts">
    import { CardMovie } from "$lib/components/cards";
    import * as Carousel from "$lib/components/ui/carousel";
    import { useMovies } from "$lib/resources";

    const movies = useMovies();
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
                {#each movies.trending.current as movie, index (movie.id)}
                    <Carousel.Item class="basis-1/5 shrink-0">
                        <CardMovie
                            {movie}
                            animated
                            animatedDelay={index * 150}
                            class="animate-duration-fast"
                        />
                    </Carousel.Item>
                {/each}
            </Carousel.Container>
            <Carousel.ButtonPrev />
            <Carousel.ButtonNext />
        </Carousel.Root>
    {/if}
</div>
