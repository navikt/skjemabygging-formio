import { expect } from 'chai';
import { submitData } from '../fixtures/form-intro-page-submit-data';

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

const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

function typeAndBlur(index, text) {
  cy.get('.rsw-editor [contenteditable="true"]').eq(index).type(text);
  cy.get('.rsw-editor [contenteditable="true"]').eq(index).blur();
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
      cy.intercept('POST', '/api/forms/cypresssettings/translations', (req) => req.reply(201, req.body)).as(
        'postTranslations',
      );
      cy.intercept('GET', '/api/forms/cypresssettings', { fixture: 'getForm.json' }).as('getForm');
      cy.intercept('GET', '/api/forms/cypresssettings/translations', { body: [] }).as('getFormTranslations');
      cy.visit('forms/cypresssettings/intropage');
    });

    it('all fields are saved with expected data', () => {
      cy.intercept('PUT', '/api/forms/cypresssettings', (req) => {
        expect(req.body.title).to.include(submitData.title);
        expect(req.body.skjemanummer).to.include(submitData.skjemanummer);
        expect(req.body.introPage.enabled).to.equal(submitData.introPage.enabled);
        expect(req.body.introPage.introduction).to.match(uuidRegex);
        expect(req.body.introPage.sections.prerequisites.title).to.equal(
          submitData.introPage.sections.prerequisites.title,
        );
        expect(req.body.introPage.sections.prerequisites.description).to.match(uuidRegex);
        expect(req.body.introPage.sections.prerequisites.bulletPoints).to.have.length(1);
        expect(req.body.introPage.sections.automaticProcessing.description).to.match(uuidRegex);
        expect(req.body.introPage.sections.automaticProcessing.bulletPoints).to.have.length(2);
        expect(req.body.introPage.sections.dataTreatment.description).to.match(uuidRegex);
        expect(req.body.introPage.sections.dataTreatment.bulletPoints).to.have.length(2);
        expect(req.body.introPage.sections.dataDisclosure.title).to.equal(
          submitData.introPage.sections.dataDisclosure.title,
        );
        expect(req.body.introPage.sections.dataDisclosure.bulletPoints).to.have.length(1);
        expect(req.body.introPage.sections.scope.title).to.equal(submitData.introPage.sections.scope.title);
        expect(req.body.introPage.sections.scope.description).to.match(uuidRegex);
        expect(req.body.introPage.sections.scope.bulletPoints).to.have.length(2);
        expect(req.body.introPage.sections.outOfScope.title).to.equal(submitData.introPage.sections.outOfScope.title);
        expect(req.body.introPage.sections.outOfScope.description).to.match(uuidRegex);
        expect(req.body.introPage.sections.outOfScope.bulletPoints).to.have.length(2);
        expect(req.body.introPage.sections.optional.title).to.match(uuidRegex);
        expect(req.body.introPage.sections.optional.description).to.match(uuidRegex);
        expect(req.body.introPage.sections.optional.bulletPoints).to.have.length(2);
        expect(req.body.introPage.selfDeclaration).to.equal(submitData.introPage.selfDeclaration);
        req.reply(req.body);
      });

      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).should('exist');
      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).click();

      ['introduction', 'beAwareOf', 'dataTreatment', 'dataStorage', 'selfDeclaration'].forEach((value) => {
        cy.get(`input[type="checkbox"][value="${value}"]`).should('be.checked');
      });

      checkAllOptionalFields();

      cy.contains('Velkomstmelding')
        .parent()
        .within(() => {
          typeAndBlur(0, submitData.introPage.introduction);
        });

      cy.get('[data-testid="importantInformation"]').within(() => {
        cy.contains('button', 'Legg til overskrift').click();
        cy.findAllByRole('textbox', {
          name: 'Overskrift',
        })
          .eq(0)
          .type(submitData.introPage.importantInformation.title);

        typeAndBlur(0, submitData.introPage.importantInformation.description);
      });

      cy.get('[data-testid="scope"]').within(() => {
        cy.findByRole('radio', { name: 'Her kan du søke om' }).check();
        cy.contains('button', 'Legg til ingress').click();
        typeAndBlur(0, submitData.introPage.sections.scope.description);
        cy.contains('Legg til punktliste').click();
        typeAndBlur(1, submitData.introPage.sections.scope.bulletPoints[0]);
        cy.contains('Legg til kulepunkt').click();
        typeAndBlur(2, submitData.introPage.sections.scope.bulletPoints[1]);
      });

      cy.get('[data-testid="out-of-scope"]').within(() => {
        cy.findByRole('radio', { name: 'Her kan du ikke' }).check();
        cy.contains('button', 'Legg til ingress').click();
        typeAndBlur(0, submitData.introPage.sections.outOfScope.description);
        cy.contains('Legg til punktliste').click();
        cy.get('.rsw-editor [contenteditable="true"]').eq(1);
        typeAndBlur(1, submitData.introPage.sections.outOfScope.bulletPoints[0]);
        cy.contains('Legg til kulepunkt').click();
        typeAndBlur(2, submitData.introPage.sections.outOfScope.bulletPoints[1]);
      });

      cy.get('[data-testid="prerequisites"]').within(() => {
        cy.findByRole('radio', { name: 'Før du søker' }).check();
        cy.contains('button', 'Legg til ingress').click();
        typeAndBlur(0, submitData.introPage.sections.prerequisites.description);
        cy.contains('Legg til punktliste').click();
        cy.get('.rsw-editor [contenteditable="true"]');
        typeAndBlur(1, submitData.introPage.sections.prerequisites.bulletPoints[0]);
      });

      cy.get('[data-testid="dataDisclosure"]').within(() => {
        cy.findByRole('radio', { name: 'Informasjon vi henter' }).check();
        cy.contains('Legg til kulepunkt').click();
        typeAndBlur(0, submitData.introPage.sections.dataDisclosure.bulletPoints[0]);
      });

      cy.get('[data-testid="dataTreatment"]').within(() => {
        cy.contains('Legg til ingress').click();
        cy.contains('Legg til punktliste').click();
        typeAndBlur(0, submitData.introPage.sections.dataTreatment.description);
        typeAndBlur(1, submitData.introPage.sections.dataTreatment.bulletPoints[0]);
        cy.contains('Legg til kulepunkt').click();
        typeAndBlur(2, submitData.introPage.sections.dataTreatment.bulletPoints[1]);
      });

      cy.get('[data-testid="automaticProcessing"]').within(() => {
        cy.contains('Legg til ingress').click();
        typeAndBlur(0, submitData.introPage.sections.automaticProcessing.description);
        cy.contains('Legg til punktliste').click();
        typeAndBlur(1, submitData.introPage.sections.automaticProcessing.bulletPoints[0]);
        cy.contains('Legg til kulepunkt').click();
        typeAndBlur(2, submitData.introPage.sections.automaticProcessing.bulletPoints[1]);
      });

      cy.get('[data-testid="optional"]').within(() => {
        cy.findByRole('textbox', { name: 'Overskrift' }).type(submitData.introPage.sections.optional.title);
        cy.contains('Legg til ingress').click();
        typeAndBlur(0, submitData.introPage.sections.optional.description);
        cy.contains('Legg til punktliste').click();
        typeAndBlur(1, submitData.introPage.sections.optional.bulletPoints[0]);
        cy.contains('Legg til kulepunkt').click();
        typeAndBlur(2, submitData.introPage.sections.optional.bulletPoints[1]);
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
      cy.wait(Array(22).fill('@postTranslations')).spread((...posts) => {
        [
          submitData.introPage.introduction,
          submitData.introPage.importantInformation.title,
          submitData.introPage.importantInformation.description,
          submitData.introPage.sections.scope.description,
          submitData.introPage.sections.scope.bulletPoints[0],
          submitData.introPage.sections.scope.bulletPoints[1],
          submitData.introPage.sections.outOfScope.description,
          submitData.introPage.sections.outOfScope.bulletPoints[0],
          submitData.introPage.sections.outOfScope.bulletPoints[1],
          submitData.introPage.sections.prerequisites.description,
          submitData.introPage.sections.prerequisites.bulletPoints[0],
          submitData.introPage.sections.dataDisclosure.bulletPoints[0],
          submitData.introPage.sections.dataTreatment.description,
          submitData.introPage.sections.dataTreatment.bulletPoints[0],
          submitData.introPage.sections.dataTreatment.bulletPoints[1],
          submitData.introPage.sections.automaticProcessing.description,
          submitData.introPage.sections.automaticProcessing.bulletPoints[0],
          submitData.introPage.sections.automaticProcessing.bulletPoints[1],
          submitData.introPage.sections.optional.title,
          submitData.introPage.sections.optional.description,
          submitData.introPage.sections.optional.bulletPoints[0],
          submitData.introPage.sections.optional.bulletPoints[1],
        ].forEach((value, index) => {
          expect(posts[index].request.body.nb).to.contain(value);
        });
      });
      cy.get('[aria-live="polite"]').should('contain.text', `Lagret skjema ${submitData.title}`);
    });

    it('all required fields are saved with expected data', () => {
      cy.intercept('PUT', '/api/forms/cypresssettings', (req) => {
        expect(req.body.introPage.enabled).to.equal(submitData.introPage.enabled);
        expect(req.body.introPage.introduction).to.match(uuidRegex);
        expect(req.body.introPage.sections.prerequisites.title).to.equal(
          submitData.introPage.sections.prerequisites.title,
        );
        expect(req.body.introPage.sections.prerequisites.description).to.match(uuidRegex);
        expect(req.body.introPage.sections.prerequisites.bulletPoints).to.have.length(1);
        expect(req.body.introPage.sections.dataTreatment.description).to.match(uuidRegex);
        expect(req.body.introPage.sections.dataTreatment.bulletPoints).to.have.length(2);
        expect(req.body.introPage.selfDeclaration).to.equal(submitData.introPage.selfDeclaration);
        req.reply(req.body);
      });

      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).should('exist');
      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).click();

      ['introduction', 'beAwareOf', 'dataTreatment', 'dataStorage', 'selfDeclaration'].forEach((value) => {
        cy.get(`input[type="checkbox"][value="${value}"]`).should('be.checked');
      });

      cy.contains('Velkomstmelding')
        .closest('section')
        .within(() => {
          typeAndBlur(0, submitData.introPage.introduction);
        });

      cy.get('[data-testid="prerequisites"]').within(() => {
        cy.findByRole('radio', { name: 'Før du søker' }).check();
        cy.contains('button', 'Legg til ingress').click();
        typeAndBlur(0, submitData.introPage.sections.prerequisites.description);
        cy.contains('Legg til punktliste').click();
        typeAndBlur(1, submitData.introPage.sections.prerequisites.bulletPoints[0]);
      });

      cy.get('[data-testid="dataTreatment"]').within(() => {
        cy.contains('Legg til ingress').click();
        cy.contains('Legg til punktliste').click();
        typeAndBlur(0, submitData.introPage.sections.dataTreatment.description);
        typeAndBlur(1, submitData.introPage.sections.dataTreatment.bulletPoints[0]);
        cy.contains('Legg til kulepunkt').click();
        typeAndBlur(2, submitData.introPage.sections.dataTreatment.bulletPoints[1]);
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
      cy.wait(Array(6).fill('@postTranslations')).spread((post1, post2, post3, post4, post5, post6) => {
        expect(post1.request.body).to.contain({
          nb: `<p>${submitData.introPage.introduction}</p>`,
        });
        expect(post2.request.body).to.contain({
          nb: `<p>${submitData.introPage.sections.prerequisites.description}</p>`,
        });
        expect(post3.request.body).to.contain({
          nb: `${submitData.introPage.sections.prerequisites.bulletPoints[0]}`,
        });
        expect(post4.request.body).to.contain({
          nb: `<p>${submitData.introPage.sections.dataTreatment.description}</p>`,
        });
        expect(post5.request.body).to.contain({
          nb: `${submitData.introPage.sections.dataTreatment.bulletPoints[0]}`,
        });
        expect(post6.request.body).to.contain({
          nb: `${submitData.introPage.sections.dataTreatment.bulletPoints[1]}`,
        });
      });
      cy.get('[aria-live="polite"]').should('contain.text', `Lagret skjema ${submitData.title}`);
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/forms/cypresssettings', { fixture: 'getForm.json' }).as('getForm');
      cy.intercept('GET', '/api/forms/cypresssettings/translations', { body: [] }).as('getFormTranslations');
      cy.intercept('PUT', '/api/forms/cypresssettings', (req) => {
        req.reply(req.body);
      });
      cy.intercept('POST', '/api/forms/cypresssettings/translations', (req) => req.reply(201, req.body)).as(
        'postTranslations',
      );
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

    it('all textfields display error if content is emptied', () => {
      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).should('exist');
      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).click();
      checkAllOptionalFields();

      cy.contains('Velkomstmelding')
        .parent()
        .within(() => {
          typeAndBlur(0, 'abc');
          typeAndBlur(0, '{selectall}{backspace}');
        });

      cy.get('[data-testid="importantInformation"]').within(() => {
        cy.contains('button', 'Legg til overskrift').click();
        cy.findAllByRole('textbox', { name: 'Overskrift' }).eq(0).type('abc');
        cy.findAllByRole('textbox', { name: 'Overskrift' }).eq(0).type('{selectall}{backspace}');

        typeAndBlur(0, 'abc');
        typeAndBlur(0, '{selectall}{backspace}');
      });

      cy.get('[data-testid="scope"]').within(() => {
        cy.findByRole('radio', { name: 'Her kan du søke om' }).check();
        cy.contains('button', 'Legg til ingress').click();
        typeAndBlur(0, 'abc');
        typeAndBlur(0, '{selectall}{backspace}');
        cy.contains('Legg til punktliste').click();
        typeAndBlur(1, 'abc');
        typeAndBlur(1, '{selectall}{backspace}');
        cy.contains('Legg til kulepunkt').click();
        typeAndBlur(2, 'abc');
        typeAndBlur(2, '{selectall}{backspace}');
      });

      cy.get('[data-testid="out-of-scope"]').within(() => {
        cy.findByRole('radio', { name: 'Her kan du ikke' }).check();
        cy.contains('button', 'Legg til ingress').click();
        typeAndBlur(0, 'abc');
        typeAndBlur(0, '{selectall}{backspace}');
        cy.contains('Legg til punktliste').click();
        typeAndBlur(1, 'abc');
        typeAndBlur(1, '{selectall}{backspace}');
        cy.contains('Legg til kulepunkt').click();
        typeAndBlur(2, 'abc');
        typeAndBlur(2, '{selectall}{backspace}');
      });

      cy.get('[data-testid="prerequisites"]').within(() => {
        cy.findByRole('radio', { name: 'Før du søker' }).check();
        cy.contains('button', 'Legg til ingress').click();
        typeAndBlur(0, 'abc');
        typeAndBlur(0, '{selectall}{backspace}');
        cy.contains('Legg til punktliste').click();
        typeAndBlur(1, 'abc');
        typeAndBlur(1, '{selectall}{backspace}');
        cy.contains('Legg til kulepunkt').click();
        typeAndBlur(2, 'abc');
        typeAndBlur(2, '{selectall}{backspace}');
      });

      cy.get('[data-testid="dataDisclosure"]').within(() => {
        cy.findByRole('radio', { name: 'Informasjon vi henter' }).check();
        cy.contains('Legg til kulepunkt').click();
        typeAndBlur(0, 'abc');
        typeAndBlur(0, '{selectall}{backspace}');
        cy.contains('Legg til kulepunkt').click();
        typeAndBlur(1, 'abc');
        typeAndBlur(1, '{selectall}{backspace}');
      });

      cy.get('[data-testid="dataTreatment"]').within(() => {
        cy.contains('Legg til ingress').click();
        typeAndBlur(0, 'abc');
        typeAndBlur(0, '{selectall}{backspace}');
        cy.contains('Legg til punktliste').click();
        typeAndBlur(1, 'abc');
        typeAndBlur(1, '{selectall}{backspace}');
        cy.contains('Legg til kulepunkt').click();
        typeAndBlur(2, 'abc');
        typeAndBlur(2, '{selectall}{backspace}');
      });

      cy.get('[data-testid="automaticProcessing"]').within(() => {
        cy.contains('Legg til ingress').click();
        typeAndBlur(0, 'abc');
        typeAndBlur(0, '{selectall}{backspace}');
        cy.contains('Legg til punktliste').click();
        typeAndBlur(1, 'abc');
        typeAndBlur(1, '{selectall}{backspace}');
        cy.contains('Legg til kulepunkt').click();
        typeAndBlur(2, 'abc');
        typeAndBlur(2, '{selectall}{backspace}');
      });

      cy.get('[data-testid="optional"]').within(() => {
        cy.findByRole('textbox', { name: 'Overskrift' }).type('abc');
        cy.findByRole('textbox', { name: 'Overskrift' }).type('{selectall}{backspace}');
        cy.contains('Legg til ingress').click();
        typeAndBlur(0, 'abc');
        typeAndBlur(0, '{selectall}{backspace}');
        cy.contains('Legg til punktliste').click();
        typeAndBlur(1, 'abc');
        typeAndBlur(1, '{selectall}{backspace}');
        cy.contains('Legg til kulepunkt').click();
        typeAndBlur(2, 'abc');
        typeAndBlur(2, '{selectall}{backspace}');
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

      cy.get('[aria-live="polite"]').should('not.contain.text', `Lagret skjema ${submitData.title}`);

      cy.contains('Velkomstmelding')
        .parent()
        .within(() => {
          cy.contains('Velkomstmelding må fylles ut').should('exist');
        });

      cy.get('[data-testid="scope"]').within(() => {
        cy.contains('Ingress må fylles ut').should('exist');
        cy.findAllByText('Kulepunktet må fylles ut').should('have.length', 2);
      });

      cy.get('[data-testid="out-of-scope"]').within(() => {
        cy.contains('Ingress må fylles ut').should('exist');
        cy.findAllByText('Kulepunktet må fylles ut').should('have.length', 2);
      });

      cy.get('[data-testid="prerequisites"]').within(() => {
        cy.contains('Ingress må fylles ut').should('exist');
        cy.findAllByText('Kulepunktet må fylles ut').should('have.length', 2);
      });

      cy.get('[data-testid="dataDisclosure"]').within(() => {
        cy.findAllByText('Kulepunktet må fylles ut').should('have.length', 2);
      });

      cy.get('[data-testid="dataTreatment"]').within(() => {
        cy.contains('Ingress må fylles ut').should('exist');
        cy.findAllByText('Kulepunktet må fylles ut').should('have.length', 2);
      });

      cy.get('[data-testid="automaticProcessing"]').within(() => {
        cy.contains('Ingress må fylles ut').should('exist');
        cy.findAllByText('Kulepunktet må fylles ut').should('have.length', 2);
      });

      cy.get('[data-testid="optional"]').within(() => {
        cy.contains('Overskrift må fylles ut').should('exist');
        cy.contains('Ingress må fylles ut').should('exist');
        cy.findAllByText('Kulepunktet må fylles ut').should('have.length', 2);
      });

      cy.findAllByText('Overskrift må fylles ut').should('have.length', 1);
      cy.findAllByText('Ingress må fylles ut').should('have.length', 6);
      cy.findAllByText('Kulepunktet må fylles ut').should('have.length', 14);
    });

    it('optional fields display does not display error message on save when enabled is false', () => {
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
        cy.contains('Legg til punktliste').click();
        cy.get('.rsw-editor [contenteditable="true"]').type(
          submitData.introPage.sections.prerequisites.bulletPoints[0],
        );
      });

      cy.get('[data-testid="scope"]').within(() => {
        cy.findByRole('radio', { name: 'Her kan du søke om' }).check();
        cy.contains('Legg til punktliste').click();
        cy.get('.rsw-editor [contenteditable="true"]').type(submitData.introPage.sections.scope.bulletPoints[0]);
      });

      cy.get('[data-testid="out-of-scope"]').within(() => {
        cy.contains('Legg til punktliste').click();
        cy.get('.rsw-editor [contenteditable="true"]').type(submitData.introPage.sections.outOfScope.bulletPoints[0]);
      });

      cy.get('[data-testid="dataDisclosure"]').within(() => {
        cy.contains('Legg til kulepunkt').click();
        cy.get('.rsw-editor [contenteditable="true"]').type(
          submitData.introPage.sections.dataDisclosure.bulletPoints[0],
        );
      });

      cy.get('[data-testid="dataTreatment"]').within(() => {
        cy.contains('Legg til punktliste').click();
        cy.get('.rsw-editor [contenteditable="true"]').type(
          submitData.introPage.sections.dataTreatment.bulletPoints[0],
        );
      });

      cy.get('[data-testid="automaticProcessing"]').within(() => {
        cy.contains('Legg til punktliste').click();
        cy.get('.rsw-editor [contenteditable="true"]').type(
          submitData.introPage.sections.automaticProcessing.bulletPoints[0],
        );
      });

      cy.get('[data-testid="optional"]').within(() => {
        cy.contains('Legg til punktliste').click();
        cy.get('.rsw-editor [contenteditable="true"]').type(submitData.introPage.sections.optional.bulletPoints[0]);
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
        cy.contains('Vennligst legg til minst to kulepunkter').should('exist');
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
