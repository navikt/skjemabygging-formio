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

    cy.visit('/fyllut/coverpageperson?sub=paper');
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
    cy.findAllByRole('textbox', { name: 'Organisasjonsnummer' }).first().type('889640782');
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

  it('should create cover page with name and address for an unknown user', () => {
    cy.mocksUseRouteVariant('foersteside:success-tc08c');

    cy.visit('/fyllut/coverpageperson?sub=paper');
    cy.defaultWaits();

    cy.clickIntroPageConfirmation();
    cy.clickStart();
    cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
    cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
    cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/ }).within(() => {
      cy.findByRole('radio', { name: 'Nei' }).check();
    });
    cy.findByRole('textbox', { name: /Fødselsdato/ }).type('01.01.1980');
    cy.findByRole('group', { name: 'Bor du i Norge?' }).within(() => cy.findByLabelText('Ja').check());
    cy.findByRole('group', { name: 'Er kontaktadressen en vegadresse eller postboksadresse?' }).within(() =>
      cy.findByLabelText('Vegadresse').check(),
    );
    cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testveien 1');
    cy.findByRole('textbox', { name: 'Postnummer' }).type('1234');
    cy.findByRole('textbox', { name: 'Poststed' }).type('Plassen');
    cy.findByRole('textbox', { name: /^Gyldig fra/ }).type('18.02.2026');
    cy.clickNextStep();

    cy.intercept('POST', '/fyllut/api/documents/cover-page-and-application').as('downloadPdf');
    cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();
    cy.findByRole('button', { name: /Last ned skjema|Download form/ }).click();
    cy.wait('@downloadPdf').its('response.statusCode').should('equal', 200);

    cy.findByText(/Nedlastingen er ferdig/).shouldBeVisible();
  });
});
