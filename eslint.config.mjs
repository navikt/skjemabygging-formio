import { fixupPluginRules } from '@eslint/compat';
import { default as eslint } from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import pluginChaiFriendly from 'eslint-plugin-chai-friendly';
import pluginCypress from 'eslint-plugin-cypress/flat';
import _import from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import vitest from 'eslint-plugin-vitest';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/src/template/**', '**/dist/**', '**/build/**', '**/node_modules/**'],
  },
  prettierConfig,
  eslint.configs.recommended,
  pluginCypress.configs.recommended,
  pluginCypress.configs.globals,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.mjs'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react,
      vitest,
      cypress: pluginCypress,
      'chai-friendly': pluginChaiFriendly,

      // TODO: Replace (and remove compatability packages in package.json) when flat config is supported in these plugins
      'react-hooks': fixupPluginRules(reactHooks),
      import: fixupPluginRules(_import),
    },

    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
        ...globals.browser,
        ...globals.node,
        fetchMock: true,
        FormioUtils: true,
      },

      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    rules: {
      ...vitest.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // Errors
      'no-unused-labels': 'error', // Should not have any unused labels
      'import/no-duplicates': 'error', // Should not import the same module twice (should be handled automatically by prettier-plugin-organize-imports)

      // Ignores unused variables starting with _ or $
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '^[_$].*',
          varsIgnorePattern: '^[_$].*',
          caughtErrorsIgnorePattern: '^[_$].*',
        },
      ],

      // There was an error with a missing key that crashed the app
      'react/jsx-key': [
        'error',
        {
          checkFragmentShorthand: true,
        },
      ],

      // Should not import from shared components or domain
      'import/no-internal-modules': [
        'error',
        {
          forbid: ['@navikt/skjemadigitalisering-shared-@(components|domain)/**'],
        },
      ],

      // Warnings
      '@typescript-eslint/ban-ts-comment': 'warn', // No @ts-ignore or @ts-nocheck comments

      // Disabled
      'vitest/expect-expect': 'off', // Cypress tests don't necessarily use expect
      '@typescript-eslint/no-explicit-any': 'off', // Explicit any's
    },
  },
  {
    files: ['**/mocks/**'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['**/cypress/e2e/**'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
);
