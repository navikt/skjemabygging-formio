import { fixupPluginRules } from '@eslint/compat';
import { default as eslint } from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import pluginChaiFriendly from 'eslint-plugin-chai-friendly';
import pluginCypress from 'eslint-plugin-cypress/flat';
import _import from 'eslint-plugin-import';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import vitest from 'eslint-plugin-vitest';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // config with just ignores is the replacement for `.eslintignore`
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
      'react-hooks': fixupPluginRules(reactHooks),
      import: fixupPluginRules(_import),
      vitest,
      cypress: pluginCypress,
      'no-only-tests': noOnlyTests,
      'chai-friendly': pluginChaiFriendly,
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

      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-namespace': 'off',
      'no-extra-boolean-cast': 'off',
      'no-case-declarations': 'off',
      'vitest/expect-expect': 'off',

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
    },
  },
);
