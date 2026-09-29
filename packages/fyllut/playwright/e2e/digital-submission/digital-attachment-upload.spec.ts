import { expect, test } from '../../fixtures/test';
import { prepareAttachmentSubmission, sendToNav, visitAttachments } from '../../helpers/attachments';
import { saveAndContinue } from '../../helpers/form';

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
        await visitAttachments(page);

        for (const name of [/Vedlegg 1/, /Vedlegg 2/, /Annen dokumentasjon/]) {
          await page.getByRole('group', { name }).getByRole('radio', { name: 'Jeg laster opp dette nå' }).check();
        }
        await saveAndContinue(page);
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
    test.describe('uploading files', () => {
      test(
        'submits attachments with the form',
        {
          annotation: [
            { type: 'migration-id', description: 'F061-T004' },
            {
              type: 'cypress-source',
              description: 'packages/fyllut/cypress/e2e/digital-submission/digital-attachment-upload.cy.ts',
            },
          ],
        },
        async ({ readyPage: page, useRouteVariant, mockEvidence }) => {
          await prepareAttachmentSubmission(page);
          await mockEvidence.expectRoutes({
            'post-familie-pdf': 'success-tc07',
            'post-digital-soknad': 'success-tc07',
          });
          await useRouteVariant('post-familie-pdf:success-tc07');
          await useRouteVariant('post-digital-soknad:success-tc07');
          await sendToNav(page);
          await expect(page.getByRole('heading', { level: 2, name: 'Kvittering' })).toBeVisible();
          for (const name of ['Vedlegg 1', 'Vedlegg 2', 'Vedlegg upload-only', 'Annet vedlegg 1']) {
            await expect(page.getByText(name, { exact: true })).toBeVisible();
          }
          await mockEvidence.verify();
        },
      );
    });
  });
});
