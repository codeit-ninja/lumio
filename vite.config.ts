import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "fs";
import { vite as vidstack } from "vidstack/plugins";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

// bits-ui ships pre-compiled .svelte files. When vite-plugin-svelte fails to
// provide the virtual CSS module (meta.svelte.css not yet in module graph),
// Vite falls back to reading the raw .svelte file and Tailwind v4 chokes on
// the JS content. This plugin intercepts those requests first.
function bitsUiCssPlugin(): Plugin {
    return {
        name: "bits-ui-css",
        enforce: "pre",
        load(id) {
            if (
                id.includes("/node_modules/bits-ui/") &&
                /[?&]svelte&type=style&lang\.css$/.test(id)
            ) {
                const filePath = id.replace(/\?.*$/, "");
                try {
                    const src = readFileSync(filePath, "utf-8");
                    const match = src.match(/<style[^>]*>([\s\S]*?)<\/style>/);
                    if (!match) return { code: "" };
                    // Strip Svelte's :global() wrappers so browsers understand the CSS
                    const css = match[1]
                        .trim()
                        .replace(/:global\(([^)]+)\)/g, "$1");
                    return { code: css };
                } catch {
                    return { code: "" };
                }
            }
        },
    };
}

export default defineConfig({
    plugins: [bitsUiCssPlugin(), tailwindcss(), vidstack(), sveltekit()],
    optimizeDeps: {
        exclude: ["runed", "phosphor-svelte", "bits-ui"],
    },
});

// test build
