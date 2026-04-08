import type { FavoriteListWithItems } from "$lib/database/favorites";
import { createContext } from "svelte";

export class FavoriteListContext {
    #list: () => FavoriteListWithItems;
    current = $derived.by(() => this.#list());

    isExpanded = $state(false);

    constructor(list: () => FavoriteListWithItems) {
        this.#list = list;
    }
}

const [getList, setList] = createContext<FavoriteListContext>();
export const createFavoriteList = (list: () => FavoriteListWithItems) =>
    setList(new FavoriteListContext(list));
export const useFavoriteList = () => getList();
