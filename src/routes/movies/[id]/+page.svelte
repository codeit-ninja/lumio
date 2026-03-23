<script lang="ts">
    import * as Movie from "$lib/components/movie-details";

    const { data: movie } = $props();

    $effect(() => {
        console.log(movie);
    });
</script>

<Movie.Root {movie} class="h-full grow relative">
    <Movie.Backdrop class="absolute w-full h-full object-cover opacity-10" />
    <div class="relative z-10 p-8">
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
                <Movie.Trailer />
            </div>
        </div>
    </div>
</Movie.Root>
