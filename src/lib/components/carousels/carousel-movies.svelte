<script lang="ts">
    import type { Movie as TMDBMovie } from "tmdb-ts";
    import * as Movie from "../movie";
    import * as Carousel from "../ui/carousel";
    import { cn } from "$lib/utils";

    type Props = {
        movies: TMDBMovie[];
    };

    let { movies }: Props = $props();
</script>

<Carousel.Root options={{ slidesToScroll: "auto", containScroll: "trimSnaps", align: "start" }}>
    <Carousel.Container class="flex gap-4 touch-pinch-zoom select-none">
        {#each movies as movie (movie.id)}
            <Movie.Root {movie}>
                <Carousel.Item class="basis-1/6 shrink-0">
                    <Movie.Link class="relative group/movie overflow-clip">
                        <Movie.Poster size="w500" />
                        <div
                            class={cn(
                                "absolute top-0 left-0 w-full p-4 flex flex-col gap-4",
                                "bg-linear-to-b from-primary-950/40 to-transparent",
                            )}
                        >
                            <Movie.Rating />
                            <Movie.Genres />
                        </div>
                        <Movie.Title
                            level="4"
                            class={cn(
                                "p-4 absolute truncate bottom-0 left-0 right-0",
                                "bg-linear-to-t from-black/80 to-transparent",
                                "opacity-0 group-hover/movie:opacity-100 transition-opacity",
                            )}
                        />
                    </Movie.Link>
                </Carousel.Item>
            </Movie.Root>
        {/each}
    </Carousel.Container>
</Carousel.Root>
