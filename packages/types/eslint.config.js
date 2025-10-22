import baseConfig from "@backtrade/eslint-config";

export default [
  ...baseConfig,
  {
    ignores: ["dist", "node_modules", "coverage"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: "./tsconfig.json",
      },
    },
  },
];
