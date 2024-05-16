import { expect } from 'chai';

const _submitData = {
  title: 'Cypress test for settings page',
  skjemanummer: 'cypress-settings',
  tema: 'BIL',
  downloadPdfButtonText: 'DownloadPDFBtnTest',
  innsending: 'PAPIR_OG_DIGITAL',
  ettersending: 'PAPIR_OG_DIGITAL',
  descriptionOfSignatures: 'Test Instructions',
  signatureLabel: 'Test account',
  signatureDescription: 'Instruction from test...',
  lockedFormReason: 'Test reason for locking',
  isLockedForm: true,
};

describe('FormSettingsPage', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
    cy.intercept('GET', '/api/forms/cypresssettings', {
      fixture: 'getForm.json',
    }).as('getForm');
    cy.intercept('GET', '/api/published-forms/*', { statusCode: 404 }).as('getPublishedForm');
    cy.intercept('GET', '/mottaksadresse/submission', { fixture: 'mottakadresse.json' }).as('getMottakAdresse');
    cy.intercept('GET', /language\/submission?.*/, { fixture: 'globalTranslations.json' }).as('getTranslations');
    cy.intercept('GET', '/api/temakoder', { fixture: 'temakoder.json' }).as('getTemaKoder');
    cy.intercept('GET', '/api/countries?*', { fixture: 'getCountriesLangNb.json' }).as('getCountriesLangNb');
    cy.visit('forms/cypresssettings/settings');
  });

  it('Fills all elements in settings page', () => {
    cy.intercept('PUT', '/api/forms/cypresssettings', (req) => {
      expect(req.body.properties.tema).to.include(_submitData.tema);
      expect(req.body.title).to.include(_submitData.title);
      expect(req.body.properties.isLockedForm).to.equal(_submitData.isLockedForm);
      expect(req.body.properties.lockedFormReason).to.equal(_submitData.lockedFormReason);
      expect(req.body.properties.skjemanummer).to.include(_submitData.skjemanummer);
      expect(req.body.properties.descriptionOfSignatures).to.include(_submitData.descriptionOfSignatures);
      expect(req.body.properties.innsending).to.include(_submitData.innsending);
      expect(req.body.properties.ettersending).to.include(_submitData.ettersending);
      expect(req.body.properties.signatures[0].label).to.include(_submitData.signatureLabel);
      expect(req.body.properties.signatures[0].description).to.include(_submitData.signatureDescription);
      req.reply(req.body);
    }).as('compareRequestData');

    cy.findByRole('checkbox', { name: 'Lås for redigering' }).check();

    cy.findByRole('textbox', { name: 'Beskriv hvorfor skjemaet er låst' }).focus();
    cy.findByRole('textbox', { name: 'Beskriv hvorfor skjemaet er låst' }).clear();
    cy.findByRole('textbox', { name: 'Beskriv hvorfor skjemaet er låst' }).type(_submitData.lockedFormReason);

    cy.findByRole('textbox', { name: 'Tittel' }).focus();
    cy.findByRole('textbox', { name: 'Tittel' }).clear();
    cy.findByRole('textbox', { name: 'Tittel' }).type(_submitData.title);

    cy.findByRole('combobox', { name: 'Tema' }).select(_submitData.tema);

    cy.findByRole('textbox', { name: 'Tekst på knapp for nedlasting av pdf' }).focus();
    cy.findByRole('textbox', { name: 'Tekst på knapp for nedlasting av pdf' }).clear();
    cy.findByRole('textbox', { name: 'Tekst på knapp for nedlasting av pdf' }).type(_submitData.downloadPdfButtonText);

    cy.findByRole('combobox', { name: 'Innsending' }).select(_submitData.innsending);
    cy.findByRole('combobox', { name: 'Ettersending' }).select(_submitData.ettersending);

    cy.findByRole('textbox', { name: 'Generelle instruksjoner (valgfritt)' }).focus();
    cy.findByRole('textbox', { name: 'Generelle instruksjoner (valgfritt)' }).clear();
    cy.findByRole('textbox', { name: 'Generelle instruksjoner (valgfritt)' }).type(_submitData.descriptionOfSignatures);

    cy.findByRole('textbox', { name: 'Hvem skal signere?' }).focus();
    cy.findByRole('textbox', { name: 'Hvem skal signere?' }).clear();
    cy.findByRole('textbox', { name: 'Hvem skal signere?' }).type(_submitData.signatureLabel);

    cy.findByRole('textbox', { name: 'Instruksjoner til den som signerer' }).focus();
    cy.findByRole('textbox', { name: 'Instruksjoner til den som signerer' }).clear();
    cy.findByRole('textbox', { name: 'Instruksjoner til den som signerer' }).type(_submitData.signatureDescription);

    cy.contains('Lagre').click();
    cy.get('[aria-live="polite"]').should('contain.text', `Lagret skjema ${_submitData.title}`);
  });
});
