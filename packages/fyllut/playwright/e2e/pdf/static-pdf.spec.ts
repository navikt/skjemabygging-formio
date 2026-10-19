import type { Page } from '@playwright/test';
import { expect, skipUnlessBuilt, test } from '../../fixtures/test';
import { visitForm, visitStaticPdfForm } from '../../helpers/form';

const visitStaticPdfPage = async (page: Page, search = '') => {
  const staticPdf = page.waitForResponse(
    (response) =>
      /\/fyllut\/api\/forms\/pdfstatic\/static-pdfs(?:\?|$)/.test(response.url()) &&
      response.request().method() === 'GET',
  );
  await visitForm(page, `/fyllut/pdfstatic/pdf${search}`);
  const response = await staticPdf;
  expect(response.status(), 'STATIC_PDF_LIST_REQUIRED').toBe(200);
  expect(await response.finished(), 'STATIC_PDF_LIST_COMPLETE').toBeNull();
};

const downloadStaticPdf = async (page: Page) => {
  const download = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      /\/fyllut\/api\/forms\/pdfstatic\/static-pdfs\/[^/?]+(?:\?|$)/.test(response.url()),
  );
  await page.getByRole('button', { name: /Last ned skjema/ }).click();
  const response = await download;
  expect(response.status()).toBe(200);
  expect(await response.finished(), 'STATIC_PDF_DOWNLOAD_COMPLETE').toBeNull();
  const body: unknown = await response.json();
  expect(body).toMatchObject({ pdfBase64: expect.any(String) });
  return response.request().postDataJSON() as { attachments?: string[] };
};

test.describe('Static PDF backend routing', () => {
  test.beforeEach(skipUnlessBuilt);

  test('returns 404 for normal fill-in routes when the form only supports static pdf', async ({ request }) => {
    const response = await request.get('/fyllut/pdfstatic');
    expect(response.status()).toBe(404);
  });
});

test.describe('Static PDF', () => {
  test.beforeEach(async ({ readyPage: page }) => {
    await visitStaticPdfForm(page);
  });

  test('should be possible to download pdf with social security number', async ({ readyPage: page }) => {
    await visitStaticPdfPage(page);

    await page.getByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).fill('22015614475');
    await page.getByRole('checkbox', { name: /Vedlegg 1/ }).check();
    await page.getByRole('link', { name: /Fortsett/ }).click();
    const request = await downloadStaticPdf(page);
    expect(request).toMatchObject({
      languageCode: 'nb',
      attachments: ['vedlegg1'],
      user: { nationalIdentityNumber: '22015614475' },
    });
    expect(request).not.toHaveProperty('type');
  });

  test('should be possible to download pdf with name and address', async ({ readyPage: page }) => {
    await visitStaticPdfPage(page);
    await page.getByRole('radio', { name: /Person som ikke har fødselsnummer eller d-nummer/ }).check();
    for (const [label, value] of [
      ['Fornavn', 'Ola'],
      ['Etternavn', 'Nordmann'],
      ['Vegadresse', 'Fyrstikkalléen 1'],
      ['Postnummer', '0661'],
      ['Poststed', 'Oslo'],
    ]) {
      await page.getByRole('textbox', { name: label }).fill(value);
    }
    await page.getByRole('checkbox', { name: /Vedlegg 1/ }).check();
    await page.getByRole('checkbox', { name: /Vedlegg 2/ }).check();
    await page.getByRole('link', { name: /Fortsett/ }).click();
    const request = await downloadStaticPdf(page);
    expect(request).toMatchObject({
      languageCode: 'nb',
      attachments: ['vedlegg1', 'vedlegg2'],
      user: {
        firstName: 'Ola',
        surname: 'Nordmann',
        address: {
          streetAddress: 'Fyrstikkalléen 1',
          postalName: 'Oslo',
          postalCode: '0661',
          country: { value: 'NO' },
        },
      },
    });
  });

  test('should be possible to continue and download pdf without selecting attachments', async ({ readyPage: page }) => {
    await visitStaticPdfPage(page);
    await page.getByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).fill('22015614475');
    await expect(page.getByRole('checkbox', { name: /Vedlegg 1/ })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Vedlegg 2/ })).toBeVisible();
    await page.getByRole('link', { name: /Fortsett/ }).click();
    const request = await downloadStaticPdf(page);
    expect(request).toMatchObject({
      languageCode: 'nb',
      user: { nationalIdentityNumber: '22015614475' },
    });
    expect(request.attachments ?? []).toHaveLength(0);
  });

  test('shows all attachments when filter is empty', async ({ readyPage: page }) => {
    await visitStaticPdfPage(page, '?filter=');
    await expect(page.getByRole('checkbox', { name: /Vedlegg 1/ })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Vedlegg 2/ })).toBeVisible();
  });

  test('shows only the matching attachment for a single filter code', async ({ readyPage: page }) => {
    await visitStaticPdfPage(page, '?filter=R4');
    await expect(page.getByRole('checkbox', { name: /Vedlegg 1/ })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Vedlegg 2/ })).toHaveCount(0);
  });

  test('shows all matching attachments for multiple filter codes and ignores whitespace', async ({
    readyPage: page,
  }) => {
    await visitStaticPdfPage(page, '?filter=%20R4%20,%20,%20K2%20');
    await expect(page.getByRole('checkbox', { name: /Vedlegg 1/ })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Vedlegg 2/ })).toBeVisible();
  });

  test('ignores unknown filter codes', async ({ readyPage: page }) => {
    await visitStaticPdfPage(page, '?filter=R4,ZZ');
    await expect(page.getByRole('checkbox', { name: /Vedlegg 1/ })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Vedlegg 2/ })).toHaveCount(0);
  });

  test('downloads static pdf when no attachments match the filter', async ({ readyPage: page }) => {
    await visitStaticPdfPage(page, '?filter=ZZ');
    await page.getByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).fill('22015614475');
    await expect(page.getByRole('checkbox', { name: /Vedlegg 1/ })).toHaveCount(0);
    await expect(page.getByRole('checkbox', { name: /Vedlegg 2/ })).toHaveCount(0);
    await page.getByRole('link', { name: /Fortsett/ }).click();
    const request = await downloadStaticPdf(page);
    expect(request.attachments ?? []).toHaveLength(0);
    expect(request).toMatchObject({ user: { nationalIdentityNumber: '22015614475' } });
  });

  test('supports ettersending after selecting an attachment', async ({ readyPage: page, useRouteVariant }) => {
    await useRouteVariant('foersteside:success-tc08c-static-pdf-ettersending');
    await visitStaticPdfPage(page, '?type=ettersending');
    await expect(page.getByRole('heading', { name: 'Ettersend dokumentasjon', level: 2 })).toBeVisible();
    await page.getByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).fill('22015614475');
    await page.getByRole('link', { name: /Fortsett/ }).click();
    await expect(page.getByRole('link', { name: 'Du må fylle ut: Vedlegg' })).toBeVisible();
    await expect(page.getByText('Du må fylle ut: Vedlegg', { exact: true })).toHaveCount(2);
    await page.getByRole('checkbox', { name: /Vedlegg 1/ }).check();
    await page.getByRole('link', { name: /Fortsett/ }).click();
    const request = await downloadStaticPdf(page);
    expect(request).toMatchObject({ type: 'ETTERSENDELSE' });
    await expect(page.getByText(/Fyll ut skjema. Husk å signere til slutt./)).toHaveCount(0);
  });

  test('returns 404 for ettersending when no attachment is selectable', async ({ readyPage: page }) => {
    await visitStaticPdfPage(page, '?type=ettersending&filter=ZZ');
    await expect(page).toHaveURL(/\/404(?:[/?#]|$)/);
  });
});
