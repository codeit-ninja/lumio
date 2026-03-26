import type { Component } from "svelte";
import { createContext } from "svelte";

// Infer Props from a Component type
type InferProps<C> = C extends Component<infer P, any, any> ? P : never;

export type DialogOptions<
    C extends Component<any, any, any> = Component<any, any, any>,
> = {
    title?: string;
    description?: string;
    component: C;
    size?: "sm" | "md" | "lg" | "full";
    props?: InferProps<C>;
};

class Dialog {
    open: boolean = $state(false);

    title: string | undefined = $state();

    description: string | undefined = $state();

    component: Component<any, any, any> | null = $state.raw(null);

    props: Record<string, any> | null = $state(null);

    size = $state<"sm" | "md" | "lg" | "full">("md");

    create<C extends Component<any, any, any>>(options: DialogOptions<C>) {
        this.title = options.title;
        this.description = options.description;
        this.component = options.component;
        this.props = (options.props ?? null) as Record<string, any> | null;
        this.size = options.size ?? "md";
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
