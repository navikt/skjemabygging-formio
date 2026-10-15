import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

if (!['dev', 'built'].includes(process.env.FYLLUT_PLAYWRIGHT_MODE ?? '')) {
  throw new Error('Run Playwright with pnpm playwright:fyllut to start an isolated FyllUt/mock stack');
}
const output = process.env.FYLLUT_PLAYWRIGHT_OUTPUT_DIR ?? resolve(import.meta.dirname, '.runtime/playwright/local');

export default defineConfig({
  testDir: './playwright/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  timeout: 60000,
  expect: { timeout: 10000 },
  outputDir: resolve(output, 'test-results'),
  reporter: [
    ['list'],
    ['json', { outputFile: resolve(output, 'results.json') }],
    ['html', { open: 'never', outputFolder: resolve(output, 'html') }],
  ],
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
