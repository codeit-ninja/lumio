<script lang="ts">
    import { Popover } from "bits-ui";
    import { isEmpty } from "lodash-es";
    import { Debounced, resource } from "runed";
    import { resolve } from "$app/paths";
    import * as Movie from "$lib/components/movie";
    import { Input } from "$lib/components/ui/input";
    import { ScrollArea } from "$lib/components/ui/scroll-area";
    import { TMDb } from "$lib/tmdb";
    import { cn } from "$lib/utils";

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

            return TMDb.search
                .multi({
                    query: query.current!,
                })
                .then(({ results }) =>
                    results.filter(
                        (result) =>
                            ["movie", "tv"].includes(result.media_type) &&
                            "vote_count" in result &&
                            result.vote_count > 0 &&
                            "vote_average" in result &&
                            result.vote_average > 1,
                    ),
                )
                .finally(() => {
                    open = true;
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
</Popover.Root>
