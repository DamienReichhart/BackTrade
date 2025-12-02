import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Base ESLint configuration for all BackTrade projects
 * Provides common TypeScript and JavaScript linting rules
 */
export default [
    {
        ignores: ["dist", "node_modules", "coverage", "*.config.cjs"],
    },
    {
        files: ["**/*.{ts,tsx,js,jsx}"],
        ignores: ["**/*.config.{js,cjs,mjs}"],
        ...js.configs.recommended,
        ...tseslint.configs.recommended[0],
        languageOptions: {
            ecmaVersion: 2025,
            sourceType: "module",
            parser: tseslint.parser,
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                ...globals.node,
                ...globals.esnext,
            },
        },
        rules: {
            // Code quality rules
            "prefer-const": "error",
            "no-var": "error",
            "no-console": "warn",
            "no-debugger": "error",

            // Import/export rules
            "no-duplicate-imports": "error",
            "no-unused-expressions": "error",

            // Type-specific rules for better type safety
            "@typescript-eslint/consistent-type-definitions": [
                "error",
                "interface",
            ],
            "@typescript-eslint/consistent-type-imports": [
                "error",
                { prefer: "type-imports", fixStyle: "inline-type-imports" },
            ],
            "@typescript-eslint/no-empty-interface": "warn",
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-var-requires": "error",
            "@typescript-eslint/no-empty-interface": "warn",
        },
    },
    {
        files: ["**/*.{ts,tsx}"],
        ignores: ["**/*.config.{js,cjs,mjs,ts}"],
        languageOptions: {
            parserOptions: {
                project: true,
            },
        },
        rules: {
            // Type-aware rules
            "@typescript-eslint/prefer-nullish-coalescing": "error",
            "@typescript-eslint/prefer-optional-chain": "error",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-var-requires": "off",
        },
    },
];
