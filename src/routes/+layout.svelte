<script lang="ts">
    import ArrowLeftIcon from "phosphor-svelte/lib/ArrowLeftIcon";
    import { onMount } from "svelte";
    import { scale } from "svelte/transition";
    import { Toaster } from "svelte-sonner";
    import { dev } from "$app/environment";
    import { createApp } from "$lib/app";
    import { createDialog, Search } from "$lib/components/app";
    import NavbarMain from "$lib/components/app/navbar/navbar-main.svelte";
    import { Trailer } from "$lib/components/app/trailer";
    import { Logo } from "$lib/components/logo";
    import { Select } from "$lib/components/ui/input";
    import { Player } from "$lib/components/ui/player";
    import { createMovies } from "$lib/resources";
    import { cn } from "$lib/utils";

    import "vidstack/bundle";

    let { children } = $props();
    let app = createApp();

    createMovies();
    createDialog();

    onMount(async () => {
        if (dev) {
            // const { movie, torrent } = await import("$lib/dev");
            // const { createStream } = await import("$lib/app");
            // // @ts-expect-error - this is just for development purposes
            // app.stream = await createStream(torrent, movie);
        }
    });
</script>

<div
    class="h-screen w-screen bg-gray-900 grid grid-cols-[300px_auto] text-gray-50 overflow-hidden"
>
    <aside class="p-6">
        <div class="h-15 flex items-center">
            <Logo />
        </div>
        <div class="mt-8">
            <NavbarMain />
        </div>
    </aside>
    <main class="flex flex-col h-screen p-6 overflow-auto">
        <header
            class="h-15 grid grid-cols-[200px_auto_500px] items-center gap-6"
        >
            <div class="overflow-clip">
                <Select
                    bind:value={app.category}
                    type="single"
                    items={[
                        { label: "Movies", value: "movies" },
                        { label: "TV Shows", value: "tv-shows" },
                    ]}
                />
            </div>
            <div>
                <Search />
            </div>
        </header>
        <div class="flex flex-col grow">
            {@render children?.()}
        </div>
    </main>
</div>

<Trailer />
<Toaster richColors theme="dark" />

{#if app.stream && app.stream.canPlay}
    <div
        class="fixed inset-0 bg-black h-screen w-screen z-50"
        in:scale={{ duration: 75 }}
        out:scale={{ duration: 75 }}
    >
        <div class="absolute top-4 left-4 z-10 text-white">
            <button
                class={cn(
                    "font-medium text-xl inline-flex items-center gap-2 px-3 py-1.5 transition-all",
                    "hover:cursor-pointer hover:-translate-x-0.5",
                )}
                onclick={() => app.stopStream()}
            >
                <ArrowLeftIcon class="relative top-px size-8" />
                Go back to library
            </button>
        </div>
        <div class="relative top-1/2 w-full -translate-y-1/2">
            <Player stream={app.stream} />
        </div>
    </div>
{/if}
