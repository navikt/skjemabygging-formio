import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';

const goToPostalInstructions = () => {
  cy.clickStart();
  cy.findByRole('textbox', { name: 'Tekstfelt' }).type('test');
  cy.clickNextStep();
  cy.clickDownloadInstructions();
};

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
    goToPostalInstructions();

    cy.wait('@getNavUnits');
    cy.findByRole('heading', { name: `1. ${TEXTS.grensesnitt.downloadApplication}` }).should('be.visible');
    cy.findByRole('heading', { name: `2. ${TEXTS.statiske.prepareLetterPage.printFormTitle}` }).should('be.visible');
    cy.findByText(TEXTS.statiske.prepareLetterPage.printFormDescription).should('be.visible');
    cy.findByRole('heading', { name: `3. ${TEXTS.statiske.prepareLetterPage.sendInPapirSectionTitle}` }).should(
      'be.visible',
    );
    cy.findByText(TEXTS.statiske.prepareLetterPage.SendInPapirSectionInstruction.trim()).should('be.visible');
    cy.findByRole('heading', { name: /Legg ved/ }).should('not.exist');
    cy.findByRole('region', { name: `1. ${TEXTS.grensesnitt.downloadApplication}` }).within(() => {
      cy.findByRole('button', { name: TEXTS.grensesnitt.downloadApplication })
        .should('be.visible')
        .should(($button) => {
          expect($button[0].getBoundingClientRect().width).to.be.lessThan(
            $button.parent()[0].getBoundingClientRect().width,
          );
        });
    });
    cy.findByRole('combobox', { name: TEXTS.statiske.navUnit.choose })
      .should('have.value', '')
      .should(($select) => {
        expect($select[0].getBoundingClientRect().width).to.be.at.most(350);
      });
    cy.findByRole('combobox', { name: TEXTS.statiske.navUnit.choose }).find('option').should('have.length', 2);

    cy.clickDownloadApplication();
    cy.findByText(TEXTS.statiske.prepareLetterPage.entityNotSelectedError).should('be.visible');

    cy.findByRole('combobox', { name: TEXTS.statiske.navUnit.choose }).select('001');
    cy.clickDownloadApplication();

    cy.wait('@downloadApplication').then((interception) => {
      expect(interception.request.body.enhetNummer).to.equal('001');
    });
  });

  it('shows a fetch error and prevents downloading without the required NAV units', () => {
    cy.intercept('GET', '/fyllut/api/enhetsliste', { statusCode: 500, body: {} }).as('failedNavUnits');

    goToPostalInstructions();

    cy.wait('@failedNavUnits');
    cy.findByText(TEXTS.statiske.prepareLetterPage.entityFetchError).should('be.visible');
    cy.findByRole('button', { name: TEXTS.grensesnitt.downloadApplication }).should('be.disabled');
    cy.findByRole('combobox', { name: TEXTS.statiske.navUnit.choose }).should('not.exist');
  });

  it('keeps the selected NAV unit when retrying a failed download', () => {
    let requests = 0;
    cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (request) => {
      requests += 1;
      request.reply(
        requests === 1
          ? { statusCode: 500, body: {} }
          : { statusCode: 200, body: '%PDF-1.4', headers: { 'content-type': 'application/pdf' } },
      );
    }).as('downloadRetry');
    goToPostalInstructions();
    cy.wait('@getNavUnits');
    cy.findByRole('combobox', { name: TEXTS.statiske.navUnit.choose }).select('001');

    cy.clickDownloadApplication();
    cy.wait('@downloadRetry');
    cy.findByText(TEXTS.statiske.prepareLetterPage.downloadError).should('be.visible');
    cy.findByRole('combobox', { name: TEXTS.statiske.navUnit.choose }).should('have.value', '001');

    cy.clickDownloadApplication();
    cy.wait('@downloadRetry').its('request.body.enhetNummer').should('equal', '001');
    cy.findByText(TEXTS.statiske.prepareLetterPage.downloadError).should('not.exist');
    cy.findByText(/Nedlastingen er ferdig/).should('be.visible');
  });
});
