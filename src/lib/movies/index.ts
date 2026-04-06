import { IMDb } from "$lib/imdb";
import { TMDb } from "$lib/tmdb";

/**
 * Get detailed information about a movie by IMDb ID, including data from TMDb.
 *
 * @param {string} imdbId - The IMDb ID of the movie.
 */
export const getMovieDetails = async (imdbId: string) => {
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
