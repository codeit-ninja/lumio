import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import importX from "eslint-plugin-import-x";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import svelteParser from "svelte-eslint-parser";
import tseslint from "typescript-eslint";

export default defineConfig([
    
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...svelte.configs["flat/recommended"],
    {
        plugins: {
            "import-x": importX,
        },
        rules: {
            "import-x/order": ["error", {
                "groups": [
                    "type",          // type imports first
                    "builtin",       // node:path, node:fs, etc.
                    "external",      // npm packages
                    "internal",      // $lib aliases
                    "parent",        // ../foo
                    "sibling",       // ./foo
                    "index",         // ./
                    "object",
                ],
                "newlines-between": "always",
                "alphabetize": {
                    "order": "asc",
                    "caseInsensitive": true,
                    "orderImportKind": "asc", // default imports before named within same group
                },
            }],
            "import-x/consistent-type-specifier-style": ["error", "prefer-top-level"],
            "indent": ["error", 4],
        },
    },
    {
        files: ["**/*.svelte", "**/*.svelte.ts"],
        languageOptions: {
            parser: svelteParser,
            parserOptions: {
                parser: tseslint.parser,
            },
            globals: globals.browser,
        },
        rules: {
            "svelte/indent": ["error", { indent: 4 }],
            "svelte/no-navigation-without-resolve": "off",
            "no-useless-assignment": "off"
        },
    },
    {
        ignores: [
            ".svelte-kit/**",
            ".vite/**",
            "out/**",
            "build/**",
            "dist/**",
            "node_modules/**",
        ],
    },

])
