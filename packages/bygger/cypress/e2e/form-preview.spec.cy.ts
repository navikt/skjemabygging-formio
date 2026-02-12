describe('FormPreview', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
    cy.intercept('GET', '/api/translations', { fixture: 'globalTranslations.json' }).as('getTranslations');
  });

  describe('When the form only supports digital submission', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/forms/testpreviewsubdigital', { fixture: 'testPreview-sub-digital.json' }).as(
        'getForm',
      );
    });

    it('should end up on page for preparing paper submission', () => {
      cy.visit('/forms/testpreviewsubdigital');
      cy.wait('@getConfig');
      cy.wait('@getForm');
      cy.wait('@getTranslations');
      cy.findByRole('link', { name: 'Forhåndsvis' }).click();
      cy.findByRole('heading', { name: 'Test forhåndsvisning (kun digital)' }).should('be.visible');
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).should('be.visible');
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).check();
      cy.findByRole('link', { name: 'Neste steg' }).click();
      cy.findByRole('heading', { name: 'Dine opplysninger' }).should('be.visible');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).should('be.visible');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('ABC');
      cy.findByRole('link', { name: 'Neste steg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg legger det ved dette skjemaet' }).check();
      });
      cy.findByRole('link', { name: 'Neste steg' }).click();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('be.visible');
      cy.findByRole('heading', { level: 3, name: 'Introduksjon' })
        .parent()
        .parent()
        .within(() => {
          cy.get('dt').eq(0).should('contain.text', 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.');
          cy.get('dd').eq(0).should('contain.text', 'Ja');
        });
      cy.findByRole('heading', { level: 3, name: 'Dine opplysninger' })
        .parent()
        .parent()
        .within(() => {
          cy.get('dt').eq(0).should('contain.text', 'Tekstfelt');
          cy.get('dd').eq(0).should('contain.text', 'ABC');
        });
      cy.findByRole('heading', { level: 3, name: 'Vedlegg' })
        .parent()
        .parent()
        .within(() => {
          cy.get('dt').eq(0).should('contain.text', 'Annen dokumentasjon');
          cy.get('dd').eq(0).should('contain.text', 'Jeg legger det ved dette skjemaet');
        });
      cy.findByRole('link', { name: 'Instruksjoner for innsending' }).should('be.visible');
      cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();
      cy.findByRole('heading', { name: 'Skjemaet er ikke sendt inn ennå' }).should('be.visible');
      cy.findByRole('button', { name: 'Last ned skjema' }).should('be.visible');
    });
  });

  describe('When the form supports no submission', () => {
    it('should end up on page for downloading application without front page', () => {});
  });

  describe('When the form supports paper and digital and does not have standard intro page', () => {
    it('should go to default intro page (not submission type selection)', () => {});
  });
});
