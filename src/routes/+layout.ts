import "../app.css";

import { registerLocale } from "@cospired/i18n-iso-languages";
import en from "@cospired/i18n-iso-languages/langs/en.json";
import { eq } from "@type32/tauri-sqlite-orm";
import { orm } from "$lib/database";
import { favoriteLists } from "$lib/database/favorites";

registerLocale(en);

export const prerender = true;
export const ssr = false;
export const trailingSlash = "always";

await orm.migrate();

// await orm.dropTable("favorite_lists");
// await orm.dropTable("favorite_list_items");

const favoriteList = await orm
    .select(favoriteLists)
    .where(eq(favoriteLists._.columns.name, "default"))
    .first();

// If the default favorite list doesn't exist, create it
// This ensures that there's always a default list for users to add movies to
if (!favoriteList) {
    const result = await orm
        .insert(favoriteLists)
        .values({ name: "default" })
        .execute();
    console.log("Created default favorite list:", result);
}
