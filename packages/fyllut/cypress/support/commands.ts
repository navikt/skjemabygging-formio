// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import "@testing-library/cypress/add-commands";
import "cypress-wait-until";

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
Cypress.Commands.add("findByRoleWhenAttached", (role, options) => {
  return cy
    .waitUntil(
      () =>
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy
          .findByRole(role, options)
          .as("elementWhenAttached")
          .wait(100) // for some reason this is needed, otherwise isAttached returns `true` regardless
          .then(($el) => Cypress.dom.isAttached($el)),
      { timeout: 2000, interval: 10 }
    )
    .get("@elementWhenAttached");
});

Cypress.Commands.add("clickNextStep", () => {
  return cy.findByRoleWhenAttached("button", { name: "Neste steg" }).click();
});

Cypress.Commands.add("clickStart", () => {
  return cy.findByRoleWhenAttached("button", { name: "Start" }).click();
});
