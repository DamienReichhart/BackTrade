const js = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = [
  { ignores: ["**/dist/**", "**/node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2025,
    },
  },
];
