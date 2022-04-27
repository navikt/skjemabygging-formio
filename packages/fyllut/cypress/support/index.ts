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

// Import commands.js using ES2015 syntax:
import { ByRoleOptions } from "@testing-library/cypress";
import { ByRoleMatcher } from "@testing-library/dom";
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Can be used if the regular approach
       * Custom command to find element by role, waiting for it to be attached to the DOM.
       * @example cy.findByRoleWhenAttached('button', { name: "Submit" })
       */
      findByRoleWhenAttached(role: ByRoleMatcher, options?: ByRoleOptions): Chainable<JQuery<HTMLElement>>;
    }
  }
}
