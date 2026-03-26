<script lang="ts">
    import type { Torrent } from "apibay.org";
    import { format } from "@std/fmt/bytes";
    import PlayIcon from "phosphor-svelte/lib/PlayIcon";
    import { Button } from "../ui/button";
    import { createStream, useApp } from "$lib/app";
    import { createMagnetURI } from "$lib/utils";
    import { webtorrent } from "$lib/webtorrent";

    type Props = {
        torrent: Torrent;
    };

    let { torrent }: Props = $props();
    let processing = $state(false);
    let app = useApp();

    async function watch(infoHash: string, name: string) {
        processing = true;
        const magnet = createMagnetURI(infoHash, name);

        webtorrent
            .add(magnet)
            .then(async (torrent) => {
                app.stream = await createStream(torrent);
            })
            .finally(() => {
                processing = false;
            });
        // progress = null;
        // transcoding = false;
        // transcodeSrc = null;
        // videoDuration = 0;

        // const largest = maxBy(
        //     activeTorrent.files.filter((f) => VIDEO_EXTENSIONS.test(f.name)),
        //     "length",
        // );
        // if (!largest) return;

        // streamSrc = largest.streamUrl;

        // (async () => {
        //     const { needsTranscode, duration } = await webtorrent.probe(
        //         largest.streamUrl,
        //     );
        //     videoDuration = duration;
        //     if (needsTranscode) {
        //         transcodeSrc = await webtorrent.transcode(largest.streamUrl);
        //         transcoding = true;
        //     }
        // })();
    }
</script>

<div
    class="bg-gray-900/40 backdrop-blur-md grid grid-cols-[2rem_auto_3rem_3rem_5rem] items-center gap-4 border border-gray-800 rounded-md px-3 py-2"
>
    <Button
        variant="lumio"
        size="icon"
        onclick={() => watch(torrent.info_hash, torrent.name)}
        loading={processing}
    >
        <PlayIcon />
    </Button>
    <span>{torrent.name}</span>
    <span class="text-success-500 text-center">{torrent.seeders}</span>
    <span class="text-destructive-500 text-center">
        {torrent.leechers}
    </span>
    <span>{format(torrent.size)}</span>
</div>
