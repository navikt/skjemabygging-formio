module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:vitest/recommended',
    'plugin:vitest-globals/recommended',
    'plugin:cypress/recommended',
    'prettier',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'react-hooks', 'import', '@typescript-eslint', 'vitest', 'cypress', 'no-only-tests'],
  globals: {
    fetchMock: true,
    vi: true,
    FormioUtils: true,
  },
  env: {
    'vitest-globals/env': true,
    'cypress/globals': true,
  },
  rules: {
    'no-only-tests/no-only-tests': 'error', // should not ignore tests
    'no-unused-labels': 'error', // Should not have any unused labels
    'import/no-duplicates': 'error', // Should not import the same module twice (should be handled automatically by prettier-plugin-organize-imports)
    '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true, argsIgnorePattern: '^[_$].*' }], // ignores unused variables starting with _ or $
    '@typescript-eslint/ban-types': 'off', // TODO: Remove 'Function' as a type mostly
    '@typescript-eslint/no-explicit-any': 'off', // Explicit any's
    '@typescript-eslint/ban-ts-comment': 'off', // @ts-ignore and @ts-nocheck comments
    '@typescript-eslint/no-namespace': 'off', // TODO: FormSummaryType.ts has a Summary namespace
    'no-extra-boolean-cast': 'off', // TODO: Remove redudant "!!"
    'no-case-declarations': 'off', // TODO: Remove "let/const" in switch cases
    'vitest/expect-expect': 'off', // Cypress tests don't necessarily use expect
    'react/jsx-key': ['error', { checkFragmentShorthand: true }], // There was an error with a missing key that crashed the app
    'import/no-internal-modules': [
      'error',
      { forbid: ['@navikt/skjemadigitalisering-shared-@(components|domain)/**'] },
    ], // Should not import from shared components or domain
  },
  root: true,
};
