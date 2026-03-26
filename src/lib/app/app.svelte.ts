import type { Stream } from "./stream.svelte";
import { createContext } from "svelte";

export class AppContext {
    stream = $state<Stream>();
}

const [get, set] = createContext<AppContext>();
export const createApp = () => set(new AppContext());
export const useApp = get;
