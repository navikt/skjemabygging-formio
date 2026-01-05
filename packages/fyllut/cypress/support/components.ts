/**
 * Test functions for form components
 */
Cypress.Commands.add('withinComponent', (label, fn) => {
  return cy.findByLabelText(label).closest('.form-group').within(fn);
});

Cypress.Commands.add('withinSummaryGroup', (heading, fn) => {
  cy.findByRole('heading', { level: 3, name: heading }).closest('.navds-form-summary').within(fn);
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
  cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (req) => {
    const { pdfFormData, submission } = req.body;
    const submissionData = JSON.parse(submission).data;
    const pdfFormDataString = JSON.stringify(pdfFormData);
    Object.values(submissionData).forEach((value) => {
      expect(pdfFormDataString).to.include(value);
    });
  }).as('downloadPdf');

  cy.clickDownloadApplication();
  cy.wait('@downloadPdf');
});
