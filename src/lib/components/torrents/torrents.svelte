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
        () => {
            return tbp.search({
                q:
                    movie.imdb.id ||
                    movie.omdb.imdbId ||
                    `${movie.tmdb.title} ${movie.omdb.year}`,
            });
        },
    );
</script>

<div class="grid gap-1">
    {#each torrents.current as torrent (torrent.info_hash)}
        <TorrentItem {torrent} />
    {/each}
</div>
