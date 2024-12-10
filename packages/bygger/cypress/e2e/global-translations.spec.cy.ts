import { expect } from 'chai';

describe('Global translations', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
    cy.intercept('GET', '/api/forms-api/global-translations', { fixture: 'formsApiGlobalTranslations.json' }).as(
      'getGlobalTranslations',
    );
    cy.visit('/oversettelser');
    cy.wait('@getGlobalTranslations');
  });

  describe('Skjematekster', () => {
    it('adds new translation', () => {
      cy.intercept('POST', '/api/forms-api/global-translations', (req) => {
        expect(req.body).to.deep.equal({
          key: 'Ny tekst',
          nb: 'Ny tekst',
          nn: 'Ny tekst (nynorsk)',
          en: 'New text',
          tag: 'skjematekster',
        });
        req.reply(201, req.body);
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

    it('halts with validation error if bokmål text is empty', () => {
      cy.findByRole('textbox', { name: 'Nynorsk' }).type('Ny tekst (nynorsk)');
      cy.findByRole('textbox', { name: 'Engelsk' }).type('New text');
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.findByText('Legg til bokmålstekst for å opprette ny oversettelse');
      cy.findByRole('textbox', { name: 'Nynorsk' }).should('have.value', 'Ny tekst (nynorsk)');
      cy.findByRole('textbox', { name: 'Engelsk' }).should('have.value', 'New text');
    });

    it('displays error message if new translation has existing key', () => {
      cy.intercept('POST', '/api/forms-api/global-translations', (req) => {
        req.reply(409, req.body);
      }).as('postGlobalTranslation');
      cy.findByRole('textbox', { name: 'Bokmål' }).type('Abc');
      cy.findByRole('textbox', { name: 'Nynorsk' }).type('Abc');
      cy.findByRole('textbox', { name: 'Engelsk' }).type('Abc');
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@postGlobalTranslation');
      cy.findByText('Det finnes allerede en global oversettelse med denne bokmålsteksten');
      cy.findByRole('textbox', { name: 'Bokmål' }).should('have.value', 'Abc');
      cy.findByRole('textbox', { name: 'Nynorsk' }).should('have.value', 'Abc');
      cy.findByRole('textbox', { name: 'Engelsk' }).should('have.value', 'Abc');
    });

    it('edits existing and adds new translation', () => {
      cy.intercept('POST', '/api/forms-api/global-translations', (req) => {
        expect(req.body).to.deep.equal({
          key: 'Test',
          nb: 'Test',
          nn: 'Test',
          en: 'Test',
          tag: 'skjematekster',
        });
        req.reply(201, req.body);
      }).as('postGlobalTranslation');
      cy.intercept('PUT', '/api/forms-api/global-translations/4', (req) => {
        expect(req.body).to.deep.equal({
          nb: 'Hei',
          nn: 'Hei',
          en: 'Hello',
          revision: 6,
        });
        req.reply(200, req.body);
      }).as('putGlobalTranslation4');
      cy.intercept('PUT', '/api/forms-api/global-translations/2', (req) => {
        console.log(JSON.stringify(req.body));
        expect(req.body).to.deep.equal({
          nb: 'Nyere',
          nn: 'Gamal',
          en: 'Old',
          revision: 3,
        });
        req.reply(200, req.body);
      }).as('putGlobalTranslation2');
      cy.findByRole('textbox', { name: 'Bokmål' }).type('Test');
      cy.findByRole('textbox', { name: 'Nynorsk' }).type('Test');
      cy.findByRole('textbox', { name: 'Engelsk' }).type('Test');
      cy.get('tr').eq(2).click();
      cy.findAllByRole('textbox', { name: 'Nynorsk' }).eq(1).type('Hei');
      cy.get('tr').eq(4).click();
      cy.findAllByRole('textbox', { name: 'Nynorsk' }).eq(2).type('{selectall}Gamal');
      cy.findAllByRole('textbox', { name: 'Engelsk' }).eq(2).type('{selectall}Old');
      cy.findByRole('button', { name: 'Lagre' }).focus();
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@postGlobalTranslation');
      cy.wait('@putGlobalTranslation4');
      cy.wait('@putGlobalTranslation2');
      cy.findAllByRole('textbox').should('have.length', 3);
      cy.wait('@getGlobalTranslations');
    });

    it('keeps translations open if they were not successful in saving', () => {
      cy.intercept('PUT', '/api/forms-api/global-translations/4', (req) => {
        req.reply(200, req.body);
      }).as('putGlobalTranslation4');
      cy.intercept('PUT', '/api/forms-api/global-translations/2', (req) => {
        req.reply(409, req.body);
      }).as('putGlobalTranslation2');
      cy.get('tr').eq(2).click();
      cy.findAllByRole('textbox', { name: 'Nynorsk' }).eq(1).type('Hei');
      cy.get('tr').eq(4).click();
      cy.findAllByRole('textbox', { name: 'Nynorsk' }).eq(2).type('{selectall}Gamal');
      cy.findAllByRole('textbox', { name: 'Engelsk' }).eq(2).type('{selectall}Old');
      cy.findByRole('button', { name: 'Lagre' }).focus();
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@putGlobalTranslation4');
      cy.wait('@putGlobalTranslation2');
      cy.findAllByRole('textbox').should('have.length', 5);
      cy.findAllByRole('textbox', { name: 'Nynorsk' }).eq(1).should('have.value', 'Gamal');
      cy.findAllByRole('textbox', { name: 'Engelsk' }).eq(1).should('have.value', 'Old');
      cy.findAllByText('Kunne ikke lagres').should('have.length', 2);
      cy.wait('@getGlobalTranslations');
    });
  });
});
