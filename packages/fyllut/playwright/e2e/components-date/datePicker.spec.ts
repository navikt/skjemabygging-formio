import { expect, test } from '../../fixtures/test';
import { nextStep, visitForm } from '../../helpers/form';

test.describe('DatePicker', () => {
  test.describe('Validation', () => {
    test(
      'should validate specificEarliestAllowedDate',
      {
        annotation: [
          { type: 'migration-id', description: 'F017-T007' },
          { type: 'cypress-source', description: 'packages/fyllut/cypress/e2e/components-date/datePicker.cy.ts' },
        ],
      },
      async ({ readyPage: page }) => {
        await page.clock.setFixedTime(new Date('2025-01-15'));
        await visitForm(page, '/fyllut/datepicker/validering?sub=paper');
        const date = page.getByLabel('Dato fra og med 10.01.2025');
        const error = 'Datoen kan ikke være tidligere enn 10.01.2025';
        await date.pressSequentially('05.01.2025');
        await nextStep(page);
        await expect(page.getByText(error, { exact: true })).toHaveCount(2);
        await date.press('ControlOrMeta+A');
        await date.pressSequentially('10.01.2025');
        await nextStep(page);
        await expect(page.getByText(error, { exact: true })).toHaveCount(0);
      },
    );
  });
});
