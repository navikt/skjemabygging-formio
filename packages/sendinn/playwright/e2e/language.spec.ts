import { expect, test } from '../fixtures/test';
import { selectDecoratorLanguage } from '../helpers/language';
import { submissionId } from '../helpers/test-data';

test.describe('Language', () => {
  test.beforeEach(async ({ signIn }) => {
    await signIn();
  });

  test('uses bokmål without a lang parameter', async ({ readyPage: page }) => {
    await page.goto('/sendinn/lospost');
    await expect(page.getByRole('heading', { level: 1, name: 'Send dokumenter til Nav' })).toBeVisible();
  });

  test('selects texts from the lang parameter', async ({ readyPage: page }) => {
    await page.goto('/sendinn/lospost?lang=en');
    await expect(page.getByRole('heading', { level: 1, name: 'Send documents to Nav' })).toBeVisible();
  });

  test('keeps the rest of the query when a language is selected in the decorator', async ({ readyPage: page }) => {
    await page.goto(`/sendinn/oppgave?innsendingsId=${submissionId}&lang=en`);
    await expect(page.getByRole('heading', { level: 1, name: 'Submit requested documentation' })).toBeVisible();

    await selectDecoratorLanguage(page, 'nn');

    await expect(page.getByRole('heading', { level: 1, name: 'Send inn etterspurd dokumentasjon' })).toBeVisible();
    await expect(page).toHaveURL(
      (url) =>
        url.pathname === '/sendinn/oppgave' &&
        url.searchParams.get('innsendingsId') === submissionId &&
        url.searchParams.get('lang') === 'nn',
    );
  });

  test('falls back to bokmål when translations fail to load', async ({ readyPage: page }) => {
    await page.route('**/sendinn/api/global-translations/en', (route) => route.fulfill({ status: 500 }));
    await page.goto('/sendinn/lospost?lang=en');
    await expect(page.getByRole('heading', { level: 1, name: 'Send dokumenter til Nav' })).toBeVisible();
  });

  test('falls back to bokmål for an unsupported language', async ({ readyPage: page }) => {
    await page.goto('/sendinn/lospost?lang=se');
    await expect(page.getByRole('heading', { level: 1, name: 'Send dokumenter til Nav' })).toBeVisible();
  });
});
