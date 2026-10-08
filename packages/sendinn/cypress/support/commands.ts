import '@testing-library/cypress/add-commands';

// Wonderwall adds the ID-porten token in Nais. Locally the mock Texas decides whether the token is valid.
const idportenAuthorization = 'Bearer idporten-token';

Cypress.Commands.add('configMocksServer', () => {
  cy.mocksConfigClient({
    port: Number(Cypress.env('MOCKS_ADMIN_PORT') ?? 3310),
  });
});

Cypress.Commands.add('skipIfNoIncludeDistTests', function () {
  if (!Cypress.env('INCLUDE_DIST_TESTS')) {
    cy.log('Set INCLUDE_DIST_TESTS to true to run this test');
    this.skip();
  }
});

Cypress.Commands.add('signIn', () => {
  cy.intercept({ pathname: /^\/sendinn(\/|$)/ }, (req) => {
    req.headers.authorization = idportenAuthorization;
  });
});

Cypress.Commands.add('requestEntry', (url: string, options: { signedIn?: boolean } = {}) =>
  cy.request({
    url,
    followRedirect: false,
    failOnStatusCode: false,
    headers: options.signedIn ? { Authorization: idportenAuthorization } : {},
  }),
);
