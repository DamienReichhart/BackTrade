const js = require("@eslint/js");
const globals = require("globals");
const tseslint = require("typescript-eslint");

/**
 * Base ESLint configuration for BackTrade API
 * Provides TypeScript and JavaScript linting rules
 */
module.exports = [
  {
    ignores: [
      "dist",
      "node_modules",
      "coverage",
      "*.config.cjs",
      "*.config.ts",
      "src/generated/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    ignores: ["**/*.config.{js,cjs,mjs,ts}", "src/generated/**"],
    ...js.configs.recommended,
    ...tseslint.configs.recommended[0],
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: "./tsconfig.json",
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
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
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
