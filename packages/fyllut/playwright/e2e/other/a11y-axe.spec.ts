import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, test } from '../../fixtures/test';
import { nextStep, showAllSteps, visitForm } from '../../helpers/form';

const scanPage = async (page: Page) => {
  await expect
    .poll(
      () =>
        page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === 'running').length),
      { message: 'Expected page animations to finish before the accessibility scan' },
    )
    .toBe(0);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
};

const scanTab = async (page: Page, title: string) => {
  await showAllSteps(page);
  await page.getByRole('link', { name: title, exact: true }).click();
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  await scanPage(page);
};

test.describe('Axe: Accessibility testing', () => {
  test.describe('Test on the intro page', () => {
    test('Static intro page', async ({ readyPage: page }) => {
      await visitForm(page, '/fyllut/cypressaxe');
      await expect(page.getByText('Axe testing i Cypress')).toBeVisible();
      await scanPage(page);
    });
  });

  test.describe('Simple test for all tabs in one run', () => {
    // Cypress shares one session; each Playwright case starts the same form independently.
    test.beforeEach(async ({ readyPage: page }) => {
      await visitForm(page, '/fyllut/cypressaxe');
      await nextStep(page);
      await expect(page.getByRole('heading', { name: 'Person', exact: true })).toBeVisible();
    });

    test('Person', async ({ readyPage: page }) => {
      await expect(page.getByRole('heading', { name: 'Person', exact: true })).toBeVisible();
      await scanPage(page);
    });

    test('Penger og konto', async ({ readyPage: page }) => {
      await scanTab(page, 'Penger og konto');
    });

    test('Bedrift / organisasjon', async ({ readyPage: page }) => {
      await scanTab(page, 'Bedrift / organisasjon');
    });

    test('Dato og tid', async ({ readyPage: page }) => {
      await scanTab(page, 'Dato og tid');
    });

    test('Standard felter', async ({ readyPage: page }) => {
      await scanTab(page, 'Standard felter');
    });

    test('Layout', async ({ readyPage: page }) => {
      await scanTab(page, 'Layout');
    });

    test('Data', async ({ readyPage: page }) => {
      await scanTab(page, 'Data');
    });
  });
});
