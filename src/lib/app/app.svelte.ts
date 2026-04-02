import type { Stream } from "./stream.svelte";
import { createContext } from "svelte";
import { PUBLIC_WYZIE_API_KEY } from "$env/static/public";
import { createWyzie } from "$lib/subtitles";

export class AppContext {
    stream = $state<Stream>();

    subtitles = createWyzie(PUBLIC_WYZIE_API_KEY);
}

const [get, set] = createContext<AppContext>();
export const createApp = () => set(new AppContext());
export const useApp = get;
