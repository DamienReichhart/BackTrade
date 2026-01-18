import baseConfig from "@backtrade/eslint-config";

export default [
    ...baseConfig,
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
