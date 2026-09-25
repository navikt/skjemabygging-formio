import { useRouteVariant } from '../../fixtures/mock-client';
import { expect, test } from '../../fixtures/test';
import { visitForm } from '../../helpers/form';

test.describe('Data fetcher', () => {
  test.describe('Rendering', () => {
    test.describe('dataFetcher outside container', () => {
      test(
        'should not render component when data is empty',
        {
          annotation: [
            { type: 'migration-id', description: 'F029-T002' },
            {
              type: 'cypress-source',
              description: 'packages/fyllut/cypress/e2e/components-deprecated-complex/data-fetcher.cy.ts',
            },
          ],
        },
        async ({ readyPage: page }) => {
          await useRouteVariant('get-register-data-activities:success-empty');
          const activities = page.waitForResponse(
            (response) =>
              response.request().method() === 'GET' &&
              /\/fyllut\/api\/register-data\/activities(?:\?|$)/.test(response.url()),
          );
          await visitForm(page, '/fyllut/datafetchertest/arbeidsrettetaktivitet?sub=digital');
          const response = await activities;
          expect(response.status()).toBe(200);
          expect(await response.json()).toEqual([]);
          await expect(page.getByRole('group', { name: 'Aktivitetsvelger' })).toHaveCount(0);
          await expect(page.locator('.aksel-alert--warning')).toContainText('Ingen aktiviteter ble hentet');
        },
      );
    });
  });
});
