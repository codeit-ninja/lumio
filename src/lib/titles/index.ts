import type { IMDbMovieDetails } from "$lib/imdb";
import type { Movie, TV } from "tmdb-ts";
import { IMDb } from "$lib/imdb";
import { TMDb } from "$lib/tmdb";

export type MovieDetails = Omit<IMDbMovieDetails, "id"> &
    Omit<Movie, "id"> & { id: string; media_type: string; tmdbId: number };
export type TVSeriesDetails = Omit<IMDbMovieDetails, "id"> &
    Omit<TV, "id"> & { id: string; media_type: string; tmdbId: number };

/**
 * Get detailed information about a movie by IMDb ID, including data from TMDb.
 *
 * @param {string} imdbId - The IMDb ID of the movie.
 */
export const getMovieDetails = async (
    imdbId: string,
): Promise<MovieDetails> => {
    const imdb = await IMDb.titles.imDbApiServiceGetTitle(imdbId);
    const { movie_results } = await TMDb.find.byExternalId(imdbId, {
        external_source: "imdb_id",
    });

    if (!imdb || !movie_results || movie_results.length === 0) {
        throw new Error(`Failed to fetch movie details for IMDb ID: ${imdbId}`);
    }

    return {
        ...imdb,
        ...movie_results[0],
        id: imdbId,
        tmdbId: movie_results[0].id,
    };
};

/**
 * Get detailed information about a TV series by IMDb ID, including data from TMDb.
 *
 * @param {string} imdbId - The IMDb ID of the TV series.
 * @returns {Promise<TVSeriesDetails>} A promise that resolves to the TV series details.
 * @throws Will throw an error if the details cannot be fetched for the given IMDb ID.
 */
export const getTVSeriesDetails = async (
    imdbId: string,
): Promise<TVSeriesDetails> => {
    const imdb = await IMDb.titles.imDbApiServiceGetTitle(imdbId);
    const { tv_results } = await TMDb.find.byExternalId(imdbId, {
        external_source: "imdb_id",
    });

    if (!imdb || !tv_results || tv_results.length === 0) {
        throw new Error(
            `Failed to fetch TV series details for IMDb ID: ${imdbId}`,
        );
    }

    return {
        ...imdb,
        ...tv_results[0],
        id: imdbId,
        tmdbId: tv_results[0].id,
    };
};
