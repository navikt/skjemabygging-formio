import { expect } from 'chai';
import * as form from '../fixtures/getForm.json';

const submitData = {
  title: 'Cypress test for settings page',
  skjemanummer: 'cypress-settings',
  tema: 'BIL',
  downloadPdfButtonText: 'DownloadPDFBtnTest',
  submissionTypes: ['PAPER', 'DIGITAL'],
  subsequentSubmissionTypes: ['PAPER', 'DIGITAL'],
  descriptionOfSignatures: 'Test Instructions',
  signatureLabel: 'Test account',
  signatureDescription: 'Instruction from test...',
  isLockedForm: true,
  mellomlagringDurationDays: '10',
};

describe('FormSettingsPage', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
    cy.intercept('GET', '/api/forms/cypresssettings', {
      fixture: 'getForm.json',
    }).as('getForm');
    cy.intercept('GET', '/api/forms/cypresssettings/translations', { body: [] }).as('getFormTranslations');
    cy.intercept('GET', '/api/form-publications/*', { statusCode: 404 }).as('getPublishedForm');
    cy.intercept('GET', '/api/recipients', { fixture: 'recipients.json' }).as('getRecipients');
    cy.intercept('GET', '/api/translations', { fixture: 'globalTranslations.json' }).as('getTranslations');
    cy.intercept('GET', '/api/temakoder', { fixture: 'temakoder.json' }).as('getTemaKoder');
    cy.visit('forms/cypresssettings/settings');
  });

  it('Locks form', () => {
    const lockedFormReason = 'Test reason for locking';
    cy.intercept('POST', '/api/forms/cypresssettings/lock', (req) => {
      expect(req.body.reason).to.equal(lockedFormReason);

      req.reply({
        ...form,
        properties: { ...form.properties, ...req.body },
        lock: { reason: lockedFormReason, createdAt: '2025-01-19T13:39:47.380Z', createdBy: 'testuser' },
      });
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
      expect(req.body.properties.submissionTypes).to.deep.include.members(submitData.submissionTypes);
      expect(req.body.properties.subsequentSubmissionTypes).to.deep.members(submitData.subsequentSubmissionTypes);
      expect(req.body.properties.signatures[0].label).to.include(submitData.signatureLabel);
      expect(req.body.properties.signatures[0].description).to.include(submitData.signatureDescription);
      req.reply(req.body);
    });

    cy.findByRole('textbox', { name: 'Tittel' }).focus();
    cy.findByRole('textbox', { name: 'Tittel' }).clear();
    cy.findByRole('textbox', { name: 'Tittel' }).type(submitData.title);

    cy.findByRole('combobox', { name: 'Tema' }).select(submitData.tema);

    cy.findByRole('textbox', { name: 'Tekst på knapp for nedlasting av pdf' }).focus();
    cy.findByRole('textbox', { name: 'Tekst på knapp for nedlasting av pdf' }).clear();
    cy.findByRole('textbox', { name: 'Tekst på knapp for nedlasting av pdf' }).type(submitData.downloadPdfButtonText);

    submitData.submissionTypes.forEach((type) => {
      cy.get(`input[type="checkbox"][value="${type}"]`).check({ force: true });
    });

    submitData.subsequentSubmissionTypes.forEach((type) => {
      cy.get(`input[type="checkbox"][value="${type}"]`).check({ force: true });
    });

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
