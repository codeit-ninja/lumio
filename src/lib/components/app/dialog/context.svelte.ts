import type { Component } from "svelte";
import { createContext } from "svelte";

export type DialogOptions<Props extends Record<string, unknown>> = {
    title: string;
    description?: string;
    component: Component<Props>;
    size?: "sm" | "md" | "lg";
    props?: Props;
};

class Dialog {
    open: boolean = $state(false);

    title: string = $state("");

    description: string = $state("");

    component: Component<any> | null = $state.raw(null);

    props: Record<string, unknown> | null = $state(null);

    size = $state<"sm" | "md" | "lg">("md");

    create<Props extends Record<string, unknown>>(
        options: DialogOptions<Props>,
    ) {
        this.title = options.title;
        this.description = options.description || "";
        this.component = options.component;
        this.props = options.props || null;
        this.size = options.size || "md";
    }

    openDialog() {
        this.open = true;
    }

    closeDialog() {
        this.open = false;
    }
}

const [get, set] = createContext<Dialog>();
export const createDialog = () => set(new Dialog());
export const useDialog = () => get();
