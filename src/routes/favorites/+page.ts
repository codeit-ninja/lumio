import type { PageLoad } from "./$types";
import { db } from "$lib/database";

export const load: PageLoad = async ({ depends }) => {
    depends("app:favorites");

    const lists = await db.query.favoritesLists.findMany({
        with: {
            items: true,
        },
    });

    return {
        lists,
    };
};
