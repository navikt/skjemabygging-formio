import { test as base, expect, type Page } from '@playwright/test';
import { restoreRouteVariants, useRouteVariant } from '../../../../mocks/mock-client';

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
};

const skipUnlessBuilt = () => {
  test.skip(
    process.env.FYLLUT_PLAYWRIGHT_MODE !== 'built',
    'Requires compiled backend routing; Vite dev serves an SPA fallback.',
  );
};

export { expect, skipUnlessBuilt, test };
export type { TestOptions };
