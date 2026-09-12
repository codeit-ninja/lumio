import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { createDrizzleProxy, Database, migrate } from "tauri-plugin-libsql-api";
import {
    favoritesListItems,
    favoritesLists,
    movies,
    relations,
} from "./schema";

const migrations = import.meta.glob<string>("$lib/drizzle/**/*.sql", {
    eager: true,
    query: "?raw",
    import: "default",
});

await Database.load("sqlite:lumio.db");
await migrate("sqlite:lumio.db", migrations);

export const db = drizzle(createDrizzleProxy("sqlite:lumio.db"), {
    schema: {
        favoritesListItems,
        favoritesLists,
        movies,
    },
    relations,
});

const [favoriteList] = await db
    .select()
    .from(favoritesLists)
    .where(eq(favoritesLists.name, "Default"))
    .limit(1);

// If the default favorite list doesn't exist, create it
// This ensures that there's always a default list for users to add movies to
if (!favoriteList) {
    await db
        .insert(favoritesLists)
        .values({ id: 1, name: "Default" })
        .execute();
}
