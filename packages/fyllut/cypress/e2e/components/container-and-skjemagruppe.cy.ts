/*
 * Tests that fields inside containers are displayed on the summary page and populated with stored values
 */

describe('Container/Beholder og skjemagruppe', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Fields inside nested containers', () => {
    it('is displayed on summary page', () => {
      cy.visit('/fyllut/container123?sub=digital');
      cy.defaultWaits();
      cy.clickStart();
      cy.clickSaveAndContinue();
      cy.findByRole('group', { name: 'Vis ytre container' }).within(() => {
        cy.findByRole('radio', { name: 'Ja' }).check();
      });
      cy.findByRole('group', { name: 'Vis indre container' }).within(() => {
        cy.findByRole('radio', { name: 'Ja' }).check();
      });
      cy.findByRole('textbox', { name: 'Ytre tekstfelt (valgfritt)' }).type('Eple');
      cy.findByRole('textbox', { name: 'Indre tekstfelt (valgfritt)' }).type('Banan');
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();
      cy.findByText('Eple').shouldBeVisible();
      cy.findByText('Banan').shouldBeVisible();
    });

    it('gets populated with value from mellomlagring', () => {
      cy.mocksUseRouteVariant('get-soknad:container123-complete');
      cy.visit('/fyllut/container123/oppsummering?sub=digital&innsendingsId=defdaa90-ab34-47be-871a-4e410029dcf9');
      cy.defaultWaits();
      cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();
      cy.findByText('Jeg er ytterst').shouldBeVisible();
      cy.findByText('Jeg er innerst').shouldBeVisible();
      cy.findByRole('link', { name: 'Rediger vis beholdere' }).click();
      cy.findByRole('heading', { name: 'Vis beholdere' });
      cy.findByRole('textbox', { name: 'Ytre tekstfelt (valgfritt)' }).should('have.value', 'Jeg er ytterst');
      cy.findByRole('textbox', { name: 'Indre tekstfelt (valgfritt)' }).should('have.value', 'Jeg er innerst');
    });
  });

  describe('Nested skjemagruppe and container/beholder', () => {
    it('validates all textfields in nested containers and skjemagruppe', () => {
      cy.visit('/fyllut/testskjemagruppe/skjemagrupper?sub=paper');
      cy.defaultWaits();
      cy.findByRole('textbox', { name: 'Tekstfelt inni skjemagruppe' }).should('be.visible');
      cy.findByRole('textbox', { name: 'Tekstfelt inni skjemagruppe inni skjemagruppe' }).should('be.visible');
      cy.findByRole('textbox', { name: 'Tekstfelt inni skjemagruppe inni container' }).should('be.visible');
      cy.findByRole('textbox', { name: 'Tekstfelt inni container inni skjemagruppe' }).should('be.visible');
      cy.clickNextStep();
      cy.get('[data-cy=error-summary]').should('exist');
      cy.get('[data-cy=error-summary]').within(() => {
        cy.findByRole('link', { name: 'Du må fylle ut: Tekstfelt inni skjemagruppe' }).should('exist');
        cy.findByRole('link', { name: 'Du må fylle ut: Tekstfelt inni skjemagruppe inni skjemagruppe' }).should(
          'exist',
        );
        cy.findByRole('link', { name: 'Du må fylle ut: Tekstfelt inni skjemagruppe inni container' }).should('exist');
        cy.findByRole('link', { name: 'Du må fylle ut: Tekstfelt inni container inni skjemagruppe' }).should('exist');
      });
    });
  });
});
