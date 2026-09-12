<script>
    import { useApp } from "$lib/app";
    import {
        TrendingMovie,
        TrendingMovies,
        TrendingMoviesGenre,
    } from "$lib/components/app/movies";
    import { TrendingTVSeries } from "$lib/components/app/tv-series";

    const app = useApp();
</script>

<div class="w-full py-6">
    {#if app.type === "MOVIE"}
        <TrendingMovie />
        <TrendingMovies />
        <TrendingMoviesGenre />
    {:else}
        <TrendingTVSeries />
    {/if}
</div>
