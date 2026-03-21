<script lang="ts">
    import CarouselMovies from "../carousels/carousel-movies.svelte";
    
    import { getTrending } from "$lib/resources/movies.svelte";


    let movies = $derived(await getTrending());
</script>

{#if movies.current}
    <CarouselMovies movies={movies.current} />
{/if}