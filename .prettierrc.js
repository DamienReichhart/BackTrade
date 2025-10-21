module.exports = {
  // Core formatting
  semi: true,
  singleQuote: false,
  trailingComma: "none",
  tabWidth: 2,
  useTabs: false,

  // Line endings and spacing
  endOfLine: "lf",
  printWidth: 80,

  // JSX specific
  jsxSingleQuote: true,
  jsxBracketSameLine: false,

  // Arrow functions
  arrowParens: "avoid",

  // Bracket spacing
  bracketSpacing: true,

  // Prose wrapping
  proseWrap: "preserve",

  // HTML whitespace sensitivity
  htmlWhitespaceSensitivity: "css",

  // Embedded language formatting
  embeddedLanguageFormatting: "auto",

  // File-specific overrides
  overrides: [
    {
      files: "*.json",
      options: {
        printWidth: 120
      }
    },
    {
      files: "*.md",
      options: {
        printWidth: 100,
        proseWrap: "always"
      }
    }
  ]
};
