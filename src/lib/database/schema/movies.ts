import type { InferSelectModel } from "drizzle-orm";
import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const movies = sqliteTable("movies", {
    id: int("id").primaryKey({ autoIncrement: true }),
    imdbId: text("imdb_id").notNull().unique(),
    didWatch: int("did_watch", { mode: "boolean" }).notNull().default(false),
    watchedAt: int("watched_at", { mode: "timestamp" }),
    stoppedAt: int("stopped_at", { mode: "number" }),
});

export type CachedMovie = InferSelectModel<typeof movies>;
