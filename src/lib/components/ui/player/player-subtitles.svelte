<script lang="ts">
    import { getName } from "@cospired/i18n-iso-languages";
    import { Popover, Tabs } from "bits-ui";
    import SubtitlesIcon from "phosphor-svelte/lib/SubtitlesIcon";
    import { ScrollArea } from "../scroll-area";
    import { usePlayer } from ".";
    import { useApp } from "$lib/app";
    import { cn } from "$lib/utils";

    const ctx = usePlayer();
    const app = useApp();
</script>

<div class="relative">
    <Popover.Root open={true}>
        <Popover.Trigger
            class={cn(
                "cursor-pointer rounded-full size-14 backdrop-blur-md grid place-items-center [&_svg]:size-5",
                "[&_svg]:transition-all bg-gray-100/10 text-gray-100",
                "hover:[&_svg]:scale-115 active:[&_svg]:scale-95",
            )}
        >
            <SubtitlesIcon weight="light" />
        </Popover.Trigger>
        <Popover.Portal>
            <Popover.Content
                class="z-50 bg-gray-900/80 rounded-lg text-white min-w-md text-sm"
                align="end"
                side="top"
                sideOffset={12}
            >
                <Tabs.Root value="external">
                    <Tabs.List class="flex p-2 border-b border-gray-700">
                        <Tabs.Trigger
                            value="build-in"
                            class={cn(
                                "px-2 py-2 font-medium text-gray-400 cursor-pointer",
                                "data-[state=active]:font-medium data-[state=active]:text-white",
                            )}
                        >
                            Build-in
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="external"
                            class={cn(
                                "px-2 py-2 font-medium text-gray-400 cursor-pointer",
                                "data-[state=active]:font-medium data-[state=active]:text-white",
                            )}
                        >
                            External
                        </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="build-in">
                        {#if app.stream?.tracks.length === 0}
                            <div class="p-4 text-gray-400">
                                No build-in subtitles available.
                            </div>
                        {:else}
                            <ScrollArea class="max-h-100">
                                <div class="p-2 w-md">
                                    {#each app.stream?.tracks || [] as track (track.index)}
                                        <button
                                            class="truncate text-start cursor-pointer rounded-md px-4 py-2 hover:bg-gray-700/50 transition-colors"
                                            type="button"
                                            onclick={() => {
                                                ctx.setTrack(track);
                                            }}
                                        >
                                            {getName(track.language, "en") ||
                                                track.language.toUpperCase()}
                                        </button>
                                    {/each}
                                </div>
                            </ScrollArea>
                        {/if}
                    </Tabs.Content>
                    <Tabs.Content value="external">
                        <Tabs.Root class="grid grid-cols-[10rem_auto]">
                            <ScrollArea class="max-h-100">
                                <Tabs.List
                                    class="flex flex-col items-start gap-2 px-2 py-2 border-r border-gray-700"
                                >
                                    {#each Object.keys(app.stream?.externalTracks || {}) as lang (lang)}
                                        <Tabs.Trigger
                                            value={lang}
                                            class={cn(
                                                "grid px-2 py-1 rounded-md cursor-pointer transition-colors",
                                                "hover:text-primary-200",
                                                "data-[state=active]:text-primary-300 data-[state=active]:font-medium",
                                            )}
                                        >
                                            <span class="truncate">
                                                {getName(lang, "en") ||
                                                    lang.toUpperCase()}
                                            </span>
                                        </Tabs.Trigger>
                                    {/each}
                                </Tabs.List>
                            </ScrollArea>
                            <ScrollArea class="max-h-100">
                                {#each Object.keys(app.stream?.externalTracks || {}) as lang (lang)}
                                    <Tabs.Content
                                        value={lang}
                                        class="p-2 flex flex-col justify-start w-md gap-1"
                                    >
                                        {#each app.stream?.externalTracks[lang] || [] as track (track.id)}
                                            <button
                                                class="truncate text-start cursor-pointer rounded-md px-4 py-2 hover:bg-gray-700/50 transition-colors"
                                                type="button"
                                                onclick={() => {
                                                    ctx.setTrack(track);
                                                }}
                                            >
                                                {track.fileName}
                                            </button>
                                        {/each}
                                    </Tabs.Content>
                                {/each}
                            </ScrollArea>
                        </Tabs.Root>
                    </Tabs.Content>
                </Tabs.Root>
            </Popover.Content>
        </Popover.Portal>
    </Popover.Root>
</div>
