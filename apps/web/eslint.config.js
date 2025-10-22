import baseConfig from "@backtrade/eslint-config";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  ...baseConfig,
  {
    ignores: ["dist", "node_modules", "coverage"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-hooks/exhaustive-deps": "off",
    },
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.browser,
      },
    },
  },
];
