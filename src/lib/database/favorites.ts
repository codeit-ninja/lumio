import type { Movie } from "$lib/resources/movies.svelte";
import type {
    InferRelationalSelectModel,
    InferSelectModel,
} from "@type32/tauri-sqlite-orm";
import {
    integer,
    relations,
    sqliteTable,
    text,
    blob,
} from "@type32/tauri-sqlite-orm";

export const favoriteLists = sqliteTable("favorite_lists", {
    id: integer("id").primaryKey().autoincrement(),
    name: text("name").unique().notNull(),
});

export const favoriteListItems = sqliteTable("favorite_list_items", {
    id: integer("id").primaryKey().autoincrement(),
    favoriteListId: integer("favorite_list_id")
        .notNull()
        .references(() => favoriteLists._.columns.id, { onDelete: "cascade" }),
    imdbId: text("imdb_id").notNull(),
    movie: blob("movie", { mode: "json" }).notNull().$type<Movie>(),
});

export const favoriteListsWithItems = relations(favoriteLists, ({ many }) => ({
    items: many(favoriteListItems),
}));

export const favoriteListItemsRelations = relations(
    favoriteListItems,
    ({ one }) => ({
        favoriteList: one(favoriteLists, {
            fields: [favoriteListItems._.columns.favoriteListId],
            references: [favoriteLists._.columns.id],
        }),
    }),
);

export type FavoriteList = InferSelectModel<typeof favoriteLists>;
export type FavoriteListItem = InferSelectModel<typeof favoriteListItems>;
export type FavoriteListWithItems = InferRelationalSelectModel<
    typeof favoriteLists,
    typeof favoriteListsWithItems,
    { items: true }
>;
