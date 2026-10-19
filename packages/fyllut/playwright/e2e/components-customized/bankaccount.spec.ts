import { expect, test } from '../../fixtures/test';
import { downloadApplication, nextStep, visitForm } from '../../helpers/form';

test.describe('BankAccount', () => {
  test.describe('Display', () => {
    test.beforeEach(async ({ readyPage: page }) => {
      await visitForm(page, '/fyllut/bankaccount/visning?sub=paper');
    });

    test('should be visible and interactable', async ({ readyPage: page }) => {
      await expect(page.getByRole('textbox', { name: 'Kontonummer', exact: true })).toHaveCount(1);
      const account = page.getByLabel('Kontonummer', { exact: true });
      await expect(account).toBeVisible();
      await expect(account).not.toHaveClass(/\baksel-sr-only\b/);
      await expect(account).toBeEnabled();
      await expect(account).not.toHaveAttribute('readonly');
    });

    test('should have description', async ({ readyPage: page }) => {
      const component = page
        .getByLabel('Kontonummer med beskrivelse', { exact: true })
        .locator(
          'xpath=ancestor::*[@data-form-component or contains(concat(" ", normalize-space(@class), " "), " form-group ")][1]',
        );
      await expect(component.getByText('Dette er en beskrivelse', { exact: true })).toHaveCount(1);
      const extendedDescription = component.getByText('Dette er utvidet beskrivelse', { exact: true });
      await expect(extendedDescription).toHaveCount(1);
      await expect(extendedDescription).not.toBeVisible();
      await component.getByRole('button', { name: 'mer', exact: true }).click();
      await expect(extendedDescription).toBeVisible();
      await expect(extendedDescription).not.toHaveClass(/\baksel-sr-only\b/);
    });
  });

  test.describe('Validation', () => {
    test.beforeEach(async ({ readyPage: page }) => {
      await visitForm(page, '/fyllut/bankaccount/validering?sub=paper');
    });

    test('should validate with required', async ({ readyPage: page }) => {
      const account = page.getByLabel('Kontonummer påkrevd', { exact: true });
      const error = 'Du må fylle ut: Kontonummer påkrevd';
      await nextStep(page);
      await expect(page.getByText(error, { exact: true })).toHaveCount(2);
      await page.getByRole('link', { name: error, exact: true }).click();
      await expect(account).toBeFocused();
      await account.pressSequentially('01234567892');
      await expect(page.getByText(error, { exact: true })).toHaveCount(0);
    });

    test('should not be required', async ({ readyPage: page }) => {
      await nextStep(page);
      await expect(page.getByLabel('Kontonummer ikke påkrevd (valgfritt)', { exact: true })).toHaveCount(1);
      await expect(page.getByText('Du må fylle ut: Kontonummer ikke påkrevd', { exact: true })).toHaveCount(0);
    });

    test('should validate invalid account number', async ({ readyPage: page }) => {
      const account = page.getByLabel('Kontonummer ikke påkrevd (valgfritt)');
      const error = 'Dette er ikke et gyldig kontonummer. Sjekk at du har tastet riktig.';
      await account.pressSequentially('12345678901');
      await nextStep(page);
      await expect(page.getByText(error, { exact: true })).toHaveCount(2);
      await page.getByRole('link', { name: error }).click();
      await expect(account).toBeFocused();
      await account.fill('');
      await account.pressSequentially('01234567892');
      await expect(page.getByText(error, { exact: true })).toHaveCount(0);
    });
  });

  test.describe('Form', () => {
    test.beforeEach(async ({ readyPage: page }) => {
      await visitForm(page, '/fyllut/bankaccount?sub=paper');
    });

    test('should test filling out a full form', async ({ readyPage: page }) => {
      await page.getByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/ }).check();
      await nextStep(page);

      await expect(page.getByRole('heading', { name: 'Visning' })).toBeVisible();
      await page.getByRole('textbox', { name: 'Kontonummer', exact: true }).pressSequentially('01234567892');
      await page.getByRole('textbox', { name: 'Kontonummer med beskrivelse' }).pressSequentially('01234567892');
      await nextStep(page);

      await expect(page.getByRole('heading', { name: 'Validering' })).toBeVisible();
      await page.getByRole('textbox', { name: 'Kontonummer påkrevd' }).pressSequentially('01234567892');
      await page
        .getByRole('textbox', { name: 'Kontonummer ikke påkrevd (valgfritt)' })
        .pressSequentially('01234567892');
      await nextStep(page);

      await expect(page.getByRole('heading', { name: 'Oppsummering' })).toBeVisible();
      for (const [heading, labels] of [
        ['Visning', ['Kontonummer', 'Kontonummer med beskrivelse']],
        ['Validering', ['Kontonummer påkrevd', 'Kontonummer ikke påkrevd']],
      ] as const) {
        const group = page
          .locator('.aksel-form-summary')
          .filter({ has: page.getByRole('heading', { level: 3, name: heading, exact: true }) });
        for (const [index, label] of labels.entries()) {
          await expect(group.locator('dt').nth(index)).toContainText(label);
          await expect(group.locator('dd').nth(index)).toContainText('0123 45 67892');
        }
      }
      await page
        .getByRole('button', { name: 'Instruksjoner for innsending' })
        .or(page.getByRole('link', { name: 'Instruksjoner for innsending' }))
        .click();
      await expect(page.getByRole('heading', { name: 'Skjemaet er ikke sendt ennå' })).toBeVisible();
      await downloadApplication(page);
    });
  });

  test.describe('Translation', () => {
    test.beforeEach(async ({ readyPage: page }) => {
      await visitForm(page, '/fyllut/bankaccount/visning?sub=paper&lang=en');
    });

    test('should have english label and description', async ({ readyPage: page }) => {
      const component = page
        .getByLabel('Kontonummer med beskrivelse (en)', { exact: true })
        .locator(
          'xpath=ancestor::*[@data-form-component or contains(concat(" ", normalize-space(@class), " "), " form-group ")][1]',
        );
      await expect(component.getByText('Dette er en beskrivelse (en)', { exact: true })).toHaveCount(1);
    });
  });
});
