import { expect } from 'chai';

const submitData = {
  title: 'Cypress test for settings page',
  skjemanummer: 'cypress-settings',
  tema: 'BIL',
  downloadPdfButtonText: 'DownloadPDFBtnTest',
  innsending: 'PAPIR_OG_DIGITAL',
  ettersending: 'PAPIR_OG_DIGITAL',
  descriptionOfSignatures: 'Test Instructions',
  signatureLabel: 'Test account',
  signatureDescription: 'Instruction from test...',
  isLockedForm: true,
  mellomlagringDurationDays: '10',
};

describe('FormSettingsPage', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/temakoder').as('getTemaKoder');
    cy.visit('forms/cypresssettings/settings');
  });

  it('Locks form', () => {
    const lockedFormReason = 'Test reason for locking';
    cy.intercept('PUT', '/api/forms/cypresssettings/form-settings', (req) => {
      expect(req.body).to.deep.equal({ isLockedForm: true, lockedFormReason });
      req.headers['Bygger-Formio-Token'] = '12345';
    }).as('configUpdate');

    cy.findByRole('button', { name: 'Lås for redigering' }).click();

    cy.findByRole('textbox', { name: 'Beskriv hvorfor skjemaet er låst' }).focus();
    cy.findByRole('textbox', { name: 'Beskriv hvorfor skjemaet er låst' }).clear();
    cy.findByRole('textbox', { name: 'Beskriv hvorfor skjemaet er låst' }).type(lockedFormReason);

    cy.findAllByRole('button', { name: 'Lås for redigering' }).eq(1).should('be.visible');
    cy.findAllByRole('button', { name: 'Lås for redigering' }).eq(1).click();
    cy.findByRole('heading', { name: 'Lås skjemaet for redigering' }).should('not.exist');
    cy.get('[aria-live="polite"]').should('contain.text', `Skjemaet ble låst for redigering`);

    cy.findByRole('button', { name: 'Lås opp skjemaet' }).should('be.visible');
    cy.findByRole('button', { name: 'Skjemaet er låst Lagre' }).should('be.visible');
    cy.findByRole('button', { name: 'Skjemaet er låst Lagre' }).click();
    cy.findByRole('heading', { name: 'Skjemaet er låst for redigering' }).should('be.visible');
  });

  it('Fills all elements in settings page', () => {
    cy.intercept('PUT', '/api/forms/cypresssettings', (req) => {
      expect(req.body.properties.tema).to.include(submitData.tema);
      expect(req.body.title).to.include(submitData.title);
      expect(req.body.properties.skjemanummer).to.include(submitData.skjemanummer);
      expect(req.body.properties.descriptionOfSignatures).to.include(submitData.descriptionOfSignatures);
      expect(req.body.properties.innsending).to.include(submitData.innsending);
      expect(req.body.properties.ettersending).to.include(submitData.ettersending);
      expect(req.body.properties.signatures[0].label).to.include(submitData.signatureLabel);
      expect(req.body.properties.signatures[0].description).to.include(submitData.signatureDescription);
      req.headers['Bygger-Formio-Token'] = '12345';
    });

    cy.findByRole('textbox', { name: 'Tittel' }).focus();
    cy.findByRole('textbox', { name: 'Tittel' }).clear();
    cy.findByRole('textbox', { name: 'Tittel' }).type(submitData.title);

    cy.findByRole('combobox', { name: 'Tema' }).select(submitData.tema);

    cy.findByRole('textbox', { name: 'Tekst på knapp for nedlasting av pdf' }).focus();
    cy.findByRole('textbox', { name: 'Tekst på knapp for nedlasting av pdf' }).clear();
    cy.findByRole('textbox', { name: 'Tekst på knapp for nedlasting av pdf' }).type(submitData.downloadPdfButtonText);

    cy.findByRole('combobox', { name: 'Innsending' }).select(submitData.innsending);
    cy.findByRole('combobox', { name: 'Ettersending' }).select(submitData.ettersending);

    cy.findByRole('spinbutton', { name: 'Mellomlagringstid (dager)' }).focus();
    cy.findByRole('spinbutton', { name: 'Mellomlagringstid (dager)' }).clear();
    cy.findByRole('spinbutton', { name: 'Mellomlagringstid (dager)' }).type(submitData.mellomlagringDurationDays);

    cy.findByRole('textbox', { name: 'Generelle instruksjoner (valgfritt)' }).focus();
    cy.findByRole('textbox', { name: 'Generelle instruksjoner (valgfritt)' }).clear();
    cy.findByRole('textbox', { name: 'Generelle instruksjoner (valgfritt)' }).type(submitData.descriptionOfSignatures);

    cy.findByRole('textbox', { name: 'Hvem skal signere?' }).focus();
    cy.findByRole('textbox', { name: 'Hvem skal signere?' }).clear();
    cy.findByRole('textbox', { name: 'Hvem skal signere?' }).type(submitData.signatureLabel);

    cy.findByRole('textbox', { name: 'Instruksjoner til den som signerer' }).focus();
    cy.findByRole('textbox', { name: 'Instruksjoner til den som signerer' }).clear();
    cy.findByRole('textbox', { name: 'Instruksjoner til den som signerer' }).type(submitData.signatureDescription);

    cy.contains('Lagre').click();
    cy.get('[aria-live="polite"]').should('contain.text', `Lagret skjema ${submitData.title}`);
  });
});
