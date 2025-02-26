import { expect } from 'chai';

describe('Form translations', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
    cy.intercept('GET', '/api/forms/tst123456', { fixture: 'form123456.json' }).as('getForm');
    cy.intercept('GET', '/api/form-publications/tst123456', { fixture: 'form123456-published.json' }).as(
      'getPublishedForm',
    );
    cy.intercept('GET', '/api/forms/tst123456/translations', { fixture: 'form123456-translations.json' }).as(
      'getFormTranslations',
    );
    cy.intercept('GET', '/api/translations', { fixture: 'formsApiGlobalTranslations.json' }).as(
      'getGlobalTranslations',
    );
    cy.visit('/forms/tst123456/oversettelser');
    cy.wait('@getForm');
    cy.wait('@getFormTranslations');
    cy.wait('@getGlobalTranslations');
  });

  it('updates existing translation, adds new translation and adds global override', () => {
    cy.intercept('POST', '/api/forms/tst123456/translations', (req) => req.reply(201, req.body)).as('postTranslation');
    cy.intercept('PUT', '/api/forms/tst123456/translations/2', (req) => req.reply(200, req.body)).as('putTranslation2');
    cy.findByRole('heading', { name: 'TST-123456, Skjema for testing av diff' }).should('be.visible');
    cy.findByText('Dine opplysninger').click();
    cy.findByRole('textbox', { name: 'Nynorsk' }).type('Dine opplysninger');
    cy.findByRole('textbox', { name: 'Engelsk' }).type('{selectall}Your information');

    cy.findByText('Fornavn2').click();
    cy.findAllByRole('textbox', { name: 'Nynorsk' }).eq(1).type('Fornavn2');
    cy.findAllByRole('textbox', { name: 'Engelsk' }).eq(1).type('First name2');

    cy.findByRole('button', { name: 'Lagre' }).focus();
    cy.findByRole('button', { name: 'Lagre' }).click();
    cy.wait(['@postTranslation', '@postTranslation', '@putTranslation2', '@getFormTranslations']).spread(
      (post1, post2, put) => {
        expect(post1.request.body).to.deep.equal({
          globalTranslationId: 6,
          key: 'Nei',
          nb: 'Nei',
          nn: 'Nei',
          en: '',
        });
        expect(post2.request.body).to.deep.equal({
          en: 'First name2',
          key: 'Fornavn2',
          nb: 'Fornavn2',
          nn: 'Fornavn2',
        });
        expect(put.request.body).to.deep.equal({
          nb: 'Dine opplysninger',
          nn: 'Dine opplysninger',
          en: 'Your information',
          revision: 3,
        });
      },
    );
    cy.findAllByRole('textbox').should('have.length', 0);
  });
});
