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
            "scripts/**/*.d.ts",
            "scripts/**/*.js",
        ],
    },
    {
        files: ["**/*.{ts,tsx}"],
        ignores: [
            "src/generated/**",
            "prisma.config.ts",
            "**/*.test.ts",
            "**/*.spec.ts",
        ],
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
                project: "./tsconfig.json",
            },
        },
    },
    {
        files: ["scripts/**/*.{ts,tsx}"],
        rules: {
            "no-console": "off",
        },
    },
];
