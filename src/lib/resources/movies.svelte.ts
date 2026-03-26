import { resource } from "runed";
import { createContext } from "svelte";
import type { Genre, Movie } from "tmdb-ts/dist/types";
import { TMDb } from "$lib/tmdb";

export class Movies {
    trending = resource(
        () => null,
        () =>
            TMDb.discover
                .movie({
                    "vote_count.gte": 500,
                })
                .then<Movie[]>((res) => res.results),
    );

    genres = resource(
        () => null,
        () => TMDb.genres.movies().then<Genre[]>((response) => response.genres),
    );
}

const [get, set] = createContext<Movies>();
export const createMovies = () => set(new Movies());
export const useMovies = get;
