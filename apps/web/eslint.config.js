import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "**/*.test.js",
      "**/*.test.jsx",
      "**/*.spec.js",
      "**/*.spec.jsx",
      "public/**",
      "db.json",
      "routes.json"
    ]
  },
  {
    files: ["**/*.{js,jsx}"],
    ...js.configs.recommended,
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/rules-of-hooks": "error",

      // React Refresh Rules
      "react-refresh/only-export-components": "off",

      // Code Quality Rules
      "no-console": "warn",
      "no-debugger": "error",
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ],
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",

      // Style Rules (Prettier handles formatting)
      // Removed: semi, quotes, comma-dangle, indent, no-trailing-spaces, eol-last
      // These are now handled by Prettier

      // Best Practices
      eqeqeq: ["error", "always"],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-return-assign": "error",
      "no-self-compare": "error",
      "no-throw-literal": "error",
      "no-unmodified-loop-condition": "error",
      "no-useless-call": "error",
      "no-useless-concat": "error",
      "no-useless-return": "error",
      "prefer-promise-reject-errors": "error",
      radix: "error",
      yoda: "error",

      // Security Rules
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",

      // Performance Rules
      "no-loop-func": "error",
      "no-unused-expressions": "error",

      // React-specific Best Practices
      "react/no-array-index-key": "warn",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "prefer-destructuring": [
        "error",
        {
          array: false,
          object: true
        },
        {
          enforceForRenamedProperties: false
        }
      ]
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022
      }
    }
  },
  // Disable ESLint rules that conflict with Prettier
  prettier
];
