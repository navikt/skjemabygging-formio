import { Page } from '@playwright/test';
import { expect, skipUnlessBuilt, test } from '../fixtures/test';
import { expectPdf } from '../helpers/download';
import { selectDecoratorLanguage } from '../helpers/language';

const next = (page: Page) => page.getByRole('button', { name: 'Neste steg', exact: true }).click();
const previous = (page: Page) => page.getByRole('button', { name: 'Forrige steg', exact: true }).click();
const instructions = async (page: Page) => {
  await page.getByRole('button', { name: 'Instruksjoner for innsending', exact: true }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Dokumentene er ikke sendt ennå' })).toBeFocused();
};
const downloadButton = (page: Page) =>
  page.getByRole('button', { name: /^(Last ned førsteside|Download cover page)$/ });
const unitSelect = (page: Page) =>
  page.getByRole('combobox', { name: 'Velg hvilken Nav-enhet som skal motta innsendingen', exact: true });

const reachInstructions = async (page: Page) => {
  await page.goto('/sendinn/sendinnjourney?filter=N1');
  await page.getByRole('radio', { name: 'Flere personer / Nav-enhet', exact: true }).check();
  await unitSelect(page).selectOption('0101');
  await next(page);
  await page.getByRole('checkbox').check();
  await next(page);
  await instructions(page);
  await expect(page.getByRole('heading', { level: 2, name: 'Dokumentene er ikke sendt ennå' })).toBeFocused();
};

test.describe('Paper cover-page download', () => {
  test.beforeEach(skipUnlessBuilt);

  test('downloads actual PDF bytes using loaded language, normalized filter and canonical answers', async ({
    readyPage: page,
    useRouteVariant,
  }) => {
    await useRouteVariant('foersteside:success-tc08e-sendinn');
    await page.goto('/sendinn/sendinnjourney?lang=en&filter=%20N1,%20&filter=N1&sub=digital');
    await page.getByRole('radio', { name: 'Multiple people / Nav unit', exact: true }).check();
    await page.getByRole('combobox').selectOption('0101');
    await page.getByRole('button', { name: 'Next step', exact: true }).click();
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Next step', exact: true }).click();
    await page.getByRole('button', { name: 'Submission instructions', exact: true }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'The documents have not been sent yet' })).toBeFocused();
    await expect(page.getByText('Enclose all attachments listed on the cover page.', { exact: true })).toBeVisible();
    await expect(
      page.getByText('Put the documents in an envelope and post it to the address on the cover page.'),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /Upload|Send to Nav/ })).toHaveCount(0);
    const responsePromise = page.waitForResponse('**/sendinn/api/cover-page');
    const downloadPromise = page.waitForEvent('download');
    await downloadButton(page).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    expect(response.headers()['cache-control']).toBe('no-store');
    expect(response.headers()['content-type']).toContain('application/json');
    const body = response.request().postDataJSON();
    expect(Object.keys(body).sort()).toEqual(['attachmentFilter', 'formPath', 'language', 'submission']);
    expect(body).toMatchObject({
      formPath: 'sendinnjourney',
      language: 'en',
      attachmentFilter: ['N1', 'N1'],
      submission: {
        data: {
          collectionType: 'multiple-people',
          navUnit: '0101',
          sendinnAttachment1: {
            evidence: {
              navId: 'evidence-id',
              value: 'leggerVedNaa',
              files: [],
            },
          },
        },
      },
    });
    expect(body.submission.data).not.toHaveProperty('sendinnAttachment2');
    await expectPdf(await downloadPromise);
    await expect(page.getByRole('status').filter({ hasText: 'The download is complete.' })).toBeVisible();
    await expect(page).toHaveURL(
      (url) => url.searchParams.get('lang') === 'en' && url.searchParams.get('sub') === 'digital',
    );
  });

  test('sends an other-document description verbatim and excludes an available unselected document', async ({
    readyPage: page,
    useRouteVariant,
  }) => {
    await useRouteVariant('get-form:sendinn-hidden-collection');
    await useRouteVariant('foersteside:success-tc08f-sendinn-description');
    await page.goto('/sendinn/sendinnjourney');
    await page
      .getByRole('group', { name: /Other document/ })
      .getByRole('checkbox')
      .check();
    await page.getByRole('textbox').fill('Additional evidence');
    await next(page);
    await instructions(page);
    const download = page.waitForEvent('download');
    await downloadButton(page).click();
    await expectPdf(await download);
    await previous(page);
    await previous(page);
    await expect(page.getByRole('textbox')).toHaveValue('Additional evidence');
    await expect(page.getByRole('group', { name: /Evidence document/ }).getByRole('checkbox')).not.toBeChecked();
  });

  test('recovers from a real generator 503, retaining navigation, language, filter and latest answers', async ({
    readyPage: page,
    useRouteVariant,
  }) => {
    await reachInstructions(page);
    await useRouteVariant('foersteside:failure');
    const failure = page.waitForResponse('**/sendinn/api/cover-page');
    await downloadButton(page).click();
    const failedResponse = await failure;
    expect(failedResponse.status()).toBe(503);
    const error = await failedResponse.json();
    expect(error.correlationId).toBeTruthy();
    const alert = page.getByRole('alert');
    await expect(alert).toContainText('Vi kunne ikke laste ned førstesiden. Prøv igjen.');
    await expect(alert).toContainText(error.correlationId);
    await expect(alert).toBeFocused();
    await expect(downloadButton(page)).toBeEnabled();
    await previous(page);
    await previous(page);
    await expect(page.getByRole('checkbox')).toBeChecked();
    await previous(page);
    await expect(unitSelect(page)).toHaveValue('0101');
    await unitSelect(page).selectOption('0202');
    await next(page);
    await next(page);
    await instructions(page);
    await selectDecoratorLanguage(page, 'en');
    await expect(downloadButton(page)).toHaveText('Download cover page');
    await useRouteVariant('foersteside:success-sendinn');
    const success = page.waitForResponse('**/sendinn/api/cover-page');
    const download = page.waitForEvent('download');
    await downloadButton(page).click();
    const response = await success;
    expect(response.status()).toBe(200);
    expect(response.request().postDataJSON()).toMatchObject({
      language: 'en',
      attachmentFilter: ['N1'],
      submission: { data: { navUnit: '0202' } },
    });
    await expectPdf(await download);
    await page.goBack();
    await expect(page).toHaveURL((url) => url.searchParams.get('lang') !== 'en');
    await page.goForward();
    await expect(downloadButton(page)).toHaveText('Download cover page');
    await expect(page).toHaveURL(
      (url) => url.searchParams.get('lang') === 'en' && url.searchParams.get('filter') === 'N1',
    );
  });

  test('uses the loaded language fallback and empty normalized filter without adding the deferred selection guard', async ({
    readyPage: page,
    useRouteVariant,
  }) => {
    await useRouteVariant('get-form:sendinn-hidden-collection');
    await page.goto('/sendinn/sendinnjourney?lang=nn&filter=%20,%20');
    await expect(page.getByRole('checkbox')).toHaveCount(2);
    await next(page);
    await instructions(page);
    const responsePromise = page.waitForResponse('**/sendinn/api/cover-page');
    const download = page.waitForEvent('download');
    await downloadButton(page).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const body = response.request().postDataJSON();
    expect(body).toMatchObject({ language: 'nb', attachmentFilter: [] });
    expect(JSON.stringify(body.submission)).not.toContain('leggerVedNaa');
    await expectPdf(await download);
  });

  test('starts over on a full reload without storing answers in the route', async ({ readyPage: page }) => {
    await reachInstructions(page);
    await expect(page).toHaveURL(
      (url) =>
        [...url.searchParams.keys()].sort().join(',') === 'filter,step' &&
        url.searchParams.get('step') === 'instructions',
    );
    await page.reload();
    await expect(page.getByTestId('error-summary').getByRole('heading')).toBeFocused();
    await expect(downloadButton(page)).toHaveCount(0);
    await page.getByTestId('error-summary').getByRole('link').click();
    await expect(page.getByRole('radio', { name: 'Flere personer / Nav-enhet', exact: true })).not.toBeChecked();
    await page.getByRole('radio', { name: 'Flere personer / Nav-enhet', exact: true }).check();
    await expect(unitSelect(page)).toHaveValue('');
  });

  for (const moveFocus of [false, true]) {
    test(`disables download while pending and ${moveFocus ? 'preserves moved focus' : 'restores lost button focus'}`, async ({
      readyPage: page,
    }) => {
      await reachInstructions(page);
      let release!: () => void;
      const pending = new Promise<void>((resolve) => {
        release = resolve;
      });
      let requests = 0;
      await page.route('**/sendinn/api/cover-page', async (route) => {
        requests += 1;
        const response = await route.fetch();
        await pending;
        await route.fulfill({ response });
      });
      const download = page.waitForEvent('download');
      await downloadButton(page).focus();
      await expect(downloadButton(page)).toBeFocused();
      await downloadButton(page).click();
      await expect(downloadButton(page)).toBeDisabled();
      await expect(page.getByRole('status')).toHaveText('Lager førstesiden. Vent litt.');
      await expect(page).toHaveURL((url) => url.searchParams.get('step') === 'instructions');
      const focusTarget = moveFocus
        ? page.getByRole('button', { name: 'Forrige steg', exact: true })
        : downloadButton(page);
      if (moveFocus) {
        await focusTarget.focus();
        await expect(focusTarget).toBeFocused();
      } else {
        await downloadButton(page).evaluate((button) => button.blur());
        await expect(downloadButton(page)).not.toBeFocused();
      }
      release();
      await expectPdf(await download);
      await expect(downloadButton(page)).toBeEnabled();
      await expect(focusTarget).toBeFocused();
      expect(requests).toBe(1);
    });
  }

  for (const pdf of ['', 'not-base64!', btoa('not a PDF')]) {
    test(`rejects an unusable success response and allows retry (${pdf || 'empty'})`, async ({ readyPage: page }) => {
      await reachInstructions(page);
      await page.route('**/sendinn/api/cover-page', (route) => route.fulfill({ json: { pdf } }), { times: 1 });
      let downloads = 0;
      page.on('download', () => {
        downloads += 1;
      });
      await downloadButton(page).click();
      await expect(page.getByRole('alert')).toBeFocused();
      expect(downloads).toBe(0);
      const download = page.waitForEvent('download');
      await downloadButton(page).click();
      await expectPdf(await download);
    });
  }

  test('reports browser download failure and retries without losing the form', async ({ readyPage: page }) => {
    await reachInstructions(page);
    await page.evaluate(() => {
      const createObjectURL = URL.createObjectURL;
      URL.createObjectURL = () => {
        URL.createObjectURL = createObjectURL;
        throw new Error('Simulated browser download failure');
      };
    });
    await downloadButton(page).click();
    await expect(page.getByRole('alert')).toBeFocused();
    const download = page.waitForEvent('download');
    await downloadButton(page).click();
    await expectPdf(await download);
  });

  test('validates direct instruction navigation and blocks an empty available list before any download', async ({
    readyPage: page,
  }) => {
    let downloads = 0;
    page.on('request', (request) => {
      if (request.url().endsWith('/api/cover-page')) downloads += 1;
    });
    await page.goto('/sendinn/sendinnjourney?step=instructions');
    await expect(page.getByTestId('error-summary').getByRole('heading')).toBeFocused();
    await expect(downloadButton(page)).toHaveCount(0);
    await page.goto('/sendinn/sendinnjourney?step=instructions&filter=unknown');
    await expect(
      page.getByText('Ingen dokumenter passer med denne lenken. Gå tilbake og kontroller lenken du brukte.'),
    ).toBeVisible();
    await expect(downloadButton(page)).toHaveCount(0);
    expect(downloads).toBe(0);
  });
});
