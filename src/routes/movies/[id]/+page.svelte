<script lang="ts">
    import { getName } from "@cospired/i18n-iso-languages";
    import { format, intervalToDuration } from "date-fns";
    import { resource } from "runed";
    import * as Movie from "$lib/components/movie";
    import { ButtonBack } from "$lib/components/ui/button";
    import { Skeleton } from "$lib/components/ui/skeleton";
    import { getMovieDetails } from "$lib/movies";

    let { params } = $props();

    const movie = resource(
        () => params.id,
        () => getMovieDetails(params.id),
    );

    $inspect(params.id);
</script>

{#if movie.loading}
    <div class="mt-6 relative h-full">
        <!-- backdrop -->
        <Skeleton
            class="fixed h-full w-full object-cover opacity-20 rounded-4xl corner-squircle"
            shimmer={false}
        />

        <div class="absolute inset-0 p-8 z-10">
            <!-- back button -->
            <Skeleton class="h-9 w-20 rounded-lg mb-8" />

            <div class="grid grid-cols-[400px_1fr] items-start gap-8">
                <!-- poster -->
                <Skeleton class="w-full aspect-2/3 rounded-4xl" />

                <div class="py-4 flex flex-col">
                    <!-- genres -->
                    <div class="flex gap-2 mb-8">
                        <Skeleton class="h-6 w-20 rounded-full" />
                        <Skeleton class="h-6 w-16 rounded-full" />
                        <Skeleton class="h-6 w-24 rounded-full" />
                    </div>

                    <!-- rating -->
                    <Skeleton class="h-8 w-28 rounded-lg mb-12" />

                    <!-- title -->
                    <Skeleton class="h-10 w-2/3 rounded-lg" />

                    <!-- details row: year · runtime · language -->
                    <div class="flex gap-4 mt-4 mb-6">
                        <Skeleton class="h-5 w-12 rounded-md" />
                        <Skeleton class="h-5 w-16 rounded-md" />
                        <Skeleton class="h-5 w-20 rounded-md" />
                    </div>

                    <!-- plot lines -->
                    <div class="flex flex-col gap-2 max-w-3xl">
                        <Skeleton class="h-4 w-full rounded-md" />
                        <Skeleton class="h-4 w-full rounded-md" />
                        <Skeleton class="h-4 w-4/5 rounded-md" />
                        <Skeleton class="h-4 w-3/4 rounded-md" />
                    </div>

                    <!-- action buttons -->
                    <div class="flex items-center gap-4 mt-8">
                        <Skeleton class="h-12 w-36 rounded-xl" />
                        <Skeleton class="h-12 w-36 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    </div>
{:else if movie.current}
    <Movie.Root movie={movie.current} class="mt-6 relative h-full">
        <Movie.Backdrop class="fixed h-full w-full object-cover opacity-20" />
        <div class="absolute inset-0 p-8 z-10">
            <div class="mb-8">
                <ButtonBack />
            </div>
            <div class="grid grid-cols-[400px_1fr] items-start gap-8">
                <div class="rounded-4xl overflow-hidden corner-squircle">
                    <Movie.Poster />
                </div>
                <div class="py-4">
                    <Movie.Genres size="lg" class="mb-8" />
                    <Movie.Rating size="lg" class="mb-12" />
                    <Movie.Title level="1" />
                    <Movie.Details
                        keys={[
                            {
                                key: "release_date",
                                value: (movie) =>
                                    format(
                                        new Date(movie.release_date),
                                        "yyyy",
                                    ),
                            },
                            {
                                key: "runtimeSeconds",
                                value: (movie) => {
                                    if (!movie.runtimeSeconds) {
                                        return undefined;
                                    }

                                    const duration = intervalToDuration({
                                        start: 0,
                                        end: movie.runtimeSeconds * 1000,
                                    });

                                    return `${duration.hours}h ${duration.minutes}m`;
                                },
                            },
                            {
                                key: "original_language",
                                value: (movie) =>
                                    getName(movie.original_language, "en") ??
                                    undefined,
                            },
                        ]}
                        class="mt-4 text-gray-300 mb-6"
                    />
                    <Movie.Plot class="max-w-3xl" />
                    <div class="flex items-center gap-4 mt-8">
                        <Movie.Watch size="lg" />
                        <Movie.Trailer size="lg" />
                    </div>
                </div>
            </div>
        </div>
    </Movie.Root>
{/if}
