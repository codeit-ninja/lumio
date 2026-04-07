import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
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
            "@stylistic": stylistic,
        },
        rules: {
            "import-x/order": [
                "error",
                {
                    groups: [
                        "type", // type imports first
                        "builtin", // node:path, node:fs, etc.
                        "external", // npm packages
                        "internal", // $lib aliases
                        "parent", // ../foo
                        "sibling", // ./foo
                        "index", // ./
                        "object",
                    ],
                    "newlines-between": "never",
                    alphabetize: {
                        order: "asc",
                        caseInsensitive: true,
                        orderImportKind: "asc", // default imports before named within same group
                    },
                },
            ],
            "import-x/consistent-type-specifier-style": [
                "error",
                "prefer-top-level",
            ],
            "@stylistic/indent": ["error", 4],
            "@stylistic/max-len": [
                "error",
                {
                    code: 100, // The maximum line length
                    tabWidth: 4,
                    ignoreComments: true, // Optional: Ignore long comments
                    ignoreUrls: true, // Optional: Ignore long URLs
                    ignoreStrings: true, // Optional: Ignore long strings
                    ignoreTemplateLiterals: true, // Optional: Ignore long template literals
                },
            ],
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
            "svelte/no-navigation-without-resolve": "off",
            "svelte/element_invalid_self_closing_tag": "off",
            "svelte/no-at-html-tags": "off",
            "no-useless-assignment": "off",
            "@typescript-eslint/no-explicit-any": "off",
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
    eslintConfigPrettier,
]);
