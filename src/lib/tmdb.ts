import { TMDB } from "tmdb-ts";

import { PUBLIC_TMDB_API_KEY } from "$env/static/public";

export const tmdb = new TMDB(PUBLIC_TMDB_API_KEY);