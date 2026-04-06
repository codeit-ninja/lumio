<script lang="ts">
    import { getName } from "@cospired/i18n-iso-languages";
    import { format, intervalToDuration } from "date-fns";
    import { resource } from "runed";
    import * as Movie from "$lib/components/movie";
    import { getMovieDetails } from "$lib/movies";

    let { params } = $props();

    const movie = resource(
        () => params.id,
        () => getMovieDetails(params.id),
    );

    $inspect(movie.current);
</script>

{#if movie.current}
    <Movie.Root movie={movie.current} class="mt-6 relative h-full">
        <Movie.Backdrop class="fixed h-full w-full object-cover opacity-20" />
        <div
            class="absolute inset-0 grid grid-cols-[400px_1fr] items-start gap-8 p-8 z-10"
        >
            <div class="rounded-4xl overflow-hidden corner-squircle">
                <Movie.Poster />
            </div>
            <div class="py-4">
                <Movie.Genres size="lg" class="mb-8" />
                <Movie.Rating size="lg" class="mb-12" />
                <Movie.Title level="1" />
                <Movie.Details
                    keys={[
                        {
                            key: "release_date",
                            value: (movie) =>
                                format(new Date(movie.release_date), "yyyy"),
                        },
                        {
                            key: "runtimeSeconds",
                            value: (movie) => {
                                if (!movie.runtimeSeconds) {
                                    return undefined;
                                }

                                const duration = intervalToDuration({
                                    start: 0,
                                    end: movie.runtimeSeconds * 1000,
                                });

                                return `${duration.hours}h ${duration.minutes}m`;
                            },
                        },
                        {
                            key: "original_language",
                            value: (movie) =>
                                getName(movie.original_language, "en") ??
                                undefined,
                        },
                    ]}
                    class="mt-4 text-gray-300 mb-6"
                />
                <Movie.Plot class="max-w-3xl" />
                <div class="flex items-center gap-4 mt-8">
                    <Movie.Watch size="lg" />
                    <Movie.Trailer size="lg" />
                </div>
            </div>
        </div>
    </Movie.Root>
{/if}

<!-- <script lang="ts">
        import PlayIcon from "phosphor-svelte/lib/PlayIcon";
        import { useApp } from "$lib/app/index.js";
        import { useDialog } from "$lib/components/app";
        import * as Movie from "$lib/components/movie-details";
        import * as Torrents from "$lib/components/torrents";
        import { Button, ButtonBack } from "$lib/components/ui/button";
        import { Player } from "$lib/components/ui/player";

        const { data: movie } = $props();
        const dialog = useDialog();
        const app = useApp();

        const trailer = $derived(
            movie.tmdb.videos.results.find(
                (video) =>
                    video.type === "Trailer" &&
                    video.site === "YouTube" &&
                    video.name.toLowerCase().includes("trailer"),
            ),
        );
    </script>

    <Movie.Root {movie} class="mt-6 h-full grow relative">
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden bg-primary">
            <Movie.Backdrop
                class="rounded-tl-4xl fixed w-[calc(100%-300px)] h-[calc(100%-78px)] object-cover opacity-20"
            />
        </div>
        <div class="p-8 relative z-10">
            <div class="mb-8">
                <ButtonBack />
            </div>
            <div class="grid grid-cols-[350px_1fr] gap-8">
                <Movie.Poster class="mt-4" />
                <div class="py-4 flex flex-col gap-6">
                    <div class="flex flex-col border-b border-gray-600">
                        <Movie.Title class="mb-6" />
                        <Movie.Genres class="mb-6" />
                        <Movie.Rating class="mb-6" />
                        <div class="mb-6 flex flex-col gap-1">
                            <Movie.Languages />
                            <Movie.Countries />
                        </div>
                    </div>
                    <Movie.Plot />
                    <div class="pt-4 flex items-center gap-4">
                        <Button
                            variant="primary"
                            onclick={() => {
                                app.findBestStream(movie);
                            }}
                        >
                            <PlayIcon />
                            Watch movie
                        </Button>
                        {#if trailer}
                            <Button
                                variant="secondary"
                                onclick={() => {
                                    dialog.create({
                                        component: Player,
                                        size: "full",
                                        props: {
                                            src: `youtube/${trailer.key}`,
                                            poster: `https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`,
                                        },
                                    });
                                    dialog.openDialog();
                                }}
                            >
                                <PlayIcon />
                                Watch Trailer
                            </Button>
                        {/if}
                        <div class="mt-6">
                            <Movie.Similar />
                        </div>
                        <!-- <div class="mt-8">
                            <H level="5" class="mb-4">Available torrents</H>
                            <Torrents.Root {movie} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Movie.Root> -->
