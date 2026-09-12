import type { Movie } from "$lib/resources/movies.svelte";
import type { InferSelectModel } from "drizzle-orm";
import { defineRelations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export { movies } from "./movies";
export type { CachedMovie } from "./movies";

export const favoritesLists = sqliteTable("favorites_lists", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
});

export const favoritesListItems = sqliteTable("favorites_list_items", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    listId: integer("list_id")
        .notNull()
        .references(() => favoritesLists.id, { onDelete: "cascade" }),
    imdbId: text("imdb_id").notNull(),
    details: text("details", { mode: "json" }).notNull().$type<Movie>(),
});

export const relations = defineRelations(
    { favoritesLists, favoritesListItems },
    (r) => ({
        favoritesLists: {
            items: r.many.favoritesListItems(),
        },
        favoritesListItems: {
            list: r.one.favoritesLists({
                from: r.favoritesListItems.listId,
                to: r.favoritesLists.id,
            }),
        },
    }),
);

export type FavoriteList = InferSelectModel<typeof favoritesLists>;
export type FavoriteListItem = InferSelectModel<typeof favoritesListItems>;
export type FavoriteListWithItems = FavoriteList & {
    items: FavoriteListItem[];
};
