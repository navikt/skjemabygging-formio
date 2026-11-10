import { expect, test } from '../fixtures/test';

test.describe('Error pages', () => {
  test.describe('Unavailable page', () => {
    test('shows content, links, title and focuses the heading', async ({ readyPage: page }) => {
      await page.goto('/sendinn/404');

      await expect(page.getByRole('heading', { level: 1, name: 'Beklager, fant ikke siden' })).toBeFocused();
      await expect(page).toHaveTitle('Beklager, fant ikke siden');
      await expect(
        page.getByText('Denne siden kan være slettet eller flyttet, eller det er en feil i lenken.'),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Gå til forsiden' })).toHaveAttribute('href', 'https://www.nav.no');
      await expect(page.getByRole('link', { name: 'Gå til Min side' })).toHaveAttribute(
        'href',
        'https://www.nav.no/minside',
      );
    });

    test('uses the language from the lang parameter', async ({ readyPage: page }) => {
      await page.goto('/sendinn/404?lang=en');

      await expect(page.getByRole('heading', { level: 1, name: 'Sorry, we could not find the page' })).toBeFocused();
      await expect(page.getByRole('button', { name: 'Go to the front page' })).toHaveAttribute(
        'href',
        'https://www.nav.no/en',
      );
    });
  });

  test.describe('Error page', () => {
    test('shows content, title and focuses the heading when config fails to load', async ({ readyPage: page }) => {
      await page.route('**/sendinn/api/config', (route) => route.fulfill({ status: 500 }));
      await page.goto('/sendinn/lospost');

      await expect(page.getByRole('heading', { level: 1, name: 'Beklager, det oppsto en feil' })).toBeFocused();
      await expect(page).toHaveTitle('Beklager, det oppsto en feil');
      await expect(page.getByRole('link', { name: 'gå til forsiden' })).toHaveAttribute('href', 'https://www.nav.no');
    });
  });

  test.describe('Session expired', () => {
    test('shows a login link back to the current page when the session has expired', async ({ readyPage: page }) => {
      await page.route('**/sendinn/api/global-translations/en', (route) => route.fulfill({ status: 401 }));
      await page.goto('/sendinn/lospost?lang=en');

      await expect(page.getByRole('heading', { name: 'Du er logget ut' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Logg inn på nytt' })).toHaveAttribute(
        'href',
        `/sendinn/oauth2/login?redirect=${encodeURIComponent('/sendinn/lospost?lang=en')}`,
      );
    });
  });
});
