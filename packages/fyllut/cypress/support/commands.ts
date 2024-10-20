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
import { expect } from 'chai';
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
Cypress.Commands.add('findByRoleWhenAttached', (role, options) => {
  return cy
    .waitUntil(
      () =>
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy
          .findByRole(role, options)
          .as('elementWhenAttached')
          .wait(100) // for some reason this is needed, otherwise isAttached returns `true` regardless
          .then(($el) => Cypress.dom.isAttached($el)),
      { timeout: 2000, interval: 10 },
    )
    .get('@elementWhenAttached');
});

Cypress.Commands.add('shouldBeVisible', { prevSubject: true }, (subject) => {
  return cy.wrap(subject).should('be.visible').should('not.have.class', 'navds-sr-only');
});

Cypress.Commands.add('clickNextStep', () => {
  return cy.findByRoleWhenAttached('button', { name: TEXTS.grensesnitt.navigation.next }).click();
});

Cypress.Commands.add('clickSaveAndContinue', () => {
  return cy.findByRoleWhenAttached('button', { name: TEXTS.grensesnitt.navigation.saveAndContinue }).click();
});

Cypress.Commands.add('clickStart', () => {
  return cy.findByRoleWhenAttached('link', { name: TEXTS.grensesnitt.introPage.start }).click();
});

Cypress.Commands.add('checkLogToAmplitude', (eventType: string, properties) => {
  return cy
    .wait('@amplitudeLogging')
    .its('request.body')
    .then((body) => {
      expect(body.events).to.have.length(1);
      return body.events[0];
    })
    .then((event) => {
      expect(event.event_type).to.equal(eventType);
      if (properties && Object.keys(properties).length > 0) {
        const propertyKeys = Object.keys(properties);
        propertyKeys.forEach((key) =>
          expect(event.event_properties?.[key]).to.equal(properties[key], `Assertion for amplitude key: "${key}"`),
        );
      }
    });
});

Cypress.Commands.add('defaultIntercepts', () => {
  cy.intercept('POST', '/amplitude/collect-auto').as('amplitudeLogging');
  cy.intercept('POST', '/fyllut/api/log*', { body: 'ok' }).as('logger');
  cy.intercept('GET', '/fyllut/api/config*').as('getConfig');
  cy.intercept('GET', '/fyllut/api/global-translations/*').as('getGlobalTranslations');
  cy.intercept('GET', '/fyllut/api/common-codes/currencies*').as('getCurrencies');
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
