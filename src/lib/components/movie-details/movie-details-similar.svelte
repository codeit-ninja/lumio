<script lang="ts">
    import { resource } from "runed";
    import { useMovie } from "./context.svelte";
    import { TMDb } from "$lib/tmdb";

    const movie = useMovie();
    const similar = resource(
        () => movie.tmdb.id,
        () =>
            TMDb.movies.similar(movie.tmdb.id, { language: "en-US", page: 1 }),
    );

    $inspect(similar.current);
</script>
