import { test as base, expect, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { restoreRouteVariants, useRouteVariant } from './mock-client';
import { startServers } from './servers';

type Servers = Awaited<ReturnType<typeof startServers>>;
type Fixtures = {
  servers: Servers;
  readyPage: Page;
  useRouteVariant: (id: string) => Promise<void>;
};

const test = base.extend<Fixtures>({
  servers: [
    async ({ browser }, use, testInfo) => {
      const directory = testInfo.outputPath('servers');
      mkdirSync(directory, { recursive: true });
      const servers = await startServers(directory);
      const errors: unknown[] = [];
      try {
        await restoreRouteVariants(servers.adminURL);
        await use(servers);
      } catch (error) {
        errors.push(error);
      } finally {
        for (const context of browser.contexts()) {
          try {
            await context.close();
          } catch (error) {
            errors.push(error);
          }
        }
        try {
          servers.assertHealthy();
        } catch (error) {
          errors.push(error);
        }
        try {
          await servers.stop();
        } catch (error) {
          errors.push(error);
        }
      }
      if (errors.length) throw new AggregateError(errors, errors.map(String).join('\n'));
    },
    { timeout: 90000 },
  ],
  baseURL: async ({ servers }, use) => {
    await use(servers.baseURL);
  },
  useRouteVariant: async ({ servers }, use) => {
    await use((id) => useRouteVariant(servers.adminURL, id));
  },
  readyPage: async ({ page }, use) => {
    await preparePage(page);
    await use(page);
  },
});

const preparePage = async (page: Page) => {
  await page.route(/^https:\/\/(?:[\w-]+\.)*nav\.no(?:\/.*)?$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html><body>redirected to nav.no</body></html>',
    }),
  );
  await page.route('**/fyllut/api/log*', (route) => route.fulfill({ status: 200, body: 'ok' }));
  await page.route('**/fyllut/api/config*', async (route) => {
    const { 'if-none-match': _etag, 'if-modified-since': _modified, ...headers } = route.request().headers();
    const response = await route.fetch({ headers: { ...headers, 'accept-encoding': 'identity' } });
    expect(response.ok(), 'FyllUt config request').toBe(true);
    const config: unknown = await response.json();
    if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('Invalid FyllUt config');
    await route.fulfill({ response, json: { ...config, newRenderForms: ['*'] } });
  });
};

export { expect, test };
