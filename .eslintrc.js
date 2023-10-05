module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:vitest/recommended",
    "plugin:vitest-globals/recommended",
    "plugin:cypress/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["react", "react-hooks", "import", "@typescript-eslint", "vitest", "cypress"],
  globals: {
    fetchMock: true,
    vi: true,
    FormioUtils: true,
  },
  env: {
    "vitest-globals/env": true,
    "cypress/globals": true,
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { ignoreRestSiblings: true, argsIgnorePattern: "^[_$].*" }], // ignore unused variables starting with _ or $
    "@typescript-eslint/ban-types": "off", // TODO: Remove 'Function' as a type mostly
    "@typescript-eslint/no-explicit-any": "off", // Explicit any's
    "@typescript-eslint/ban-ts-comment": "off", // @ts-ignore and @ts-nocheck comments
    "@typescript-eslint/no-namespace": "off", // TODO: FormSummaryType.ts has a Summary namespace
    "no-extra-boolean-cast": "off", // TODO: Remove redudant "!!"
    "no-case-declarations": "off", // TODO: Remove "let/const" in switch cases
    "vitest/no-identical-title": "off",
    "vitest/valid-expect": "off",
    "vitest/valid-title": "off",
    "vitest/expect-expect": "off",
    "react/jsx-key": ["error", { checkFragmentShorthand: true }],
    "import/no-internal-modules": [
      "error",
      { forbid: ["@navikt/skjemadigitalisering-shared-@(components|domain)/**"] },
    ],
  },
  root: true,
};
