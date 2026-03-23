import type { ClassValue } from "svelte/elements";
import { twMerge } from "tailwind-merge";
import { env } from "$env/dynamic/public";

export const cn = (...classes: (ClassValue | null | undefined | false)[]) => {
    return twMerge(...(classes.filter(Boolean) as string[]));
};

export const getTMDBImageURL = (path: string, size: string = "original") => {
    return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getOMDBPostURL = (imdbId: string, h: number = 500) => {
    return `https://img.omdbapi.com/?i=${imdbId}&h=${h}&apikey=${env.PUBLIC_OMDB_API_KEY}`;
};
