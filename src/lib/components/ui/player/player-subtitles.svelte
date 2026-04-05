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
    <Popover.Root bind:open={ctx.showTrackMenu}>
        <Popover.Trigger
            class={cn(
                "group cursor-pointer rounded-full size-14 backdrop-blur-md grid place-items-center [&_svg]:size-5 [&_svg]:transition-transform",
                "bg-linear-to-br from-gray-100/30 to-gray-100/25 text-gray-200 border border-white/10 shadow-sm",
                "data-active:bg-gray-100/20",
                "hover:[&_svg]:scale-115",
            )}
        >
            <SubtitlesIcon weight="light" />
        </Popover.Trigger>
        <Popover.Content
            class={cn(
                "z-50 bg-linear-(--gradient-liquid-100) backdrop-blur-xl rounded-lg text-white min-w-md text-sm",
                "border border-white/10 shadow-sm",
            )}
            align="end"
            side="top"
            sideOffset={12}
        >
            <Tabs.Root value="external">
                <Tabs.List class="flex p-2 border-b border-white/10">
                    <Tabs.Trigger
                        value="build-in"
                        class={cn(
                            "px-3 py-1.5 font-medium cursor-pointer text-shadow-sm rounded-md border border-transparent",
                            "data-[state=active]:bg-linear-(--gradient-liquid-200) data-[state=active]:border-white/10 data-[state=active]:shadow-xs",
                        )}
                    >
                        Build-in
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="external"
                        class={cn(
                            "px-3 py-1.5 font-medium cursor-pointer text-shadow-sm rounded-md border border-transparent",
                            "data-[state=active]:bg-linear-(--gradient-liquid-200) data-[state=active]:border-white/10 data-[state=active]:shadow-xs",
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
                    <Tabs.Root
                        class="grid grid-cols-[10rem_auto]"
                        bind:value={app.stream!.selectedExternalLang}
                    >
                        <ScrollArea class="max-h-100">
                            <Tabs.List
                                class="flex flex-col gap-2 p-1.5 border-r border-white/10"
                            >
                                {#each Object.keys(app.stream?.externalTracks || {}) as lang (lang)}
                                    <Tabs.Trigger
                                        value={lang}
                                        class={cn(
                                            "grid px-3 py-1.5 rounded-md cursor-pointer transition-colors text-start border border-transparent text-shadow-sm",
                                            "data-[state=active]:bg-linear-(--gradient-liquid-200) data-[state=active]:text-white data-[state=active]:border-white/10",
                                            "data-[state=active]:shadow-xs",
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
                                    class="p-1.5 flex flex-col justify-start w-md gap-1"
                                >
                                    {#each app.stream?.externalTracks[lang] || [] as track (track.id)}
                                        <button
                                            class={cn(
                                                "truncate text-start cursor-pointer rounded-md px-3 py-1.5 transition-colors border border-transparent text-shadow-sm",
                                                track.url === ctx.track?.src &&
                                                    "bg-linear-(--gradient-liquid-200) border-white/10 shadow-xs",
                                            )}
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
    </Popover.Root>
</div>
