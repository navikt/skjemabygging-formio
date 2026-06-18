import { defineConfig } from 'cypress';
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

type RuntimeConfig = {
  baseUrl?: string;
};

const runtimeConfigPath = resolve(dirname(fileURLToPath(import.meta.url)), '.runtime', 'cypress.mocks.json');

const runtimeConfig: RuntimeConfig = existsSync(runtimeConfigPath)
  ? JSON.parse(readFileSync(runtimeConfigPath, 'utf-8'))
  : {};

export default defineConfig({
  video: false,
  e2e: {
    baseUrl: runtimeConfig.baseUrl ?? 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 1000,
    testIsolation: false,
    setupNodeEvents(on) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium') {
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-gpu');
        }
        return launchOptions;
      });
    },
  },
});
