<script lang="ts">
    import { isEmpty } from "lodash-es";
    import { Debounced, resource } from "runed";
    import { resolve } from "$app/paths";
    import { Img } from "$lib/components/ui/img";
    import { Input } from "$lib/components/ui/input";
    import * as Popover from "$lib/components/ui/popover";
    import { ScrollArea } from "$lib/components/ui/scroll-area";
    import { StarIcon } from "$lib/icons";
    import { IMDb } from "$lib/imdb";
    import { cn, formatNumber } from "$lib/utils";

    let search = $state<string>();
    let query = new Debounced(() => search, 300);
    let open = $state(false);
    let customAnchor = $state<HTMLElement>(null!);

    const results = resource(
        () => query.current,
        async () => {
            if (isEmpty(query.current)) {
                open = false;
                return;
            }

            return IMDb.search
                .imDbApiServiceSearchTitles({ query: query.current!, limit: 5 })
                .then((response) => {
                    open = true;

                    return (
                        response.titles?.filter(
                            (item) =>
                                item.startYear <= new Date().getFullYear(),
                        ) ?? []
                    );
                });
        },
    );
    $inspect(results.current);
</script>

<Input
    placeholder="Search..."
    bind:value={search}
    bind:ref={customAnchor}
    autocomplete="off"
/>
<Popover.Root bind:open>
    <Popover.Content
        {customAnchor}
        sideOffset={8}
        trapFocus={false}
        onOpenAutoFocus={(event) => {
            event.preventDefault();
        }}
        class={cn("w-(--bits-popover-anchor-width) overflow-clip")}
    >
        <ScrollArea class="max-h-120 p-4">
            {#each results.current as movie (movie.id)}
                <a
                    href={resolve("/movies/[id]", { id: movie.id })}
                    class={cn(
                        "bg-linear-to-br from-transparent to-transparent grid grid-cols-[100px_1fr] gap-4 not-last:mb-4 transition-all",
                        "border border-transparent rounded-xl overflow-clip",
                        "hover:border-white/10 hover:shadow-sm",
                    )}
                    onclick={() => {
                        open = false;
                    }}
                >
                    <Img
                        src={movie.primaryImage?.url}
                        wsrv={{ w: 100 }}
                        class="rounded-2xl corner-squircle"
                    />
                    <div class="py-1">
                        <h3 class="font-heading text-lg mb-4">
                            {movie.primaryTitle} ({movie.startYear})
                        </h3>
                        <div class="flex items-center gap-2 text-lg">
                            <StarIcon
                                class="text-rating size-8 relative bottom-0.5"
                            />
                            <span>
                                {movie.rating?.aggregateRating?.toFixed(1)}
                            </span>
                            <span class="text-sm font-medium text-gray-400">
                                {formatNumber(movie.rating?.voteCount ?? 0)}
                            </span>
                        </div>
                    </div>
                </a>
            {/each}
        </ScrollArea>
    </Popover.Content>
</Popover.Root>
<!-- <Popover.Root bind:open>
    <Popover.Content
        {customAnchor}
        class={cn(
            "w-(--bits-popover-anchor-width) outline-none backdrop-blur-sm",
            "border border-white/10 rounded-lg shadow z-50",
            "bg-linear-to-br from-gray-800/80 to-gray-900/80",
        )}
        sideOffset={4}
        trapFocus={false}
        onOpenAutoFocus={(event) => {
            event.preventDefault();
        }}
    >
        <ScrollArea class="max-h-120">
            {#each results.current as movie (movie.id)}
                {#if movie.media_type === "movie"}
                    <div class="px-2 pt-2 last:pb-2">
                        <a
                            href={resolve("/movies/[id]", {
                                id: movie.id.toString(),
                            })}
                            class={cn(
                                "bg-linear-to-br from-gray-100/10 to-gray-100/5 block rounded-lg border border-white/10",
                                "hover:bg-gray-300/10 data-[state=open]:bg-gray-300/10 transition-colors shadow-sm",
                            )}
                        >
                            <Movie.Root
                                {movie}
                                class="grid grid-cols-[100px_1fr] gap-4 p-2"
                            >
                                <Movie.Poster class="rounded" />
                                <div class="flex flex-col gap-1 min-w-0">
                                    <Movie.Title
                                        class="text-lg font-light truncate mb-0"
                                    />
                                    <Movie.Rating size="sm" />
                                    <Movie.Genres class="mt-2" size="sm" />
                                </div>
                            </Movie.Root>
                        </a>
                    </div>
                {/if}
            {/each}
        </ScrollArea>
    </Popover.Content>
</Popover.Root> -->
