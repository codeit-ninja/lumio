<script lang="ts">
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
                    </div> -->
                </div>
            </div>
        </div>
    </div>
</Movie.Root>
