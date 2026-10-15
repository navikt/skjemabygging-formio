declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Points the mocks-server admin client at the port from the runtime config.
       */
      configMocksServer(): Chainable<void>;

      /**
       * Skips the test unless it runs against the built app, where sendinn-backend serves index.html.
       */
      skipIfNoIncludeDistTests(): Chainable<void>;

      /**
       * Adds an ID-porten bearer token to every request under /sendinn, like Wonderwall does in Nais.
       */
      signIn(): Chainable<void>;

      /**
       * Requests an entry URL from sendinn-backend without following redirects.
       */
      requestEntry(url: string, options?: { signedIn?: boolean }): Chainable<Cypress.Response<string>>;
    }
  }
}

export {};
