import type { IMDbMovieDetails } from "$lib/imdb";
import type { Genre, Movie as TMDbMovie } from "tmdb-ts/dist/types";
import { PersistedState, resource } from "runed";
import { createContext } from "svelte";
import { IMDb } from "$lib/imdb";
import { TMDb } from "$lib/tmdb";

export type Movie = Omit<IMDbMovieDetails, "id"> &
    Omit<TMDbMovie, "id"> & { id: string; media_type: string; tmdbId: number };

export class Movies {
    trending = resource(
        () => null,
        async () => {
            const persisted = new PersistedState<Movie[] | undefined>(
                "trending-movies",
                undefined,
            );

            if (persisted.current) {
                return persisted.current;
            }

            const response = await IMDb.titles.imDbApiServiceListTitles({
                sortBy: "SORT_BY_POPULARITY",
                types: ["MOVIE"],
                countryCodes: ["NL"],
            });

            const movies = response.titles?.map(async (title) => {
                if (!title.id) {
                    return null;
                }

                const { movie_results } = await TMDb.find.byExternalId(
                    title.id,
                    {
                        external_source: "imdb_id",
                    },
                );

                if (!movie_results?.[0]) {
                    return null;
                }

                return {
                    ...title,
                    ...movie_results[0],
                    id: title.id,
                    tmdbId: movie_results[0].id,
                };
            });

            const result = (await Promise.all(movies ?? [])).filter(
                (m) => m !== null,
            );
            persisted.current = result;

            return persisted.current;
        },
    );

    genres = resource(
        () => null,
        () => TMDb.genres.movies().then<Genre[]>((response) => response.genres),
    );
}

const [get, set] = createContext<Movies>();
export const createMovies = () => set(new Movies());
export const useMovies = get;
