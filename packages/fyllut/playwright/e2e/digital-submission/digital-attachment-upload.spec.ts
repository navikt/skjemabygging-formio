import { resolve } from 'node:path';
import { grensesnitt } from '../../../../shared-domain/src/texts/grensesnitt';
import { statiske } from '../../../../shared-domain/src/texts/statiskeTekster';
import { expect, test } from '../../fixtures/test';
import {
  prepareAttachmentSubmission,
  sendToNav,
  uploadAttachmentFile,
  visitAttachments,
} from '../../helpers/attachments';
import { saveAndContinue, showAllSteps } from '../../helpers/form';

const source = 'packages/fyllut/cypress/e2e/digital-submission/digital-attachment-upload.cy.ts';
const annotation = (id: string) => [
  { type: 'migration-id', description: id },
  { type: 'cypress-source', description: source },
];

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
    test(
      'renders attachments together with regular components without attachment-panel metadata',
      { annotation: annotation('F061-T002') },
      async ({ readyPage: page }) => {
        await visitAttachments(page);
        await expect(page.getByText('Kontroller at vedleggene er riktige før du fortsetter.')).toBeVisible();
        await page.getByRole('textbox', { name: /Kommentar til vedlegg/ }).fill('Relevant kommentar');
        await showAllSteps(page);
        await page.getByRole('link', { name: 'Oppsummering', exact: true }).click();
        const panel = page
          .getByRole('heading', { level: 3, name: /^Vedlegg/ })
          .locator('xpath=ancestor::*[@data-cy="form-summary-panel"][1]');
        await expect(panel.getByText('Kommentar til vedlegg', { exact: true })).toBeVisible();
        await expect(panel.getByText('Relevant kommentar', { exact: true })).toBeVisible();
      },
    );
    test.describe('uploading files', () => {
      test(
        'shows uploaded attachments on summary page',
        { annotation: annotation('F061-T003') },
        async ({ readyPage: page }) => {
          await prepareAttachmentSubmission(page);
          const heading = page.getByRole('heading', { level: 3, name: 'Vedlegg', exact: true });
          await expect(heading).toBeVisible();
          const panel = heading.locator('xpath=ancestor::*[@data-cy="form-summary-panel"][1]');
          for (const name of ['Vedlegg 1', 'Vedlegg 2', 'Vedlegg upload-only', 'Annet vedlegg 1'])
            await expect(panel.getByText(name, { exact: true })).toBeVisible();
        },
      );

      for (const [operationIndex, operation] of ['upload', 'delete'].entries()) {
        for (const [outcomeIndex, outcome] of ['success', 'failure'].entries()) {
          const caseId = `F061-T005-C${String(operationIndex * 2 + outcomeIndex + 1).padStart(3, '0')}`;
          test(
            `blocks submission during a pending ${operation} and recovers after ${outcome}`,
            { annotation: annotation(caseId) },
            async ({ readyPage: page }) => {
              await prepareAttachmentSubmission(page);
              let submissions = 0;
              page.on('request', (request) => {
                if (request.method() === 'POST' && /\/api\/send-inn\/digital-application\/[^/?]+$/.test(request.url()))
                  submissions++;
              });
              let release!: () => void;
              const released = new Promise<void>((done) => {
                release = done;
              });
              let intercepted!: () => void;
              const pending = new Promise<void>((done) => {
                intercepted = done;
              });
              const url =
                operation === 'upload'
                  ? /\/api\/send-inn\/digital-application\/[^/]+\/attachments\/[^/?]+$/
                  : /\/api\/send-inn\/digital-application\/[^/]+\/attachments\/[^/]+\/[^/?]+$/;
              let held = false;
              await page.route(url, async (route) => {
                if (held || route.request().method() !== (operation === 'upload' ? 'POST' : 'DELETE')) {
                  await route.continue();
                  return;
                }
                held = true;
                intercepted();
                await released;
                if (outcome === 'failure')
                  await route.fulfill({ status: 503, json: { errorCode: 'SERVICE_UNAVAILABLE' } });
                else if (operation === 'delete') await route.fulfill({ status: 204 });
                else await route.continue();
              });
              try {
                await page
                  .getByRole('button', { name: /^Forrige steg$/ })
                  .or(page.getByRole('link', { name: /^Forrige steg$/ }))
                  .click();
                const attachment = page.locator('[data-cy="attachment-upload"]').filter({ hasText: /Vedlegg 1/ });
                if (operation === 'upload')
                  await attachment
                    .locator('input[type="file"]')
                    .setInputFiles(
                      resolve(import.meta.dirname, '../../../cypress/fixtures/files/another-small-file.txt'),
                    );
                else await attachment.getByRole('button', { name: 'Slett filen', exact: true }).click();
                await pending;
                await page.getByRole('textbox', { name: /Kommentar til vedlegg/ }).fill('Edited while pending');
                await saveAndContinue(page);
                await expect(page.getByRole('heading', { level: 2, name: 'Oppsummering' })).toBeVisible();
                const send = page.getByRole('button', { name: grensesnitt.navigation.sendToNav, exact: true });
                const notice = page.getByText(statiske.attachment.pendingOperations, { exact: true });
                await expect(send).toBeEnabled();
                await expect(send).toHaveAttribute('data-variant', 'secondary');
                await expect(notice).toHaveCount(0);
                await send.click();
                await expect(notice).toBeVisible();
                expect(submissions).toBe(0);
                await expect(page.getByText('Edited while pending', { exact: true })).toBeVisible();
                const responsePromise = page.waitForResponse(
                  (response) =>
                    url.test(response.url()) &&
                    response.request().method() === (operation === 'upload' ? 'POST' : 'DELETE'),
                );
                release();
                const response = await responsePromise;
                expect(response.status()).toBe(outcome === 'failure' ? 503 : operation === 'upload' ? 201 : 204);
                if (response.status() !== 204) expect(await response.finished()).toBeNull();
                await expect(send).toBeEnabled();
                await expect(notice).toHaveCount(0);
                await expect(send).toHaveAttribute('data-variant', operation === 'upload' ? 'primary' : 'secondary');
                if (operation === 'delete' && outcome === 'failure') {
                  await page
                    .getByRole('button', { name: grensesnitt.summaryPage.editAnswers, exact: true })
                    .first()
                    .click();
                  await page.route(url, (route) =>
                    route.request().method() === 'DELETE' ? route.fulfill({ status: 204 }) : route.continue(),
                  );
                  await expect(attachment.getByText('small-file.txt', { exact: true })).toBeVisible();
                  await expect(
                    attachment.getByText(statiske.uploadFile.deleteFileError, { exact: true }),
                  ).toBeVisible();
                  const deleted = page.waitForResponse(
                    (response) => url.test(response.url()) && response.request().method() === 'DELETE',
                  );
                  await attachment.getByRole('button', { name: 'Slett filen', exact: true }).click();
                  expect((await deleted).status()).toBe(204);
                  await expect(attachment.getByText('small-file.txt', { exact: true })).toHaveCount(0);
                  await expect(attachment.getByText(statiske.uploadFile.deleteFileError, { exact: true })).toHaveCount(
                    0,
                  );
                  await uploadAttachmentFile(page, attachment, 'small-file.txt');
                  await saveAndContinue(page);
                  await expect(page.getByRole('heading', { level: 2, name: 'Oppsummering' })).toBeVisible();
                  await expect(send).toHaveAttribute('data-variant', 'primary');
                }
              } finally {
                release();
              }
            },
          );
        }
      }
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
        async ({ readyPage: page, useRouteVariant }) => {
          await prepareAttachmentSubmission(page);
          await useRouteVariant('post-familie-pdf:success-tc07');
          await useRouteVariant('post-digital-soknad:success-tc07');
          await sendToNav(page);
          await expect(page.getByRole('heading', { level: 2, name: 'Kvittering' })).toBeVisible();
          for (const name of ['Vedlegg 1', 'Vedlegg 2', 'Vedlegg upload-only', 'Annet vedlegg 1']) {
            await expect(page.getByText(name, { exact: true })).toBeVisible();
          }
        },
      );
    });
  });
});
