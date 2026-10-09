import { submissionId } from '../support/testData';

describe('Entry routing', () => {
  beforeEach(() => {
    cy.signIn();
  });

  it('shows the løspost journey', () => {
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
  ].forEach((url) => {
    it(`shows the unavailable page for ${url}`, () => {
      cy.visit(url, { failOnStatusCode: false });
      cy.findByRole('heading', { level: 1, name: 'Beklager, fant ikke siden' }).should('exist');
    });
  });
});
