import AxeBuilder from '@axe-core/playwright';
import { Page } from '@playwright/test';
import { expect, skipUnlessBuilt, test } from '../fixtures/test';
import { expectPdf } from '../helpers/download';
import { nextStep, previousStep, unitSelect } from '../helpers/form';
import { selectDecoratorLanguage } from '../helpers/language';

const scanPage = async (page: Page) => {
  await expect
    .poll(() => page.evaluate(() => document.getAnimations().filter(({ playState }) => playState === 'running').length))
    .toBe(0);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
};
const download = async (page: Page) => {
  const response = page.waitForResponse('**/sendinn/api/cover-page');
  const file = page.waitForEvent('download');
  await page.getByRole('button', { name: /^(Last ned førsteside|Download cover page)$/ }).click();
  const result = await response;
  expect(result.status()).toBe(200);
  await expectPdf(await file);
  return result.request().postDataJSON().submission.data;
};

test.describe('Paper acceptance through the real backend', () => {
  test.beforeEach(skipUnlessBuilt);

  test('uses published Nynorsk content throughout the journey and printed document list', async ({
    readyPage: page,
    useRouteVariant,
  }) => {
    await useRouteVariant('get-form:sendinn-nynorsk');
    await useRouteVariant('get-form-translations:sendinn-nynorsk');
    await useRouteVariant('foersteside:success-tc08i-sendinn-nynorsk');
    await page.goto('/sendinn/sendinnjourney?lang=nn&filter=N1');
    await expect(page.locator('html')).toHaveAttribute('lang', 'nn');
    await expect(page.getByRole('group', { name: /Evidence document \(nn\)/ })).toBeVisible();
    await page.getByRole('checkbox').check();
    await nextStep(page);
    await expect(page.getByTestId('form-summary-panel')).toContainText('Evidence document (nn)');
    await scanPage(page);
    await page.getByRole('button', { name: 'Instruksjonar for innsending', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Dokumenta er ikkje sende enno', level: 2 })).toBeFocused();
    await expect(page.getByRole('listitem')).toHaveText(['Evidence document (nn)']);
    await download(page);
  });

  test('downloads an identified person with authored document order, a verbatim maximum-length title and accessible pages', async ({
    readyPage: page,
    useRouteVariant,
  }) => {
    await useRouteVariant('foersteside:success-tc08g-sendinn-identified');
    await page.goto('/sendinn/sendinnjourney?lang=en&filter=%20N6,N1%20&filter=N6');
    await nextStep(page);
    const errors = page.getByTestId('error-summary');
    await expect(errors.getByRole('heading')).toBeFocused();
    await scanPage(page);
    await errors.getByRole('link').focus();
    await page.keyboard.press('Enter');
    const identified = page.getByRole('radio', { name: 'Person with a national identity number', exact: true });
    await expect(identified).toBeFocused();
    await page.keyboard.press('Space');
    await page.getByRole('textbox').fill('03876399856');
    await nextStep(page);
    await expect(page.getByRole('group')).toHaveText([/Evidence document \(en\)/, /Other document \(en\)/]);
    const choices = page.getByRole('checkbox');
    await expect(choices.nth(0)).not.toBeChecked();
    await expect(choices.nth(1)).not.toBeChecked();
    await choices.nth(1).check();
    await nextStep(page);
    await expect(errors.getByRole('heading')).toBeFocused();
    await errors.getByRole('link').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('textbox')).toBeFocused();
    await scanPage(page);
    await page.getByRole('textbox').fill('Additional  evidence..............................');
    await choices.nth(0).check();
    await nextStep(page);
    await expect(page.getByTestId('form-summary-panel').first()).toContainText('038763');
    await expect(page.getByTestId('form-summary-panel').last()).toContainText('Additional evidence');
    await scanPage(page);
    await page.getByRole('button', { name: 'Submission instructions', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'The documents have not been sent yet', level: 2 })).toBeFocused();
    await scanPage(page);
    const data = await download(page);
    expect(data.userType).toBe('identified-person');
    expect(data).not.toHaveProperty('navUnit');
    expect(data).not.toHaveProperty('navContactUnit');
    await expect(page.getByText('The download is complete.')).toBeVisible();
  });

  test('downloads an unidentified person after lookup retry and removes inactive identity, person and contact routing when switching branches', async ({
    readyPage: page,
    useRouteVariant,
  }) => {
    await useRouteVariant('get-nav-units:error');
    await useRouteVariant('foersteside:success-tc08h-sendinn-unidentified');
    await page.goto('/sendinn/sendinnjourney?filter=N1');
    await page.getByRole('radio', { name: 'Person som har fødselsnummer eller d-nummer', exact: true }).check();
    await page.getByRole('textbox').fill('03876399856');
    await page.getByRole('radio', { name: 'Person som ikke har fødselsnummer eller d-nummer', exact: true }).check();
    await page.getByRole('textbox', { name: 'Fornavn', exact: true }).fill('Alex');
    await page.getByRole('textbox', { name: 'Etternavn', exact: true }).fill('Example');
    await page
      .getByRole('radiogroup', { name: 'Bor du i Norge?', exact: true })
      .getByRole('radio', { name: 'Ja', exact: true })
      .check();
    await page
      .getByRole('radiogroup', { name: 'Er kontaktadressen en vegadresse eller postboksadresse?', exact: true })
      .getByRole('radio', { name: 'Vegadresse', exact: true })
      .check();
    await page.getByRole('textbox', { name: 'Vegadresse', exact: true }).fill('Example street 1');
    await page.getByRole('textbox', { name: 'Postnummer', exact: true }).fill('0123');
    await page.getByRole('textbox', { name: 'Poststed', exact: true }).fill('Oslo');
    await page
      .getByRole('radiogroup', { name: 'Har du vært i kontakt med Nav om saken?', exact: true })
      .getByRole('radio', { name: 'Ja', exact: true })
      .check();
    await expect(page.getByRole('button', { name: 'Prøv igjen', exact: true })).toBeVisible();
    await scanPage(page);
    await useRouteVariant('get-nav-units:success');
    await page.getByRole('button', { name: 'Prøv igjen', exact: true }).click();
    await unitSelect(page).selectOption('0101');
    await expect(page.getByRole('textbox', { name: 'Fornavn', exact: true })).toHaveValue('Alex');
    await nextStep(page);
    await page.getByRole('checkbox').check();
    await nextStep(page);
    const summary = page.getByTestId('form-summary-panel').first();
    await expect(summary).toContainText('Alex');
    await expect(summary).toContainText('Example street 1');
    await expect(summary).toContainText('Nav Alpha');
    await scanPage(page);
    await page.getByRole('button', { name: 'Instruksjoner for innsending', exact: true }).click();
    const person = await download(page);
    expect(person.dineOpplysninger).not.toHaveProperty('identitet');

    await previousStep(page);
    await previousStep(page);
    await previousStep(page);
    await page.getByRole('radio', { name: 'Flere personer / Nav-enhet', exact: true }).check();
    await unitSelect(page).selectOption('0101');
    await nextStep(page);
    await expect(page.getByRole('checkbox')).toBeChecked();
    await nextStep(page);
    await expect(summary).toContainText('Nav Alpha');
    await expect(summary).not.toContainText('Alex');
    await useRouteVariant('foersteside:success-tc08e-sendinn');
    await selectDecoratorLanguage(page, 'en');
    await page.getByRole('button', { name: 'Submission instructions', exact: true }).click();
    const multiple = await download(page);
    expect(multiple.userType).toBe('multiple-people');
    expect(multiple).not.toHaveProperty('dineOpplysninger');
    expect(multiple).not.toHaveProperty('hasNavContact');
    expect(multiple).not.toHaveProperty('navContactUnit');
  });
});
