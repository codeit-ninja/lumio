<script lang="ts">
    import { getName } from "@cospired/i18n-iso-languages";
    import { isEmpty } from "lodash-es";
    import SubtitlesIcon from "phosphor-svelte/lib/SubtitlesIcon";
    import { usePlayer } from "./context.svelte";
    import * as Dropdown from "$lib/components/ui/dropdown";
    import { cn } from "$lib/utils";

    const ctx = usePlayer();
</script>

<div class="relative">
    <Dropdown.Root bind:open={ctx.showTrackMenu}>
        {#snippet trigger({ props })}
            <button
                class={cn(
                    "cursor-pointer rounded-full size-14 backdrop-blur-md grid place-items-center [&_svg]:size-5",
                    "bg-gray-100/10 text-gray-100",
                    !isEmpty(ctx.activeTrackIndex) &&
                        "bg-primary-500/10 text-primary-400",
                    ctx.showTrackMenu && "bg-primary-100/10 text-primary-400",
                )}
                {...props}
            >
                <SubtitlesIcon weight="light" />
            </button>
        {/snippet}
        <Dropdown.RadioGroup bind:value={ctx.activeTrackIndex}>
            {#each ctx.tracks as track (track.index)}
                <Dropdown.RadioItem
                    value={track.index.toString()}
                    closeOnSelect={false}
                    onSelect={(e) => {
                        if (ctx.activeTrackIndex === track.index.toString()) {
                            ctx.activeTrackIndex = "";
                            ctx.setActiveTrack(undefined);

                            e.preventDefault();
                        } else {
                            ctx.setActiveTrack(track.index);
                        }
                    }}
                >
                    {getName(track.language, "en") ||
                        track.title ||
                        `Track ${track.index + 1}`}
                </Dropdown.RadioItem>
            {/each}
        </Dropdown.RadioGroup>
    </Dropdown.Root>
    <!-- {#if ctx.showTrackMenu}
        <div
            class="absolute bottom-12 left-1/2 -translate-x-1/2 min-w-36 rounded-lg backdrop-blur-md bg-gray-900/80 text-sm text-white shadow-xl overflow-hidden"
        >
            <button
                class={cn(
                    "w-full px-4 py-2 text-left hover:bg-white/10 transition-colors",
                    ctx.activeTrackIndex === null && "text-primary-400",
                )}
                onclick={() => ctx.setActiveTrack(null)}
            >
                Off
            </button>
            {#each ctx.tracks as track (track.index)}
                <button
                    class={cn(
                        "w-full px-4 py-2 text-left hover:bg-white/10 transition-colors",
                        ctx.activeTrackIndex === track.index &&
                            "text-primary-400",
                    )}
                    onclick={() => ctx.setActiveTrack(track.index)}
                >
                    {track.title ||
                        track.language ||
                        `Track ${track.index + 1}`}
                </button>
            {/each}
        </div>
    {/if} -->
</div>
