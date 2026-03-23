import { error } from "@sveltejs/kit";
import { isNumber } from "lodash-es";
import { IMDb } from "$lib/imdb.js";
import { OMDb } from "$lib/omdb";
import { TMDb } from "$lib/tmdb";

export const load = async ({ params }) => {
    const { id } = params;

    if (!id || !isNumber(Number(id))) {
        return error(400, "Invalid movie ID");
    }

    try {
        const tmdb = await TMDb.movies.details(Number(id), [
            "external_ids",
            "videos",
        ]);
        const omdb = await OMDb.getMovieById(tmdb.external_ids.imdb_id);
        const imdb = await IMDb.titles.imDbApiServiceGetTitle(
            tmdb.external_ids.imdb_id,
        );

        return {
            tmdb,
            omdb,
            imdb,
        };
    } catch (err) {
        console.error("Failed to load movie details:", err);
        return error(500, "Failed to load movie details");
    }
};
