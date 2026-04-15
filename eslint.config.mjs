// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';
import boundaries from 'eslint-plugin-boundaries';

// @ts-check
import eslint from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';
import { baseIgnores, baseRules } from '../eslint.base.config.mjs';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const config = [
  {
    ignores: [
      ...baseIgnores,
      '*.config.js',
      '*.config.ts',
      'public/',
      '.cache/',
      'storybook-static/',
    ],
  },
  eslint.configs.recommended,
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      parser: tsParser,
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      ...baseRules,
      '@next/next/no-html-link-for-pages': 'off',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      // Downgrade pre-existing issues to warnings (fix incrementally)
      'no-case-declarations': 'warn',
      'no-empty': 'warn',
      'no-constant-binary-expression': 'warn',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-i18next',
              message: 'Import useTranslation from @/shared/i18n/client instead.',
            },
          ],
        },
      ],
    },
  }, // Allow react-i18next only in the i18n shim itself
  {
    files: ['src/shared/i18n/client.ts'],
    rules: { 'no-restricted-imports': 'off' },
  }, // Storybook stories use render() with hooks — this is valid Storybook API
  {
    files: ['**/*.stories.tsx', '**/*.stories.ts'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  }, // Config files and scripts use require() — this is expected in CJS context
  {
    files: [
      'scripts/**',
      'tokens/**',
      '*.config.js',
      '*.config.ts',
      '.storybook/**',
    ],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  }, // Next.js generated types use triple-slash references
  {
    files: ['next-env.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
  // FSD layer boundaries enforcement
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'shared', pattern: ['src/shared/*'] },
        { type: 'entities', pattern: ['src/entities/*'] },
        { type: 'features', pattern: ['src/features/*'] },
        { type: 'widgets', pattern: ['src/widgets/*'] },
        { type: 'pages', pattern: ['src/views/*'] },
        { type: 'processes', pattern: ['src/processes/*'] },
        { type: 'app', pattern: ['app/*', 'src/app/*'] },
      ],
      'boundaries/ignore': [
        '**/*.test.*',
        '**/*.spec.*',
        '**/*.stories.*',
      ],
    },
    rules: {
      'boundaries/element-types': [
        'warn', // Start with warn, upgrade to error after full migration
        {
          default: 'allow', // Allow uncategorized imports (stores/, types/, services/, components/ still exist)
          rules: [
            // Widgets must not import from other widgets
            {
              from: 'widgets',
              disallow: ['widgets'],
              message: 'Widgets must not import from other widgets. Use entities or features as mediators.',
            },
            // Entities must not import from features, widgets, pages, or processes
            {
              from: 'entities',
              disallow: ['features', 'widgets', 'pages', 'processes'],
              message: 'Entities can only import from shared/ and other entities.',
            },
          ],
        },
      ],
    },
  },
  ...storybook.configs['flat/recommended'],
];

export default config;
