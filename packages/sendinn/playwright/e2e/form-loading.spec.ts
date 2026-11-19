import { expect, test } from '../fixtures/test';
import { selectDecoratorLanguage } from '../helpers/language';

test.describe('Paper form loading', () => {
  test('loads the canonical form from the backend with the normalized filter and ignores sub', async ({
    readyPage: page,
  }) => {
    let releaseLoading: () => void = () => {};
    const loading = new Promise<void>((resolve) => {
      releaseLoading = resolve;
    });
    await page.route('**/sendinn/api/forms/nav123456?*', async (route) => {
      await loading;
      await route.continue();
    });
    const requested = page.waitForRequest((request) => request.url().includes('/sendinn/api/forms/nav123456?'));
    const loaded = page.waitForResponse((response) => response.url().includes('/sendinn/api/forms/nav123456?'));
    await page.goto('/sendinn/nav123456?sub=digital&filter=%20N2,N1%20&filter=N2&lang=en');
    await requested;
    await expect(
      page.getByRole('heading', { level: 1, name: 'Submit documentation for a form', exact: true }),
    ).toHaveCount(0);
    releaseLoading();
    const response = await loaded;
    expect(response.status()).toBe(200);
    expect(new URL(response.url()).searchParams.getAll('filter')).toEqual(['N2', 'N1', 'N2']);
    expect(new URL(response.url()).searchParams.has('sub')).toBe(false);
    const result = await response.json();
    expect(result).toMatchObject({
      language: 'en',
      languages: ['nb', 'en'],
      attachmentFilter: ['N2', 'N1', 'N2'],
      form: { path: 'nav123456', publishedLanguages: ['en'], properties: { submissionTypes: ['PAPER'] } },
      translations: { 'First document': { en: 'First document (en)' } },
    });
    expect(JSON.stringify(result.form.components)).not.toContain('applicationOnly');
    expect(result.form.components.at(-1).components).toMatchObject([
      { key: 'sendinnAttachment1', components: [{ key: 'firstDocument' }] },
      { key: 'sendinnAttachment2', components: [{ key: 'secondDocument' }] },
    ]);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Submit documentation for a form', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('textbox')).toHaveCount(0);
  });

  test('shows the shared unavailable page for a missing form', async ({ readyPage: page }) => {
    await page.goto('/sendinn/missingform');
    await expect(page.getByRole('heading', { level: 1, name: 'Beklager, fant ikke siden' })).toBeFocused();
  });

  test('does not open a paper-disabled form even with sub=paper', async ({ readyPage: page, useRouteVariant }) => {
    await useRouteVariant('get-form:sendinn-paper-disabled');
    await page.goto('/sendinn/nav123456?sub=paper');
    await expect(page.getByRole('heading', { level: 1, name: 'Beklager, fant ikke siden' })).toBeFocused();
  });

  test('keeps a correlated upstream outage distinct from unavailable and recovers on reload', async ({
    readyPage: page,
    useRouteVariant,
  }) => {
    await useRouteVariant('get-form:sendinn-error');
    await page.goto('/sendinn/nav123456');
    await expect(page.getByRole('heading', { level: 1, name: 'Beklager, det oppsto en feil' })).toBeFocused();
    await expect(page.getByText('sendinn-form-upstream-error', { exact: false })).toBeVisible();
    await useRouteVariant('get-form:success');
    await page.reload();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Send inn dokumentasjon til skjema', exact: true }),
    ).toBeVisible();
  });

  test('keeps an unknown nonempty filter empty and exposes no completion action', async ({ readyPage: page }) => {
    await page.goto('/sendinn/nav123456?filter=unknown');
    await expect(
      page.getByText('Ingen dokumenter passer med denne lenken. Gå tilbake og kontroller lenken du brukte.'),
    ).toBeVisible();
    await expect(page.getByRole('textbox')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Last ned|Send inn/ })).toHaveCount(0);
  });

  test('reloads in the selected published language without dropping the attachment filter', async ({
    readyPage: page,
  }) => {
    await page.goto('/sendinn/nav123456?filter=N2');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Send inn dokumentasjon til skjema', exact: true }),
    ).toBeVisible();
    const reloaded = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.pathname === '/sendinn/api/forms/nav123456' && url.searchParams.get('lang') === 'en';
    });
    await selectDecoratorLanguage(page, 'en');
    expect((await (await reloaded).json()).attachmentFilter).toEqual(['N2']);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Submit documentation for a form', exact: true }),
    ).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveURL(
      (url) => url.searchParams.get('filter') === 'N2' && url.searchParams.get('lang') === 'en',
    );
  });

  test('uses Bokmål for a language that is not published for the form', async ({ readyPage: page }) => {
    await page.goto('/sendinn/nav123456?lang=nn');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Send inn dokumentasjon til skjema', exact: true }),
    ).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'nb');
  });

  test('uses the existing session-expired recovery if the form request loses its session', async ({
    readyPage: page,
  }) => {
    await page.route('**/sendinn/api/forms/nav123456?*', (route) => route.fulfill({ status: 401 }));
    await page.goto('/sendinn/nav123456?filter=N2');
    await expect(page.getByRole('heading', { name: 'Du er logget ut' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Logg inn på nytt' })).toHaveAttribute(
      'href',
      `/sendinn/oauth2/login?redirect=${encodeURIComponent('/sendinn/nav123456?filter=N2')}`,
    );
  });
});
