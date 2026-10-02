import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['mocks/mocks/utils/playwrightEvidence.test.ts', 'mocks/mocks/utils/testCaseUtils.test.ts'],
  },
});
