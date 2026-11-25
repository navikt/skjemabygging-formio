import { Page } from '@playwright/test';
import { expect, skipUnlessBuilt, test } from '../fixtures/test';
import { expectPdf } from '../helpers/download';
import { nextStep, previousStep, unitSelect } from '../helpers/form';
import { selectDecoratorLanguage } from '../helpers/language';

const goToPaperSubmission = async (page: Page) => {
  await page.getByRole('button', { name: 'Instruksjoner for innsending', exact: true }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Dokumentene er ikke sendt ennå' })).toBeFocused();
};
const downloadButton = (page: Page) =>
  page.getByRole('button', { name: /^(Last ned førsteside|Download cover page)$/ });

const reachPaperSubmission = async (page: Page) => {
  await page.goto('/sendinn/sendinnjourney?filter=N1');
  await page.getByRole('radio', { name: 'Flere personer / Nav-enhet', exact: true }).check();
  await unitSelect(page).selectOption('0101');
  await nextStep(page);
  await page.getByRole('checkbox').check();
  await nextStep(page);
  await goToPaperSubmission(page);
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
    await nextStep(page);
    await page.getByRole('checkbox').check();
    await nextStep(page);
    await page.getByRole('button', { name: 'Submission instructions', exact: true }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'The documents have not been sent yet' })).toBeFocused();
    await expect(page.getByRole('heading', { level: 3, name: '3. Attach the following document' })).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveText(['Evidence document (en)']);
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
    expect(Object.keys(body).sort()).toEqual(['attachmentFilter', 'formPath', 'language', 'revision', 'submission']);
    expect(body).toMatchObject({
      formPath: 'sendinnjourney',
      revision: 3,
      language: 'en',
      attachmentFilter: ['N1', 'N1'],
      submission: {
        data: {
          userType: 'multiple-people',
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
    await expect(page.getByText('The download is complete.')).toBeVisible();
    await expect(page).toHaveURL(
      (url) => url.searchParams.get('lang') === 'en' && url.searchParams.get('sub') === 'digital',
    );
  });

  test('sends an other-document description verbatim and excludes an available unselected document', async ({
    readyPage: page,
    useRouteVariant,
  }) => {
    await useRouteVariant('get-form:sendinn-hidden-user-type');
    await useRouteVariant('foersteside:success-tc08f-sendinn-description');
    await page.goto('/sendinn/sendinnjourney');
    await page
      .getByRole('group', { name: /Other document/ })
      .getByRole('checkbox')
      .check();
    await page.getByRole('textbox').fill('Additional evidence');
    await nextStep(page);
    await goToPaperSubmission(page);
    await expect(page.getByRole('heading', { level: 3, name: '3. Legg ved dette vedlegget' })).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveText(['Additional evidence']);
    const download = page.waitForEvent('download');
    await downloadButton(page).click();
    await expectPdf(await download);
    await previousStep(page);
    await previousStep(page);
    await expect(page.getByRole('textbox')).toHaveValue('Additional evidence');
    await expect(page.getByRole('group', { name: /Evidence document/ }).getByRole('checkbox')).not.toBeChecked();
  });

  test('recovers from a real generator 503, retaining navigation, language, filter and latest answers', async ({
    readyPage: page,
    useRouteVariant,
  }) => {
    await reachPaperSubmission(page);
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
    await previousStep(page);
    await previousStep(page);
    await expect(page.getByRole('checkbox')).toBeChecked();
    await previousStep(page);
    await expect(unitSelect(page)).toHaveValue('0101');
    await unitSelect(page).selectOption('0202');
    await nextStep(page);
    await nextStep(page);
    await goToPaperSubmission(page);
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

  test('requires a selection with the loaded language fallback and empty normalized filter before downloading a later document', async ({
    readyPage: page,
    useRouteVariant,
  }) => {
    await useRouteVariant('get-form:sendinn-hidden-user-type');
    await useRouteVariant('foersteside:success-tc08f-sendinn-description');
    let requests = 0;
    page.on('request', (request) => {
      if (request.url().endsWith('/api/cover-page')) requests += 1;
    });
    await page.goto('/sendinn/sendinnjourney?lang=nn&filter=%20,%20');
    await expect(page.getByRole('checkbox')).toHaveCount(2);
    await nextStep(page);
    await expect(page.getByTestId('error-summary').getByRole('link')).toHaveText('Du må velge minst ett vedlegg');
    expect(requests).toBe(0);
    await page
      .getByRole('group', { name: /Other document/ })
      .getByRole('checkbox')
      .check();
    await page.getByRole('textbox').fill('Additional evidence');
    await nextStep(page);
    await goToPaperSubmission(page);
    const responsePromise = page.waitForResponse('**/sendinn/api/cover-page');
    const download = page.waitForEvent('download');
    await downloadButton(page).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const body = response.request().postDataJSON();
    expect(body).toMatchObject({ language: 'nb', attachmentFilter: [] });
    expect(body.submission.data.sendinnAttachment2.other[0].value).toBe('leggerVedNaa');
    expect(body.submission.data.sendinnAttachment1?.evidence?.value).not.toBe('leggerVedNaa');
    await expectPdf(await download);
    expect(requests).toBe(1);
  });

  test('starts over on a full reload without storing answers in the route', async ({ readyPage: page }) => {
    await reachPaperSubmission(page);
    await expect(page).toHaveURL(
      (url) =>
        url.pathname === '/sendinn/sendinnjourney/send-i-posten' && [...url.searchParams.keys()].join(',') === 'filter',
    );
    await page.reload();
    await expect(page.getByTestId('error-summary').getByRole('heading')).toBeFocused();
    await expect(downloadButton(page)).toHaveCount(0);
    await page.getByTestId('error-summary').getByRole('link').first().click();
    await expect(page.getByRole('radio', { name: 'Flere personer / Nav-enhet', exact: true })).not.toBeChecked();
    await page.getByRole('radio', { name: 'Flere personer / Nav-enhet', exact: true }).check();
    await expect(unitSelect(page)).toHaveValue('');
  });

  for (const moveFocus of [false, true]) {
    test(`disables download while pending and ${moveFocus ? 'preserves moved focus' : 'restores lost button focus'}`, async ({
      readyPage: page,
    }) => {
      await reachPaperSubmission(page);
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
      await expect(page).toHaveURL((url) => url.pathname === '/sendinn/sendinnjourney/send-i-posten');
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

  test('reports browser download failure and retries without losing the form', async ({ readyPage: page }) => {
    await reachPaperSubmission(page);
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

  test('validates direct paper submission navigation and blocks an empty available list before any download', async ({
    readyPage: page,
    useRouteVariant,
  }) => {
    let downloads = 0;
    page.on('request', (request) => {
      if (request.url().endsWith('/api/cover-page')) downloads += 1;
    });
    await page.goto('/sendinn/sendinnjourney/send-i-posten');
    await expect(page.getByTestId('error-summary').getByRole('heading')).toBeFocused();
    await expect(downloadButton(page)).toHaveCount(0);
    await useRouteVariant('get-form:sendinn-hidden-user-type');
    await page.goto('/sendinn/sendinnjourney/send-i-posten?filter=N6');
    const errors = page.getByTestId('error-summary');
    await expect(errors.getByRole('heading')).toBeFocused();
    await expect(errors.getByRole('link')).toHaveText('Du må velge minst ett vedlegg');
    await expect(page).toHaveURL((url) => url.pathname === '/sendinn/sendinnjourney/oppsummering');
    await expect(downloadButton(page)).toHaveCount(0);
    await errors.getByRole('link').click();
    await expect(page.getByRole('checkbox')).toBeFocused();
    await expect(page.locator('#input-sendinnAttachment2-other-value')).toContainText('Du må velge minst ett vedlegg');
    await page.goto('/sendinn/sendinnjourney/send-i-posten?filter=unknown');
    await expect(
      page.getByText('Ingen dokumenter passer med denne lenken. Gå tilbake og kontroller lenken du brukte.'),
    ).toBeVisible();
    await expect(downloadButton(page)).toHaveCount(0);
    expect(downloads).toBe(0);
  });

  test('revalidates latest selections on the summary and a history entry before allowing another download', async ({
    readyPage: page,
    useRouteVariant,
  }) => {
    await useRouteVariant('foersteside:success-tc08e-sendinn');
    await reachPaperSubmission(page);
    let requests = 0;
    page.on('request', (request) => {
      if (request.url().endsWith('/api/cover-page')) requests += 1;
    });
    await previousStep(page);
    await previousStep(page);
    await page.getByRole('checkbox').uncheck();
    await page.goBack();
    await page.getByRole('button', { name: 'Instruksjoner for innsending', exact: true }).click();
    const errors = page.getByTestId('error-summary');
    await expect(errors.getByRole('link')).toHaveText('Du må velge minst ett vedlegg');
    await expect(downloadButton(page)).toHaveCount(0);
    await page.goBack();
    await expect(page).toHaveURL((url) => url.pathname === '/sendinn/sendinnjourney/oppsummering');
    await expect(errors.getByRole('heading')).toBeFocused();
    await expect(errors.getByRole('link')).toHaveText('Du må velge minst ett vedlegg');
    await expect(downloadButton(page)).toHaveCount(0);
    expect(requests).toBe(0);
    await errors.getByRole('link').click();
    await expect(page.getByRole('checkbox')).toBeFocused();
    await expect(page.getByRole('checkbox')).not.toBeChecked();
    await page.getByRole('checkbox').check();
    await nextStep(page);
    await goToPaperSubmission(page);
    await selectDecoratorLanguage(page, 'en');
    const response = page.waitForResponse('**/sendinn/api/cover-page');
    const download = page.waitForEvent('download');
    await downloadButton(page).click();
    const result = await response;
    expect(result.status()).toBe(200);
    expect(result.request().postDataJSON().submission.data.navUnit).toBe('0101');
    await expectPdf(await download);
    expect(requests).toBe(1);
  });
});
