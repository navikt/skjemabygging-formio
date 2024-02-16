import { ByRoleOptions } from '@testing-library/cypress';
import { ByRoleMatcher } from '@testing-library/dom';
import { CyHttpMessages } from 'cypress/types/net-stubbing';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * This is a custom command to find element by role, and waiting for it to be attached to the DOM.
       * Can be used if you get issues with detached DOM element when you want to interact with an element retrieved by findByRole
       * @example cy.findByRoleWhenAttached('button', { name: "Submit" })
       */
      findByRoleWhenAttached(role: ByRoleMatcher, options?: ByRoleOptions): Chainable<JQuery<HTMLElement>>;

      /**
       * Provided you are in the form wizard. Use this to click on the "Neste steg"-button.
       */
      clickNextStep(): Chainable<JQuery<HTMLElement>>;

      clickSaveAndContinue(): Chainable<JQuery<HTMLElement>>;

      clickStart(): Chainable<JQuery<HTMLElement>>;

      checkLogToAmplitude(eventType: string, properties?: object): Chainable<JQuery<HTMLElement>>;

      defaultIntercepts(): Cypress.Chainable<JQuery<HTMLElement>>;

      defaultInterceptsMellomlagring(): Chainable<JQuery<HTMLElement>>;

      defaultInterceptsExternal(): Chainable<JQuery<HTMLElement>>;

      submitMellomlagring(callback: (req: CyHttpMessages.IncomingHttpRequest) => void): Chainable<JQuery<HTMLElement>>;

      shouldBeVisible(): Chainable<JQuery>;

      /**
       * Configures the Mocks Server administration API client
       */
      configMocksServer(): Chainable<JQuery<HTMLElement>>;
    }
  }
}
