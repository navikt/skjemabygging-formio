/**
 * Test functions for form components
 */
import { Component, dateUtils, navFormUtils, stringUtils } from '@navikt/skjemadigitalisering-shared-domain';

Cypress.Commands.add('withinComponent', (label, fn) => {
  return cy.findByLabelText(label).closest('.form-group').within(fn);
});

Cypress.Commands.add('withinSummaryGroup', (heading, fn) => {
  cy.findByRole('heading', { level: 3, name: heading }).closest('.aksel-form-summary').within(fn);
});

Cypress.Commands.add('findByLabelOptional', (label) => {
  return cy.findByLabelText(`${label} (valgfritt)`);
});

Cypress.Commands.add('findAllByErrorMessageRequired', (label) => {
  return cy.findAllByText(`Du må fylle ut: ${label}`);
});

Cypress.Commands.add('clickErrorMessageRequired', (label) => {
  return cy.findByRole('link', { name: `Du må fylle ut: ${label}` }).click();
});

Cypress.Commands.add('findAllByErrorMessageMinLength', (label) => {
  return cy.findAllByText(new RegExp(`${label} må ha minst . tegn`));
});

Cypress.Commands.add('clickErrorMessageMinLength', (label) => {
  return cy.findByRole('link', { name: new RegExp(`${label} må ha minst . tegn`) }).click();
});

Cypress.Commands.add('findAllByErrorMessageMaxLength', (label) => {
  return cy.findAllByText(new RegExp(`${label} kan ikke ha mer enn . tegn`));
});

Cypress.Commands.add('clickErrorMessageMaxLength', (label) => {
  return cy.findByRole('link', { name: new RegExp(`${label} kan ikke ha mer enn . tegn`) }).click();
});

Cypress.Commands.add('testDownloadPdf', () => {
  const formatRadiopanelValue = (value: string, options: Array<{ label: string; value: string }>) =>
    options.find((option) => option.value === value).label;
  const formatMonthPickerValue = (value: string) => stringUtils.toPascalCase(dateUtils.toLongMonthFormat(value));

  const formatValue = (value: any, component: Component) => {
    switch (component.type) {
      case 'radiopanel':
        return formatRadiopanelValue(value, component.values);
      case 'monthPicker':
        return formatMonthPickerValue(value);
      default:
        return value;
    }
  };

  cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (req) => {
    const { pdfFormData, submission, form } = req.body;
    const submissionData = JSON.parse(submission).data;
    const pdfFormDataString = JSON.stringify(pdfFormData);
    const components = JSON.parse(form).components;

    Object.entries(submissionData).forEach(([key, submissionValue]) => {
      const component = navFormUtils.findByKey(key, components);
      const value = formatValue(submissionValue, component);
      expect(pdfFormDataString).to.include(`"label":"${component.label}","verdi":"${value}"`);
    });
  }).as('downloadPdf');

  cy.clickDownloadApplication();
  cy.wait('@downloadPdf');
});
