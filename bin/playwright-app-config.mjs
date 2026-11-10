import { createServer } from 'node:net';
import { resolve } from 'node:path';

const allocatePort = async () => {
  const server = createServer();
  await new Promise((done, fail) => {
    server.once('error', fail);
    server.listen(0, '127.0.0.1', done);
  });
  const address = server.address();
  await new Promise((done, fail) => server.close((error) => (error ? fail(error) : done())));
  if (!address || typeof address === 'string') throw new Error('Could not allocate a test server port');
  return address.port;
};

/**
 * Playwright settings shared by the app suites: mode, ports, output, reporters and web servers.
 * The app's playwright.config.ts adds `use` and passes the result to defineConfig.
 * @param {{app: string, displayName: string, configDir: string,
 *   createServerConfig: (options: {repoRoot: string, ports: number[], mode: 'dev' | 'built', testMode: boolean})
 *     => ReturnType<typeof import('./app-server-config.mjs').createAppServerConfig>}} options
 */
const createPlaywrightAppConfig = async ({ app, displayName, configDir, createServerConfig }) => {
  const envPrefix = `${app.toUpperCase()}_PLAYWRIGHT`;
  const mode = process.env[`${envPrefix}_MODE`] ?? 'dev';
  if (mode !== 'dev' && mode !== 'built') throw new Error(`Unsupported Playwright mode: ${mode}`);
  const runId = (process.env[`${envPrefix}_RUN_ID`] ??= `${Date.now()}-${process.pid}`);
  const output = resolve(configDir, '.runtime/playwright', runId);

  // Workers reload the config; inherit the run's ports rather than allocating another environment.
  process.env[`${envPrefix}_PORTS`] ??= (await Promise.all(Array.from({ length: 4 }, allocatePort))).join(',');
  const ports = process.env[`${envPrefix}_PORTS`].split(',').map(Number);
  if (
    ports.length !== 4 ||
    new Set(ports).size !== 4 ||
    ports.some((port) => !Number.isInteger(port) || port < 1 || port > 65535)
  )
    throw new Error(`Invalid ${envPrefix}_PORTS`);
  const plan = createServerConfig({ repoRoot: resolve(configDir, '../..'), ports, mode, testMode: true });

  return {
    plan,
    config: {
      testDir: './playwright/e2e',
      workers: 1,
      retries: 0,
      forbidOnly: true,
      timeout: 60000,
      expect: { timeout: 10000 },
      outputDir: resolve(output, 'test-results'),
      reporter: [
        /** @type {const} */ (['list']),
        /** @type {const} */ (['json', { outputFile: resolve(output, 'results.json') }]),
        /** @type {const} */ (['html', { open: 'never', outputFolder: resolve(output, 'html') }]),
      ],
      webServer: plan.commands.map(([command, args, env, cwd], index) => ({
        name: ['Mocks', `${displayName} backend`, `${displayName} frontend`][index],
        command: [command, ...args].map((argument) => `"${argument}"`).join(' '),
        cwd,
        env,
        url: [plan.healthURLs[0], plan.healthURLs[2], plan.healthURLs[3]][index],
        reuseExistingServer: false,
        gracefulShutdown: { signal: /** @type {const} */ ('SIGINT'), timeout: 5000 },
        timeout: 60000,
      })),
    },
  };
};

export { createPlaywrightAppConfig };
