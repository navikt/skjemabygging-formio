import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

const baseURL = process.env.FYLLUT_PLAYWRIGHT_BASE_URL;
const mockAdminURL = process.env.FYLLUT_PLAYWRIGHT_MOCK_ADMIN_URL;
if (!baseURL || !mockAdminURL) {
  throw new Error('Run Playwright with pnpm playwright:fyllut to start an isolated FyllUt/mock stack');
}
const output = process.env.FYLLUT_PLAYWRIGHT_OUTPUT_DIR ?? resolve(import.meta.dirname, '.runtime/playwright/local');

export default defineConfig({
  testDir: './playwright/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  expect: { timeout: 10000 },
  outputDir: resolve(output, 'test-results'),
  reporter: [['list'], ['html', { open: 'never', outputFolder: resolve(output, 'html') }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
