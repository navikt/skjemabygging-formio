// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
import '@testing-library/cypress/add-commands';

//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add('clickBuilderComponentButton', (title: string) => {
  cy.findAllByTitle(title).first().should('exist').click({ force: true }); // force because these buttons are only visible on hover
});

Cypress.Commands.add('openEditComponentModal', (query) => {
  query
    .should('exist')
    .closest("[data-testid='builder-component']")
    .within(() => {
      cy.clickBuilderComponentButton('Rediger');
    });
});

Cypress.on('uncaught:exception', (err, _runnable, _promise) => {
  if (err.message?.includes('cdn.form.io')) {
    return false;
  }
  return true;
});

Cypress.Commands.add('defaultIntercepts', () => {
  cy.intercept('POST', '/api/log/error', { body: 'ok' }).as('logger');
  cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
  cy.intercept('GET', '/api/forms/*', { fixture: 'getForm.json' }).as('getForm');
  cy.intercept('GET', '/api/translations', { fixture: 'globalTranslations.json' }).as('getTranslations');
  cy.intercept('GET', '/api/forms/*/translations', { body: [] }).as('getFormTranslations');
  return cy;
});

Cypress.Commands.add('defaultWaits', () => {
  cy.wait('@getConfig');
  cy.wait('@getForm');
  cy.wait('@getTranslations');
  cy.wait('@getFormTranslations');
  return cy;
});
