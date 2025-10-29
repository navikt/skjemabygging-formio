/*
 * Tests for mellomlagring behavior (creating, updating, deleting, navigation to/from summary etc)
 */

import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';

const testMellomlagringConfirmationModal = (
  buttonText: string,
  modalTexts: {
    body: string;
    title: string;
    cancel: string;
    confirm: string;
  },
) => {
  cy.findByRole('button', { name: buttonText }).should('be.visible');
  cy.findByRole('button', { name: buttonText }).click();
  cy.findByText(modalTexts.body).should('be.visible');
  cy.findByRole('button', { name: modalTexts.cancel }).click();
  cy.findByRole('button', { name: buttonText }).click();
  cy.findByRole('button', { name: modalTexts.confirm }).click();
};

describe('Mellomlagring', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    // Do not call cy.defaultInterceptsMellomlagring() like we usually do since we need to create an extra spy
    cy.intercept('POST', '/fyllut/api/send-inn/soknad*', cy.spy().as('createMellomlagringSpy')).as(
      'createMellomlagring',
    );
    cy.intercept('PUT', '/fyllut/api/send-inn/soknad*', cy.spy().as('updateMellomlagringSpy')).as(
      'updateMellomlagring',
    );
    cy.intercept('GET', '/fyllut/api/send-inn/soknad/*').as('getMellomlagring');
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('When submission method is "paper"', () => {
    it('redirects to start page if url does not contain "innsendingsId"', () => {
      cy.visit('/fyllut/testmellomlagring/oppsummering?sub=paper&lang=nb-NO');
      cy.defaultWaits();
      cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
    });

    it('does not fetch or update mellomlagring', () => {
      cy.visit('/fyllut/testmellomlagring?sub=paper');
      cy.defaultWaits();
      cy.clickStart();
      cy.get('@createMellomlagringSpy').should('not.have.been.called');
      cy.findByRole('heading', { name: 'Valgfrie opplysninger' }).should('exist');
      cy.clickNextStep();
      cy.get('@updateMellomlagringSpy').should('not.have.been.called');
      cy.findByRole('group', { name: 'Ønsker du å få gaven innpakket' }).within(() => {
        cy.findByLabelText('Nei').check({ force: true });
      });
      cy.clickNextStep();
      cy.get('@updateMellomlagringSpy').should('not.have.been.called');
      cy.findByLabelText('Hvordan ønsker du å motta pakken?').click();
      cy.findByLabelText('Hvordan ønsker du å motta pakken?').type('På døra{enter}');
      cy.clickNextStep();
      cy.get('@createMellomlagringSpy').should('not.have.been.called');
      cy.clickNextStep();
      cy.findByLabelText('Annen dokumentasjon').within(() => {
        cy.findByLabelText('Ja, jeg legger det ved denne søknaden.').check({ force: true });
      });
      cy.findByRole('group', { name: 'Oppmøtebekreftelse' }).within(() => {
        cy.findByLabelText('Jeg har levert denne dokumentasjonen tidligere').check({ force: true });
      });
      cy.findByRole('group', {
        name: 'Bekreftelse på at du av helsemessige årsaker må benytte dyrere transport',
      }).within(() => {
        cy.findByLabelText('Jeg har levert denne dokumentasjonen tidligere').check({ force: true });
      });
      cy.clickNextStep();
      cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveDraft }).should('not.exist');
      cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveAndContinue }).should('not.exist');
      cy.findAllByRole('link', { name: TEXTS.grensesnitt.summaryPage.editAnswers })
        .first()
        .should('exist')
        .should('have.attr', 'href')
        .and('contains', '/fyllut/testmellomlagring/valgfrieOpplysninger?sub=paper');
    });
  });

  describe('When submission method is "digital"', () => {
    beforeEach(() => {
      cy.intercept('GET', '/fyllut/api/send-inn/soknad/8e3c3621-76d7-4ebd-90d4-34448ebcccc3').as(
        'getMellomlagringValid',
      );
      cy.intercept('GET', `/fyllut/api/send-inn/soknad/f99dc639-add1-468f-b4bb-961cdfd1e599`).as(
        'getMellomlagringForInnsendingWithUpdateError',
      );
      cy.intercept('DELETE', '/fyllut/api/send-inn/soknad/8e3c3621-76d7-4ebd-90d4-34448ebcccc3').as(
        'deleteMellomlagring',
      );
    });

    it('creates and updates mellomlagring', () => {
      cy.visit('/fyllut/testmellomlagring?sub=digital');
      cy.defaultWaits();
      cy.clickStart();
      cy.wait('@createMellomlagring');
      cy.findByRole('heading', { name: 'Valgfrie opplysninger' }).should('exist');
      cy.clickSaveAndContinue();
      cy.wait('@updateMellomlagring');
      cy.findByRole('group', { name: 'Ønsker du å få gaven innpakket' }).within(() => {
        cy.findByLabelText('Nei').check({ force: true });
      });
      cy.clickSaveAndContinue();
      cy.wait('@updateMellomlagring');
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(200); // has to wait on form.io to redraw page after updating mellomlagring
      cy.findByRole('combobox', { name: 'Hvordan ønsker du å motta pakken?' }).click();
      cy.findByRole('combobox', { name: 'Hvordan ønsker du å motta pakken?' }).type('P{enter}');
      cy.clickSaveAndContinue();
      cy.wait('@updateMellomlagring');
      cy.clickSaveAndContinue();
      cy.wait('@updateMellomlagring');
      cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveDraft }).should('exist');
      cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.cancelAndDelete }).should('exist');
      cy.findAllByRole('link', { name: TEXTS.grensesnitt.summaryPage.editAnswers })
        .first()
        .should('exist')
        .and(
          'have.attr',
          'href',
          '/fyllut/testmellomlagring/valgfrieOpplysninger?sub=digital&innsendingsId=75eedb4c-1253-44d8-9fde-3648f4bb1878#hvaDrakkDuTilFrokost',
        );
    });

    it('fetches mellomlagring and navigates to "/summary" on start, when url contains "innsendingsId"', () => {
      cy.visit('/fyllut/testmellomlagring?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3&lang=nb-NO');
      cy.defaultWaits();
      cy.wait('@getMellomlagringValid');
      cy.findByRole('heading', { name: TEXTS.statiske.introPage.title }).should('exist');
      cy.clickStart();
      cy.url().should('include', '/valgfrieOpplysninger');
    });

    it('redirects to form not found page when not found', () => {
      cy.mocksUseRouteVariant('get-soknad:not-found');

      cy.visit(`/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3`);
      cy.defaultWaits();
      cy.wait('@getMellomlagringValid');
      cy.url().should('not.include', '8e3c3621-76d7-4ebd-90d4-34448ebcccc3');
      cy.url().should('not.include', 'sub=digital');
      cy.url().should('not.include', 'oppsummering');
      cy.url().should('equal', `${Cypress.env('BASE_URL')}/fyllut/soknad-ikke-funnet`);
    });

    it('lets you delete mellomlagring', () => {
      cy.mocksUseRouteVariant('delete-soknad:failure');

      cy.visit(
        '/fyllut/testmellomlagring/gave?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3&lang=nb-NO',
      );
      cy.defaultWaits();
      cy.wait('@getMellomlagringValid');
      cy.findByRole('heading', { name: 'Gave', level: 2 }).should('be.visible');
      testMellomlagringConfirmationModal(
        TEXTS.grensesnitt.navigation.cancelAndDelete,
        TEXTS.grensesnitt.confirmDeletePrompt,
      );
      cy.wait('@deleteMellomlagring');
      cy.findByText(TEXTS.statiske.mellomlagringError.delete.message).should('be.visible');
    });

    it('lets you save mellomlagring before cancelling', () => {
      cy.mocksUseRouteVariant('put-soknad:failure');

      cy.visit(
        `/fyllut/testmellomlagring/gave?sub=digital&innsendingsId=f99dc639-add1-468f-b4bb-961cdfd1e599&lang=nb-NO`,
      );
      cy.defaultWaits();
      cy.wait('@getMellomlagringForInnsendingWithUpdateError');
      cy.findByRole('heading', { name: 'Gave', level: 2 }).should('be.visible');

      cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveDraft }).click();
      const body = TEXTS.grensesnitt.confirmSavePrompt.body.replace('{{date}}', '10.01.2024').trim();
      cy.findByText(body).should('be.visible');
      cy.findByRole('button', { name: TEXTS.grensesnitt.confirmSavePrompt.cancel }).click();
      cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveDraft }).click();
      cy.findByRole('button', { name: TEXTS.grensesnitt.confirmSavePrompt.confirm }).click();

      cy.wait('@updateMellomlagring');
      cy.findByText(TEXTS.statiske.mellomlagringError.update.message).should('be.visible');
    });

    describe('When starting on the summary page', () => {
      it('redirects to start page if url does not contain "innsendingsId"', () => {
        cy.skipIfNoIncludeDistTests();
        cy.visit('/fyllut/testmellomlagring/oppsummering?sub=digital&lang=nb-NO');
        cy.defaultWaits();
        cy.findByRole('heading', { name: TEXTS.statiske.introPage.title }).should('exist');
      });

      describe('When url contains query param "innsendingsId"', () => {
        beforeEach(() => {
          cy.fixture('mellomlagring/submitTestMellomlagring.json').then((fixture) => {
            cy.submitMellomlagring((req) => {
              const { submission: bodySubmission, ...bodyRest } = req.body;
              const { submission: fixtureSubmission, ...fixtureRest } = fixture;
              expect(bodySubmission.data).to.deep.eq(fixtureSubmission.data);
              expect({
                ...bodyRest,
                pdfFormData: {
                  ...bodyRest.pdfFormData,
                  bunntekst: undefined, // ignore bunntekst since it contains timestamps
                },
              }).to.deep.eq({
                ...fixtureRest,
                pdfFormData: {
                  ...bodyRest.pdfFormData,
                  bunntekst: undefined,
                },
              });
            });
          });
        });

        it('retrieves mellomlagring and redirects after submitting', () => {
          cy.visit(
            '/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3&lang=nb-NO',
          );
          cy.defaultWaits();
          cy.wait('@getMellomlagringValid');
          cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
          cy.findByText('Ønsker du å få gaven innpakket').should('exist');
          cy.clickSaveAndContinue();
          cy.wait('@submitMellomlagring');
          cy.verifySendInnRedirect();
        });

        it('retrieves mellomlagring and lets you navigate to first empty panel', () => {
          cy.visit(
            '/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3&lang=nb-NO',
          );
          cy.defaultWaits();
          cy.wait('@getMellomlagringValid');
          cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
          cy.clickEditAnswers();
          cy.url().should('include', '/valgfrieOpplysninger');
          cy.findByRole('textbox', { name: 'Hva drakk du til frokost (valgfritt)' }).should('have.focus');
        });

        it('lets you edit and update submission data', () => {
          cy.visit(
            '/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3&lang=nb-NO',
          );
          cy.defaultWaits();
          cy.wait('@getMellomlagringValid');
          cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
          cy.findByText('Ønsker du å få gaven innpakket').should('exist').next('dd').should('contain.text', 'Nei');
          cy.findByText('Farge').should('not.exist');
          cy.findByText('Tekst på kortet').should('not.exist');

          cy.clickEditAnswer('Gave');
          cy.findByRole('heading', { name: 'Gave' }).should('exist');
          cy.findByRole('group', { name: 'Ønsker du å få gaven innpakket' })
            .should('exist')
            .within(() => {
              cy.findByLabelText('Ja').click();
              cy.findByLabelText('Ja').should('be.checked');
            });

          cy.findByRole('group', { name: 'Farge' }).should('exist');

          cy.clickSaveAndContinue();
          cy.get('@updateMellomlagringSpy').should('not.have.been.called');

          cy.findByRole('group', { name: 'Farge' }).should('exist');
          cy.get('[data-cy=error-summary]').within(() => {
            cy.get('a').should('have.length', 2);
            cy.findByRole('link', { name: 'Du må fylle ut: Farge' }).should('exist').click({ force: true });
          });

          cy.findByRole('group', { name: 'Farge' })
            .should('exist')
            .should('have.focus')
            .within(() => {
              cy.findByLabelText('Rød').click();
            });

          cy.get('[data-cy=error-summary]').should('exist');
          cy.get('[data-cy=error-summary]').within(() => {
            cy.get('a').should('have.length', 1);
            cy.findByRole('link', { name: 'Du må fylle ut: Tekst på kortet' }).should('exist').click({ force: true });
          });
          cy.findByLabelText('Tekst på kortet').should('have.focus').type('Takk for hjelpen!');

          cy.clickShowAllSteps();
          cy.findByRole('link', { name: 'Oppsummering' }).click();
          cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
          cy.findByText('Ønsker du å få gaven innpakket').should('exist').next('dd').should('contain.text', 'Ja');
          cy.findByText('Farge').should('exist').next('dd').should('contain.text', 'Rød');
          cy.findByText('Tekst på kortet').should('exist').next('dd').should('contain.text', 'Takk for hjelpen!');
        });

        it('lets you delete mellomlagring', () => {
          cy.mocksUseRouteVariant('delete-soknad:failure');

          cy.visit(
            '/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3&lang=nb-NO',
          );
          cy.defaultWaits();
          cy.wait('@getMellomlagringValid');
          cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
          testMellomlagringConfirmationModal(
            TEXTS.grensesnitt.navigation.cancelAndDelete,
            TEXTS.grensesnitt.confirmDeletePrompt,
          );
          cy.wait('@deleteMellomlagring');
          cy.findByText(TEXTS.statiske.mellomlagringError.delete.message).should('be.visible');
        });

        it('lets you save mellomlagring before cancelling', () => {
          cy.mocksUseRouteVariant('put-soknad:failure');

          cy.visit(
            `/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=f99dc639-add1-468f-b4bb-961cdfd1e599&lang=nb-NO`,
          );
          cy.defaultWaits();
          cy.wait('@getMellomlagringForInnsendingWithUpdateError');
          cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');

          cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveDraft }).click();
          const body = TEXTS.grensesnitt.confirmSavePrompt.body.replace('{{date}}', '10.01.2024').trim();
          cy.findByText(body).should('be.visible');
          cy.findByRole('button', { name: TEXTS.grensesnitt.confirmSavePrompt.cancel }).click();
          cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveDraft }).click();
          cy.findByRole('button', { name: TEXTS.grensesnitt.confirmSavePrompt.confirm }).click();

          cy.wait('@updateMellomlagring');
          cy.findByText(TEXTS.statiske.mellomlagringError.update.message).should('be.visible');
        });
      });

      describe('When stored submission contains values for inputs that have been removed from the form', () => {
        beforeEach(() => {
          cy.mocksUseRouteVariant('get-soknad:success-extra-values');
          cy.submitMellomlagring((req) => {
            const { submission } = req.body;
            expect(submission.data['slettetTekstfelt']).to.be.undefined;
            // Container
            expect(submission.data['container.slettetTekstFelt']).to.be.undefined;
            // Datagrid
            expect(submission.data['datagrid']).to.deep.eq([{ tekstfelt: 'Hoppeslott' }, { tekstfelt: 'Hund' }]);
            expect(submission.data['datagrid1']).to.be.undefined;
            // value should be removed if the corresponding field is conditionally hidden
            expect(submission.data['hvaSyntesDuOmFrokosten']).to.be.undefined;
            req.reply(201);
          });
        });

        it('removes the unused values from submission before submitting', () => {
          cy.visit(
            '/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3&lang=nb-NO',
          );
          cy.defaultWaits();
          cy.wait('@getMellomlagringValid');
          cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
          cy.findByText('Ønsker du å få gaven innpakket').should('exist');
          cy.clickSaveAndContinue();
          cy.wait('@submitMellomlagring');
        });
      });

      describe('When stored submission contains value which no longer is available in select', () => {
        it('hides save-and-continue button and renders info message on summary page', () => {
          cy.mocksUseRouteVariant('get-form:success-v2');

          cy.visit(
            '/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3&lang=nb-NO',
          );
          cy.defaultWaits();
          cy.wait('@getMellomlagringValid');
          cy.contains(TEXTS.statiske.summaryPage.validationMessage).should('exist');
          cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveAndContinue }).should('not.exist');
          cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
        });
      });

      describe('When form contains select components with dataSrc "values" and "url"', () => {
        beforeEach(() => {
          cy.intercept('GET', '/fyllut/api/send-inn/soknad/df6c8a69-9eb0-4878-b51f-38b3849ef9b6').as(
            'getMellomlagring',
          );
        });

        describe('it does not allow user to continue to sendinn application', () => {
          it('when submission data is not complete', () => {
            cy.mocksUseRouteVariant('get-soknad:form-select-partial-v1');

            cy.visit(
              '/fyllut/testselect/oppsummering?sub=digital&innsendingsId=df6c8a69-9eb0-4878-b51f-38b3849ef9b6&lang=nb-NO',
            );
            cy.defaultWaits();
            cy.wait('@getMellomlagring');
            cy.get('dl')
              .eq(0)
              .within(() => {
                cy.get('dt').should('have.length', 1);
                cy.get('dt').eq(0).should('contain.text', 'Velg instrument');
                cy.get('dd').eq(0).should('contain.text', 'Piano');
              });

            cy.contains(TEXTS.statiske.summaryPage.validationMessage).should('exist');
            cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveAndContinue }).should('not.exist');
            cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
          });

          it('when form-v2 does not allow value anymore', () => {
            cy.mocksUseRouteVariant('get-form:success-v2');
            cy.mocksUseRouteVariant('get-soknad:form-select-invalid-instrument-v1');

            cy.visit(
              '/fyllut/testselect/oppsummering?sub=digital&innsendingsId=df6c8a69-9eb0-4878-b51f-38b3849ef9b6&lang=nb-NO',
            );
            cy.defaultWaits();
            cy.wait('@getMellomlagring');
            cy.get('dl')
              .eq(0)
              .within(() => {
                cy.get('dt').should('have.length', 3);
                cy.get('dt').eq(0).should('contain.text', 'Velg instrument');
                cy.get('dd').eq(0).should('contain.text', 'Piano'); // <- invalid in form v2
                cy.get('dt').eq(1).should('contain.text', 'Velg land du vil reise til');
                cy.get('dd').eq(1).should('contain.text', 'Italia');
                cy.get('dt').eq(2).should('contain.text', 'Velg valuta du vil betale med');
                cy.get('dd').eq(2).should('contain.text', 'Euro (EUR)');
              });
            cy.contains(TEXTS.statiske.summaryPage.validationMessage).should('exist');
            cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveAndContinue }).should('not.exist');
            cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
          });
        });

        describe('allows user to continue to sendinn application', () => {
          it('when submission data is complete and valid', () => {
            cy.mocksUseRouteVariant('get-soknad:form-select-complete-v1');

            cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad', (req) => {
              const { submission, attachments } = req.body;
              expect(submission.data.velgInstrument).to.deep.eq({ label: 'Piano', value: 'piano' });
              expect(submission.data.velgLand).to.deep.eq({ label: 'Italia', value: 'IT' });
              expect(submission.data.velgValutaDuVilBetaleMed).to.deep.eq({ label: 'Euro (EUR)', value: 'EUR' });
              expect(attachments).to.have.length(1);
              expect(attachments[0].vedleggsnr).to.eq('P2');
            }).as('submitMellomlagring');

            cy.visit(
              '/fyllut/testselect/oppsummering?sub=digital&innsendingsId=df6c8a69-9eb0-4878-b51f-38b3849ef9b6&lang=nb-NO',
            );
            cy.defaultWaits();
            cy.wait('@getMellomlagring');
            cy.get('dl')
              .eq(0)
              .within(() => {
                cy.get('dt').should('have.length', 3);
                cy.get('dt').eq(0).should('contain.text', 'Velg instrument');
                cy.get('dd').eq(0).should('contain.text', 'Piano');
                cy.get('dt').eq(1).should('contain.text', 'Velg land du vil reise til');
                cy.get('dd').eq(1).should('contain.text', 'Italia');
                cy.get('dt').eq(2).should('contain.text', 'Velg valuta du vil betale med');
                cy.get('dd').eq(2).should('contain.text', 'Euro (EUR)');
              });
            cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveAndContinue }).should('exist');
            cy.contains(TEXTS.statiske.summaryPage.validationMessage).should('not.exist');
            cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');

            cy.clickSaveAndContinue();
            cy.wait('@submitMellomlagring');
          });

          it('even if submission data contains an invalid country', () => {
            cy.mocksUseRouteVariant('get-soknad:form-select-invalid-country-v1');

            cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad', (req) => {
              const { submission, attachments } = req.body;
              expect(submission.data.velgInstrument).to.deep.eq({ label: 'Piano', value: 'piano' });
              expect(submission.data.velgLand).to.deep.eq({ label: 'Invalid country', value: 'INVALID' });
              expect(submission.data.velgValutaDuVilBetaleMed).to.deep.eq({ label: 'Euro (EUR)', value: 'EUR' });
              expect(attachments).to.have.length(1);
              expect(attachments[0].vedleggsnr).to.eq('P2');
            }).as('submitMellomlagring');

            cy.visit(
              '/fyllut/testselect/oppsummering?sub=digital&innsendingsId=df6c8a69-9eb0-4878-b51f-38b3849ef9b6&lang=nb-NO',
            );
            cy.defaultWaits();
            cy.wait('@getMellomlagring');
            cy.get('dl')
              .eq(0)
              .within(() => {
                cy.get('dt').should('have.length', 3);
                cy.get('dt').eq(0).should('contain.text', 'Velg instrument');
                cy.get('dd').eq(0).should('contain.text', 'Piano');
                cy.get('dt').eq(1).should('contain.text', 'Velg land du vil reise til');
                cy.get('dd').eq(1).should('contain.text', 'Invalid country'); // <- invalid (dataSrc=url)
                cy.get('dt').eq(2).should('contain.text', 'Velg valuta du vil betale med');
                cy.get('dd').eq(2).should('contain.text', 'Euro (EUR)');
              });
            cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveAndContinue }).should('exist');
            cy.contains(TEXTS.statiske.summaryPage.validationMessage).should('not.exist');
            cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');

            cy.clickSaveAndContinue();
            cy.wait('@submitMellomlagring');
          });
        });
      });

      it('Allows user to submit complete submission', () => {
        cy.mocksUseRouteVariant('get-soknad:nav083501-complete-v1');
        cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad', (req) => {
          const { submission, attachments } = req.body;
          expect(submission.data.landvelger).to.deep.eq({ label: 'Frankrike', value: 'FR' });
          expect(attachments).to.have.length(2);
          expect(attachments[0].label).to.eq('Personinntektsskjema');
          expect(attachments[1].label).to.eq('Resultatregnskap');
        }).as('submitMellomlagring');
        cy.intercept('GET', '/fyllut/api/send-inn/soknad/2db25aab-3524-4426-a333-489542bf16bf').as('getMellomlagring');

        cy.visit(
          '/fyllut/nav083501/oppsummering?sub=digital&innsendingsId=2db25aab-3524-4426-a333-489542bf16bf&lang=nb-NO',
        );
        cy.defaultWaits();
        cy.wait('@getMellomlagring');
        cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveAndContinue }).should('exist');
        cy.contains(TEXTS.statiske.summaryPage.validationMessage).should('not.exist');
        cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
        cy.clickSaveAndContinue();
        cy.wait('@submitMellomlagring');
      });
    });
  });
});
