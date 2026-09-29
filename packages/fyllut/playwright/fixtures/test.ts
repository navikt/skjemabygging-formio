import { test as base, expect, type Page } from '@playwright/test';
import { resolve } from 'node:path';
import { startTestEpoch, type Epoch } from '../../../../bin/playwright/test-epoch.mjs';
import { restoreRouteVariants, useRouteVariant } from './mock-client';

type Fixtures = {
  readyPage: Page;
  epoch: Epoch;
  useRouteVariant: (id: string) => Promise<void>;
};

const test = base.extend<Fixtures>({
  epoch: [
    async ({ browser }, use, testInfo) => {
      const id = testInfo.annotations.find((annotation) => annotation.type === 'migration-id')?.description;
      if (!id) throw new Error('Missing migration ID');
      const epoch = await startTestEpoch({
        mode: process.env.FYLLUT_PLAYWRIGHT_MODE ?? 'dev',
        testId: id,
        attempt: testInfo.retry,
        output: process.env.FYLLUT_PLAYWRIGHT_OUTPUT_DIR ?? resolve('packages/fyllut/.runtime/playwright/local'),
      });
      const errors: unknown[] = [];
      try {
        await restoreRouteVariants(epoch.adminURL);
        // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture callback.
        await use(epoch);
        epoch.assertHealthy();
      } catch (error) {
        errors.push(error);
      } finally {
        for (const context of browser.contexts()) {
          try {
            await context.close();
          } catch (error) {
            errors.push(error);
            epoch.fatal(new Error('BROWSER_CLEANUP_FAILED'));
          }
        }
        try {
          await restoreRouteVariants(epoch.adminURL);
        } catch (error) {
          errors.push(error);
          epoch.fatal(new Error('MOCK_RESTORE_FAILED'));
        }
        try {
          await epoch.stop();
        } catch (error) {
          errors.push(error);
        }
      }
      if (errors.length) throw new AggregateError(errors, errors.map(String).join('\n'));
    },
    { timeout: 90000 },
  ],
  baseURL: async ({ epoch }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture callback.
    await use(epoch.baseURL);
  },
  useRouteVariant: async ({ epoch }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture callback.
    await use((id) => useRouteVariant(epoch.adminURL, id));
  },
  readyPage: async ({ page }, use) => {
    await page.route(/^https:\/\/(?:[\w-]+\.)*nav\.no(?:\/.*)?$/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!doctype html><html><body>redirected to nav.no</body></html>',
      }),
    );
    await page.route('**/fyllut/api/log*', (route) => route.fulfill({ status: 200, body: 'ok' }));
    await page.route('**/fyllut/api/config*', async (route) => {
      const {
        'if-none-match': _requestEtag,
        'if-modified-since': _modified,
        ...requestHeaders
      } = route.request().headers();
      const response = await route.fetch({ headers: { ...requestHeaders, 'accept-encoding': 'identity' } });
      if (!response.ok()) throw new Error(`FyllUt config failed: HTTP ${response.status()}`);
      const config: unknown = await response.json();
      if (!config || typeof config !== 'object' || Array.isArray(config))
        throw new Error('Invalid FyllUt config response');
      const { etag: _etag, 'content-encoding': _encoding, 'content-length': _length, ...headers } = response.headers();
      await route.fulfill({ status: response.status(), headers, json: { ...config, newRenderForms: ['*'] } });
    });
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture callback.
    await use(page);
  },
});

export { expect, test };
