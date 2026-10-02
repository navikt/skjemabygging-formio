import { expect, test } from '../../fixtures/test';
import { downloadApplication, nextStep, visitForm } from '../../helpers/form';

test.describe('BankAccount', () => {
  test.describe('Validation', () => {
    test(
      'should validate invalid account number',
      {
        annotation: [
          { type: 'migration-id', description: 'F004-T005' },
          {
            type: 'cypress-source',
            description: 'packages/fyllut/cypress/e2e/components-customized/bankaccount.cy.ts',
          },
        ],
      },
      async ({ readyPage: page }) => {
        await visitForm(page, '/fyllut/bankaccount/validering?sub=paper');
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
      },
    );
  });

  test.describe('Form', () => {
    test(
      'should test filling out a full form',
      {
        annotation: [
          { type: 'migration-id', description: 'F004-T006' },
          {
            type: 'cypress-source',
            description: 'packages/fyllut/cypress/e2e/components-customized/bankaccount.cy.ts',
          },
        ],
      },
      async ({ readyPage: page }) => {
        await visitForm(page, '/fyllut/bankaccount?sub=paper');
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
      },
    );
  });
});
