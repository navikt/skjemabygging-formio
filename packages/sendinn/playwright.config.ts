import { defineConfig, devices } from '@playwright/test';
import { createPlaywrightAppConfig } from '../../bin/playwright-app-config.mjs';
import { createSendinnServerConfig } from '../../bin/sendinn-server-config.mjs';
import type { TestOptions } from './playwright/fixtures/test';

const { plan, config } = await createPlaywrightAppConfig({
  app: 'sendinn',
  displayName: 'Sendinn',
  configDir: import.meta.dirname,
  createServerConfig: createSendinnServerConfig,
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
