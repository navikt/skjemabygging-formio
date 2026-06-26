/*
 * Replacement suite for mellomlagring.cy.ts with the same scenario coverage,
 * but less brittle selectors, less repeated setup, and fewer assertions that
 * depend on hidden DOM or transient rerenders.
 */

import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';

const validInnsendingsId = '8e3c3621-76d7-4ebd-90d4-34448ebcccc3';
const updateErrorInnsendingsId = 'f99dc639-add1-468f-b4bb-961cdfd1e599';
const selectMellomlagringId = 'df6c8a69-9eb0-4878-b51f-38b3849ef9b6';
const completeSubmissionId = '2db25aab-3524-4426-a333-489542bf16bf';

const expectSummaryPage = () => {
  cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).shouldBeVisible();
};

const failOnSubmitApplicationAttempt = () => {
  cy.intercept('POST', '/fyllut/api/send-inn/digital-application/*', () => {
    throw new Error('Submission should be blocked by summary validation');
  });
};

const openSummaryInStepper = () => {
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: TEXTS.statiske.summaryPage.title }).click();
  expectSummaryPage();
};

const withinOpenDialog = (callback: () => void) => {
  cy.get('dialog[open]').should('be.visible').within(callback);
};

const testConfirmationModal = (
  buttonText: string,
  modalTexts: {
    body: string;
    title: string;
    cancel: string;
    confirm: string;
  },
) => {
  cy.findByRole('button', { name: buttonText }).click();
  withinOpenDialog(() => {
    cy.findByText(modalTexts.body).shouldBeVisible();
    cy.findByRole('button', { name: modalTexts.cancel }).click();
  });
  cy.get('dialog[open]').should('not.exist');

  cy.findByRole('button', { name: buttonText }).click();
  withinOpenDialog(() => {
    cy.findByText(modalTexts.body).shouldBeVisible();
    cy.findByRole('button', { name: modalTexts.confirm }).click();
  });
};

const confirmSaveDraftAfterCancellingOnce = () => {
  const body = TEXTS.grensesnitt.confirmSavePrompt.body.replace('{{date}}', '10.01.2024').trim();

  cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveDraft }).click();
  withinOpenDialog(() => {
    cy.findByText(body).shouldBeVisible();
    cy.findByRole('button', { name: TEXTS.grensesnitt.confirmSavePrompt.cancel }).click();
  });
  cy.get('dialog[open]').should('not.exist');

  cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveDraft }).click();
  withinOpenDialog(() => {
    cy.findByText(body).shouldBeVisible();
    cy.findByRole('button', { name: TEXTS.grensesnitt.confirmSavePrompt.confirm }).click();
  });
};

const expectSummaryValidationToBlockSubmission = () => {
  cy.clickSendNav();
  cy.contains(TEXTS.statiske.summaryPage.validationMessage).shouldBeVisible();
  expectSummaryPage();
  cy.url().should('not.include', '/kvittering');
};

describe('Mellomlagring v2', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
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
    it('navigates directly to and renders summary page even though submission is empty', () => {
      cy.visitRouteAndWait('/fyllut/testmellomlagring/oppsummering?sub=paper&lang=nb-NO');
      expectSummaryPage();
    });

    it('does not fetch or update mellomlagring', () => {
      cy.visitRouteAndWait('/fyllut/testmellomlagring?sub=paper');

      cy.clickStart();
      cy.findByRole('heading', { name: 'Valgfrie opplysninger' }).shouldBeVisible();
      cy.get('@createMellomlagringSpy').should('not.have.been.called');

      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
        cy.findByLabelText('Ja').check();
      });
      cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).type('03876399856');

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
    });
  });

  describe('When submission method is "digital"', () => {
    beforeEach(() => {
      cy.intercept('GET', `/fyllut/api/send-inn/soknad/${validInnsendingsId}`).as('getMellomlagringValid');
      cy.intercept('GET', `/fyllut/api/send-inn/soknad/${updateErrorInnsendingsId}`).as(
        'getMellomlagringForInnsendingWithUpdateError',
      );
      cy.intercept('DELETE', `/fyllut/api/send-inn/soknad/${validInnsendingsId}`).as('deleteMellomlagring');
    });

    it('creates and updates mellomlagring', () => {
      cy.visitRouteAndWait('/fyllut/testmellomlagring?sub=digital');

      cy.clickStart();
      cy.wait('@createMellomlagring');
      cy.findByRole('heading', { name: 'Valgfrie opplysninger' }).shouldBeVisible();

      cy.clickSaveAndContinue();
      cy.wait('@updateMellomlagring');

      cy.findByRole('group', { name: 'Ønsker du å få gaven innpakket' }).within(() => {
        cy.findByLabelText('Nei').check({ force: true });
      });

      cy.clickSaveAndContinue();
      cy.wait('@updateMellomlagring');

      cy.findByRole('combobox', { name: 'Hvordan ønsker du å motta pakken?' }).click();
      cy.findByRole('combobox', { name: 'Hvordan ønsker du å motta pakken?' }).type('P{enter}');

      cy.clickSaveAndContinue();
      cy.wait('@updateMellomlagring');
      cy.clickSaveAndContinue();
      cy.wait('@updateMellomlagring');

      cy.findByRole('heading', { name: TEXTS.statiske.attachment.title }).shouldBeVisible();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByLabelText(/Nei, jeg har ingen ekstra dokumentasjon/).check();
      });
      cy.findByRole('group', { name: /Oppmøtebekreftelse/ }).within(() => {
        cy.findByLabelText(/ettersender dokumentasjonen senere/).check();
      });
      cy.findByRole('group', { name: /Bekreftelse på at du av helsemessige/ }).within(() => {
        cy.findByLabelText(/ettersender dokumentasjonen senere/).check();
      });

      cy.clickSaveAndContinue();
      cy.wait('@updateMellomlagring');

      cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveDraft }).shouldBeVisible();
      cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.cancelAndDelete }).shouldBeVisible();
    });

    it('fetches mellomlagring and starts from the intro page when url contains "innsendingsId"', () => {
      cy.visitRouteAndWait(`/fyllut/testmellomlagring?sub=digital&innsendingsId=${validInnsendingsId}&lang=nb-NO`, [
        '@getMellomlagringValid',
      ]);

      cy.url().should('include', `innsendingsId=${validInnsendingsId}`);
      cy.findByRole('heading', { name: TEXTS.statiske.introPage.title }).shouldBeVisible();
      cy.clickStart();
      cy.url().should('include', `innsendingsId=${validInnsendingsId}`);
      cy.url().should('include', '/valgfrieOpplysninger');
    });

    it('redirects to form not found page when not found', () => {
      cy.mocksUseRouteVariant('get-soknad:not-found');

      cy.visitRouteAndWait(`/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=${validInnsendingsId}`, [
        '@getMellomlagringValid',
      ]);

      cy.url().should('not.include', validInnsendingsId);
      cy.url().should('not.include', 'sub=digital');
      cy.url().should('not.include', 'oppsummering');
      cy.url().should('equal', `${Cypress.env('BASE_URL')}/fyllut/soknad-ikke-funnet`);
    });

    it('shows an error when deleting mellomlagring fails', () => {
      cy.mocksUseRouteVariant('delete-soknad:failure');
      cy.visitRouteAndWait(
        `/fyllut/testmellomlagring/gave?sub=digital&innsendingsId=${validInnsendingsId}&lang=nb-NO`,
        ['@getMellomlagringValid'],
      );

      cy.findByRole('group', { name: 'Ønsker du å få gaven innpakket' }).shouldBeVisible();
      testConfirmationModal(TEXTS.grensesnitt.navigation.cancelAndDelete, TEXTS.grensesnitt.confirmDeletePrompt);
      cy.wait('@deleteMellomlagring');
      cy.findByText(TEXTS.statiske.mellomlagringError.delete.message).shouldBeVisible();
    });

    it('shows an error when saving mellomlagring before cancelling fails', () => {
      cy.mocksUseRouteVariant('put-soknad:failure');
      cy.visitRouteAndWait(
        `/fyllut/testmellomlagring/gave?sub=digital&innsendingsId=${updateErrorInnsendingsId}&lang=nb-NO`,
        ['@getMellomlagringForInnsendingWithUpdateError'],
      );

      cy.findByRole('group', { name: 'Ønsker du å få gaven innpakket' }).shouldBeVisible();
      confirmSaveDraftAfterCancellingOnce();
      cy.wait('@updateMellomlagring');
      cy.findByText(TEXTS.statiske.mellomlagringError.update.message).shouldBeVisible();
    });

    describe('When partially filling out a form', () => {
      it('should navigate to first component with validation error from summary', () => {
        cy.defaultInterceptsExternal();
        failOnSubmitApplicationAttempt();
        cy.visitRouteAndWait('/fyllut/components?sub=digital');

        cy.clickIntroPageConfirmation();
        cy.clickStart();
        cy.wait('@createMellomlagring');
        cy.findByRole('heading', { name: 'Dine opplysninger' }).shouldBeVisible();

        openSummaryInStepper();
        expectSummaryValidationToBlockSubmission();
        cy.clickEditAnswers();
        cy.wait('@getActivities');
        cy.findByRole('group', { name: 'Hvilken aktivitet søker du om støtte i forbindelse med?' }).should(
          'have.focus',
        );
      });

      it('should navigate to first component with validation error from summary, in a large form', () => {
        cy.visitRouteAndWait('/fyllut/largeform?sub=digital');

        cy.clickIntroPageConfirmation();
        cy.clickStart();
        cy.wait('@createMellomlagring');

        cy.findByRole('checkbox', { name: 'Avkryssingsboks 1' }).shouldBeVisible().click();
        cy.findByRole('textbox', { name: 'Tekstfelt 1a' }).type('a');
        cy.findByRole('textbox', { name: 'Tekstfelt 1b' }).type('b');
        cy.findByRole('textbox', { name: 'Tekstfelt 1c' }).type('c');
        cy.findByRole('textbox', { name: 'Tekstfelt 1d' }).type('d');
        cy.findByRole('textbox', { name: 'Tekstfelt 1e' }).type('e');
        cy.findByRole('textbox', { name: 'Tekstfelt 1f' }).type('f');
        cy.findByRole('textbox', { name: 'Tekstfelt 1g' }).type('g');
        cy.findByRole('textbox', { name: 'Tekstfelt 1h' }).type('h');
        cy.findByRole('textbox', { name: 'Tekstområde 1' }).type('test');
        cy.findByRole('textbox', { name: 'Tall 1' }).type('123');

        cy.clickSaveAndContinue();
        cy.findByRole('checkbox', { name: 'Avkryssingsboks 2' }).shouldBeVisible().click();

        openSummaryInStepper();
        cy.clickEditAnswers();
        cy.url().should('include', '/p2');
        cy.findByRole('textbox', { name: 'Tekstfelt 2a' }).shouldBeVisible().should('have.focus');
      });
    });

    describe('When starting on the summary page', () => {
      it('redirects to start page if url does not contain "innsendingsId"', () => {
        cy.skipIfNoIncludeDistTests();
        cy.visitRouteAndWait('/fyllut/testmellomlagring/oppsummering?sub=digital&lang=nb-NO');
        cy.findByRole('heading', { name: TEXTS.statiske.introPage.title }).shouldBeVisible();
      });

      describe('When url contains query param "innsendingsId"', () => {
        beforeEach(() => {
          cy.fixture('mellomlagring/submitTestMellomlagring.json').then((fixture) => {
            cy.submitApplication((req) => {
              const { submission: bodySubmission } = req.body;
              const { submission: fixtureSubmission } = fixture;
              expect(bodySubmission.data).to.deep.eq(fixtureSubmission.data);
            });
          });
        });

        it('retrieves mellomlagring and redirects after submitting', () => {
          cy.visitRouteAndWait(`/fyllut/testmellomlagring?sub=digital&innsendingsId=${validInnsendingsId}&lang=nb-NO`, [
            '@getMellomlagringValid',
          ]);

          openSummaryInStepper();
          cy.findByText('Ønsker du å få gaven innpakket').should('exist');
          cy.clickSendNav();
          cy.wait('@submitApplication');
          cy.findByRole('heading', { name: 'Kvittering' }).shouldBeVisible();
        });

        it('retrieves mellomlagring and lets you navigate to first panel with error', () => {
          failOnSubmitApplicationAttempt();
          cy.visitRouteAndWait(
            `/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=${validInnsendingsId}&lang=nb-NO`,
            ['@getMellomlagringValid'],
          );

          cy.clickShowAllSteps();
          cy.findByRole('link', { name: 'Levering' }).click();
          cy.findByRole('heading', { name: 'Levering' }).shouldBeVisible();

          cy.findByRole('combobox', { name: 'Hvordan ønsker du å motta pakken?' })
            .get('svg')
            .eq(2)
            .click({ force: true });

          cy.findByRole('link', { name: TEXTS.statiske.summaryPage.title }).click();
          expectSummaryValidationToBlockSubmission();
          cy.clickEditAnswers();

          cy.url().should('include', '/levering');
          cy.findByRole('combobox', { name: 'Hvordan ønsker du å motta pakken?' })
            .shouldBeVisible()
            .should('have.focus');
        });

        describe('retrieves mellomlagring containing vedleggsliste', () => {
          it('shows attachment page when empty', () => {
            cy.visitRouteAndWait(
              `/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=${validInnsendingsId}&lang=nb-NO`,
              ['@getMellomlagringValid'],
            );
            cy.clickShowAllSteps();
            cy.findByRole('link', { name: 'Vedlegg' }).should('exist');
          });

          it('hides attachment page when not empty', () => {
            cy.mocksUseRouteVariant('get-soknad:success-1-sendinn-upload');
            cy.visitRouteAndWait(
              `/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=${validInnsendingsId}&lang=nb-NO`,
              ['@getMellomlagringValid'],
            );
            cy.clickShowAllSteps();
            cy.findByRole('link', { name: 'Vedlegg' }).should('not.exist');
          });
        });

        it('lets you edit and update submission data', () => {
          cy.visitRouteAndWait(
            `/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=${validInnsendingsId}&lang=nb-NO`,
            ['@getMellomlagringValid'],
          );

          cy.findByText('Ønsker du å få gaven innpakket').should('exist').next('dd').should('contain.text', 'Nei');
          cy.findByText('Farge').should('not.exist');
          cy.findByText('Tekst på kortet').should('not.exist');

          cy.clickEditAnswer('Gave');
          cy.findByRole('group', { name: 'Ønsker du å få gaven innpakket' }).within(() => {
            cy.findByLabelText('Ja').click();
            cy.findByLabelText('Ja').should('be.checked');
          });

          cy.findByRole('group', { name: 'Farge' }).shouldBeVisible();

          cy.clickSaveAndContinue();
          cy.get('@updateMellomlagringSpy').should('not.have.been.called');

          cy.get('[data-cy=error-summary]').within(() => {
            cy.get('a').should('have.length', 2);
            cy.findByRole('link', { name: 'Du må fylle ut: Farge' }).click({ force: true });
          });

          cy.findByRole('group', { name: 'Farge' })
            .should('have.focus')
            .within(() => {
              cy.findByLabelText('Rød').click();
            });

          cy.get('[data-cy=error-summary]').within(() => {
            cy.get('a').should('have.length', 1);
            cy.findByRole('link', { name: 'Du må fylle ut: Tekst på kortet' }).click({ force: true });
          });

          cy.findByLabelText('Tekst på kortet').should('have.focus').type('Takk for hjelpen!');

          openSummaryInStepper();
          cy.findByText('Ønsker du å få gaven innpakket').should('exist').next('dd').should('contain.text', 'Ja');
          cy.findByText('Farge').should('exist').next('dd').should('contain.text', 'Rød');
          cy.findByText('Tekst på kortet').should('exist').next('dd').should('contain.text', 'Takk for hjelpen!');
        });

        it('shows an error when deleting mellomlagring from summary fails', () => {
          cy.mocksUseRouteVariant('delete-soknad:failure');
          cy.visitRouteAndWait(
            `/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=${validInnsendingsId}&lang=nb-NO`,
            ['@getMellomlagringValid'],
          );

          testConfirmationModal(TEXTS.grensesnitt.navigation.cancelAndDelete, TEXTS.grensesnitt.confirmDeletePrompt);
          cy.wait('@deleteMellomlagring');
          cy.findByText(TEXTS.statiske.mellomlagringError.delete.message).shouldBeVisible();
        });

        it('shows an error when saving mellomlagring from summary fails', () => {
          cy.mocksUseRouteVariant('put-soknad:failure');
          cy.visitRouteAndWait(
            `/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=${updateErrorInnsendingsId}&lang=nb-NO`,
            ['@getMellomlagringForInnsendingWithUpdateError'],
          );

          confirmSaveDraftAfterCancellingOnce();
          cy.wait('@updateMellomlagring');
          cy.findByText(TEXTS.statiske.mellomlagringError.update.message).shouldBeVisible();
        });

        it('shows loading state and submits correctly when entering directly on summary page', () => {
          cy.intercept('GET', `/fyllut/api/send-inn/soknad/${validInnsendingsId}`, (req) => {
            req.continue((res) => {
              res.setDelay(500);
            });
          }).as('getMellomlagringDelayed');

          cy.visitRouteAndWait(
            `/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=${validInnsendingsId}&lang=nb-NO`,
          );

          cy.findAllByTestId('skeleton').should('have.length.greaterThan', 0);
          cy.wait('@getMellomlagringDelayed');

          expectSummaryPage();
          cy.findByText('Ønsker du å få gaven innpakket').should('exist').next('dd').should('contain.text', 'Nei');

          cy.clickSendNav();
          cy.wait('@submitApplication');
          cy.findByRole('heading', { name: 'Kvittering' }).shouldBeVisible();
        });
      });

      describe('When stored submission contains values for inputs that have been removed from the form', () => {
        beforeEach(() => {
          cy.mocksUseRouteVariant('get-soknad:success-extra-values');
          cy.submitApplication((req) => {
            const { submission } = req.body;
            expect(submission.data['slettetTekstfelt']).to.be.undefined;
            expect(submission.data['container.slettetTekstFelt']).to.be.undefined;
            expect(submission.data['datagrid']).to.deep.eq([{ tekstfelt: 'Hoppeslott' }, { tekstfelt: 'Hund' }]);
            expect(submission.data['datagrid1']).to.be.undefined;
            expect(submission.data['hvaSyntesDuOmFrokosten']).to.be.undefined;
            req.reply(201);
          });
        });

        it('removes the unused values from submission before submitting', () => {
          cy.visitRouteAndWait(
            `/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=${validInnsendingsId}&lang=nb-NO`,
            ['@getMellomlagringValid'],
          );

          cy.findByText('Ønsker du å få gaven innpakket').should('exist');
          cy.clickSendNav();
          cy.wait('@submitApplication');
          cy.findByRole('heading', { name: 'Kvittering' }).shouldBeVisible();
        });
      });

      describe('When stored submission contains value which no longer is available in select', () => {
        it('shows an info message and blocks submission on the summary page', () => {
          cy.mocksUseRouteVariant('get-form-deprecated:success-v2');
          failOnSubmitApplicationAttempt();
          cy.visitRouteAndWait(
            `/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=${validInnsendingsId}&lang=nb-NO`,
            ['@getMellomlagringValid'],
          );

          cy.contains(TEXTS.statiske.summaryPage.validationMessage).should('exist');
          expectSummaryPage();
          expectSummaryValidationToBlockSubmission();
        });
      });

      describe('When form contains select components with dataSrc "values" and "url"', () => {
        beforeEach(() => {
          cy.intercept('GET', `/fyllut/api/send-inn/soknad/${selectMellomlagringId}`).as('getMellomlagring');
        });

        describe('it does not allow user to continue to sendinn application', () => {
          it('when submission data is not complete', () => {
            cy.mocksUseRouteVariant('get-soknad:form-select-partial-v1');
            failOnSubmitApplicationAttempt();
            cy.visitRouteAndWait(
              `/fyllut/testselect/oppsummering?sub=digital&innsendingsId=${selectMellomlagringId}&lang=nb-NO`,
              ['@getMellomlagring'],
            );

            cy.get('dl')
              .eq(0)
              .within(() => {
                cy.get('dt').should('have.length', 1);
                cy.get('dt').eq(0).should('contain.text', 'Velg instrument');
                cy.get('dd').eq(0).should('contain.text', 'Piano');
              });

            cy.contains(TEXTS.statiske.summaryPage.validationMessage).should('exist');
            expectSummaryPage();
            expectSummaryValidationToBlockSubmission();
          });

          it('when form-v2 does not allow value anymore', () => {
            cy.mocksUseRouteVariant('get-form-deprecated:success-v2');
            cy.mocksUseRouteVariant('get-soknad:form-select-invalid-instrument-v1');
            failOnSubmitApplicationAttempt();
            cy.visitRouteAndWait(
              `/fyllut/testselect/oppsummering?sub=digital&innsendingsId=${selectMellomlagringId}&lang=nb-NO`,
              ['@getMellomlagring'],
            );

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

            cy.contains(TEXTS.statiske.summaryPage.validationMessage).should('exist');
            expectSummaryPage();
            expectSummaryValidationToBlockSubmission();
          });
        });

        describe('allows user to submit application', () => {
          it('when submission data is complete and valid', () => {
            cy.mocksUseRouteVariant('get-soknad:form-select-complete-v1');
            cy.submitApplication((req) => {
              const { submission } = req.body;
              expect(submission.data.velgInstrument).to.deep.eq({ label: 'Piano', value: 'piano' });
              expect(submission.data.velgLand).to.deep.eq({ label: 'Italia', value: 'IT' });
              expect(submission.data.velgValutaDuVilBetaleMed).to.deep.eq({ label: 'Euro (EUR)', value: 'EUR' });
              expect(submission.attachments).to.have.length(2);
              expect(submission.attachments[0].title).to.eq('Kursbevis');
            });

            cy.visitRouteAndWait(
              `/fyllut/testselect/oppsummering?sub=digital&innsendingsId=${selectMellomlagringId}&lang=nb-NO`,
              ['@getMellomlagring'],
            );

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

            cy.contains(TEXTS.statiske.summaryPage.validationMessage).should('not.exist');
            expectSummaryPage();

            cy.clickSendNav();
            cy.wait('@submitApplication');
            cy.findByRole('heading', { name: 'Kvittering' }).shouldBeVisible();
          });

          it('even if submission data contains an invalid country', () => {
            cy.mocksUseRouteVariant('get-soknad:form-select-invalid-country-v1');
            cy.submitApplication((req) => {
              const { submission } = req.body;
              expect(submission.data.velgInstrument).to.deep.eq({ label: 'Piano', value: 'piano' });
              expect(submission.data.velgLand).to.deep.eq({ label: 'Invalid country', value: 'INVALID' });
              expect(submission.data.velgValutaDuVilBetaleMed).to.deep.eq({ label: 'Euro (EUR)', value: 'EUR' });
              expect(submission.attachments).to.have.length(2);
            });

            cy.visitRouteAndWait(
              `/fyllut/testselect/oppsummering?sub=digital&innsendingsId=${selectMellomlagringId}&lang=nb-NO`,
              ['@getMellomlagring'],
            );

            cy.get('dl')
              .eq(0)
              .within(() => {
                cy.get('dt').should('have.length', 3);
                cy.get('dt').eq(0).should('contain.text', 'Velg instrument');
                cy.get('dd').eq(0).should('contain.text', 'Piano');
                cy.get('dt').eq(1).should('contain.text', 'Velg land du vil reise til');
                cy.get('dd').eq(1).should('contain.text', 'Invalid country');
                cy.get('dt').eq(2).should('contain.text', 'Velg valuta du vil betale med');
                cy.get('dd').eq(2).should('contain.text', 'Euro (EUR)');
              });

            cy.contains(TEXTS.statiske.summaryPage.validationMessage).should('not.exist');
            expectSummaryPage();

            cy.clickSendNav();
            cy.wait('@submitApplication');
            cy.findByRole('heading', { name: 'Kvittering' }).shouldBeVisible();
          });
        });
      });

      it('allows user to submit complete submission', () => {
        cy.mocksUseRouteVariant('get-soknad:nav083501-complete-v1');
        cy.submitApplication((req) => {
          const { submission } = req.body;
          expect(submission.data.landvelger).to.deep.eq({ label: 'Frankrike', value: 'FR' });
          expect(submission.attachments).to.have.length(3);
          expect(submission.attachments[0].title).to.eq('Personinntektsskjema');
          expect(submission.attachments[1].title).to.eq('Resultatregnskap');
        });
        cy.intercept('GET', `/fyllut/api/send-inn/soknad/${completeSubmissionId}`).as('getMellomlagring');

        cy.visitRouteAndWait(
          `/fyllut/nav083501/oppsummering?sub=digital&innsendingsId=${completeSubmissionId}&lang=nb-NO`,
          ['@getMellomlagring'],
        );

        cy.contains(TEXTS.statiske.summaryPage.validationMessage).should('not.exist');
        expectSummaryPage();

        cy.clickSendNav();
        cy.wait('@submitApplication');
        cy.findByRole('heading', { name: 'Kvittering' }).shouldBeVisible();
      });
    });
  });
});
