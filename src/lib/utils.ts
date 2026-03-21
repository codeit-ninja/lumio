import type { ClassValue } from 'svelte/elements'

import { twMerge } from 'tailwind-merge'

export const cn = (...classes: (ClassValue | null | undefined | false)[]) => {
    return twMerge(...classes.filter(Boolean) as string[])
}

export const getTMDBImageURL = (path: string, size: string = "original") => {
    return `https://image.tmdb.org/t/p/${size}${path}`;
}