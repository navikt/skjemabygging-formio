import { submissionId } from '../support/testData';

describe('Language', () => {
  beforeEach(() => {
    cy.signIn();
  });

  it('uses bokmål without a lang parameter', () => {
    cy.visit('/sendinn/lospost');
    cy.findByRole('heading', { level: 1, name: 'Send dokumenter til Nav' }).should('exist');
  });

  it('selects texts from the lang parameter', () => {
    cy.visit('/sendinn/lospost?lang=en');
    cy.findByRole('heading', { level: 1, name: 'Send documents to Nav' }).should('exist');
  });

  it('keeps the rest of the query when a language is selected in the decorator', () => {
    cy.visit(`/sendinn/oppgave?innsendingsId=${submissionId}&lang=en`);
    cy.findByRole('heading', { level: 1, name: 'Submit requested documentation' }).should('exist');

    cy.selectDecoratorLanguage('nn');

    cy.findByRole('heading', { level: 1, name: 'Send inn etterspurd dokumentasjon' }).should('exist');
    cy.location('pathname').should('eq', '/sendinn/oppgave');
    cy.location('search').should('include', `innsendingsId=${submissionId}`).and('include', 'lang=nn');
  });

  it('falls back to bokmål when translations fail to load', () => {
    cy.intercept('GET', '/sendinn/api/global-translations/en', { statusCode: 500 });
    cy.visit('/sendinn/lospost?lang=en');
    cy.findByRole('heading', { level: 1, name: 'Send dokumenter til Nav' }).should('exist');
  });

  it('falls back to bokmål for an unsupported language', () => {
    cy.visit('/sendinn/lospost?lang=se');
    cy.findByRole('heading', { level: 1, name: 'Send dokumenter til Nav' }).should('exist');
  });
});
