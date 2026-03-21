import type { Genres } from "tmdb-ts/dist/endpoints/genre";

import { resource } from "runed"

import { tmdb } from "$lib/tmdb";

export const genre = $state<{ current: keyof typeof tmdb.genres }>({ current: 'movies' })

export const getGenres = () => {
    return resource(
        () => genre.current,
        () => tmdb.genres[genre.current]().then<Genres['genres']>((response) => response.genres)
    )
}