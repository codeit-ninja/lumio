<script lang="ts">
    import { useMovies } from "$lib/resources";
    import CarouselMovies from "../carousels/carousel-movies.svelte";

    const { trending } = useMovies();
</script>

{#if trending.current}
    <CarouselMovies movies={trending.current} />
{/if}
