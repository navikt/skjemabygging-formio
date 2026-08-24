import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';

describe('NAV unit selection', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.intercept('GET', '/fyllut/api/enhetsliste', {
      body: [
        { enhetNr: '002', navn: 'NAV Ytelse', type: 'YTA' },
        { enhetNr: '001', navn: 'NAV Arbeid', type: 'ALS' },
      ],
    }).as('getNavUnits');
    cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application').as('downloadApplication');
    cy.visit('/fyllut/navunitselection?sub=paper');
    cy.defaultWaits();
  });

  it('requires a filtered NAV unit and includes it in the cover-page request', () => {
    cy.clickStart();
    cy.findByRole('textbox', { name: 'Tekstfelt' }).type('test');
    cy.clickNextStep();
    cy.clickDownloadInstructions();

    cy.wait('@getNavUnits');
    cy.findByRole('combobox', { name: TEXTS.statiske.navUnit.choose }).should('have.value', '');
    cy.findByRole('combobox', { name: TEXTS.statiske.navUnit.choose }).find('option').should('have.length', 2);

    cy.clickDownloadApplication();
    cy.findByText(TEXTS.statiske.prepareLetterPage.entityNotSelectedError).should('be.visible');

    cy.findByRole('combobox', { name: TEXTS.statiske.navUnit.choose }).select('001');
    cy.clickDownloadApplication();

    cy.wait('@downloadApplication').then((interception) => {
      expect(interception.request.body.enhetNummer).to.equal('001');
    });
  });
});
