import { submissionId } from '../support/testData';

describe('Entry routing', () => {
  beforeEach(() => {
    cy.signIn();
  });

  it('shows the standalone journey', () => {
    cy.visit('/sendinn/lospost');
    cy.findByRole('heading', { level: 1, name: 'Send dokumenter til Nav' }).should('exist');
    cy.title().should('eq', 'Send dokumenter til Nav');
  });

  it('shows the form journey', () => {
    cy.visit('/sendinn/nav123456');
    cy.findByRole('heading', { level: 1, name: 'Send inn dokumentasjon til skjema' }).should('exist');
  });

  it('shows the form journey with a task', () => {
    cy.visit(`/sendinn/nav123456?innsendingsId=${submissionId}`);
    cy.findByRole('heading', { level: 1, name: 'Send inn etterspurt dokumentasjon til skjema' }).should('exist');
  });

  it('shows the task journey', () => {
    cy.visit(`/sendinn/oppgave?innsendingsId=${submissionId}`);
    cy.findByRole('heading', { level: 1, name: 'Send inn etterspurt dokumentasjon' }).should('exist');
  });

  [
    '/sendinn',
    '/sendinn/oppgave',
    '/sendinn/oppgave?innsendingsId=not-a-uuid',
    '/sendinn/nav123456/extra',
    '/sendinn/nav123456?innsendingsId=not-a-uuid',
    '/sendinn/404/',
  ].forEach((url) => {
    it(`moves ${url} to the not found page`, () => {
      cy.visit(url, { failOnStatusCode: false });
      cy.location('pathname').should('eq', '/sendinn/404');
      cy.location('search').should('eq', '');
      cy.findByRole('heading', { level: 1, name: 'Beklager, fant ikke siden' }).should('exist');
    });
  });

  it('keeps only the language parameter when moving to the not found page', () => {
    cy.visit(`/sendinn/nav123456/extra?innsendingsId=${submissionId}&lang=en&sub=digital`, {
      failOnStatusCode: false,
    });
    cy.location('pathname').should('eq', '/sendinn/404');
    cy.location('search').should('eq', '?lang=en');
    cy.findByRole('heading', { level: 1, name: 'Sorry, we could not find the page' }).should('exist');
  });

  it('replaces the original URL in the history', () => {
    cy.visit('/sendinn/lospost');
    cy.findByRole('heading', { level: 1, name: 'Send dokumenter til Nav' }).should('exist');
    cy.window().then((win) => win.history.pushState({}, '', '/sendinn/oppgave'));
    cy.window().then((win) => win.dispatchEvent(new win.PopStateEvent('popstate')));
    cy.location('pathname').should('eq', '/sendinn/404');

    cy.go('back');
    cy.location('pathname').should('eq', '/sendinn/lospost');
    cy.findByRole('heading', { level: 1, name: 'Send dokumenter til Nav' }).should('exist');
  });
});
