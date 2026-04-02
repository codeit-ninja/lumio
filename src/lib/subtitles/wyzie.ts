const BASE_URL = "https://sub.wyzie.io";

export interface WyzieSubtitle {
    id: string;
    url: string;
    flagUrl: string;
    format: string;
    encoding: string;
    display: string;
    language: string;
    media: string;
    isHearingImpaired: boolean;
    source: string;
    release: string;
    releases: string[];
    fileName: string;
    downloadCount?: number;
    origin: string;
    matchedRelease?: string;
    matchedFilter?: string;
}

export interface WyzieSearchParams {
    /**
     * TMDB or IMDB ID (required). For IMDB IDs, include the 'tt' prefix.
     */
    id: string | number;
    /**
     * Season number (required together with episode for TV shows).
     */
    season?: number;
    /**
     * Episode number (required together with season for TV shows).
     */
    episode?: number;
    /**
     * ISO 639-1 language codes, e.g. ["en", "es"].
     */
    language?: string[];
    /**
     * Subtitle formats to return, e.g. ["srt", "ass"].
     */
    format?: string[];
    /**
     * Whether to prefer hearing-impaired subtitles.
     */
    hi?: boolean;
    /**
     * Character encoding filter, e.g. ["utf-8", "latin-1"].
     */
    encoding?: string[];
    /**
     * Subtitle providers to query, e.g. ["subdl", "podnapisi"]. Defaults to opensubtitles.
     */
    source?: string[];
    /**
     * Release or scene name filters, e.g. ["1080p", "WEB"].
     */
    release?: string[];
    /**
     * Filename filters.
     */
    fileName?: string[];
    /**
     * Content origin filter, e.g. ["WEB", "BLURAY", "DVD"].
     */
    origin?: string[];
    /**
     * Bypass cache and fetch fresh results.
     */
    refresh?: boolean;
}

export class Wyzie {
    constructor(private readonly apiKey: string) {}
    /**
     * Search for subtitles matching the given parameters.
     * At least `id` is required, and if searching for TV shows, both `season` and `episode` must be provided.
     * The other parameters are optional filters to narrow down results.
     *
     * The API returns an array of matching subtitles with metadata and download URLs.
     *
     * @param params Search parameters to filter subtitle results.
     * @returns A promise that resolves to an array of matching subtitles.
     */
    async search(params: WyzieSearchParams): Promise<WyzieSubtitle[]> {
        console.log("Searching Wyzie with params:", params);
        const query = new URLSearchParams();
        query.set("id", String(params.id));
        query.set("key", this.apiKey);

        if (params.season !== undefined) {
            query.set("season", String(params.season));
        }

        if (params.episode !== undefined) {
            query.set("episode", String(params.episode));
        }

        if (params.language?.length) {
            query.set("language", params.language.join(","));
        }

        if (params.format?.length) {
            query.set("format", params.format.join(","));
        }

        if (params.hi !== undefined) {
            query.set("hi", String(params.hi));
        }

        if (params.encoding?.length) {
            query.set("encoding", params.encoding.join(","));
        }
        if (params.source?.length) {
            query.set("source", params.source.join(","));
        }

        if (params.release?.length) {
            query.set("release", params.release.join(","));
        }

        if (params.fileName?.length) {
            query.set("fileName", params.fileName.join(","));
        }

        if (params.origin?.length) {
            query.set("origin", params.origin.join(","));
        }

        if (params.refresh !== undefined) {
            query.set("refresh", String(params.refresh));
        }

        const response = await fetch(`${BASE_URL}/search?${query}`);
        if (!response.ok) {
            throw new Error(
                `Wyzie API error: ${response.status} ${response.statusText}`,
            );
        }
        return response.json() as Promise<WyzieSubtitle[]>;
    }
}

export const createWyzie = (apiKey: string) => new Wyzie(apiKey);
