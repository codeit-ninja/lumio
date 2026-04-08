<script lang="ts">
    import { invoke } from "@tauri-apps/api/core";
    import { onMount } from "svelte";
    import type { Stream } from "$lib/app/stream.svelte";
    import { createPlayer } from "./context.svelte";
    import PlayerControls from "./player-controls.svelte";
    import { SpinnerIcon } from "$lib/icons";

    type Props = {
        stream: Stream;
        poster?: string;
    };

    let { stream, poster }: Props = $props();

    const ctx = createPlayer();

    // Sync props into context so sub-components can read them via usePlayer()
    $effect(() => {
        ctx.stream = stream;
        ctx.poster = poster;
    });

    // Keep the media-player src attribute current when it changes after mount
    $effect(() => {
        ctx.playerEl?.setAttribute("src", ctx.src);
    });

    onMount(() => {
        // Tag the WebView2 audio session with Lumio's identity so Windows
        // shows it as "Lumio" in the Volume Mixer instead of "Microsoft Edge WebView2".
        invoke("refresh_audio_session");
    });
</script>

<media-player
    src={ctx.src}
    class="block! relative group/media overflow-clip"
    {@attach ctx.action}
>
    <media-provider>
        {#if ctx.poster}
            <media-poster
                class="absolute inset-0 block h-full w-full rounded-md bg-black opacity-0 transition-opacity data-visible:opacity-100 [&>img]:h-full [&>img]:w-full [&>img]:object-cover"
                src={ctx.poster}
            ></media-poster>
        {/if}
    </media-provider>

    {#if ctx.stream?.seeking}
        <SpinnerIcon
            class="absolute inset-0 m-auto z-55 size-18 text-primary-300"
        />
    {/if}

    <PlayerControls />
</media-player>
