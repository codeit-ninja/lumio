import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { createApiBay } from "apibay.org";

// Patch global fetch so apibay.org requests go through Tauri's HTTP plugin (bypasses CORS)
const originalFetch = globalThis.fetch;
globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
        typeof input === "string"
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url;
    if (url.includes("apibay.org")) {
        return tauriFetch(input, init);
    }
    return originalFetch(input, init);
};

export const tbp = createApiBay({ transform: true });
