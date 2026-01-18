import baseConfig from "@backtrade/eslint-config";

export default [
    ...baseConfig,
    {
        ignores: ["dist", "node_modules", "coverage"],
    },
    {
        files: ["**/*.{ts,tsx}"],
        ignores: ["**/*.test.ts", "**/*.spec.ts"],
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
                project: "./tsconfig.json",
            },
        },
    },
];
