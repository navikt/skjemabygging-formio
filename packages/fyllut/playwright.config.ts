import { defineConfig, devices } from '@playwright/test';
import { createFyllutServerConfig } from '../../bin/fyllut-server-config.mjs';
import { createPlaywrightAppConfig } from '../../bin/playwright-app-config.mjs';
import type { TestOptions } from './playwright/fixtures/test';

const { plan, config } = await createPlaywrightAppConfig({
  app: 'fyllut',
  displayName: 'FyllUt',
  configDir: import.meta.dirname,
  createServerConfig: createFyllutServerConfig,
});

export default defineConfig<TestOptions>({
  ...config,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: plan.baseURL,
    mockAdminURL: plan.adminURL,
    testIdAttribute: 'data-cy',
    viewport: { width: 1280, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
