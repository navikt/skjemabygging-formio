import { expect, test } from '../../fixtures/test';
import { visitForm } from '../../helpers/form';

test.describe('Digital submission with attachments uploaded in Fyllut', () => {
  test.describe('Form with attachments', () => {
    test(
      'shows validation errors when files are not uploaded',
      {
        annotation: [
          { type: 'migration-id', description: 'F061-T001' },
          {
            type: 'cypress-source',
            description: 'packages/fyllut/cypress/e2e/digital-submission/digital-attachment-upload.cy.ts',
          },
        ],
      },
      async ({ readyPage: page }) => {
        const next = page
          .getByRole('button', { name: /^(Lagre og fortsett|Save and continue)$/ })
          .or(page.getByRole('link', { name: /^(Lagre og fortsett|Save and continue)$/ }));
        await visitForm(page, '/fyllut/formwithattachments?sub=digital');
        await page.getByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/ }).check();
        await next.click();
        await expect(page.getByRole('heading', { name: 'Dine opplysninger' })).toBeVisible();
        await next.click();
        await expect(page.getByRole('heading', { level: 2, name: 'Diverse' })).toBeVisible();
        await page
          .getByRole('group', { name: /Radiopanel 1/ })
          .getByLabel('Radiovalg 1')
          .check();
        await next.click();
        await expect(page.getByRole('heading', { level: 2, name: 'Vedlegg' })).toBeVisible();

        for (const name of [/Vedlegg 1/, /Vedlegg 2/, /Annen dokumentasjon/]) {
          await page.getByRole('group', { name }).getByRole('radio', { name: 'Jeg laster opp dette nå' }).check();
        }
        await next.click();
        const summary = page.locator('[data-cy=error-summary]');
        await expect(summary).toBeVisible();
        const errors = [
          'Du må laste opp fil: Vedlegg 1',
          'Du må laste opp fil: Vedlegg 2',
          'Du må laste opp fil: Annen dokumentasjon',
          'Du må laste opp fil: Vedlegg upload-only',
        ];
        await expect(summary.getByRole('link', { name: /^Du må laste opp fil: .*/ })).toHaveCount(errors.length);
        for (const error of errors) {
          await expect(summary.getByRole('link', { name: error })).toBeVisible();
        }
        await summary.getByRole('link', { name: errors[0] }).click();
        const attachment = page
          .getByRole('group', { name: /Vedlegg 1/ })
          .locator('xpath=ancestor::*[@data-cy="attachment-upload"][1]');
        await expect(attachment.getByRole('button', { name: 'Velg fil' })).toBeFocused();
      },
    );
  });
});
