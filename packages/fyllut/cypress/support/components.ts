/**
 * Test functions for form components
 */

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
  return cy.findAllByText(new RegExp(`${label} må ha minst \\d+ tegn`));
});

Cypress.Commands.add('clickErrorMessageMinLength', (label) => {
  return cy.findByRole('link', { name: new RegExp(`${label} må ha minst \\d+ tegn`) }).click();
});

Cypress.Commands.add('findAllByErrorMessageMaxLength', (label) => {
  return cy.findAllByText(new RegExp(`${label} kan ikke ha mer enn \\d+ tegn`));
});

Cypress.Commands.add('clickErrorMessageMaxLength', (label) => {
  return cy.findByRole('link', { name: new RegExp(`${label} kan ikke ha mer enn \\d+ tegn`) }).click();
});

Cypress.Commands.add('testDownloadPdf', () => {
  cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (req) => {
    req.on('response', (res) => {
      if (res.statusCode !== 200) {
        throw new Error(`Expected PDF download response 200, got ${res.statusCode}`);
      }
    });
  }).as('downloadPdf');

  cy.clickDownloadApplication();
  cy.wait('@downloadPdf');
});
