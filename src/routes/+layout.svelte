<script lang="ts">
    import { scale } from "svelte/transition";
    import { createApp } from "$lib/app";
    import { createDialog, Dialog } from "$lib/components/app";
    import NavbarGenres from "$lib/components/app/navbar/navbar-genres.svelte";
    import NavbarMain from "$lib/components/app/navbar/navbar-main.svelte";
    import { Logo } from "$lib/components/logo";
    import { Player } from "$lib/components/ui/player";
    import { createMovies } from "$lib/resources";

    import "vidstack/bundle";

    let { children } = $props();
    let app = createApp();

    createMovies();
    createDialog();
</script>

<div
    class="bg-gray-950 text-white h-screen w-screen overflow-hidden grid grid-cols-[300px_1fr]"
>
    <aside class="border-r border-gray-800">
        <div
            class="px-4 min-h-17.25 flex items-center border-b border-gray-800"
        >
            <Logo />
        </div>
        <div class="p-4 flex gap-4 flex-col">
            <NavbarMain />
            <NavbarGenres />
        </div>
    </aside>
    <main class="h-dvh w-full flex flex-col overflow-hidden">
        <div
            class="p-3 min-h-17.25 border-b border-gray-800 flex items-center gap-4"
        ></div>
        <div class="relative flex grow dialog-container overflow-auto">
            {@render children?.()}

            <Dialog />
        </div>
    </main>
</div>

{#if app.stream && app.stream.canPlay}
    {@const player = {
        current: undefined as unknown as ReturnType<typeof Player>,
    }}
    <div
        class="fixed inset-0 bg-black h-screen w-screen z-50"
        in:scale={{ duration: 75 }}
        out:scale={{ duration: 75 }}
    >
        <Player
            bind:this={player.current}
            src={app.stream.streamUrl}
            duration={app.stream.metadata?.duration}
            onseek={(time) => app.stream!.seek(player.current, time)}
        />
    </div>
{/if}
