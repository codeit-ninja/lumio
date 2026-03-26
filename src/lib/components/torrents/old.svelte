<script lang="ts">
    import { maxBy } from "lodash-es";
    import { resource } from "runed";
    import type { Player } from "$lib/components/ui/player";
    import { tbp } from "$lib/torrents/thepiratebay";
    import { createMagnetURI, VIDEO_EXTENSIONS } from "$lib/utils";
    import type { TorrentInfo, TorrentProgress } from "$lib/webtorrent";
    import { webtorrent } from "$lib/webtorrent";
    import type { MovieContext } from "../movie-details";

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

    const torrent = $derived(
        torrents.current?.filter((t) => t.name.includes("1080p"))[0],
    );

    let activeTorrent = $state<TorrentInfo | null>(null);
    let progress = $state<TorrentProgress | null>(null);
    let streamSrc = $state<string | null>(null);
    let transcoding = $state(false);
    let transcodeSrc = $state<string | null>(null);
    let videoDuration = $state(0);
    let seeking = $state(false);
    // Bind to the Player component so we can call applySeek() imperatively
    let player: ReturnType<typeof Player> | null = $state(null);

    $effect(() => {
        const unsubscribe = webtorrent.onProgress((data) => {
            if (activeTorrent && data.infoHash === activeTorrent.infoHash) {
                progress = data;
            }
        });
        return unsubscribe;
    });

    /** Seek: restart FFmpeg from seekTime, then imperatively swap the src on the
     *  player element without triggering a Svelte re-render that would destroy it. */
    async function handleSeek(seekTime: number) {
        if (!streamSrc || seeking) {
            return;
        }

        seeking = true;
        try {
            const newUrl = await webtorrent.seek(streamSrc, seekTime);
            transcodeSrc = newUrl;
            // Apply imperatively so the <Player> component does not unmount
            player?.applySeek(newUrl, seekTime);
        } finally {
            seeking = false;
        }
    }

    async function addTorrent(infoHash: string, name: string) {
        const magnet = createMagnetURI(infoHash, name);
        activeTorrent = await webtorrent.add(magnet);
        progress = null;
        transcoding = false;
        transcodeSrc = null;
        videoDuration = 0;

        const largest = maxBy(
            activeTorrent.files.filter((f) => VIDEO_EXTENSIONS.test(f.name)),
            "length",
        );
        if (!largest) return;

        streamSrc = largest.streamUrl;

        (async () => {
            const { needsTranscode, duration } = await webtorrent.probe(
                largest.streamUrl,
            );
            videoDuration = duration;
            if (needsTranscode) {
                transcodeSrc = await webtorrent.transcode(largest.streamUrl);
                transcoding = true;
            }
        })();
    }
</script>

{#if streamSrc}
    <Player
        bind:this={player}
        src={transcoding && transcodeSrc ? transcodeSrc : streamSrc}
        duration={videoDuration > 0 ? videoDuration : undefined}
        onseek={transcoding ? handleSeek : undefined}
        disabled={seeking}
    />
{/if}

{#if !activeTorrent}
    {#if torrents.loading}
        <p>Searching for torrents...</p>
    {:else if torrent}
        <button onclick={() => addTorrent(torrent.info_hash, torrent.name)}>
            Play {torrent.name}
        </button>
    {/if}
{:else if progress && progress.progress < 1}
    <p>
        Buffering: {(progress.progress * 100).toFixed(1)}% — {(
            progress.downloadSpeed /
            1024 /
            1024
        ).toFixed(2)} MB/s
    </p>
{/if}
