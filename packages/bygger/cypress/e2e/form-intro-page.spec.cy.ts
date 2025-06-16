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
        title: 'introPage.prerequisites.title.alt1',
        description: 'Dette er hva du må ha klart før du starter',
        bulletPoints: ['Et kulepunkt for informasjon om utfylling av skjemaet'],
      },
      dataTreatment: {
        description: 'Dette er hvordan vi behandler dine data',
        bulletPoints: [
          'Et kulepunkt for hvordan vi behandler personopplysninger',
          'Enda et kulepunkt for hvordan vi behandler personopplysninger',
        ],
      },
      scope: {
        title: 'introPage.scope.title.alt1',
        description: 'Dette er hva skjemaet kan brukes til',
        bulletPoints: [
          'Kulepunkt for hva skjemaet kan brukes til...',
          'Enda et kulepunkt for hva skjemaet kan brukes til...',
        ],
      },
      outOfScope: {
        title: 'introPage.outOfScope.title.alt3',
        description: 'Dette er hva skjemaet ikke skal brukes til',
        bulletPoints: ['Kulepunkt for ikke bruk til...', 'Enda et kulepunkt for ikke bruk til...'],
      },
      dataDisclosure: {
        title: 'introPage.dataDisclosure.title.alt2',
        bulletPoints: ['Kulepunkt for informasjon vi henter om deg'],
      },
      automaticProcessing: {
        description: 'Dette er informasjon om automatisk saksbehandling',
        bulletPoints: ['Kulepunkt for automatisk saksbehandling', 'Enda et kulepunkt for automatisk saksbehandling'],
      },
      optional: {
        title: 'Valgfri seksjon',
        description: 'Dette er en valgfri seksjon',
        bulletPoints: ['Kulepunkt for valgfritt element', 'Enda et kulepunkt for valgfritt element'],
      },
    },
    selfDeclaration: 'introPage.selfDeclaration.description.alt3',
  },
};

function checkAllOptionalFields() {
  const checkboxes = [
    'Viktig informasjon',
    'Beskrivelse av hva skjemaet kan brukes til',
    'Avklar hva skjemaet IKKE skal brukes til',
    'Informasjon vi henter (om deg)',
    'Automatisk saksbehandling',
    'Valgfri seksjon',
  ];

  checkboxes.forEach((name) => {
    cy.findByRole('checkbox', { name }).click();
  });
}

describe('FormSettingsPage', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
    cy.intercept('GET', '/api/form-publications/*', { statusCode: 404 }).as('getPublishedForm');
    cy.intercept('GET', '/api/recipients', { fixture: 'recipients.json' }).as('getRecipients');
    cy.intercept('GET', '/api/translations', { fixture: 'globalTranslations.json' }).as('getTranslations');
    cy.intercept('GET', '/api/temakoder', { fixture: 'temakoder.json' }).as('getTemaKoder');
  });

  describe('Render components', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/forms/cypresssettings', { fixture: 'getForm.json' }).as('getForm');
      cy.intercept('GET', '/api/forms/cypresssettings/translations', { body: [] }).as('getFormTranslations');
      cy.visit('forms/cypresssettings/intropage');
    });

    it('all fields are saved with expected data', () => {
      cy.intercept('PUT', '/api/forms/cypresssettings', (req) => {
        expect(req.body.title).to.include(submitData.title);
        expect(req.body.skjemanummer).to.include(submitData.skjemanummer);
        expect(req.body.introPage.enabled).to.equal(submitData.introPage.enabled);
        expect(req.body.introPage.introduction).to.include(submitData.introPage.introduction);
        expect(req.body.introPage.sections.prerequisites).to.deep.equal(submitData.introPage.sections.prerequisites);
        expect(req.body.introPage.sections.automaticProcessing).to.deep.equal(
          submitData.introPage.sections.automaticProcessing,
        );
        expect(req.body.introPage.sections.dataTreatment).to.deep.equal(submitData.introPage.sections.dataTreatment);
        expect(req.body.introPage.sections.dataDisclosure).to.deep.equal(submitData.introPage.sections.dataDisclosure);
        expect(req.body.introPage.sections.scope).to.deep.equal(submitData.introPage.sections.scope);
        expect(req.body.introPage.sections.outOfScope).to.deep.equal(submitData.introPage.sections.outOfScope);
        expect(req.body.introPage.sections.optional).to.deep.equal(submitData.introPage.sections.optional);
        expect(req.body.introPage.selfDeclaration).to.include(submitData.introPage.selfDeclaration);
        req.reply(req.body);
      });

      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).should('exist');
      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).click();

      ['introduction', 'prerequisites', 'dataTreatment', 'dataStorage', 'selfDeclaration'].forEach((value) => {
        cy.get(`input[type="checkbox"][value="${value}"]`).should('be.checked');
      });

      checkAllOptionalFields();

      cy.contains('Velkomstmelding')
        .closest('section')
        .within(() => {
          cy.findByRole('textbox', {
            name: 'Velkomstmelding som hjelper bruker forstå at de bruker riktig skjema',
          }).type(submitData.introPage.introduction);
        });

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
        cy.contains('Legg til kulepunkt').click();
        cy.findAllByRole('textbox', { name: 'Kulepunkt' })
          .eq(1)
          .type(submitData.introPage.sections.scope.bulletPoints[1]);
      });

      cy.get('[data-testid="out-of-scope"]').within(() => {
        cy.findByRole('radio', { name: 'Her kan du ikke' }).check();
        cy.contains('button', 'Legg til ingress').click();
        cy.findByRole('textbox', { name: 'Ingress' }).type(submitData.introPage.sections.outOfScope.description);
        cy.contains('Legg til punktliste').click();
        cy.findByRole('textbox', { name: 'Kulepunkt' }).type(submitData.introPage.sections.outOfScope.bulletPoints[0]);
        cy.contains('Legg til kulepunkt').click();
        cy.findAllByRole('textbox', { name: 'Kulepunkt' })
          .eq(1)
          .type(submitData.introPage.sections.outOfScope.bulletPoints[1]);
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

      cy.get('[data-testid="dataDisclosure"]').within(() => {
        cy.findByRole('radio', { name: 'Informasjon vi henter' }).check();
        cy.contains('Legg til kulepunkt').click();
        cy.findByRole('textbox', { name: 'Kulepunkt' }).type(
          submitData.introPage.sections.dataDisclosure.bulletPoints[0],
        );
      });

      cy.get('[data-testid="dataTreatment"]').within(() => {
        cy.contains('Legg til ingress').click();
        cy.contains('Legg til punktliste').click();
        cy.findByRole('textbox', { name: 'Ingress' }).type(submitData.introPage.sections.dataTreatment.description);
        cy.findByRole('textbox', { name: 'Kulepunkt' }).type(
          submitData.introPage.sections.dataTreatment.bulletPoints[0],
        );
        cy.contains('Legg til kulepunkt').click();
        cy.findAllByRole('textbox', { name: 'Kulepunkt' })
          .eq(1)
          .type(submitData.introPage.sections.dataTreatment.bulletPoints[1]);
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
        cy.contains('Legg til kulepunkt').click();
        cy.findAllByRole('textbox', { name: 'Kulepunkt' })
          .eq(1)
          .type(submitData.introPage.sections.automaticProcessing.bulletPoints[1]);
      });

      cy.get('[data-testid="optional"]').within(() => {
        cy.findByRole('textbox', { name: 'Overskrift' }).type(submitData.introPage.sections.optional.title);
        cy.contains('Legg til ingress').click();
        cy.findByRole('textbox', { name: 'Ingress' }).type(submitData.introPage.sections.optional.description);
        cy.contains('Legg til punktliste').click();
        cy.findByRole('textbox', { name: 'Kulepunkt' }).type(submitData.introPage.sections.optional.bulletPoints[0]);
        cy.contains('Legg til kulepunkt').click();
        cy.findAllByRole('textbox', { name: 'Kulepunkt' })
          .eq(1)
          .type(submitData.introPage.sections.optional.bulletPoints[1]);
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

    it('all required fields are saved with expected data', () => {
      cy.intercept('PUT', '/api/forms/cypresssettings', (req) => {
        expect(req.body.introPage.enabled).to.equal(submitData.introPage.enabled);
        expect(req.body.introPage.introduction).to.include(submitData.introPage.introduction);
        expect(req.body.introPage.sections.prerequisites).to.deep.equal(submitData.introPage.sections.prerequisites);
        expect(req.body.introPage.sections.dataTreatment).to.deep.equal(submitData.introPage.sections.dataTreatment);
        expect(req.body.introPage.selfDeclaration).to.include(submitData.introPage.selfDeclaration);
        req.reply(req.body);
      });

      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).should('exist');
      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).click();

      ['introduction', 'prerequisites', 'dataTreatment', 'dataStorage', 'selfDeclaration'].forEach((value) => {
        cy.get(`input[type="checkbox"][value="${value}"]`).should('be.checked');
      });

      cy.contains('Velkomstmelding')
        .closest('section')
        .within(() => {
          cy.findByRole('textbox', {
            name: 'Velkomstmelding som hjelper bruker forstå at de bruker riktig skjema',
          }).type(submitData.introPage.introduction);
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
        cy.contains('Legg til kulepunkt').click();
        cy.findAllByRole('textbox', { name: 'Kulepunkt' })
          .eq(1)
          .type(submitData.introPage.sections.dataTreatment.bulletPoints[1]);
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

  describe('Validation', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/forms/cypresssettings', { fixture: 'getForm.json' }).as('getForm');
      cy.intercept('GET', '/api/forms/cypresssettings/translations', { body: [] }).as('getFormTranslations');
      cy.visit('forms/cypresssettings/intropage');
    });

    it('all required fields display error message when not filled out and enabled is true', () => {
      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).should('exist');
      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).click();

      cy.contains('Lagre').click();
      cy.get('[aria-live="polite"]').should('not.contain.text', `Lagret skjema ${submitData.title}`);

      cy.contains('Velkomstmelding')
        .closest('section')
        .within(() => {
          cy.contains('Velkomstmelding må fylles ut').should('exist');
        });

      cy.contains('Informasjon om utfylling av skjemaet')
        .closest('section')
        .within(() => {
          cy.contains('Seksjonen må ha en ingress eller kulepunkter').should('exist');
        });

      cy.contains('Hvordan vi behandler personopplysninger')
        .closest('section')
        .within(() => {
          cy.contains('Seksjonen må ha en ingress eller kulepunkter').should('exist');
        });

      cy.contains('Erklæring')
        .closest('section')
        .within(() => {
          cy.contains('Egenerklæring må fylles ut').should('exist');
        });
    });

    it('optional fields display does not display error message on save when enabled is false', () => {
      cy.intercept('PUT', '/api/forms/cypresssettings', (req) => {
        req.reply(req.body);
      });

      checkAllOptionalFields();

      cy.contains('Lagre').click();
      cy.get('[aria-live="polite"]').should('contain.text', `Lagret skjema ${submitData.title}`);

      cy.contains('Velkomstmelding må fylles ut').should('not.exist');
      cy.contains('Overskrift må fylles ut').should('not.exist');
      cy.contains('Seksjonen må ha en ingress eller kulepunkter').should('not.exist');
      cy.contains('Egenerklæring må fylles ut').should('not.exist');
    });

    it('optional fields display error message when not filled out', () => {
      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).should('exist');
      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).click();

      checkAllOptionalFields();
      cy.contains('Lagre').click();
      cy.get('[aria-live="polite"]').should('not.contain.text', `Lagret skjema ${submitData.title}`);

      cy.contains('Velkomstmelding')
        .closest('section')
        .within(() => {
          cy.contains('Velkomstmelding må fylles ut').should('exist');
        });

      cy.contains('Viktig informasjon')
        .closest('section')
        .within(() => {
          cy.contains('Brødtekst må fylles ut').should('exist');
        });

      cy.contains('Beskriv hva skjemaet kan brukes til')
        .closest('section')
        .within(() => {
          cy.contains('Overskrift må fylles ut').should('exist');
          cy.contains('Seksjonen må ha en ingress eller kulepunkter').should('exist');
        });

      cy.contains('Avklar hva skjemaet IKKE skal brukes til')
        .closest('section')
        .within(() => {
          cy.contains('Overskrift må fylles ut').should('exist');
          cy.contains('Seksjonen må ha en ingress eller kulepunkter').should('exist');
        });

      cy.contains('Informasjon om utfylling av skjemaet')
        .closest('section')
        .within(() => {
          cy.contains('Overskrift må fylles ut').should('exist');
          cy.contains('Seksjonen må ha en ingress eller kulepunkter').should('exist');
        });

      cy.contains('Informasjon vi henter')
        .closest('section')
        .within(() => {
          cy.contains('Overskrift må fylles ut').should('exist');
        });

      cy.contains('Hvordan vi behandler personopplysninger')
        .closest('section')
        .within(() => {
          cy.contains('Seksjonen må ha en ingress eller kulepunkter').should('exist');
        });

      cy.contains('Automatisk saksbehandling')
        .closest('section')
        .within(() => {
          cy.contains('Seksjonen må ha en ingress eller kulepunkter').should('exist');
        });

      cy.contains('Valgfritt element')
        .closest('section')
        .within(() => {
          cy.contains('Seksjonen må ha en ingress eller kulepunkter').should('exist');
        });

      cy.contains('Erklæring')
        .closest('section')
        .within(() => {
          cy.contains('Egenerklæring må fylles ut').should('exist');
        });
    });

    it('fields with bullet points display error message when not meeting requirement of at least two', () => {
      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).should('exist');
      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).click();

      checkAllOptionalFields();

      cy.get('[data-testid="prerequisites"]').within(() => {
        cy.contains('Legg til kulepunkt').click();
        cy.findByRole('textbox', { name: 'Kulepunkt' }).type(submitData.introPage.sections.outOfScope.bulletPoints[0]);
      });

      cy.get('[data-testid="scope"]').within(() => {
        cy.findByRole('radio', { name: 'Her kan du søke om' }).check();
        cy.contains('Legg til punktliste').click();
        cy.findByRole('textbox', { name: 'Kulepunkt' }).type(submitData.introPage.sections.scope.bulletPoints[0]);
      });

      cy.get('[data-testid="out-of-scope"]').within(() => {
        cy.contains('Legg til punktliste').click();
        cy.findByRole('textbox', { name: 'Kulepunkt' }).type(submitData.introPage.sections.outOfScope.bulletPoints[0]);
      });

      cy.get('[data-testid="dataDisclosure"]').within(() => {
        cy.contains('Legg til kulepunkt').click();
        cy.findByRole('textbox', { name: 'Kulepunkt' }).type(
          submitData.introPage.sections.dataDisclosure.bulletPoints[0],
        );
      });

      cy.get('[data-testid="dataTreatment"]').within(() => {
        cy.contains('Legg til punktliste').click();
        cy.findByRole('textbox', { name: 'Kulepunkt' }).type(
          submitData.introPage.sections.dataTreatment.bulletPoints[0],
        );
      });

      cy.get('[data-testid="automaticProcessing"]').within(() => {
        cy.contains('Legg til punktliste').click();
        cy.findByRole('textbox', { name: 'Kulepunkt' }).type(
          submitData.introPage.sections.automaticProcessing.bulletPoints[0],
        );
      });

      cy.get('[data-testid="optional"]').within(() => {
        cy.contains('Legg til punktliste').click();
        cy.findByRole('textbox', { name: 'Kulepunkt' }).type(submitData.introPage.sections.optional.bulletPoints[0]);
      });

      cy.contains('Lagre').click();
      cy.get('[aria-live="polite"]').should('not.contain.text', `Lagret skjema ${submitData.title}`);

      cy.contains('Beskriv hva skjemaet kan brukes til')
        .closest('section')
        .within(() => {
          cy.contains('Vennligst legg til minst to kulepunkter').should('exist');
        });

      cy.contains('Avklar hva skjemaet IKKE skal brukes til')
        .closest('section')
        .within(() => {
          cy.contains('Vennligst legg til minst to kulepunkter').should('exist');
        });

      cy.get('[data-testid="prerequisites"]').within(() => {
        cy.contains('Vennligst legg til minst to kulepunkter').should('not.exist');
      });

      cy.get('[data-testid="dataDisclosure"]').within(() => {
        cy.contains('Vennligst legg til minst to kulepunkter').should('not.exist');
      });

      cy.contains('Hvordan vi behandler personopplysninger')
        .closest('section')
        .within(() => {
          cy.contains('Vennligst legg til minst to kulepunkter').should('exist');
        });

      cy.contains('Automatisk saksbehandling')
        .closest('section')
        .within(() => {
          cy.contains('Vennligst legg til minst to kulepunkter').should('exist');
        });

      cy.contains('Valgfritt element')
        .closest('section')
        .within(() => {
          cy.contains('Vennligst legg til minst to kulepunkter').should('exist');
        });
    });
  });
});
