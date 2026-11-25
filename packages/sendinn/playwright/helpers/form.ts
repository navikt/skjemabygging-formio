import type { Page } from '@playwright/test';

const nextStep = (page: Page) => page.getByRole('button', { name: /^(Neste steg|Next step)$/ }).click();
const previousStep = (page: Page) => page.getByRole('button', { name: /^(Forrige steg|Previous step)$/ }).click();
const unitSelect = (page: Page) =>
  page.getByRole('combobox', { name: 'Velg hvilken Nav-enhet som skal motta innsendingen', exact: true });

export { nextStep, previousStep, unitSelect };
