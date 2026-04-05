<script lang="ts">
    import { scale } from "svelte/transition";
    import { cn } from "tailwind-variants";
    import { useApp } from "$lib/app";
    import { Player } from "$lib/components/ui/player";
    import { CloseIcon } from "$lib/icons";
    import { getTMDBImageURL } from "$lib/utils";

    const app = useApp();
</script>

{#if app.trailer}
    <div
        class="fixed inset-0 bg-black z-50 grid place-items-center"
        in:scale={{ duration: 75 }}
        out:scale={{ duration: 75 }}
    >
        <button
            class={cn(
                "z-50 fixed right-6 top-6 inline-flex items-center gap-2 text-white text-xl cursor-pointer",
                "transition-all active:scale-98 active:text-gray-200",
            )}
            type="button"
            onclick={() => app.closeTrailer()}
        >
            <CloseIcon class="size-10" />
        </button>
        <Player
            src={`youtube/${app.trailer.key}`}
            poster={app.movie?.backdrop_path
                ? getTMDBImageURL(app.movie.backdrop_path)
                : undefined}
        />
    </div>
{/if}
