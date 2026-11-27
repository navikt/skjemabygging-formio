import type { Page } from '@playwright/test';
import { expect, test } from '../../fixtures/test';
import { visitForm } from '../../helpers/form';

const isPrefillDataRequest = (url: string) => url.includes('/fyllut/api/send-inn/prefill-data');
const isDraftUpdate = (method: string, url: string) => method === 'PUT' && url.includes('/fyllut/api/send-inn/soknad');
const isSubmission = (method: string, url: string) =>
  method === 'POST' && url.includes('/fyllut/api/send-inn/digital-application/');

const saveAndContinue = async (page: Page) => {
  await page.getByRole('button', { name: 'Lagre og fortsett', exact: true }).click();
};

test.describe('Resumed draft and prefill data', () => {
  test('replaces the saved identity and fills empty person data with the current prefill', async ({
    readyPage: page,
    useRouteVariant,
  }) => {
    await useRouteVariant('get-soknad:success-your-information-without-person-data');
    const prefillData = page.waitForResponse((response) => isPrefillDataRequest(response.url()));

    await visitForm(
      page,
      '/fyllut/yourinformation/dineOpplysninger?sub=digital&innsendingsId=8e1d4b7a-2422-4c3e-b6f0-1a9e5d2c7f30',
    );
    expect((await prefillData).status()).toBe(200);

    await expect(page.getByRole('heading', { name: 'Dine opplysninger', exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Fødselsnummer eller d-nummer' })).toHaveValue('088427 48500');
    await expect(page.getByRole('textbox', { name: 'Fornavn' })).toHaveValue('Ola');
    await expect(page.getByRole('textbox', { name: 'Etternavn' })).toHaveValue('Nordmann');
    await expect(page.getByRole('textbox', { name: 'Vegadresse' })).toHaveValue('Testveien 1C');

    await saveAndContinue(page);
    await expect(page.getByRole('heading', { name: 'Navn', exact: true })).toBeVisible();
    await saveAndContinue(page);
    await expect(page.getByRole('heading', { name: 'Oppsummering', exact: true })).toBeVisible();

    const submission = page.waitForRequest((request) => isSubmission(request.method(), request.url()));
    await page.getByRole('button', { name: 'Send til Nav', exact: true }).click();
    const request = await submission;
    expect(request.postDataJSON().submission.data.dineOpplysninger).toMatchObject({
      fornavn: 'Ola',
      etternavn: 'Nordmann',
      identitet: { identitetsnummer: '08842748500' },
      adresse: { adresse: 'Testveien 1C', postnummer: '1234', bySted: 'Plassen' },
    });
  });

  test('stops the user when prefill data fails', async ({ readyPage: page, useRouteVariant }) => {
    await useRouteVariant('get-soknad:success-your-information-with-identity');
    await page.route('**/fyllut/api/send-inn/prefill-data*', (route) =>
      route.fulfill({ status: 500, json: { message: 'Feil ved kall til SendInn for preutfylling' } }),
    );
    const savedOrSubmitted: string[] = [];
    page.on('request', (request) => {
      if (isDraftUpdate(request.method(), request.url()) || isSubmission(request.method(), request.url())) {
        savedOrSubmitted.push(request.url());
      }
    });
    const prefillData = page.waitForResponse((response) => isPrefillDataRequest(response.url()));

    await visitForm(
      page,
      '/fyllut/yourinformation/dineOpplysninger?sub=digital&innsendingsId=5c6a0f3e-2422-4f6b-9a51-7d3c2e8b1f42',
    );
    expect((await prefillData).status()).toBe(500);

    await expect(page.getByRole('heading', { name: 'Beklager, det oppsto en feil' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dine opplysninger', exact: true })).toHaveCount(0);
    expect(savedOrSubmitted).toEqual([]);
  });
});
