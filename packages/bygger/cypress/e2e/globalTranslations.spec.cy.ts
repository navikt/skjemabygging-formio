import { expect } from 'chai';

describe('Global translations', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
    cy.intercept('GET', '/api/forms-api/global-translations', { fixture: 'formsApiGlobalTranslations.json' }).as(
      'getGlobalTranslations',
    );
  });

  describe('Skjematekster', () => {
    beforeEach(() => {
      cy.visit('/oversettelser');
      cy.wait('@getGlobalTranslations');
    });

    it('Adds new translation', () => {
      cy.intercept('POST', '/api/forms-api/global-translations', (req) => {
        expect(req.body).to.deep.equal({
          key: 'Ny tekst',
          nb: 'Ny tekst',
          nn: 'Ny tekst (nynorsk)',
          en: 'New text',
          tag: 'skjematekster',
        });
        req.reply(200, req.body);
      }).as('postGlobalTranslation');
      cy.findByRole('textbox', { name: 'Bokmål' }).type('Ny tekst');
      cy.findByRole('textbox', { name: 'Nynorsk' }).type('Ny tekst (nynorsk)');
      cy.findByRole('textbox', { name: 'Engelsk' }).type('New text');
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@postGlobalTranslation');
      cy.findByRole('textbox', { name: 'Bokmål' }).should('have.value', '');
      cy.findByRole('textbox', { name: 'Nynorsk' }).should('have.value', '');
      cy.findByRole('textbox', { name: 'Engelsk' }).should('have.value', '');
    });
  });
});
