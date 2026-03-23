import { z } from "zod";
import { env } from "$env/dynamic/public";

export type GetMovieOptions = {
    t?: string;
    i?: string;
    y?: number;
    plot?: "short" | "full";
    apiKey?: string;
};
const movieDetailsSchema = z
    .object({
        Title: z.string().optional(),
        Year: z.string().optional(),
        Rated: z.string().optional(),
        Released: z.string().optional(),
        Runtime: z.string().optional(),
        Genre: z.string().optional(),
        Director: z.string().optional(),
        Writer: z.string().optional(),
        Actors: z.string().optional(),
        Plot: z.string().optional(),
        Language: z.string().optional(),
        Country: z.string().optional(),
        Awards: z.string().optional(),
        Poster: z.string().optional(),
        Ratings: z
            .array(
                z.object({
                    Source: z.string(),
                    Value: z.string(),
                }),
            )
            .optional()
            .default([]),
        Metascore: z.string().optional(),
        imdbRating: z.string().optional(),
        imdbVotes: z.string().optional(),
        imdbID: z.string().optional(),
        Type: z.string().optional(),
        DVD: z.string().optional(),
        BoxOffice: z.string().optional(),
        Production: z.string().optional(),
        Website: z.string().optional(),
        Response: z.string().optional(),
    })
    .transform((data) => ({
        title: data.Title === "N/A" ? undefined : data.Title,
        year: data.Year === "N/A" ? undefined : data.Year,
        rated: data.Rated === "N/A" ? undefined : data.Rated,
        released: data.Released === "N/A" ? undefined : data.Released,
        runtime: data.Runtime === "N/A" ? undefined : data.Runtime,
        genre: data.Genre === "N/A" ? undefined : data.Genre,
        director: data.Director === "N/A" ? undefined : data.Director,
        writer: data.Writer === "N/A" ? undefined : data.Writer,
        actors: data.Actors === "N/A" ? undefined : data.Actors,
        plot: data.Plot === "N/A" ? undefined : data.Plot,
        language: data.Language === "N/A" ? undefined : data.Language,
        country: data.Country === "N/A" ? undefined : data.Country,
        awards: data.Awards === "N/A" ? undefined : data.Awards,
        poster: data.Poster === "N/A" ? undefined : data.Poster,
        ratings: data.Ratings.map((r) => ({
            source: r.Source,
            value: r.Value,
        })),
        metascore: data.Metascore === "N/A" ? undefined : data.Metascore,
        imdbRating: data.imdbRating ? parseFloat(data.imdbRating) : undefined,
        imdbVotes: data.imdbVotes
            ? parseInt(data.imdbVotes.replace(/,/g, ""))
            : undefined,
        imdbId: data.imdbID === "N/A" ? undefined : data.imdbID,
        type: data.Type === "N/A" ? undefined : data.Type,
        dvd: data.DVD === "N/A" ? undefined : data.DVD,
        boxOffice: data.BoxOffice === "N/A" ? undefined : data.BoxOffice,
        production: data.Production === "N/A" ? undefined : data.Production,
        website: data.Website === "N/A" ? undefined : data.Website,
        response: data.Response === "N/A" ? undefined : data.Response,
    }));

export type OMDbMovieDetails = z.infer<typeof movieDetailsSchema>;

class OMDB {
    private apiKey: string;
    private baseUrl: string;

    private params: Record<string, string> = {};

    constructor(apiKey: string, baseUrl: string = "https://www.omdbapi.com/") {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;

        this.params = {
            apikey: this.apiKey,
        };
    }

    getMovieById(
        id: string,
        options?: GetMovieOptions,
    ): Promise<OMDbMovieDetails> {
        return this.request({ i: id, ...options });
    }

    getMovieByTitle(
        title: string,
        options?: GetMovieOptions,
    ): Promise<OMDbMovieDetails> {
        return this.request({ t: title, ...options });
    }

    request(options?: GetMovieOptions): Promise<OMDbMovieDetails> {
        this.params = {
            ...this.params,
            ...Object.fromEntries(
                Object.entries(options || {}).map(([key, value]) => [
                    key,
                    String(value),
                ]),
            ),
        };

        return fetch(
            `${this.baseUrl}?${new URLSearchParams(this.params).toString()}`,
        )
            .then(async (res) => {
                const data = await res.json();
                return data;
            })
            .then((data) => movieDetailsSchema.parse(data))
            .catch((err) => {
                console.error("OMDb API request failed:", err);
                throw new Error("Failed to fetch data from OMDb API");
            });
    }
}

export const OMDb = new OMDB(env.PUBLIC_OMDB_API_KEY);
