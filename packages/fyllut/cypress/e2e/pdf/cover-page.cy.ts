import { expect } from 'chai';

describe('Cover page', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.mocksRestoreRouteVariants();
  });

  it('should create cover page', () => {
    cy.mocksUseRouteVariant('foersteside:success-tc08a');

    cy.visit('/fyllut/components?sub=paper');
    cy.defaultWaits();

    cy.clickIntroPageConfirmation();
    cy.clickStart();
    cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/ }).within(() => {
      cy.findByRole('radio', { name: 'Ja' }).check();
    });
    cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).type('20905995783');
    cy.clickNextStep();

    cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (req) => {
      req.on('response', (res) => {
        expect(res.statusCode).to.eq(200);
      });
    }).as('downloadPdf');

    cy.clickShowAllSteps();
    cy.findByRole('link', { name: /Oppsummering|Summary/ }).click();
    cy.findByRole('heading', { name: /Oppsummering|Summary/ }).shouldBeVisible();
    cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();
    cy.findByRole('button', { name: /Last ned skjema|Download form/ }).click();
    cy.wait('@downloadPdf');

    cy.findByText(/Nedlastingen er ferdig/).shouldBeVisible();
  });

  it('should create cover page with organization number as bruker', () => {
    cy.mocksUseRouteVariant('foersteside:success-organizationnumber');

    cy.visit('/fyllut/coverpageorganizationnumber?sub=paper');
    cy.defaultWaits();

    cy.clickIntroPageConfirmation();
    cy.clickNextStep();

    cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).type('889640782');
    cy.findByRole('textbox', { name: 'Organisasjonsnummer med beskrivelse' }).type('974652277');
    cy.clickNextStep();

    cy.findByRole('textbox', { name: 'Organisasjonsnummer påkrevd' }).type('889640782');
    cy.findByRole('textbox', { name: 'Organisasjonsnummer ikke påkrevd (valgfritt)' }).type('974652277');
    cy.findByRole('textbox', { name: 'Organisasjonsnummer ugyldig format (valgfritt)' }).type('889640782');
    cy.findByRole('textbox', { name: 'Organisasjonsnummer egendefinert (valgfritt)' }).type('889640782');
    cy.clickNextStep();

    cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application', (req) => {
      req.on('response', (res) => {
        expect(res.statusCode).to.eq(200);
      });
    }).as('downloadPdf');

    cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();
    cy.findByRole('button', { name: /Last ned skjema|Download form/ }).click();
    cy.wait('@downloadPdf');

    cy.findByText(/Nedlastingen er ferdig/).shouldBeVisible();
  });
});
