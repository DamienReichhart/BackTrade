module.exports = {
  root: false,
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  env: { node: true, browser: true, es2022: true },
  extends: ["eslint:recommended"],
  ignorePatterns: ["dist", "node_modules"],
};
