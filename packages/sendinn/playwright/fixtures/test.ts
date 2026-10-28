import { test as base, expect, type Page } from '@playwright/test';
import { restoreRouteVariants, useRouteVariant } from '../../../../mocks/mock-client';

type TestOptions = {
  mockAdminURL: string;
};
type Fixtures = {
  resetMocks: void;
  readyPage: Page;
  signIn: () => Promise<void>;
  useRouteVariant: (id: string) => Promise<void>;
};

// Synthetic bearer value: the local Texas mock determines the session state.
const signedInHeaders = { Authorization: 'Bearer playwright-test-token' };

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
  signIn: async ({ page }, use) => {
    await use(() => page.setExtraHTTPHeaders(signedInHeaders));
  },
  readyPage: async ({ page }, use) => {
    await page.route('**/sendinn/api/log/**', (route) => route.fulfill({ status: 200, body: 'ok' }));
    await use(page);
  },
});

const skipUnlessBuilt = () => {
  test.skip(
    process.env.SENDINN_PLAYWRIGHT_MODE !== 'built',
    'Requires compiled backend routing; Vite dev serves an SPA fallback.',
  );
};

export { expect, signedInHeaders, skipUnlessBuilt, test };
export type { TestOptions };
