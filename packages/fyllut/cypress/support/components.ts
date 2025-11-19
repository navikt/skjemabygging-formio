/**
 * Test functions for form components
 */

import { expect } from 'chai';

Cypress.Commands.add('testActive', ({ label, role }) => {
  if (role) {
    cy.findByRole(role, { name: label }).should('exist');
  }
  cy.findByLabelText(label).should('be.visible');
  cy.findByLabelText(label).should('be.enabled');
  cy.testReadOnly({ label, value: false });
});

Cypress.Commands.add(
  'testDescription',
  ({ label, description, additionalDescriptionText, additionalDescriptionLabel }) => {
    cy.findByLabelText(label)
      .closest('.form-group')
      .parent()
      .within(() => {
        cy.contains(description ?? 'This is the description').should('exist');
        cy.contains(additionalDescriptionText ?? 'This is more description').should('not.be.visible');
        cy.findByRole('button', { name: additionalDescriptionLabel ?? 'more' }).click();
        cy.contains(additionalDescriptionText ?? 'This is more description').should('be.visible');
      });
  },
);

Cypress.Commands.add('testAutocomplete', ({ label, value }) => {
  cy.findByLabelText(label).should('have.attr', 'autocomplete', value);
});

Cypress.Commands.add('testSpellcheck', ({ label }) => {
  cy.findByLabelText(label).should('have.attr', 'spellcheck', 'true');
});

Cypress.Commands.add('testReadOnly', ({ label, value }) => {
  if (value) {
    cy.findByLabelText(label).should('have.attr', 'readonly');
  } else {
    cy.findByLabelText(label).should('not.have.attr', 'readonly');
  }
});

Cypress.Commands.add('testCalculateValue', ({ label, value }) => {
  cy.findByLabelText(label).should('have.value', value);
  cy.testReadOnly({ label, value: true });
});

Cypress.Commands.add('testValid', ({ label, invalidValue, validValue, errorMessage }) => {
  if (invalidValue) {
    cy.findByLabelText(label).type(invalidValue);
  }
  cy.clickNextStep();
  cy.findAllByText(errorMessage).should('have.length', 2);
  cy.findByRole('link', { name: errorMessage }).click();
  cy.findByLabelText(label).should('have.focus');
  // TODO: Support other elements like clickable elements
  cy.focused().clear();
  cy.focused().type(validValue);
  cy.findAllByText(errorMessage).should('have.length', 0);
});

Cypress.Commands.add('testRequired', ({ label, value, validValue }) => {
  const errorMessage = `Du må fylle ut: ${label}`;
  if (value) {
    cy.testValid({ label, validValue, errorMessage });
  } else {
    cy.findByLabelText(`${label} (valgfritt)`).should('exist');
    cy.findAllByText(errorMessage).should('have.length', 0);
  }
});

Cypress.Commands.add('testMinLength', ({ label, invalidValue, validValue }) => {
  const errorMessage = new RegExp(`${label} må ha minst . tegn`);
  cy.testValid({ label, invalidValue, validValue, errorMessage });
});

Cypress.Commands.add('testMaxLength', ({ label, invalidValue, validValue }) => {
  const errorMessage = new RegExp(`${label} kan ikke ha mer enn . tegn`);
  cy.testValid({ label, invalidValue, validValue, errorMessage });
});

Cypress.Commands.add('testSummaryGroup', ({ name, items }) => {
  cy.findByRole('heading', { level: 2, name })
    .closest('.navds-form-summary')
    .within(() => {
      items.forEach((item, index) => {
        cy.get('dt').eq(index).should('contain.text', item.label);
        cy.get('dd').eq(index).should('contain.text', item.value);
      });
    });
});

Cypress.Commands.add('testDownloadPdf', () => {
  cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (req) => {
    const { pdfFormData, submission } = req.body;
    const data = JSON.parse(submission).data;
    const pdfFormDataString = JSON.stringify(pdfFormData);
    Object.keys(data).forEach((key) => {
      expect(pdfFormDataString).to.include(data[key]);
    });
  }).as('downloadPdf');

  cy.clickDownloadApplication();
  cy.wait('@downloadPdf');
});
