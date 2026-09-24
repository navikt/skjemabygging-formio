import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '../../fixtures/test';
import { showAllSteps, visitForm } from '../../helpers/form';

const scanPage = async (page: import('@playwright/test').Page) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
};

test.describe('Axe: Accessibility testing', () => {
  test.describe('Test on the intro page', () => {
    test(
      'Static intro page',
      {
        annotation: [
          { type: 'migration-id', description: 'F073-T001' },
          { type: 'cypress-source', description: 'packages/fyllut/cypress/e2e/other/a11y-axe.cy.ts' },
        ],
      },
      async ({ readyPage: page }) => {
        await visitForm(page, '/fyllut/cypressaxe');
        await expect(page.getByText('Axe testing i Cypress')).toBeVisible();
        await scanPage(page);
      },
    );
  });

  test.describe('Simple test for all tabs in one run', () => {
    test(
      'Penger og konto',
      {
        annotation: [
          { type: 'migration-id', description: 'F073-T003' },
          { type: 'cypress-source', description: 'packages/fyllut/cypress/e2e/other/a11y-axe.cy.ts' },
        ],
      },
      async ({ readyPage: page }) => {
        await visitForm(page, '/fyllut/cypressaxe');
        await page
          .getByRole('button', { name: /^(Neste steg|Next step)$/ })
          .or(page.getByRole('link', { name: /^(Neste steg|Next step)$/ }))
          .click();
        await showAllSteps(page);
        await page.getByRole('link', { name: 'Penger og konto' }).click();
        await expect(page.getByRole('heading', { name: 'Penger og konto' })).toBeVisible();
        await scanPage(page);
      },
    );
  });
});
