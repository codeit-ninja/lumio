<script lang="ts">
    import * as Movie from "$lib/components/movie";
    import { useMovies } from "$lib/resources";

    const movies = useMovies();
    const movie = $derived(movies.trending.current?.at(2));

    $inspect(movie);
</script>

{#if movie}
    <Movie.Root {movie} class="relative">
        <Movie.Backdrop class="opacity-85" />
        <div
            class="absolute inset-0 p-6 bg-primary-950/40 rounded-4xl corner-squircle"
        >
            <div class="flex flex-col h-full">
                <Movie.Genres size="lg" class="mb-8" />
                <Movie.Rating size="lg" />
                <div class="mt-auto">
                    <Movie.Title level="1" />
                    <div class="mt-4 mb-6">
                        <Movie.Duration class="text-gray-300" />
                        <span class="text-gray-300">&nbsp;•&nbsp;</span>
                        <Movie.Language class="text-gray-300" />
                    </div>
                    <Movie.Plot class="text-gray-200 text-lg max-w-4xl mb-12" />
                    <div class="flex gap-4">
                        <Movie.Watch size="lg" />
                        <Movie.Trailer size="lg" />
                    </div>
                </div>
            </div>
        </div>
    </Movie.Root>
{/if}
