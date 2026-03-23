import type { IMDbMovieDetails } from "$lib/imdb";
import type { OMDbMovieDetails } from "$lib/omdb";
import type { AppendToResponse, MovieDetails } from "tmdb-ts";
import { createContext } from "svelte";

export type MovieContext = {
    omdb: OMDbMovieDetails;
    imdb: IMDbMovieDetails;
    tmdb: AppendToResponse<MovieDetails, ["external_ids", "videos"], "movie">;
};

const [get, set] = createContext<MovieContext>();
export const createMovie = (movie: () => MovieContext) => set(movie());
export const useMovie = () => get();
