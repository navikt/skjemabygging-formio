import { expect } from 'chai';

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
  introPage: {
    enabled: true,
    introduction: 'Velkomstmelding',
    importantInformation: {
      title: 'Viktig informasjon',
      description: 'Dette er viktig informasjon som brukeren må lese før de fortsetter.',
    },
    sections: {
      prerequisites: { title: 'Før du søker', description: 'Dette er hva du må ha klart før du starter' },
      dataTreatment: {
        title: 'Hvordan vi behandler personopplysninger',
        description: 'Dette er hvordan vi behandler dine data',
      },
      scope: { title: 'Hva skjemaet kan brukes til', description: 'Dette er hva skjemaet kan brukes til' },
      outOfScope: {
        title: 'Hva skjemaet IKKE skal brukes til',
        description: 'Dette er hva skjemaet ikke skal brukes til',
      },
      dataDisclosure: { title: 'Informasjon vi henter (om deg)', description: 'Dette er informasjon vi henter om deg' },
      automaticProcessing: {
        title: 'Automatisk saksbehandling',
        description: 'Dette er informasjon om automatisk saksbehandling',
      },
      optional: { title: 'Valgfri seksjon', description: 'Dette er en valgfri seksjon' },
    },
    selfDeclaration: 'scope3',
  },
};

describe('FormSettingsPage', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
    cy.intercept('GET', '/api/form-publications/*', { statusCode: 404 }).as('getPublishedForm');
    cy.intercept('GET', '/api/recipients', { fixture: 'recipients.json' }).as('getRecipients');
    cy.intercept('GET', '/api/translations', { fixture: 'globalTranslations.json' }).as('getTranslations');
    cy.intercept('GET', '/api/temakoder', { fixture: 'temakoder.json' }).as('getTemaKoder');
  });

  describe('Unpublished form', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/forms/cypresssettings', { fixture: 'getForm.json' }).as('getForm');
      cy.intercept('GET', '/api/forms/cypresssettings/translations', { body: [] }).as('getFormTranslations');
      cy.visit('forms/cypresssettings/intropage');
    });

    it('is saved with expected data', () => {
      cy.intercept('PUT', '/api/forms/cypresssettings', (req) => {
        expect(req.body.introPage.enabled).to.include(submitData.introPage.enabled);
        expect(req.body.title).to.include(submitData.title);
        expect(req.body.introPage.skjemanummer).to.include(submitData.skjemanummer);
        expect(req.body.introPage.descriptionOfSignatures).to.include(submitData.descriptionOfSignatures);
        expect(req.body.introPage.submissionTypes).to.deep.include.members(submitData.submissionTypes);
        expect(req.body.introPage.subsequentSubmissionTypes).to.deep.members(submitData.subsequentSubmissionTypes);
        expect(req.body.introPage.signatures[0].label).to.include(submitData.signatureLabel);
        expect(req.body.introPage.signatures[0].description).to.include(submitData.signatureDescription);
        req.reply(req.body);
      });

      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).should('exist');
      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).click();

      // cy.findByText('Velg hvilke seksjoner som skal vises på introsiden').within(() => {
      //   cy.findByRole('checkbox', {
      //     name: /Velkomstbeskjed\/introduksjon/i,
      //   }).should('be.checked');
      //
      //   cy.findByRole('checkbox', {
      //     name: /Før du søker\/sender\/fyller ut/i,
      //   }).should('be.checked');
      //
      //   cy.findByRole('checkbox', { name: /Hvordan vi behandler personopplysninger/ }).should('be.checked');
      //   cy.findByRole('checkbox', { name: /Lagring underveis/ }).should('be.checked');
      //   cy.findByRole('checkbox', { name: /Erklæring om å gi riktige opplysninger/ }).should('be.checked');
      // });

      cy.findByRole('textbox', {
        name: 'Velkomstmelding som hjelper bruker forstå at de bruker riktig skjema',
      }).type(submitData.introPage.introduction);

      cy.findByRole('radio', { name: 'Før du søker' }).check();

      cy.contains('button', 'Legg til ingress').click();
      cy.findByRole('textbox', {
        name: 'Ingress',
      }).type(submitData.introPage.sections.prerequisites.description);
      cy.contains('Legg til kulepunkt').click();
      cy.findByRole('textbox', {
        name: 'Kulepunkt',
      }).type('Et kulepunkt');

      cy.findByRole('radio', { name: 'behandle henvendelsen din' }).check();

      // cy.contains('Lagre').click();
      // cy.get('[aria-live="polite"]').should('contain.text', `Lagret skjema ${submitData.title}`);
    });
  });
});
