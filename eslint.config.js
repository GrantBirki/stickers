import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';

const readonlyGlobals = (names) => Object.fromEntries(names.map((name) => [name, 'readonly']));

const browserGlobals = readonlyGlobals([
  'AbortController',
  'CustomEvent',
  'Event',
  'FocusEvent',
  'HTMLElement',
  'IntersectionObserver',
  'MouseEvent',
  'PointerEvent',
  'PopStateEvent',
  'Storage',
  'URL',
  'cancelAnimationFrame',
  'clearInterval',
  'clearTimeout',
  'console',
  'document',
  'fetch',
  'globalThis',
  'history',
  'localStorage',
  'location',
  'queueMicrotask',
  'requestAnimationFrame',
  'sessionStorage',
  'setInterval',
  'setTimeout',
  'window',
]);

const nodeGlobals = readonlyGlobals([
  'Buffer',
  'URL',
  'clearTimeout',
  'console',
  'global',
  'globalThis',
  'process',
  'setTimeout',
]);

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
        ...browserGlobals,
      },
    },
    rules: {
      'no-unused-vars': unusedVarsRule,
    },
  },

  // Core ESLint cannot see assignments consumed only by Svelte markup.
  {
    files: ['src/**/*.svelte', 'test/**/*.svelte'],
    rules: {
      'no-useless-assignment': 'off',
    },
  },

  // Node tests.
  {
    files: ['test/**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...nodeGlobals,
        ...browserGlobals,
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
        ...nodeGlobals,
      },
    },
    rules: {
      'no-unused-vars': unusedVarsRule,
    },
  },
];
