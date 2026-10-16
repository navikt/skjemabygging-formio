import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

const mode = process.env.FYLLUT_PLAYWRIGHT_MODE ?? 'dev';
if (!['dev', 'built'].includes(mode)) throw new Error(`Unsupported Playwright mode: ${mode}`);
const runId = (process.env.FYLLUT_PLAYWRIGHT_RUN_ID ??= `${Date.now()}-${process.pid}`);
const output = resolve(import.meta.dirname, '.runtime/playwright', runId);

export default defineConfig({
  testDir: './playwright/e2e',
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
