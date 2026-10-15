import { defineConfig } from 'cypress';
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const configDir = dirname(fileURLToPath(import.meta.url));

type RuntimeConfig = {
  baseUrl?: string;
  env?: Record<string, string | number | boolean>;
};

// Written by `pnpm start:sendinn:mocks`, which starts the servers on free ports.
const runtimeConfigPath = resolve(configDir, '.runtime', 'cypress.mocks.json');

const runtimeConfig: RuntimeConfig = existsSync(runtimeConfigPath)
  ? JSON.parse(readFileSync(runtimeConfigPath, 'utf-8'))
  : {};

const baseUrl = runtimeConfig.baseUrl ?? 'http://localhost:3003';

export default defineConfig({
  video: false,
  e2e: {
    baseUrl,
    viewportWidth: 1280,
    viewportHeight: 1000,
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium') {
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-gpu');
        }
        return launchOptions;
      });
      return config;
    },
    env: {
      MOCKS_ADMIN_PORT: 3310,
      INCLUDE_DIST_TESTS: false,
      ...runtimeConfig.env,
    },
  },
});
