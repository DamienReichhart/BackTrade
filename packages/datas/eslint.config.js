import baseConfig from "@backtrade/eslint-config";

export default [
    ...baseConfig,
    {
        ignores: [
            "dist",
            "node_modules",
            "coverage",
            "src/generated/**",
            "prisma.config.ts",
        ],
    },
    {
        files: ["**/*.{ts,tsx}"],
        ignores: ["src/generated/**", "prisma.config.ts"],
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
                project: "./tsconfig.json",
            },
        },
    },
];
