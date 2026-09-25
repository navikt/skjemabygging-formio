import { expect, test } from '../../fixtures/test';
import { visitForm } from '../../helpers/form';

test.describe('Static PDF', () => {
  test(
    'should be possible to download pdf with social security number',
    {
      annotation: [
        { type: 'migration-id', description: 'F086-T001' },
        { type: 'cypress-source', description: 'packages/fyllut/cypress/e2e/pdf/static-pdf.cy.ts' },
      ],
    },
    async ({ readyPage: page }) => {
      const staticPdf = page.waitForResponse(
        (response) =>
          response.url().includes('/fyllut/api/forms/pdfstatic/static-pdfs') && response.request().method() === 'GET',
      );
      await visitForm(page, '/fyllut/pdfstatic/pdf');
      expect((await staticPdf).ok()).toBeTruthy();

      await page.getByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).pressSequentially('22015614475');
      await page.getByRole('checkbox', { name: /Vedlegg 1/ }).check();
      await page.getByRole('link', { name: /Fortsett/ }).click();
      const download = page.waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          /\/fyllut\/api\/forms\/pdfstatic\/static-pdfs\/[^/]+/.test(response.url()),
      );
      await page.getByRole('button', { name: /Last ned skjema/ }).click();
      const response = await download;
      const request: unknown = response.request().postDataJSON();
      expect(request).toMatchObject({
        languageCode: 'nb',
        attachments: ['vedlegg1'],
        user: { nationalIdentityNumber: '22015614475' },
      });
      expect(response.status()).toBe(200);
      const body: unknown = await response.json();
      expect(body).toMatchObject({ pdfBase64: expect.any(String) });
    },
  );
});
