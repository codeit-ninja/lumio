import type { Movie } from "tmdb-ts/dist/types"

import { resource } from "runed"

import { tmdb } from "$lib/tmdb"

export const getTrending = async () => {
    return resource<Movie[] | null>(
        () => null,
        () => tmdb.discover.movie({ sort_by: 'popularity.desc' }).then(res => res.results)
    )
}