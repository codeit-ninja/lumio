<script lang="ts">
    import NavbarGenres from '$lib/components/app/navbar/navbar-genres.svelte';
    import NavbarMain from '$lib/components/app/navbar/navbar-main.svelte';
    import { Logo } from '$lib/components/logo';

    let { children } = $props();
</script>

<div class="bg-gray-950 text-white h-screen w-screen overflow-hidden grid grid-cols-[300px_1fr]">
    <aside class="border-r border-gray-800">
        <div class="px-4 h-17.25 flex items-center border-b border-gray-800">
            <Logo />
        </div>
        <div class="p-4 flex gap-4 flex-col">
            <NavbarMain />
            <NavbarGenres />
        </div>
    </aside>
    <main>
        <div class="p-3 h-17.25 border-b border-gray-800 flex items-center gap-4">
            
        </div>
        <div class="p-8">
            {@render children?.()}
        </div>
    </main>
</div>