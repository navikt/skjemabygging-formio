import { test as base, expect, type Page } from '@playwright/test';
import { restoreRouteVariants } from './mock-client';

type Fixtures = {
  readyPage: Page;
};

const test = base.extend<Fixtures>({
  readyPage: async ({ page }, use) => {
    await restoreRouteVariants();
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
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright's fixture callback is not a React hook.
      await use(page);
    } catch (error) {
      try {
        await restoreRouteVariants();
      } catch (cleanupError) {
        throw new AggregateError([error, cleanupError], 'Test and mock variant cleanup both failed', {
          cause: cleanupError,
        });
      }
      throw error;
    }
    await restoreRouteVariants();
  },
});

export { expect, test };
