import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist", "node_modules"],
  },
  {
    files: ["**/*.{ts,js}"],
    ...js.configs.recommended,
    ...tseslint.configs.recommended[0],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parser: tseslint.parser,
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
  },
];
