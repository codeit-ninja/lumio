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
    class="w-sm"
    bind:value={search}
    bind:ref={customAnchor}
/>
<Popover.Root bind:open>
    <Popover.Content
        {customAnchor}
        class={cn(
            "w-(--bits-popover-anchor-width) outline-none",
            "bg-gray-900 rounded shadow z-100",
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
                    {console.log(movie)}
                    <a
                        href={resolve("/movies/[id]", {
                            id: movie.id.toString(),
                        })}
                    >
                        <Movie.Root
                            {movie}
                            class="not-first:border-t-2 border-gray-800 grid grid-cols-[100px_1fr] gap-4 p-4"
                        >
                            <Movie.Poster class="rounded" />
                            <div class="flex flex-col gap-2">
                                <Movie.Title class="text-lg font-bold" />
                                <Movie.Genres />
                                <Movie.Rating />
                            </div>
                        </Movie.Root>
                    </a>
                {/if}
            {/each}
        </ScrollArea>
    </Popover.Content>
</Popover.Root>
