import Database from "@tauri-apps/plugin-sql";
import { TauriORM } from "@type32/tauri-sqlite-orm";
import {
    favoriteListItems,
    favoriteListItemsRelations,
    favoriteLists,
    favoriteListsWithItems,
} from "./favorites";

export const db = await Database.load("sqlite:mydb.db");
export const orm = new TauriORM(db, {
    favoriteLists,
    favoriteListItems,
    favoriteListsWithItems,
    favoriteListItemsRelations,
});
