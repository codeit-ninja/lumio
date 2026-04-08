import type {
    FavoriteList,
    FavoriteListItem,
    FavoriteListWithItems,
} from "$lib/database/favorites";
import { orm } from "$lib/database";
import { favoriteListItems, favoriteLists } from "$lib/database/favorites";

export const load = async ({ depends }) => {
    depends("app:favorites");

    const [allLists, allItems] = await Promise.all([
        orm.select(favoriteLists).all() as Promise<FavoriteList[]>,
        orm.select(favoriteListItems).all() as Promise<FavoriteListItem[]>,
    ]);

    return {
        lists: allLists.map((list) => ({
            ...list,
            items: allItems.filter((item) => item.favoriteListId === list.id),
        })) as FavoriteListWithItems[],
    };
};
