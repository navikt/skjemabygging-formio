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
      findByRoleWhenAttached(
        role: ByRoleMatcher,
        options?: ByRoleOptions,
        wait?: number,
      ): Chainable<JQuery<HTMLElement>>;

      /**
       * Provided you are in the form wizard. Use this to click on the "Neste steg"-button.
       */
      clickNextStep(): Chainable<JQuery<HTMLElement>>;

      /**
       * Provided you are in the form wizard. Use this to click on the "Forrige steg"-button.
       */
      clickPreviousStep(): Chainable<JQuery<HTMLElement>>;

      clickSaveAndContinue(): Chainable<JQuery<HTMLElement>>;

      clickStart(): Chainable<JQuery<HTMLElement>>;

      clickIntroPageConfirmation(): Chainable<JQuery<HTMLElement>>;

      clickShowAllSteps(): Chainable<JQuery<HTMLElement>>;

      clickEditAnswer(title: string, linkText?: string): Chainable<JQuery<HTMLElement>>;

      clickEditAnswers(linkText?: string): Chainable<JQuery<HTMLElement>>;

      clickSendDigital(): Chainable<JQuery<HTMLElement>>;

      clickSendNav(): Chainable<JQuery<HTMLElement>>;

      clickDownloadInstructions(): Chainable<JQuery<HTMLElement>>;

      clickDownloadApplication(): Chainable<JQuery<HTMLElement>>;

      verifySendInnRedirect(): Chainable<JQuery<HTMLElement>>;

      verifyNavRedirect(): Chainable<JQuery<HTMLElement>>;

      defaultIntercepts(): Chainable<JQuery<HTMLElement>>;

      defaultInterceptsMellomlagring(): Chainable<JQuery<HTMLElement>>;

      defaultInterceptsExternal(): Chainable<JQuery<HTMLElement>>;

      defaultWaits(): Chainable<JQuery<HTMLElement>>;

      submitMellomlagring(callback: (req: CyHttpMessages.IncomingHttpRequest) => void): Chainable<JQuery<HTMLElement>>;

      shouldBeVisible(): Chainable<JQuery>;

      /**
       * Configures the Mocks Server administration API client
       */
      configMocksServer(): Chainable<JQuery<HTMLElement>>;

      /**
       * Run test only on build code. This is allways true on GitHub, but if you want to run locally you can chanage INCLUDE_DIST_TESTS to true.
       */
      skipIfNoIncludeDistTests(): Chainable<void>;

      /**
       * Form components
       */
      testActive(params: { label: string; role?: string }): void;

      testDescription(params: {
        label: string;
        description?: string;
        additionalDescriptionText?: string;
        additionalDescriptionLabel?: string;
      }): void;

      testAutocomplete(params: { label: string; value: string }): void;

      testSpellcheck(params: { label: string }): void;

      testReadOnly(params: { label: string; value: boolean }): void;

      testCalculateValue(params: { label: string; value: string }): void;

      testValid(params: {
        label: string;
        invalidValue?: string;
        validValue: string;
        errorMessage: string | RegExp;
      }): void;

      testRequired(params: { label: string; value: boolean; validValue?: string }): void;

      testMinLength(params: { label: string; invalidValue: string; validValue: string }): void;

      testMaxLength(params: { label: string; invalidValue: string; validValue: string }): void;

      testSummaryGroup(params: { name: string; items: Array<{ label: string; value: string }> }): void;

      testDownloadPdf(): void;
    }
  }
}
