export {};

declare global {
  namespace Cypress {
    interface Chainable {
      clickBuilderComponentButton(title: string): Chainable<JQuery<HTMLElement>>;

      openEditComponentModal(query: Chainable<JQuery<HTMLElement>>): Chainable<JQuery<HTMLElement>>;

      defaultIntercepts(): Chainable<JQuery<HTMLElement>>;

      defaultWaits(): Chainable<JQuery<HTMLElement>>;
    }
  }
}
