import { expect, test } from '../fixtures/test';
import { submissionId } from '../helpers/test-data';

test.describe('Entry routing', () => {
  test.beforeEach(async ({ signIn }) => {
    await signIn();
  });

  const journeys = [
    { name: 'standalone', url: '/sendinn/lospost', heading: 'Send dokumenter til Nav' },
    { name: 'form', url: '/sendinn/nav123456', heading: 'Send inn dokumentasjon til skjema' },
    {
      name: 'form with a task',
      url: `/sendinn/nav123456?innsendingsId=${submissionId}`,
      heading: 'Send inn etterspurt dokumentasjon til skjema',
    },
    {
      name: 'task',
      url: `/sendinn/oppgave?innsendingsId=${submissionId}`,
      heading: 'Send inn etterspurt dokumentasjon',
    },
    {
      name: 'task link',
      url: `/sendinn/${submissionId}`,
      heading: 'Send inn etterspurt dokumentasjon fra varsel',
    },
  ];

  for (const { name, url, heading } of journeys) {
    test(`shows the ${name} journey`, async ({ readyPage: page }) => {
      await page.goto(url);
      await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible();
      await expect(page).toHaveTitle(heading);
    });
  }

  for (const url of [
    '/sendinn',
    '/sendinn/oppgave',
    '/sendinn/oppgave?innsendingsId=not-a-uuid',
    '/sendinn/nav123456/extra',
    '/sendinn/nav123456?innsendingsId=not-a-uuid',
    '/sendinn/404/',
  ]) {
    test(`moves ${url} to the not found page`, async ({ readyPage: page }) => {
      await page.goto(url);
      await expect(page).toHaveURL((url) => url.pathname === '/sendinn/404' && url.search === '');
      await expect(page.getByRole('heading', { level: 1, name: 'Beklager, fant ikke siden' })).toBeVisible();
    });
  }

  test('keeps only the language parameter when moving to the not found page', async ({ readyPage: page }) => {
    await page.goto(`/sendinn/nav123456/extra?innsendingsId=${submissionId}&lang=en&sub=digital`);
    await expect(page).toHaveURL((url) => url.pathname === '/sendinn/404' && url.search === '?lang=en');
    await expect(page.getByRole('heading', { level: 1, name: 'Sorry, we could not find the page' })).toBeVisible();
  });

  test('replaces the original URL in the history', async ({ readyPage: page }) => {
    await page.goto('/sendinn/lospost');
    await expect(page.getByRole('heading', { level: 1, name: 'Send dokumenter til Nav' })).toBeVisible();
    await page.evaluate(() => {
      window.history.pushState({}, '', '/sendinn/oppgave');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await expect(page).toHaveURL((url) => url.pathname === '/sendinn/404');

    await page.goBack();
    await expect(page).toHaveURL((url) => url.pathname === '/sendinn/lospost');
    await expect(page.getByRole('heading', { level: 1, name: 'Send dokumenter til Nav' })).toBeVisible();
  });
});
