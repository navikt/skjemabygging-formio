import { test as base, expect, type Page } from '@playwright/test';
import { restoreRouteVariants, useRouteVariant } from './mock-client';

type TestOptions = {
  mockAdminURL: string;
};
type Fixtures = {
  resetMocks: void;
  readyPage: Page;
  useRouteVariant: (id: string) => Promise<void>;
};

const test = base.extend<TestOptions & Fixtures>({
  mockAdminURL: ['', { option: true }],
  resetMocks: [
    async ({ mockAdminURL }, use) => {
      await restoreRouteVariants(mockAdminURL);
      await use();
    },
    { auto: true },
  ],
  useRouteVariant: async ({ mockAdminURL }, use) => {
    await use((id) => useRouteVariant(mockAdminURL, id));
  },
  readyPage: async ({ page }, use) => {
    await preparePage(page);
    await use(page);
  },
});

const preparePage = async (page: Page) => {
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

const skipUnlessBuilt = () => {
  test.skip(
    process.env.FYLLUT_PLAYWRIGHT_MODE !== 'built',
    'Requires compiled backend routing; Vite dev serves an SPA fallback.',
  );
};

export { expect, skipUnlessBuilt, test };
export type { TestOptions };
