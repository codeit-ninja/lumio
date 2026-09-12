import type { IMDbMovieDetails } from "$lib/imdb";
import type { TV } from "tmdb-ts";
import pLimit from "p-limit";
import { resource } from "runed";
import { createContext } from "svelte";
import { useQuery } from "$lib/cache";
import { IMDb } from "$lib/imdb";
import { TMDb } from "$lib/tmdb";

export type TVSeries = Omit<IMDbMovieDetails, "id"> &
    Omit<TV, "id"> & { id: string; media_type: string; tmdbId: number };

export class Series {
    trending = resource(
        () => null,
        async () => {
            return useQuery("trending-tv-series", {
                fetcher: async () => {
                    const response = await IMDb.titles.imDbApiServiceListTitles(
                        {
                            sortBy: "SORT_BY_POPULARITY",
                            types: ["TV_SERIES"],
                            minVoteCount: 15000,
                        },
                    );

                    const limit = pLimit(5);
                    const titles = (response.titles ?? []).map((title) =>
                        limit(async () => {
                            if (!title.id) {
                                return null;
                            }

                            const { tv_results } = await TMDb.find.byExternalId(
                                title.id,
                                {
                                    external_source: "imdb_id",
                                },
                            );

                            if (!tv_results?.[0]) {
                                return null;
                            }

                            return {
                                ...title,
                                ...tv_results?.[0],
                                id: title.id,
                                tmdbId: tv_results[0]?.id,
                            };
                        }),
                    );

                    const result = (await Promise.all(titles ?? [])).filter(
                        (m) => m !== null,
                    );
                    return result;
                },
            });
        },
    );
}

const [get, set] = createContext<Series>();
export const createSeries = () => set(new Series());
export const useSeries = get;
