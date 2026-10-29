import { Page } from '@playwright/test';
import { expect, test } from '../fixtures/test';
import { selectDecoratorLanguage } from '../helpers/language';

const next = (page: Page) => page.getByRole('button', { name: 'Neste steg', exact: true }).click();
const previous = (page: Page) => page.getByRole('button', { name: 'Forrige steg', exact: true }).click();
const unitSelect = (page: Page) =>
  page.getByRole('combobox', { name: 'Velg hvilken Nav-enhet som skal motta innsendingen', exact: true });
const errorSummary = (page: Page) => page.getByTestId('error-summary');
const identity = (page: Page) => page.getByRole('textbox', { name: 'Fødselsnummer eller d-nummer', exact: true });

test.describe('Generated paper journey', () => {
  test('uses keyboard choices, linked errors and heading focus without losing values', async ({ readyPage: page }) => {
    let loads = 0;
    page.on('request', (request) => {
      if (request.url().includes('/api/forms/')) loads += 1;
    });
    await page.goto('/sendinn/sendinnjourney?filter=N1&sub=digital');
    await next(page);
    await expect(errorSummary(page).getByRole('heading')).toBeFocused();
    await errorSummary(page).getByRole('link').click();
    const identified = page.getByRole('radio', { name: 'Person som har fødselsnummer eller d-nummer', exact: true });
    await expect(identified).toBeFocused();
    await next(page);
    await expect(errorSummary(page).getByRole('heading')).toBeFocused();
    await errorSummary(page).getByRole('link').click();
    await expect(identified).toBeFocused();
    await page.keyboard.press('Space');
    await identity(page).fill('123');
    await expect(identity(page)).toBeFocused();
    await next(page);
    await expect(errorSummary(page).getByRole('heading')).toBeFocused();
    await expect(identity(page)).toHaveValue('123');
    await errorSummary(page).getByRole('link').click();
    await expect(identity(page)).toBeFocused();
    await identity(page).fill('03876399856');
    await expect(errorSummary(page)).toBeHidden();
    await next(page);
    await expect(page.getByRole('heading', { level: 2, name: 'Ettersend dokumentasjon', exact: true })).toBeFocused();
    await expect(page.getByRole('checkbox')).toHaveCount(1);
    await expect(page.getByRole('checkbox')).not.toBeChecked();
    await previous(page);
    await expect(identity(page)).toHaveValue('038763 99856');
    await next(page);
    await next(page);
    await expect(page.getByRole('heading', { level: 2, name: 'Oppsummering', exact: true })).toBeFocused();
    await expect(page.getByTestId('form-summary-panel').first()).toContainText('038763');
    await page.getByRole('button', { name: 'Instruksjoner for innsending', exact: true }).click();
    await expect(errorSummary(page)).toBeHidden();
    await expect(page.getByRole('button', { name: 'Last ned førsteside', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Send til Nav|Lagre/ })).toHaveCount(0);
    await expect(page).toHaveURL(
      (url) => url.searchParams.get('filter') === 'N1' && url.searchParams.get('sub') === 'digital',
    );
    expect(loads).toBe(1);
    await page.goBack();
    await expect(page.getByRole('heading', { level: 2, name: 'Oppsummering', exact: true })).toBeFocused();
    await page.goBack();
    await expect(page.getByRole('checkbox')).not.toBeChecked();
    await page.goForward();
    await expect(page.getByRole('heading', { level: 2, name: 'Oppsummering', exact: true })).toBeFocused();
  });

  test('validates unvisited pages from the summary and focuses the linked field', async ({ readyPage: page }) => {
    await page.goto('/sendinn/sendinnjourney?step=oppsummering');
    await page.getByRole('button', { name: 'Instruksjoner for innsending', exact: true }).click();
    await expect(errorSummary(page).getByRole('heading')).toBeFocused();
    await expect(errorSummary(page).getByRole('link')).toHaveCount(1);
    await errorSummary(page).getByRole('link').click();
    await expect(
      page.getByRole('radio', { name: 'Person som har fødselsnummer eller d-nummer', exact: true }),
    ).toBeFocused();
    await expect(errorSummary(page)).toBeHidden();
    await expect(page).toHaveURL((url) => url.searchParams.get('step') === 'sendinnCollection' && !url.hash);
  });

  test('reuses paper other-document titles, rejects invalid titles and clears them on deselection', async ({
    readyPage: page,
    useRouteVariant,
  }) => {
    await useRouteVariant('get-form:sendinn-hidden-collection');
    await page.goto('/sendinn/sendinnjourney?filter=N6');
    await expect(page.getByRole('radio')).toHaveCount(0);
    await expect(page.getByRole('combobox')).toHaveCount(0);
    const choice = page.getByRole('checkbox');
    await choice.check();
    const title = page.getByRole('textbox');
    await expect(title).toBeVisible();
    await next(page);
    await expect(errorSummary(page).getByRole('heading')).toBeFocused();
    await errorSummary(page).getByRole('link').click();
    await expect(title).toBeFocused();
    await expect(title).toHaveAttribute('maxlength', '50');
    await title.fill(' ');
    await next(page);
    await expect(errorSummary(page).getByRole('heading')).toBeFocused();
    await expect(title).toHaveValue('');
    await title.fill('Additional evidence');
    await choice.uncheck();
    await expect(title).toBeHidden();
    await choice.check();
    await expect(title).toHaveValue('');
    await title.fill('Additional evidence');
    await expect(page.getByRole('button', { name: /Legg til|Last opp/ })).toHaveCount(0);
    await expect(page.locator('input[type="file"]')).toHaveCount(0);
    await next(page);
    await expect(page.getByTestId('form-summary-panel')).toContainText('Additional evidence');
    await page.getByRole('link', { name: 'Endre svar', exact: true }).click();
    await expect(title).toHaveValue('Additional evidence');
  });

  test('filters across configured unit types and summarizes the selected unit name', async ({ readyPage: page }) => {
    await page.goto('/sendinn/sendinnjourney');
    await page.getByRole('radio', { name: 'Flere personer / Nav-enhet', exact: true }).check();
    await expect(unitSelect(page).getByRole('option')).toHaveText(['Velg enhet', 'Nav Alpha', 'Nav Beta']);
    await next(page);
    await expect(errorSummary(page).getByRole('heading')).toBeFocused();
    await errorSummary(page).getByRole('link').click();
    await expect(unitSelect(page)).toBeFocused();
    await unitSelect(page).selectOption('0202');
    await expect(unitSelect(page)).toBeFocused();
    await next(page);
    await next(page);
    await expect(page.getByTestId('form-summary-panel').first()).toContainText('Nav Beta');
    await expect(page.getByTestId('form-summary-panel').first()).not.toContainText('0202');
    await page.getByRole('button', { name: 'Instruksjoner for innsending', exact: true }).click();
    await expect(errorSummary(page)).toBeHidden();
    await previous(page);
    await previous(page);
    await previous(page);
    await expect(unitSelect(page)).toHaveValue('0202');
    await page.getByRole('radio', { name: 'Person som har fødselsnummer eller d-nummer', exact: true }).check();
    await identity(page).fill('03876399856');
    await page.getByRole('radio', { name: 'Flere personer / Nav-enhet', exact: true }).check();
    await expect(unitSelect(page)).toHaveValue('');
    await page.getByRole('radio', { name: 'Person som har fødselsnummer eller d-nummer', exact: true }).check();
    await expect(identity(page)).toHaveValue('');
  });

  test('falls back to all successful units and never turns a lookup failure into success', async ({
    readyPage: page,
    useRouteVariant,
  }) => {
    await useRouteVariant('get-form:sendinn-forced-unit');
    await useRouteVariant('get-nav-units:error');
    await page.goto('/sendinn/sendinnjourney');
    await expect(page.getByRole('radio')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Prøv igjen', exact: true })).toBeVisible();
    await expect(unitSelect(page).getByRole('option')).toHaveCount(1);
    await next(page);
    await expect(errorSummary(page).getByRole('heading')).toBeFocused();
    await useRouteVariant('get-nav-units:no-matching-types');
    await page.getByRole('button', { name: 'Prøv igjen', exact: true }).click();
    await expect(unitSelect(page).getByRole('option')).toHaveText(['Velg enhet', 'Nav Gamma']);
    await unitSelect(page).selectOption('0303');
    await next(page);
    await next(page);
    await expect(page.getByTestId('form-summary-panel').first()).toContainText('Nav Gamma');
  });

  test('retains answers and the canonical filter when changing language during navigation', async ({
    readyPage: page,
  }) => {
    await page.goto('/sendinn/sendinnjourney?filter=N1');
    await page.getByRole('radio', { name: 'Flere personer / Nav-enhet', exact: true }).check();
    await unitSelect(page).selectOption('0101');
    await selectDecoratorLanguage(page, 'en');
    const englishUnit = page.getByRole('combobox', {
      name: 'Select the NAV unit that will process your case',
      exact: true,
    });
    await expect(englishUnit).toHaveValue('0101');
    await expect(page.getByRole('radio', { name: 'Multiple people / Nav unit', exact: true })).toBeChecked();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.getByRole('button', { name: 'Next step', exact: true }).click();
    await expect(page.getByRole('group', { name: /Evidence document \(en\)/ })).toBeVisible();
    await expect(page.getByRole('checkbox')).toHaveCount(1);
    await page.getByRole('button', { name: 'Next step', exact: true }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'Summary', exact: true })).toBeFocused();
    await expect(page.getByTestId('form-summary-panel').first()).toContainText('Nav Alpha');
    await expect(page).toHaveURL(
      (url) => url.searchParams.get('lang') === 'en' && url.searchParams.get('filter') === 'N1',
    );
  });

  test('collects an unidentified person and retries Nav contact lookup without losing other answers', async ({
    readyPage: page,
    useRouteVariant,
  }) => {
    await useRouteVariant('get-nav-units:error');
    await page.goto('/sendinn/sendinnjourney?filter=N1');
    await page.getByRole('radio', { name: 'Person som ikke har fødselsnummer eller d-nummer', exact: true }).check();
    await next(page);
    await expect(errorSummary(page).getByRole('link')).toHaveCount(4);
    await page.getByRole('textbox', { name: 'Fornavn', exact: true }).fill('Alex');
    await page.getByRole('textbox', { name: 'Etternavn', exact: true }).fill('Example');
    await page
      .getByRole('group', { name: 'Bor du i Norge?', exact: true })
      .getByRole('radio', { name: 'Ja', exact: true })
      .check();
    await page
      .getByRole('group', { name: 'Er kontaktadressen en vegadresse eller postboksadresse?', exact: true })
      .getByRole('radio', { name: 'Vegadresse', exact: true })
      .check();
    await page.getByRole('textbox', { name: 'Vegadresse', exact: true }).fill('Example street 1');
    await page.getByRole('textbox', { name: 'Postnummer', exact: true }).fill('0123');
    await page.getByRole('textbox', { name: 'Poststed', exact: true }).fill('Oslo');
    const contact = page.getByRole('group', { name: 'Har du vært i kontakt med Nav om saken?', exact: true });
    await contact.getByRole('radio', { name: 'Ja', exact: true }).check();
    await expect(page.getByRole('button', { name: 'Prøv igjen', exact: true })).toBeVisible();
    await next(page);
    await expect(errorSummary(page).getByRole('link')).toHaveCount(1);
    await expect(page.getByRole('textbox', { name: 'Fornavn', exact: true })).toHaveValue('Alex');
    await useRouteVariant('get-nav-units:success');
    await page.getByRole('button', { name: 'Prøv igjen', exact: true }).click();
    await unitSelect(page).selectOption('0101');
    await contact.getByRole('radio', { name: 'Nei', exact: true }).check();
    await expect(unitSelect(page)).toBeHidden();
    await contact.getByRole('radio', { name: 'Ja', exact: true }).check();
    await expect(unitSelect(page)).toHaveValue('');
    await unitSelect(page).selectOption('0101');
    await next(page);
    await next(page);
    const collectionSummary = page.getByTestId('form-summary-panel').first();
    await expect(collectionSummary).toContainText('Alex');
    await expect(collectionSummary).toContainText('Example street 1');
    await expect(collectionSummary).toContainText('Nav Alpha');
    await previous(page);
    await previous(page);
    await page.getByRole('radio', { name: 'Flere personer / Nav-enhet', exact: true }).check();
    await unitSelect(page).selectOption('0202');
    await next(page);
    await next(page);
    await expect(collectionSummary).toContainText('Nav Beta');
    await expect(collectionSummary).not.toContainText('Alex');
    await expect(collectionSummary).not.toContainText('Example street');
    await expect(collectionSummary).not.toContainText('Nav Alpha');
  });

  test('recovers unit names on the summary without a number-only or empty-success fallback', async ({
    readyPage: page,
    useRouteVariant,
  }) => {
    await useRouteVariant('get-form:sendinn-forced-unit');
    await page.goto('/sendinn/sendinnjourney');
    await unitSelect(page).selectOption('0202');
    await next(page);
    await page
      .getByRole('group', { name: /Evidence document/ })
      .getByRole('checkbox')
      .check();
    await useRouteVariant('get-nav-units:error');
    await next(page);
    await expect(page.getByRole('button', { name: 'Prøv igjen', exact: true })).toBeVisible();
    await expect(page.getByTestId('form-summary-panel').first()).not.toContainText('0202');
    await useRouteVariant('get-nav-units:success');
    await page.getByRole('button', { name: 'Prøv igjen', exact: true }).click();
    await expect(page.getByTestId('form-summary-panel').first()).toContainText('Nav Beta');
    await previous(page);
    await expect(page.getByRole('group', { name: /Evidence document/ }).getByRole('checkbox')).toBeChecked();
    await useRouteVariant('get-nav-units:no-matching-types');
    await next(page);
    await expect(page.getByRole('button', { name: 'Prøv igjen', exact: true })).toBeVisible();
    await expect(page.getByTestId('form-summary-panel').first()).not.toContainText('0202');
    await useRouteVariant('get-nav-units:success');
    await page.getByRole('button', { name: 'Prøv igjen', exact: true }).click();
    await expect(page.getByTestId('form-summary-panel').first()).toContainText('Nav Beta');
    await previous(page);
    await previous(page);
    await expect(unitSelect(page)).toHaveValue('0202');
  });

  test('blocks empty filtered choices even when navigating directly to the summary', async ({ readyPage: page }) => {
    await page.goto('/sendinn/sendinnjourney?filter=unknown&step=oppsummering');
    await expect(
      page.getByText('Ingen dokumenter passer med denne lenken. Gå tilbake og kontroller lenken du brukte.'),
    ).toBeVisible();
    await expect(page.getByRole('checkbox')).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: /Instruksjoner for innsending|Neste steg|Last ned|Send til Nav/ }),
    ).toHaveCount(0);
  });
});
