import { expect } from 'chai';
import { submitData } from '../fixtures/form-intro-page-submit-data';

function checkAllOptionalFields() {
  const checkboxes = [
    'Viktig informasjon',
    'Beskrivelse av hva skjemaet kan brukes til',
    'Avklar hva skjemaet IKKE skal brukes til',
    'Før du søker / sender / fyller ut',
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

      ['introduction', 'beAwareOf', 'dataDisclosure', 'dataStorage', 'selfDeclaration'].forEach((value) => {
        cy.get(`input[type="checkbox"][value="${value}"]`).should('be.checked');
      });
      cy.findByRole('heading', { name: 'Hvordan vi behandler personopplysninger' }).should('not.exist');

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
      cy.wait(Array(19).fill('@postTranslations')).spread((...posts) => {
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
          submitData.introPage.sections.automaticProcessing.description,
          submitData.introPage.sections.automaticProcessing.bulletPoints[0],
          submitData.introPage.sections.automaticProcessing.bulletPoints[1],
          submitData.introPage.sections.optional.title,
          submitData.introPage.sections.optional.description,
          submitData.introPage.sections.optional.bulletPoints[0],
          submitData.introPage.sections.optional.bulletPoints[1],
        ].forEach((value) => {
          expect(posts.some((post) => post.request.body.nb.includes(value))).to.be.true;
        });
      });
      cy.get('[aria-live="polite"]').should('contain.text', `Lagret skjema ${submitData.title}`);
    });

    it('all required fields are saved with expected data', () => {
      cy.intercept('PUT', '/api/forms/cypresssettings', (req) => {
        expect(req.body.introPage.enabled).to.equal(submitData.introPage.enabled);
        expect(req.body.introPage.introduction).to.match(uuidRegex);
        expect(req.body.introPage.selfDeclaration).to.equal(submitData.introPage.selfDeclaration);
        req.reply(req.body);
      });

      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).should('exist');
      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).click();

      ['introduction', 'beAwareOf', 'dataDisclosure', 'dataStorage', 'selfDeclaration'].forEach((value) => {
        cy.get(`input[type="checkbox"][value="${value}"]`).should('be.checked');
      });

      cy.contains('Velkomstmelding')
        .closest('section')
        .within(() => {
          typeAndBlur(0, submitData.introPage.introduction);
        });

      cy.get('[data-testid="dataDisclosure"]').within(() => {
        cy.findByRole('radio', { name: 'Informasjon vi henter om deg' }).check();
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
      cy.wait('@postTranslations').then((post) => {
        expect(post.request.body).to.contain({
          nb: `<p>${submitData.introPage.introduction}</p>`,
        });
      });
      cy.get('[aria-live="polite"]').should('contain.text', `Lagret skjema ${submitData.title}`);
    });

    it('deletes the selected saved bullet point instead of the last one', () => {
      let initialBulletPointKeys: string[] = [];
      const savedTranslations: Array<{ key: string; nb: string; [key: string]: unknown }> = [];
      let saveCount = 0;

      cy.intercept('GET', '/api/forms/cypresssettings/translations', (req) => {
        req.reply(savedTranslations);
      }).as('getSavedFormTranslations');

      cy.intercept('POST', '/api/forms/cypresssettings/translations', (req) => {
        const existingTranslationIndex = savedTranslations.findIndex(({ key }) => key === req.body.key);

        if (existingTranslationIndex === -1) {
          savedTranslations.push(req.body);
        } else {
          savedTranslations[existingTranslationIndex] = req.body;
        }

        req.reply(201, req.body);
      }).as('saveTranslation');

      cy.intercept('PUT', '/api/forms/cypresssettings', (req) => {
        saveCount += 1;
        const bulletPoints = req.body.introPage.sections.prerequisites.bulletPoints;

        if (saveCount === 1) {
          expect(bulletPoints).to.have.length(3);
          initialBulletPointKeys = [...bulletPoints];
        }

        if (saveCount === 2) {
          expect(bulletPoints).to.deep.equal([initialBulletPointKeys[0], initialBulletPointKeys[2]]);
        }

        req.reply(req.body);
      }).as('saveForm');

      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).click();
      cy.findByRole('checkbox', { name: 'Før du søker / sender / fyller ut' }).click();

      cy.contains('Velkomstmelding')
        .parent()
        .within(() => {
          typeAndBlur(0, 'Velkommen');
        });

      cy.get('[data-testid="prerequisites"]').within(() => {
        cy.findByRole('radio', { name: 'Før du søker' }).check();
        cy.contains('Legg til punktliste').click();
        typeAndBlur(0, 'Kulepunkt 1');
        cy.contains('Legg til kulepunkt').click();
        typeAndBlur(1, 'Kulepunkt 2');
        cy.contains('Legg til kulepunkt').click();
        typeAndBlur(2, 'Kulepunkt 3');
      });

      cy.get('[data-testid="dataDisclosure"]').within(() => {
        cy.findByRole('radio', { name: 'Informasjon vi henter' }).check();
      });

      cy.contains('Erklæring')
        .closest('section')
        .then(($section) => {
          cy.wrap($section).within(() => {
            cy.wrap($section).within(() => {
              cy.findByRole('radio', { name: 'behandle henvendelsen din' }).check();
            });
          });
        });

      cy.contains('Lagre').click();
      cy.wait('@saveForm');
      cy.wait('@getSavedFormTranslations');

      cy.get('[data-testid="prerequisites"]').within(() => {
        cy.get('.rsw-editor [contenteditable="true"]').should('have.length', 3);
        cy.get('.rsw-editor [contenteditable="true"]').eq(0).should('contain.text', 'Kulepunkt 1');
        cy.get('.rsw-editor [contenteditable="true"]').eq(1).should('contain.text', 'Kulepunkt 2');
        cy.get('.rsw-editor [contenteditable="true"]').eq(2).should('contain.text', 'Kulepunkt 3');

        cy.findAllByRole('button', { name: 'Slett' }).eq(1).click();

        cy.get('.rsw-editor [contenteditable="true"]').should('have.length', 2);
        cy.get('.rsw-editor [contenteditable="true"]').eq(0).should('contain.text', 'Kulepunkt 1');
        cy.get('.rsw-editor [contenteditable="true"]').eq(1).should('contain.text', 'Kulepunkt 3');
        cy.contains('Kulepunkt 2').should('not.exist');
      });

      cy.contains('Lagre').click();
      cy.wait('@saveForm');
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

    it('validates true when minimal required fields of select group of sections are filled out and enabled is true', () => {
      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).should('exist');
      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).click();
      cy.findByRole('checkbox', { name: 'Viktig informasjon' }).click();
      cy.findByRole('checkbox', { name: 'Avklar hva skjemaet IKKE skal brukes til' }).click();
      cy.findByRole('checkbox', { name: 'Før du søker / sender / fyller ut' }).click();
      cy.findByRole('checkbox', { name: 'Informasjon vi henter (om deg)' }).click();

      cy.contains('Velkomstmelding')
        .parent()
        .within(() => {
          typeAndBlur(0, 'Velkommen');
        });

      cy.get('[data-testid="importantInformation"]').within(() => {
        typeAndBlur(0, 'Viktig informasjon');
      });

      cy.get('[data-testid="out-of-scope"]').within(() => {
        cy.findByRole('radio', { name: 'Her kan du ikke' }).check();
        cy.contains('button', 'Legg til ingress').click();
        typeAndBlur(0, 'Dette kan du ikke gjøre');
      });

      cy.get('[data-testid="prerequisites"]').within(() => {
        cy.findByRole('radio', { name: 'Før du søker' }).check();
        cy.contains('Legg til punktliste').click();
        cy.get('.rsw-editor [contenteditable="true"]');
        typeAndBlur(0, 'Kulepunkt 1');
        cy.contains('Legg til kulepunkt').click();
        typeAndBlur(1, 'Kulepunkt 2');
      });

      cy.get('[data-testid="dataDisclosure"]').within(() => {
        cy.findByRole('radio', { name: 'Informasjon vi henter' }).check();
      });

      cy.contains('Erklæring')
        .closest('section')
        .then(($section) => {
          cy.wrap($section).within(() => {
            cy.wrap($section).within(() => {
              cy.findByRole('radio', { name: 'behandle henvendelsen din' }).check();
            });
          });
        });

      cy.contains('Lagre').click();
      cy.get('[aria-live="polite"]').should('contain.text', `Lagret skjema ${submitData.title}`);
      cy.get('[aria-live="polite"]').should('contain.text', '5 oversettelser ble lagret');
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

      cy.get('[data-testid="importantInformation"]').within(() => {
        cy.contains('Overskrift må fylles ut').should('exist');
        cy.contains('Brødtekst må fylles ut').should('exist');
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

      cy.get('[data-testid="automaticProcessing"]').within(() => {
        cy.contains('Ingress må fylles ut').should('exist');
        cy.findAllByText('Kulepunktet må fylles ut').should('have.length', 2);
      });

      cy.get('[data-testid="optional"]').within(() => {
        cy.contains('Overskrift må fylles ut').should('exist');
        cy.contains('Ingress må fylles ut').should('exist');
        cy.findAllByText('Kulepunktet må fylles ut').should('have.length', 2);
      });

      cy.findAllByText('Brødtekst må fylles ut').should('have.length', 1);
      cy.findAllByText('Overskrift må fylles ut').should('have.length', 2);
      cy.findAllByText('Ingress må fylles ut').should('have.length', 5);
      cy.findAllByText('Kulepunktet må fylles ut').should('have.length', 12);
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
    it('go to next validation error using scroll after fixing the previous one', () => {
      const assertInViewport = ($el) => {
        const rect = $el[0].getBoundingClientRect();
        cy.window()
          .its('innerHeight')
          .then((innerHeight) => {
            expect(rect.top).to.be.at.least(0);
            expect(rect.bottom).to.be.at.most(innerHeight);
          });
      };

      const assertBelowViewport = ($el) => {
        const rect = $el[0].getBoundingClientRect();
        cy.window()
          .its('innerHeight')
          .then((innerHeight) => {
            expect(rect.top).to.be.greaterThan(innerHeight);
          });
      };

      cy.window().then((win) => {
        cy.spy(win.HTMLElement.prototype, 'scrollIntoView').as('scrollIntoView');
      });

      cy.findByRole('checkbox', { name: 'Bruk standard introside' }).check();

      cy.contains('Lagre').click();
      cy.get('@scrollIntoView').should('have.been.calledWithMatch', {
        block: 'center',
      });
      cy.get('[aria-live="polite"]').should('not.contain.text', `Lagret skjema ${submitData.title}`);
      cy.contains(
        'Endringene ble ikke lagret fordi introsiden har valideringsfeil. Rett opp feltene markert med rødt.',
      );
      cy.contains('Velkomstmelding må fylles ut').then(assertInViewport);
      cy.contains('Egenerklæring må fylles ut').then(assertBelowViewport);

      cy.contains('Velkomstmelding')
        .parent()
        .within(() => {
          typeAndBlur(0, submitData.introPage.introduction);
        });
      cy.contains('Lagre').click();
      cy.contains('Velkomstmelding må fylles ut').should('not.exist');
      cy.contains('Egenerklæring må fylles ut').then(assertInViewport);

      cy.contains('Erklæring')
        .closest('section')
        .then(($section) => {
          cy.wrap($section).within(() => {
            cy.findByRole('radio', { name: 'behandle saken din' }).check();
          });
        });

      cy.contains('Lagre').click();
      cy.contains(
        'Endringene ble ikke lagret fordi introsiden har valideringsfeil. Rett opp feltene markert med rødt.',
      ).should('not.exist');
    });
  });
});
