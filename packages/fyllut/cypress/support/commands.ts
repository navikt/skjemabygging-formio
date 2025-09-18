// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import '@testing-library/cypress/add-commands';
import 'cypress-wait-until';
import { CyHttpMessages } from 'cypress/types/net-stubbing';

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

// Based on https://github.com/cypress-io/cypress/issues/7306#issuecomment-636009167
Cypress.Commands.add('findByRoleWhenAttached', (role, options, wait: number = 100) => {
  return cy
    .waitUntil(
      () =>
        cy
          .findByRole(role, options)
          .as('elementWhenAttached')
          .wait(wait) // for some reason this is needed, otherwise isAttached returns `true` regardless
          .then(($el) => Cypress.dom.isAttached($el)),
      { timeout: 2000, interval: 10 },
    )
    .get('@elementWhenAttached');
});

Cypress.Commands.add('shouldBeVisible', { prevSubject: true }, (subject) => {
  return cy.wrap(subject).should('be.visible').should('not.have.class', 'navds-sr-only');
});

Cypress.Commands.add('clickNextStep', () => {
  return cy.findByRoleWhenAttached('link', { name: TEXTS.grensesnitt.navigation.next }, 500).click();
});

Cypress.Commands.add('clickPreviousStep', () => {
  return cy.findByRoleWhenAttached('link', { name: TEXTS.grensesnitt.navigation.previous }, 500).click();
});

Cypress.Commands.add('clickSaveAndContinue', () => {
  return cy
    .url()
    .then((url) =>
      cy
        .findByRoleWhenAttached(
          url.includes('/oppsummering') ? 'button' : 'link',
          { name: TEXTS.grensesnitt.navigation.saveAndContinue },
          500,
        )
        .click(),
    );
});

Cypress.Commands.add('clickStart', () => {
  return cy.findByRoleWhenAttached('link', { name: TEXTS.grensesnitt.introPage.start }, 500).click();
});

Cypress.Commands.add('clickShowAllSteps', () => {
  return cy.findByRoleWhenAttached('button', { name: TEXTS.grensesnitt.stepper.showAllSteps }, 500).click();
});

Cypress.Commands.add('clickEditAnswer', (title, linkText) => {
  cy.findByRole('heading', { level: 2, name: title })
    .parent()
    .parent()
    .findByRole('link', { name: linkText ?? TEXTS.grensesnitt.summaryPage.edit })
    .click();
});

Cypress.Commands.add('clickEditAnswers', (linkText) => {
  cy.findAllByRole('link', { name: linkText ?? TEXTS.grensesnitt.summaryPage.editAnswers })
    .first()
    .click();
});

Cypress.Commands.add('verifySendInnRedirect', () => {
  return cy.origin(Cypress.env('SEND_INN_FRONTEND'), () => {
    cy.contains('Send Inn Frontend');
  });
});

Cypress.Commands.add('defaultIntercepts', () => {
  cy.intercept('POST', '/fyllut/api/log*', { body: 'ok' }).as('logger');
  cy.intercept('GET', '/fyllut/api/config*').as('getConfig');
  cy.intercept('GET', '/fyllut/api/global-translations/*').as('getGlobalTranslations');
  cy.intercept('GET', '/fyllut/api/common-codes/currencies*').as('getCurrencies');
  cy.intercept('GET', '/fyllut/api/common-codes/area-codes').as('getAreaCodes');
  cy.intercept('GET', '/fyllut/api/translations/*').as('getTranslations');
  cy.intercept('GET', '/fyllut/api/forms/*').as('getForm');
  return cy;
});

Cypress.Commands.add('defaultInterceptsMellomlagring', () => {
  cy.intercept('POST', '/fyllut/api/send-inn/soknad*').as('createMellomlagring');
  cy.intercept('PUT', '/fyllut/api/send-inn/soknad*').as('updateMellomlagring');
  cy.intercept('GET', '/fyllut/api/send-inn/soknad/*').as('getMellomlagring');

  return cy;
});

Cypress.Commands.add('submitMellomlagring', (callback: (req: CyHttpMessages.IncomingHttpRequest) => void) => {
  cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad', (req) => {
    callback(req);
  }).as('submitMellomlagring');

  return cy;
});

Cypress.Commands.add('defaultInterceptsExternal', () => {
  cy.intercept('GET', '/fyllut/api/send-inn/prefill-data*').as('getPrefillData');
  cy.intercept('GET', '/fyllut/api/send-inn/activities*').as('getActivities');
  return cy;
});

Cypress.Commands.add('defaultWaits', () => {
  cy.wait('@getConfig');
  cy.wait('@getForm');
  cy.wait('@getTranslations');
  return cy;
});

Cypress.Commands.add('configMocksServer', () => {
  cy.mocksConfigClient({
    port: 3310,
  });
  return cy;
});

Cypress.Commands.add('skipIfNoIncludeDistTests', function () {
  if (!Cypress.env('INCLUDE_DIST_TESTS')) {
    cy.log('Set INCLUDE_DIST_TESTS to true to run this test');
    this.skip();
  }
});
