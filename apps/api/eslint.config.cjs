const js = require("@eslint/js");
const globals = require("globals");
const prettier = require("eslint-config-prettier");

module.exports = [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "**/*.test.js",
      "**/*.test.jsx",
      "**/*.spec.js",
      "**/*.spec.jsx",
      "build.js"
    ]
  },
  {
    files: ["src/**/*.{cjs,js,jsx}"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.es2022
      }
    },
    rules: {
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
      "no-unused-expressions": "error"
    }
  },
  // Disable ESLint rules that conflict with Prettier
  prettier
];
