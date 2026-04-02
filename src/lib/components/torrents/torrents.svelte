<script lang="ts">
    import type { MovieContext } from "../movie-details";
    import { resource } from "runed";
    import TorrentItem from "./torrent-item.svelte";
    import { tbp } from "$lib/torrents/thepiratebay";

    type Props = {
        movie: MovieContext;
    };

    const { movie }: Props = $props();

    const torrents = resource(
        () => movie,
        async () => {
            let results = await tbp.search({
                q:
                    movie.imdb.id ||
                    movie.omdb.imdbId ||
                    `${movie.tmdb.title} ${movie.omdb.year}`,
            });

            if (
                results[0].info_hash ===
                "0000000000000000000000000000000000000000"
            ) {
                results = await tbp.search({
                    q: `${movie.tmdb.title} (${movie.omdb.year})`,
                });

                if (
                    results[0].info_hash ===
                    "0000000000000000000000000000000000000000"
                ) {
                    results = [];
                }
            }

            return results;
        },
    );
</script>

<div class="grid gap-1">
    {#each torrents.current as torrent (torrent.info_hash)}
        <TorrentItem {torrent} {movie} />
    {/each}
</div>
