module.exports = {
  // Basic formatting
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,

  // JSX specific
  jsxSingleQuote: false,
  jsxBracketSameLine: false,

  // Other
  arrowParens: 'always',
  endOfLine: 'lf',
  proseWrap: 'preserve',
  quoteProps: 'as-needed',
  bracketSpacing: true,

  // File-specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
      },
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 80,
      },
    },
  ],
};
