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
  isLockedForm: false,
  mellomlagringDurationDays: '10',
  introPage: {
    enabled: true,
    introduction: 'Velkomstmelding',
    importantInformation: {
      title: 'Viktig informasjon',
      description: 'Dette er viktig informasjon som brukeren må lese før de fortsetter.',
    },
    sections: {
      prerequisites: {
        title: 'scope1',
        description: 'Dette er hva du må ha klart før du starter',
        bulletPoints: ['Et kulepunkt for informasjon om utfylling av skjemaet'],
      },
      dataTreatment: {
        title: 'Hvordan vi behandler personopplysninger',
        description: 'Dette er hvordan vi behandler dine data',
        bulletPoints: ['Et kulepunkt for hvordan vi behandler personopplysninger'],
      },
      scope: {
        title: 'Hva skjemaet kan brukes til',
        description: 'Dette er hva skjemaet kan brukes til',
        bulletPoints: ['Kulepunkt for hva skjemaet kan brukes til...'],
      },
      outOfScope: {
        title: 'Hva skjemaet IKKE skal brukes til',
        description: 'Dette er hva skjemaet ikke skal brukes til',
        bulletPoints: ['Kulepunkt for ikke bruk til...'],
      },
      dataDisclosure: {
        title: 'Informasjon vi henter (om deg)',
        bulletPoints: ['Kulepunkt for informasjon vi henter om deg'],
      },
      automaticProcessing: {
        title: 'Automatisk saksbehandling',
        description: 'Dette er informasjon om automatisk saksbehandling',
        bulletPoints: ['Kulepunkt for automatisk saksbehandling'],
      },
      optional: {
        title: 'Valgfri seksjon',
        description: 'Dette er en valgfri seksjon',
        bulletPoints: ['Kulepunkt for valgfritt element'],
      },
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

    it('required fields are saved with expected data', () => {
      cy.intercept('PUT', '/api/forms/cypresssettings', (req) => {
        expect(req.body.title).to.include(submitData.title);
        expect(req.body.skjemanummer).to.include(submitData.skjemanummer);
        expect(req.body.introPage.enabled).to.equal(submitData.introPage.enabled);
        expect(req.body.introPage.introduction).to.include(submitData.introPage.introduction);
        expect(req.body.introPage.sections.prerequisites).to.deep.equal(submitData.introPage.sections.prerequisites);
        expect(req.body.introPage.selfDeclaration).to.include(submitData.introPage.selfDeclaration);
        req.reply(req.body);
      });

      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).should('exist');
      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).click();

      ['introduction', 'prerequisites', 'dataTreatment', 'dataStorage', 'selfDeclaration'].forEach((value) => {
        cy.get(`input[type="checkbox"][value="${value}"]`).should('be.checked');
      });

      cy.findByRole('checkbox', { name: 'Viktig informasjon' }).click();
      cy.findByRole('checkbox', { name: 'Beskrivelse av hva skjemaet kan brukes til' }).click();
      cy.findByRole('checkbox', { name: 'Avklar hva skjemaet IKKE skal brukes til' }).click();
      cy.findByRole('checkbox', { name: 'Informasjon vi henter (om deg)' }).click();
      cy.findByRole('checkbox', { name: 'Automatisk saksbehandling' }).click();
      cy.findByRole('checkbox', { name: 'Valgfri seksjon' }).click();

      cy.contains('Velkomstmelding')
        .closest('section')
        .within(() => {
          cy.findByRole('textbox', {
            name: 'Velkomstmelding som hjelper bruker forstå at de bruker riktig skjema',
          }).type(submitData.introPage.introduction);
        });

      // TODO fyll ut alle feltene og juster indeks i eq() for å matche riktig seksjon
      cy.contains('Viktig informasjon')
        .closest('section')
        .then(($section) => {
          cy.wrap($section).within(() => {
            cy.contains('button', 'Legg til overskrift').click();
            cy.findAllByRole('textbox', {
              name: 'Overskrift',
            })
              .eq(0)
              .type(submitData.introPage.importantInformation.title);
            cy.findByRole('textbox', {
              name: 'Brødtekst',
            }).type(submitData.introPage.importantInformation.description);
          });
        });

      cy.get('[data-testid="scope"]').within(() => {
        cy.findByRole('radio', { name: 'Her kan du søke om' }).check();
        cy.contains('button', 'Legg til ingress').click();
        cy.findByRole('textbox', { name: 'Ingress' }).type(submitData.introPage.sections.scope.description);
        cy.contains('Legg til punktliste').click();
        cy.findByRole('textbox', { name: 'Kulepunkt' }).type(submitData.introPage.sections.scope.bulletPoints[0]);
      });

      cy.get('[data-testid="out-of-scope"]').within(() => {
        cy.findByRole('radio', { name: 'Her kan du ikke' }).check();
        cy.contains('button', 'Legg til ingress').click();
        cy.findByRole('textbox', { name: 'Ingress' }).type(submitData.introPage.sections.outOfScope.description);
        cy.contains('Legg til punktliste').click();
        cy.findByRole('textbox', { name: 'Kulepunkt' }).type(submitData.introPage.sections.outOfScope.bulletPoints[0]);
      });

      cy.get('[data-testid="prerequisites"]').within(() => {
        cy.findByRole('radio', { name: 'Før du søker' }).check();
        cy.contains('button', 'Legg til ingress').click();
        cy.findByRole('textbox', { name: 'Ingress' }).type(submitData.introPage.sections.prerequisites.description);
        cy.contains('Legg til kulepunkt').click();
        cy.findByRole('textbox', { name: 'Kulepunkt' }).type(
          submitData.introPage.sections.prerequisites.bulletPoints[0],
        );
      });

      cy.get('[data-testid="dataTreatment"]').within(() => {
        cy.contains('Legg til ingress').click();
        cy.contains('Legg til punktliste').click();
        cy.findByRole('textbox', { name: 'Ingress' }).type(submitData.introPage.sections.dataTreatment.description);
        cy.findByRole('textbox', { name: 'Kulepunkt' }).type(
          submitData.introPage.sections.dataTreatment.bulletPoints[0],
        );
      });

      cy.get('[data-testid="dataDisclosure"]').within(() => {
        cy.findByRole('radio', { name: 'Informasjon vi henter' }).check();
        cy.contains('Legg til kulepunkt').click();
        cy.findByRole('textbox', { name: 'Kulepunkt' }).type(
          submitData.introPage.sections.dataDisclosure.bulletPoints[0],
        );
      });

      cy.get('[data-testid="automaticProcessing"]').within(() => {
        cy.contains('Legg til ingress').click();
        cy.findByRole('textbox', { name: 'Ingress' }).type(
          submitData.introPage.sections.automaticProcessing.description,
        );
        cy.contains('Legg til punktliste').click();
        cy.findByRole('textbox', { name: 'Kulepunkt' }).type(
          submitData.introPage.sections.automaticProcessing.bulletPoints[0],
        );
      });

      cy.get('[data-testid="optional"]').within(() => {
        cy.findByRole('textbox', { name: 'Overskrift' }).type(submitData.introPage.sections.optional.title);
        cy.contains('Legg til ingress').click();
        cy.findByRole('textbox', { name: 'Ingress' }).type(submitData.introPage.sections.optional.description);
        cy.contains('Legg til punktliste').click();
        cy.findByRole('textbox', { name: 'Kulepunkt' }).type(submitData.introPage.sections.optional.bulletPoints[0]);
      });

      cy.contains('Erklæring')
        .closest('section')
        .then(($section) => {
          cy.wrap($section).within(() => {
            cy.wrap($section).within(() => {
              cy.findByRole('radio', { name: 'behandle saken din' }).check();
            });
          });
        });

      cy.contains('Lagre').click();
      cy.get('[aria-live="polite"]').should('contain.text', `Lagret skjema ${submitData.title}`);
    });
  });
});
