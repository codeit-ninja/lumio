<script lang="ts">

    import type { Movie as TMDBMovie } from "tmdb-ts";

    import  * as Movie from "../movie";
    import  * as Carousel from "../ui/carousel";

    type Props = {
        movies: TMDBMovie[];
    }

    let { movies }: Props = $props();
</script>

<Carousel.Root options={{ slidesToScroll: "auto", containScroll: "trimSnaps", align: "start" }}>
    <Carousel.Container class="flex gap-4 touch-pinch-zoom select-none">
        {#each movies as movie (movie.id)}
            <Movie.Root {movie}>
                <Carousel.Item class="basis-1/6 shrink-0">
                    <Movie.Link>
                        <Movie.Poster size="w500" />
                    </Movie.Link>
                </Carousel.Item>
            </Movie.Root>
        {/each}
    </Carousel.Container>
</Carousel.Root>