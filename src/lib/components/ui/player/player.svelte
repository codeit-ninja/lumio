<script lang="ts">
    import type { SubtitleTrack } from "$lib/webtorrent";
    import { createPlayer } from "./context.svelte";
    import PlayerControls from "./player-controls.svelte";

    type Props = {
        src: string;
        poster?: string;
        duration?: number;
        onseek?: (time: number) => void;
        disabled?: boolean;
        tracks?: SubtitleTrack[];
        needTranscode?: boolean;
    };

    let {
        src,
        poster,
        duration,
        onseek,
        disabled = false,
        tracks = [],
        needTranscode = false,
    }: Props = $props();

    const ctx = createPlayer();

    // Sync props into context so sub-components can read them via usePlayer()
    $effect(() => {
        ctx.src = src;
        ctx.poster = poster;
        ctx.duration = duration;
        ctx.onseek = onseek;
        ctx.disabled = disabled;
        ctx.tracks = tracks;
        ctx.needTranscode = needTranscode;
    });

    // Keep the media-player src attribute current when it changes after mount
    $effect(() => {
        ctx.playerEl?.setAttribute("src", ctx.src);
    });

    /** Called imperatively by the parent to seek without unmounting the player. */
    export function seek(newSrc: string, atTime: number) {
        ctx.seek(newSrc, atTime);
    }
</script>

<media-player
    {src}
    class="block! relative group/media overflow-clip"
    use:ctx.action
>
    <media-provider>
        {#if ctx.poster}
            <media-poster
                class="absolute inset-0 block h-full w-full rounded-md bg-black opacity-0 transition-opacity data-visible:opacity-100 [&>img]:h-full [&>img]:w-full [&>img]:object-cover"
                src={ctx.poster}
            ></media-poster>
        {/if}
    </media-provider>

    <PlayerControls />
</media-player>
