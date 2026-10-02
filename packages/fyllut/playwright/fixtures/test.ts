import { test as base, expect, type Page } from '@playwright/test';
import { resolve } from 'node:path';
import { startTestEpoch, type Epoch } from '../../../../bin/playwright/test-epoch.mjs';
import { restoreRouteVariants, useRouteVariant } from './mock-client';
import { createMockEvidence } from './mock-evidence';

type Evidence = ReturnType<typeof createMockEvidence>;

type Fixtures = {
  readyPage: Page;
  epoch: Epoch & { evidence: Evidence };
  useRouteVariant: (id: string) => Promise<void>;
  mockEvidence: Evidence;
  observeMocks: boolean;
  mockFault: 'hold-pdf' | undefined;
  resetVariants: (url: string, phase: 'before' | 'after') => Promise<void>;
  stopEpoch: (epoch: Epoch) => Promise<void>;
};

const test = base.extend<Fixtures>({
  observeMocks: [true, { option: true }],
  mockFault: [undefined, { option: true }],
  // eslint-disable-next-line no-empty-pattern -- Playwright requires destructuring fixture dependencies.
  resetVariants: async ({}, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture callback.
    await use((url) => restoreRouteVariants(url));
  },
  // eslint-disable-next-line no-empty-pattern -- Playwright requires destructuring fixture dependencies.
  stopEpoch: async ({}, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture callback.
    await use((epoch) => epoch.stop());
  },
  epoch: [
    async ({ browser, resetVariants, stopEpoch, observeMocks, mockFault }, use, testInfo) => {
      const id = testInfo.annotations.find((annotation) =>
        ['migration-id', 'technical-id'].includes(annotation.type),
      )?.description;
      if (!id) throw new Error('Missing test identity');
      const epoch = await startTestEpoch({
        mode: process.env.FYLLUT_PLAYWRIGHT_MODE ?? 'dev',
        testId: id,
        attempt: testInfo.retry,
        output: process.env.FYLLUT_PLAYWRIGHT_OUTPUT_DIR ?? resolve('packages/fyllut/.runtime/playwright/local'),
        observeMocks,
        mockFault,
      });
      const errors: unknown[] = [];
      const evidence = createMockEvidence(epoch);
      try {
        try {
          await resetVariants(epoch.adminURL, 'before');
        } catch (error) {
          epoch.fatal(new Error('MOCK_RESET_FAILED'));
          throw error;
        }
        // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture callback.
        await use({ ...epoch, evidence });
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
          await evidence.finish();
        } catch (error) {
          errors.push(error);
          epoch.fatal(new Error('MOCK_EVIDENCE_CLEANUP_FAILED'));
        }
        try {
          await resetVariants(epoch.adminURL, 'after');
        } catch (error) {
          errors.push(error);
          epoch.fatal(new Error('MOCK_RESTORE_FAILED'));
        }
        try {
          await stopEpoch(epoch);
        } catch (error) {
          errors.push(error);
          epoch.fatal(new Error('EPOCH_CLEANUP_FAILED'));
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
  mockEvidence: async ({ epoch }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture callback.
    await use(epoch.evidence);
  },
  readyPage: async ({ page }, use) => {
    await preparePage(page);
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture callback.
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
};

export { expect, preparePage, test };
