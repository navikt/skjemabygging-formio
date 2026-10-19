import type { Page } from '@playwright/test';
import { expect, test } from '../../fixtures/test';
import { nextStep, visitForm } from '../../helpers/form';

const componentFor = (page: Page, label: string) =>
  page
    .getByLabel(label, { exact: true })
    .locator(
      'xpath=ancestor::*[@data-form-component or contains(concat(" ", normalize-space(@class), " "), " form-group ")][1]',
    );

test.describe('DatePicker', () => {
  test.beforeEach(async ({ readyPage: page }) => {
    await page.clock.setFixedTime(new Date('2025-01-15'));
  });

  test(
    'should preserve the natural date width despite legacy input--xxl sizing',
    {
      annotation: [
        { type: 'cypress-source', description: 'packages/fyllut/cypress/e2e/components-date/datePicker.cy.ts' },
      ],
    },
    async ({ readyPage: page }) => {
      await visitForm(page, '/fyllut/components/datoogtid?sub=paper');
      const time = page.getByRole('textbox', { name: /Klokkeslett/ });
      await expect
        .poll(async () => Math.abs((await time.evaluate((element) => element.getBoundingClientRect().width)) - 420))
        .toBeLessThanOrEqual(1);
      const date = page.getByRole('textbox', { name: /Dato \(dd\.mm/ });
      await expect.poll(() => date.evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThan(0);
      await expect.poll(() => date.evaluate((element) => element.getBoundingClientRect().width)).toBeLessThan(420);
    },
  );

  test.describe('Display', () => {
    test.beforeEach(async ({ readyPage: page }) => {
      await visitForm(page, '/fyllut/datepicker/visning?sub=paper');
    });

    test(
      'should be visible and interactable',
      {
        annotation: [
          { type: 'cypress-source', description: 'packages/fyllut/cypress/e2e/components-date/datePicker.cy.ts' },
        ],
      },
      async ({ readyPage: page }) => {
        const date = page.getByLabel('Dato (dd.mm.åååå)', { exact: true });
        await expect(date).toHaveCount(1);
        await expect(date).toBeVisible();
        await expect(date).not.toHaveClass(/\baksel-sr-only\b/);
        await expect(date).toBeEnabled();
        await expect(date).not.toHaveAttribute('readonly');
      },
    );

    test(
      'should accept a valid date',
      {
        annotation: [
          { type: 'cypress-source', description: 'packages/fyllut/cypress/e2e/components-date/datePicker.cy.ts' },
        ],
      },
      async ({ readyPage: page }) => {
        const date = page.getByLabel('Dato (dd.mm.åååå)', { exact: true });
        await date.pressSequentially('15.01.2025');
        await expect(date).toHaveValue('15.01.2025');
      },
    );

    test(
      'should have description',
      {
        annotation: [
          { type: 'cypress-source', description: 'packages/fyllut/cypress/e2e/components-date/datePicker.cy.ts' },
        ],
      },
      async ({ readyPage: page }) => {
        const component = componentFor(page, 'Dato med beskrivelse');
        await expect(component.getByText('Velg ønsket dato', { exact: true })).toBeVisible();
      },
    );

    test(
      'should have additionalDescription',
      {
        annotation: [
          { type: 'cypress-source', description: 'packages/fyllut/cypress/e2e/components-date/datePicker.cy.ts' },
        ],
      },
      async ({ readyPage: page }) => {
        const component = componentFor(page, 'Dato med tilleggsbeskrivelse');
        await expect(component.getByText('Mer informasjon', { exact: true })).toHaveCount(1);
        const extendedDescription = component.getByText('Utvidet informasjon om dato', { exact: true });
        await expect(extendedDescription).toHaveCount(1);
        await expect(extendedDescription).not.toBeVisible();
        await component.getByRole('button', { name: 'Mer informasjon', exact: true }).click();
        await expect(extendedDescription).toBeVisible();
      },
    );
  });

  test.describe('Validation', () => {
    test.beforeEach(async ({ readyPage: page }) => {
      await visitForm(page, '/fyllut/datepicker/validering?sub=paper');
    });

    test(
      'should validate required',
      {
        annotation: [
          { type: 'cypress-source', description: 'packages/fyllut/cypress/e2e/components-date/datePicker.cy.ts' },
        ],
      },
      async ({ readyPage: page }) => {
        const error = 'Du må fylle ut: Dato påkrevd';
        await nextStep(page);
        await expect(page.getByText(error, { exact: true })).toHaveCount(2);
        await page.getByRole('link', { name: error, exact: true }).click();
        await page.locator(':focus').pressSequentially('15.01.2025');
        await nextStep(page);
        await expect(page.getByText(error, { exact: true })).toHaveCount(0);
      },
    );

    test(
      'should not be required',
      {
        annotation: [
          { type: 'cypress-source', description: 'packages/fyllut/cypress/e2e/components-date/datePicker.cy.ts' },
        ],
      },
      async ({ readyPage: page }) => {
        await nextStep(page);
        await expect(page.getByText('Du må fylle ut: Dato ikke påkrevd', { exact: true })).toHaveCount(0);
      },
    );

    test(
      'should validate specificEarliestAllowedDate',
      {
        annotation: [
          { type: 'cypress-source', description: 'packages/fyllut/cypress/e2e/components-date/datePicker.cy.ts' },
        ],
      },
      async ({ readyPage: page }) => {
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

    test(
      'should validate specificLatestAllowedDate',
      {
        annotation: [
          { type: 'cypress-source', description: 'packages/fyllut/cypress/e2e/components-date/datePicker.cy.ts' },
        ],
      },
      async ({ readyPage: page }) => {
        const date = page.getByLabel('Dato til og med 20.01.2025', { exact: true });
        const error = 'Datoen kan ikke være senere enn 20.01.2025';
        await date.pressSequentially('25.01.2025');
        await nextStep(page);
        await expect(page.getByText(error, { exact: true })).toHaveCount(2);
        await date.press('ControlOrMeta+A');
        await date.pressSequentially('15.01.2025');
        await nextStep(page);
        await expect(page.getByText(error, { exact: true })).toHaveCount(0);
      },
    );
  });

  test.describe('Translation', () => {
    test.beforeEach(async ({ readyPage: page }) => {
      await visitForm(page, '/fyllut/datepicker/visning?sub=paper&lang=en');
    });

    test(
      'should translate label',
      {
        annotation: [
          { type: 'cypress-source', description: 'packages/fyllut/cypress/e2e/components-date/datePicker.cy.ts' },
        ],
      },
      async ({ readyPage: page }) => {
        await expect(page.getByLabel('Dato (dd.mm.åååå) (en)', { exact: true })).toHaveCount(1);
      },
    );

    test(
      'should translate description',
      {
        annotation: [
          { type: 'cypress-source', description: 'packages/fyllut/cypress/e2e/components-date/datePicker.cy.ts' },
        ],
      },
      async ({ readyPage: page }) => {
        const component = componentFor(page, 'Dato med beskrivelse (en)');
        await expect(component.getByText('Velg ønsket dato (en)', { exact: true })).toBeVisible();
      },
    );
  });
});
