import { expect, test } from '../../fixtures/test';
import { expectVisibleToUser, nextStep, visitForm } from '../../helpers/form';

test.describe('DatePicker', () => {
  test.beforeEach(async ({ readyPage: page }) => {
    await page.clock.setFixedTime(new Date('2025-01-15'));
  });

  test.describe('Display', () => {
    test.beforeEach(async ({ readyPage: page }) => {
      await visitForm(page, '/fyllut/datepicker/visning?sub=paper');
    });

    test('should be visible and interactable', async ({ readyPage: page }) => {
      const date = page.getByLabel('Dato (dd.mm.åååå)', { exact: true });
      await expect(date).toHaveCount(1);
      await expectVisibleToUser(date);
      await expect(date).toBeEnabled();
      await expect(date).not.toHaveAttribute('readonly');
    });

    test('should accept a valid date', async ({ readyPage: page }) => {
      const date = page.getByLabel('Dato (dd.mm.åååå)', { exact: true });
      await date.fill('15.01.2025');
      await expect(date).toHaveValue('15.01.2025');
    });

    test('should have description', async ({ readyPage: page }) => {
      const date = page.getByLabel('Dato med beskrivelse', { exact: true });
      await expect(date).toHaveAccessibleDescription('Velg ønsket dato');
      await expect(page.getByText('Velg ønsket dato', { exact: true })).toBeVisible();
    });

    test('should have additionalDescription', async ({ readyPage: page }) => {
      await expect(page.getByLabel('Dato med tilleggsbeskrivelse', { exact: true })).toBeVisible();
      await expect(page.getByText('Mer informasjon', { exact: true })).toHaveCount(1);
      const extendedDescription = page.getByText('Utvidet informasjon om dato', { exact: true });
      await expect(extendedDescription).toHaveCount(1);
      await expect(extendedDescription).not.toBeVisible();
      await page.getByRole('button', { name: 'Mer informasjon', exact: true }).click();
      await expect(extendedDescription).toBeVisible();
    });
  });

  test.describe('Validation', () => {
    test.beforeEach(async ({ readyPage: page }) => {
      await visitForm(page, '/fyllut/datepicker/validering?sub=paper');
    });

    test('should validate required', async ({ readyPage: page }) => {
      const date = page.getByLabel('Dato påkrevd', { exact: true });
      const error = 'Du må fylle ut: Dato påkrevd';
      await nextStep(page);
      await expect(page.getByText(error, { exact: true })).toHaveCount(2);
      await page.getByRole('link', { name: error, exact: true }).click();
      await expect(date).toBeFocused();
      await date.fill('15.01.2025');
      await nextStep(page);
      await expect(page.getByText(error, { exact: true })).toHaveCount(0);
    });

    test('should not be required', async ({ readyPage: page }) => {
      await nextStep(page);
      await expect(page.getByText('Du må fylle ut: Dato ikke påkrevd', { exact: true })).toHaveCount(0);
    });

    test('should validate specificEarliestAllowedDate', async ({ readyPage: page }) => {
      const date = page.getByLabel('Dato fra og med 10.01.2025');
      const error = 'Datoen kan ikke være tidligere enn 10.01.2025';
      await date.fill('05.01.2025');
      await nextStep(page);
      await expect(page.getByText(error, { exact: true })).toHaveCount(2);
      await date.fill('10.01.2025');
      await nextStep(page);
      await expect(page.getByText(error, { exact: true })).toHaveCount(0);
    });

    test('should validate specificLatestAllowedDate', async ({ readyPage: page }) => {
      const date = page.getByLabel('Dato til og med 20.01.2025', { exact: true });
      const error = 'Datoen kan ikke være senere enn 20.01.2025';
      await date.fill('25.01.2025');
      await nextStep(page);
      await expect(page.getByText(error, { exact: true })).toHaveCount(2);
      await date.fill('15.01.2025');
      await nextStep(page);
      await expect(page.getByText(error, { exact: true })).toHaveCount(0);
    });
  });

  test.describe('Translation', () => {
    test.beforeEach(async ({ readyPage: page }) => {
      await visitForm(page, '/fyllut/datepicker/visning?sub=paper&lang=en');
    });

    test('should translate label', async ({ readyPage: page }) => {
      await expect(page.getByLabel('Dato (dd.mm.åååå) (en)', { exact: true })).toHaveCount(1);
    });

    test('should translate description', async ({ readyPage: page }) => {
      const date = page.getByLabel('Dato med beskrivelse (en)', { exact: true });
      await expect(date).toHaveAccessibleDescription('Velg ønsket dato (en)');
      await expect(page.getByText('Velg ønsket dato (en)', { exact: true })).toBeVisible();
    });
  });
});
