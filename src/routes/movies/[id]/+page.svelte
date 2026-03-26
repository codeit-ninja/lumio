<script lang="ts">
    import PlayIcon from "phosphor-svelte/lib/PlayIcon";
    import { useDialog } from "$lib/components/app";
    import * as Movie from "$lib/components/movie-details";
    import * as Torrents from "$lib/components/torrents";
    import { Button } from "$lib/components/ui/button";
    import { H } from "$lib/components/ui/h/index.js";
    import { Player } from "$lib/components/ui/player";

    const { data: movie } = $props();
    const dialog = useDialog();

    const trailer = $derived(
        movie.tmdb.videos.results.find(
            (video) =>
                video.type === "Trailer" &&
                video.site === "YouTube" &&
                video.name.toLowerCase().includes("trailer"),
        ),
    );
</script>

<Movie.Root {movie} class="h-full grow relative">
    <Movie.Backdrop class="fixed w-full h-full object-cover opacity-10" />
    <div class="p-8 relative z-10">
        <Movie.Title class="mb-8" />
        <div class="grid grid-cols-[300px_1fr] gap-8">
            <Movie.Poster class="mt-4" />
            <div class="py-4 flex flex-col gap-6">
                <div class="flex flex-col border-b-2 border-gray-800">
                    <Movie.Genres class="mb-6" />
                    <Movie.Rating class="mb-6" />
                    <Movie.Languages class="mb-2" />
                    <Movie.Countries class="mb-6" />
                    <Movie.Directors class="mb-6" />
                    <Movie.Writers class="mb-6" />
                </div>
                <Movie.Plot />
                <div class="pt-6 border-t-2 border-gray-800">
                    {#if trailer}
                        <Button
                            variant="primary"
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
                    <div class="mt-8">
                        <H level="5" class="mb-4">Available torrents</H>
                        <Torrents.Root {movie} />
                    </div>
                </div>
            </div>
        </div>
    </div>
</Movie.Root>
