import { test } from '@playwright/test';

// Deliberately exercise forbidOnly during collection, never in the migration suite.
const declare = process.env.FYLLUT_PLAYWRIGHT_EXCLUSIVE === 'true' ? test.only : test;
declare(
  'exclusive-declaration',
  { annotation: { type: 'technical-id', description: 'exclusive-declaration' } },
  async () => {
    throw new Error('EXCLUSIVE_TEST_SHOULD_NOT_EXECUTE');
  },
);
