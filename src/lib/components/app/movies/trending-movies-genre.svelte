<script lang="ts">
    import { resource } from "runed";
    import { CardMovie } from "$lib/components/cards";
    import * as Carousel from "$lib/components/ui/carousel";
    import { H } from "$lib/components/ui/h";
    import { ToggleGroup } from "$lib/components/ui/toggle-group";
    import { useMovies } from "$lib/resources";

    let currentInterest = $state("in0000001");

    const { genres, getMoviesByInterest } = useMovies();

    const movies = resource(
        () => currentInterest,
        (interest) => getMoviesByInterest(interest),
    );
    const interests = $derived.by(() => {
        if (!genres.current) {
            return [];
        }

        return genres.current
            .map((genre) => ({
                value: genre.interests.at(0)?.id,
                label: genre.interests.at(0)?.name,
            }))
            .filter((interest) => interest.value && interest.label) as {
            value: string;
            label: string;
        }[];
    });
</script>

<H level="2" class="my-8">Trending Movies by Genre</H>
{#if interests}
    <ToggleGroup items={interests} type="single" bind:value={currentInterest} />
{/if}
<div class="relative w-full mt-8">
    {#if movies.current}
        <Carousel.Root
            options={{
                slidesToScroll: "auto",
                containScroll: "trimSnaps",
                align: "start",
            }}
        >
            <Carousel.Container class="flex gap-4 touch-pinch-zoom select-none">
                {#each movies.current as movie, index (movie.id)}
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
