import { defineConfig, devices } from '@playwright/test';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { createSendinnServerConfig } from '../../bin/sendinn-server-config.mjs';
import type { TestOptions } from './playwright/fixtures/test';

const mode = process.env.SENDINN_PLAYWRIGHT_MODE ?? 'dev';
if (mode !== 'dev' && mode !== 'built') throw new Error(`Unsupported Playwright mode: ${mode}`);
const runId = (process.env.SENDINN_PLAYWRIGHT_RUN_ID ??= `${Date.now()}-${process.pid}`);
const output = resolve(import.meta.dirname, '.runtime/playwright', runId);

const allocatePort = async () => {
  const server = createServer();
  await new Promise<void>((done, fail) => {
    server.once('error', fail);
    server.listen(0, '127.0.0.1', done);
  });
  const address = server.address();
  await new Promise<void>((done, fail) => server.close((error) => (error ? fail(error) : done())));
  if (!address || typeof address === 'string') throw new Error('Could not allocate a test server port');
  return address.port;
};

// Workers reload this config; inherit the run's ports rather than allocating another environment.
process.env.SENDINN_PLAYWRIGHT_PORTS ??= (await Promise.all(Array.from({ length: 4 }, allocatePort))).join(',');
const ports = process.env.SENDINN_PLAYWRIGHT_PORTS.split(',').map(Number);
if (
  ports.length !== 4 ||
  new Set(ports).size !== 4 ||
  ports.some((port) => !Number.isInteger(port) || port < 1 || port > 65535)
)
  throw new Error('Invalid SENDINN_PLAYWRIGHT_PORTS');
const plan = createSendinnServerConfig({
  repoRoot: resolve(import.meta.dirname, '../..'),
  ports,
  mode,
  testMode: true,
});

export default defineConfig<TestOptions>({
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
  webServer: plan.commands.map(([command, args, env, cwd], index) => ({
    name: ['Mocks', 'Sendinn backend', 'Sendinn frontend'][index],
    command: [command, ...args].map((argument) => `"${argument}"`).join(' '),
    cwd,
    env,
    url: [plan.healthURLs[0], `${plan.backendURL}/sendinn/internal/isReady`, `${plan.baseURL}/sendinn/`][index],
    reuseExistingServer: false,
    gracefulShutdown: { signal: 'SIGINT', timeout: 5000 },
    timeout: 60000,
  })),
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
