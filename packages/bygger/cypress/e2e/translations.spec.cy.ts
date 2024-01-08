describe('Translations', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
  });

  describe('Form translations', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/forms/tst123456', { fixture: 'form123456.json' }).as('getForm');
      cy.intercept('GET', '/api/published-forms/tst123456', { statusCode: 404 }).as('getPublishedForm');
      cy.intercept('GET', '/api/countries?*', { fixture: 'getCountriesLangNb.json' }).as('getCountriesLangNb');

      cy.visit('/forms/tst123456');
      cy.wait('@getForm');
    });

    describe('when loading of translations succeeds', () => {
      beforeEach(() => {
        cy.intercept('GET', /language\/submission?.*/, { fixture: 'globalTranslations.json' }).as('getTranslations');
        cy.wait('@getTranslations', { timeout: 10000 });
      });

      it('shows translated texts for chosen language', () => {
        cy.findByRole('link', { name: 'Språk' }).click();
        cy.findByDisplayValue('Annan dokumentasjon', { timeout: 10000 }).should('exist');
        cy.findByRole('button', { name: 'Norsk nynorsk' }).click();
        cy.findByRole('link', { name: 'Engelsk' }).click();
        cy.findByDisplayValue('Other documentation').should('exist');
      });
    });

    describe('when loading of translations fails', () => {
      beforeEach(() => {
        cy.intercept('GET', /language\/submission?.*/, { statusCode: 500, body: 'Failed to load translations' }).as(
          'getTranslationsFailure',
        );
        cy.wait('@getTranslationsFailure', { timeout: 10000 });
      });

      it('shows error message', () => {
        cy.findByRole('link', { name: 'Språk' }).click();
        cy.findAllByText('Henting av oversettelser for dette skjemaet feilet. Last siden på nytt.').should(
          'be.visible',
        );
      });
    });
  });

  describe('Global translations', () => {
    beforeEach(() => {
      cy.intercept('GET', /\/api\/forms\\?.+/, { body: [] }).as('getForms');
      cy.visit('/');
    });

    describe('when loading of global translations succeeds', () => {
      beforeEach(() => {
        cy.intercept('GET', /language\/submission?.*/, { fixture: 'globalTranslations.json' }).as('getTranslations');
      });

      it('shows translated texts for chosen language', () => {
        cy.findByRole('button', { name: 'Åpne meny' }).click();
        cy.findByRole('link', { name: 'Globale Oversettelser' }).click();
        cy.findByRole('heading', { name: 'Norsk nynorsk' }).should('exist');
        cy.findByDisplayValue('Annan dokumentasjon');
        cy.findByRole('button', { name: 'Norsk nynorsk' }).click();
        cy.findByRole('link', { name: 'Engelsk' }).click();
        cy.findByRole('heading', { name: 'Engelsk' }).should('exist');
        cy.findByDisplayValue('Other documentation').should('exist');
      });
    });

    describe('when loading of global translations fails', () => {
      beforeEach(() => {
        cy.intercept('GET', /language\/submission?.*/, { statusCode: 500, body: 'Failed to load translations' }).as(
          'getTranslationsFailure',
        );
      });

      it('shows error message', () => {
        cy.findByRole('button', { name: 'Åpne meny' }).click();
        cy.findByRole('link', { name: 'Globale Oversettelser' }).click();
        cy.findByRole('heading', { name: 'Norsk nynorsk' }).should('exist');
        cy.wait('@getTranslationsFailure');
        cy.findAllByText('Henting av globale oversettelser feilet. Last siden på nytt.').should('be.visible');
      });
    });
  });
});
