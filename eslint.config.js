import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

const unusedVarsRule = [
  'error',
  {
    argsIgnorePattern: '^_',
    caughtErrorsIgnorePattern: '^_',
    varsIgnorePattern: '^_',
  },
];

export default [
  {
    // Generated/build output and scratch dirs.
    ignores: [
      'dist/**',
      'node_modules/**',
      'stickers/**',
      'example/**',
      'examples/**',
      'tmp/**',
    ],
  },

  js.configs.recommended,

  // Lint Svelte components.
  ...svelte.configs['flat/recommended'],

  // Browser app source.
  {
    files: ['src/**/*.{js,svelte}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': unusedVarsRule,
    },
  },

  // Node tests.
  {
    files: ['test/**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': unusedVarsRule,
    },
  },

  // Node scripts/config.
  {
    files: ['scripts/**/*.{js,mjs,cjs}', 'vite.config.js', '*.config.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': unusedVarsRule,
    },
  },
];
