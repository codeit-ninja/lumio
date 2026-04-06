<script lang="ts">
    import { usePlayer } from ".";
    import { useApp } from "$lib/app";
    import * as Popover from "$lib/components/ui/popover";
    import AudioIcon from "$lib/icons/audio-icon.svelte";
    import { cn } from "$lib/utils";

    const ctx = usePlayer();
    const app = useApp();
</script>

<Popover.Root open={true}>
    {#snippet trigger({ props })}
        <button
            class={cn(
                "group cursor-pointer rounded-full size-14 backdrop-blur-md grid place-items-center [&_svg]:size-5 [&_svg]:transition-transform",
                "bg-linear-to-br from-gray-100/30 to-gray-100/25 text-gray-200 border border-white/10 shadow-sm",
                "data-active:bg-gray-100/20",
                "hover:[&_svg]:scale-115",
            )}
            {...props}
        >
            <AudioIcon />
        </button>
    {/snippet}
    <Popover.Content align="end" side="top" sideOffset={8}>
        <div class="p-4">
            {#if ctx.audioTracks.length === 0}
                <div class="p-4 text-gray-400">No audio tracks available.</div>
            {:else}
                {#each ctx.audioTracks as track, i (track.index)}
                    <button
                        onclick={() =>
                            app.stream!.setAudioTrack(
                                ctx,
                                track,
                                ctx.displayTime,
                            )}
                        class={cn(
                            "w-full text-left px-3 py-2 rounded-md",
                            track.index === app.stream?.activeAudioTrack?.index
                                ? "bg-linear-(--gradient-liquid-200) border-white/10 shadow-xs"
                                : "hover:bg-gray-100/20",
                        )}
                    >
                        {track.title || `Track ${i + 1}`}
                    </button>
                {/each}
            {/if}
        </div>
    </Popover.Content>
</Popover.Root>
