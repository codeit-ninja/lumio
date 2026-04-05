<script lang="ts">
    import { PersistedState, resource } from "runed";
    import { page } from "$app/state";
    import * as Movie from "$lib/components/movie";
    import { TMDb } from "$lib/tmdb";

    const currentPage = new PersistedState("page", 1);
    const movies = resource(
        () => page.params.id,
        () =>
            TMDb.discover.movie({
                with_genres: page.params.id,
                sort_by: "popularity.desc",
                with_original_language: "en|nl",
                region: "NL",
                page: currentPage.current,
            }),
    );
</script>

<div class="grid grid-cols-5 w-full">
    {#each movies.current?.results as movie (movie.id)}
        <Movie.Root {movie}>
            <Movie.Link class="overflow-clip relative group">
                <Movie.Poster
                    class="rounded-none transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
                <div class="flex flex-col absolute inset-0 bg-black/10">
                    <Movie.Genres class="p-4" size="sm" />
                    <div
                        class="mt-auto px-4 pb-4 pt-12 bg-linear-to-t from-gray-950 to-transparent"
                    >
                        <Movie.Rating />
                        <Movie.Title class="font-light truncate" level="4" />
                    </div>
                </div>
            </Movie.Link>
        </Movie.Root>
    {/each}
</div>
