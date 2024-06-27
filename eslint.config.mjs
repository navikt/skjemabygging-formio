import { fixupPluginRules } from '@eslint/compat';
import { default as eslint } from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import pluginChaiFriendly from 'eslint-plugin-chai-friendly';
import pluginCypress from 'eslint-plugin-cypress/flat';
import _import from 'eslint-plugin-import';
import pluginMocha from 'eslint-plugin-mocha';
import noOnlyTests from 'eslint-plugin-no-only-tests';
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
  pluginMocha.configs.flat.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.mjs'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react,
      vitest,
      cypress: pluginCypress,
      'no-only-tests': noOnlyTests,
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
      'no-only-tests/no-only-tests': 'error',
      'no-unused-labels': 'error',
      'import/no-duplicates': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '^[_$].*',
          varsIgnorePattern: '^[_$].*',
        },
      ],
      'react/jsx-key': [
        'error',
        {
          checkFragmentShorthand: true,
        },
      ],
      'import/no-internal-modules': [
        'error',
        {
          forbid: ['@navikt/skjemadigitalisering-shared-@(components|domain)/**'],
        },
      ],

      // Warnings
      '@typescript-eslint/ban-types': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-namespace': 'warn',
      'no-extra-boolean-cast': 'warn',
      'no-case-declarations': 'warn',
      'vitest/expect-expect': 'warn',
      'mocha/no-setup-in-describe': 'warn',
      'mocha/consistent-spacing-between-blocks': 'warn',
      'mocha/max-top-level-suites': 'warn',

      // Disabled
      'mocha/no-mocha-arrows': 'off',
    },
  },
);
