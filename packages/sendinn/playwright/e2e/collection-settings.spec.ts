import { expect, skipUnlessBuilt, test } from '../fixtures/test';
import { expectPdf } from '../helpers/download';

test.describe('Trusted collection settings', () => {
  test.beforeEach(skipUnlessBuilt);

  for (const hidden of [true, false]) {
    for (const forced of [true, false, undefined]) {
      test(`downloads with hideUserTypes=${hidden} and forced unit=${forced ?? 'absent'}`, async ({
        readyPage: page,
        useRouteVariant,
      }) => {
        await useRouteVariant(`get-form:sendinn-collection-${hidden}-${forced ?? 'absent'}`);
        await useRouteVariant(
          hidden ? 'foersteside:success-tc08f-sendinn-description' : 'foersteside:success-tc08e-sendinn',
        );
        await page.goto(`/sendinn/sendinnjourney?lang=${hidden ? 'nb' : 'en'}&filter=${hidden ? 'N6' : 'N1'}`);

        if (hidden) {
          await expect(page.getByRole('radio')).toHaveCount(0);
          await expect(page.getByRole('combobox')).toHaveCount(0);
          await expect(page.getByRole('textbox')).toHaveCount(0);
        } else {
          if (forced) {
            await expect(page.getByRole('radio')).toHaveCount(0);
          } else {
            await expect(page.getByRole('radio')).toHaveCount(3);
            await expect(
              page.getByRole('radio', { name: 'Person with a national identity number', exact: true }),
            ).toBeVisible();
            await expect(
              page.getByRole('radio', { name: 'Person without a national identity number', exact: true }),
            ).toBeVisible();
            await page.getByRole('radio', { name: 'Multiple people / Nav unit', exact: true }).check();
          }
          await expect(page.getByRole('textbox')).toHaveCount(0);
          await expect(page.getByRole('combobox').getByRole('option')).toHaveText([
            'Select unit',
            'Nav Alpha',
            'Nav Beta',
          ]);
          await page.getByRole('button', { name: 'Next step', exact: true }).click();
          const errors = page.getByTestId('error-summary');
          await expect(errors.getByRole('heading')).toBeFocused();
          await errors.getByRole('link').focus();
          await page.keyboard.press('Enter');
          await expect(page.getByRole('combobox')).toBeFocused();
          await page.getByRole('combobox').selectOption('0101');
          await page.getByRole('button', { name: 'Next step', exact: true }).click();
        }

        await expect(page.getByRole('checkbox')).not.toBeChecked();
        await page.getByRole('checkbox').check();
        if (hidden) await page.getByRole('textbox').fill('Additional evidence');
        await page.getByRole('button', { name: hidden ? 'Neste steg' : 'Next step', exact: true }).click();
        if (!hidden) {
          await expect(page.getByTestId('form-summary-panel').first()).toContainText('Nav Alpha');
          await expect(page.getByTestId('form-summary-panel').first()).not.toContainText('0101');
        }
        await page
          .getByRole('button', {
            name: hidden ? 'Instruksjoner for innsending' : 'Submission instructions',
            exact: true,
          })
          .click();
        const response = page.waitForResponse('**/sendinn/api/cover-page');
        const download = page.waitForEvent('download');
        await page
          .getByRole('button', { name: hidden ? 'Last ned førsteside' : 'Download cover page', exact: true })
          .click();
        const result = await response;
        expect(result.status()).toBe(200);
        const data = result.request().postDataJSON().submission.data;
        expect(data).not.toHaveProperty('yourInformation');
        expect(data).not.toHaveProperty('navContactUnit');
        if (hidden || forced) expect(data).not.toHaveProperty('collectionType');
        if (hidden) expect(data).not.toHaveProperty('navUnit');
        else expect(data.navUnit).toBe('0101');
        await expectPdf(await download);
      });
    }
  }
});
