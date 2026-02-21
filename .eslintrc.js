module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'unused-imports'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'off', // Turned off in favor of unused-imports
    '@typescript-eslint/no-require-imports': 'warn', // Allow require() for dynamic imports
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/no-empty-object-type': 'warn',
    'import/first': 'off', // Disable - not configured
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': ['warn', {
      vars: 'all',
      varsIgnorePattern: '^_',
      args: 'after-used',
      argsIgnorePattern: '^_',
    }],

    // React specific rules
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-unescaped-entities': 'warn', // Allow apostrophes in JSX
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    // React Compiler rules - relaxed for existing codebase
    'react-hooks/set-state-in-effect': 'warn',
    'react-hooks/purity': 'warn',
    'react-hooks/immutability': 'warn',
    'react-hooks/refs': 'warn',
    'react-hooks/static-components': 'warn',
    'react-hooks/preserve-manual-memoization': 'warn',

    // General best practices
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',
    'no-restricted-globals': 'off',
    'no-case-declarations': 'warn', // Allow declarations in case blocks
  },
  overrides: [
    {
      // Relax rules for JavaScript files (legacy code)
      files: ['*.js', '*.jsx'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      // Test files
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
  ignorePatterns: [
    'build/',
    'dist/',
    'node_modules/',
    'src/engine-dist/',
    '*.config.js',
  ],
};
