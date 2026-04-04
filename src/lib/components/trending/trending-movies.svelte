<script lang="ts">
    import CarouselMovies from "../carousels/carousel-movies.svelte";
    import { useMovies } from "$lib/resources";

    const { trending } = useMovies();
</script>

{#if trending.current}
    <CarouselMovies movies={trending.current} />
{/if}
