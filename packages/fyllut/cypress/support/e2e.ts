// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import { register } from '@mocks-server/cypress-commands';
import 'cypress-axe';
import './commands';
import './components';

const isProductionSpec = () => Cypress.spec.relative.startsWith('cypress/e2e/production/');

beforeEach(() => {
  if (!isProductionSpec()) {
    return;
  }

  cy.clearCookies();
  cy.clearLocalStorage();
  cy.window({ log: false }).then((win) => {
    win.sessionStorage.clear();
  });
});

register();
