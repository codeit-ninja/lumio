import { PersistedState } from "runed";

export type UseQueryOptions<T> = {
    fetcher: () => Promise<T>;
    invalidate?: () => boolean;
    expiresIn?: number;
    invalid?: boolean;
};

export type CacheEntry<T> = {
    data: T;
    expiresAt: number;
};

/**
 * A simple caching mechanism for async data fetching in Svelte components. It uses `PersistedState` to store the cached data and its expiration time. The `useQuery` function checks if the cached data is still valid before returning it, and if not, it calls the provided fetcher function to get fresh data and updates the cache.
 *
 * Example usage:
 *
 * ```ts
 * const data = await useQuery("my-data key", {
 *     fetcher: async () => {
 *         // Fetch data from an API or perform any async operation
 *         const response = await fetch("https://api.example.com/data");
 *         return response.json();
 *     },
 *     expiresIn: 1000 * 60 * 5, // Cache expires in 5 minutes
 * });
 * ```
 *
 * @param key - A unique key to identify the cached data.
 * @param options - An object containing the fetcher function, optional invalidate function, and optional expiration time.
 * @returns The cached data if valid, or fresh data from the fetcher if the cache is expired or invalid.
 * @throws Any error thrown by the fetcher function will be propagated to the caller.
 */
export const useQuery = async <T>(key: string, options: UseQueryOptions<T>) => {
    const persisted = new PersistedState<CacheEntry<T> | undefined>(
        key,
        undefined,
    );

    if (persisted.current && !options.invalid) {
        const { data, expiresAt } = persisted.current;

        if (expiresAt > Date.now()) {
            return data;
        }

        persisted.current = undefined;
    }

    const data = await options.fetcher();

    persisted.current = {
        data,
        expiresAt: Date.now() + (options.expiresIn ?? 1000 * 60 * 60), // default 1 hour
    };

    return data;
};
