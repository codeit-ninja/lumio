<script lang="ts">
    import { resource } from "runed";
    import CarouselMovies from "../carousels/carousel-movies.svelte";
    import { IMDb } from "$lib/imdb";

    const trending = resource(
        () => null,
        () => {
            return IMDb.titles.imDbApiServiceListTitles({
                sortBy: "SORT_BY_POPULARITY",
                types: ["MOVIE"],
            });
        },
    );

    $inspect(trending.current);
</script>
