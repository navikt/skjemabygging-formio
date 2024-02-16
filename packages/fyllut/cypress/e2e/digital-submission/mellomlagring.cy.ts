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
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.intercept('POST', '/fyllut/api/send-inn/soknad*', cy.spy().as('createMellomlagringSpy'));
    cy.intercept('PUT', '/fyllut/api/send-inn/soknad*', cy.spy().as('updateMellomlagringSpy'));
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('When submission method is "paper"', () => {
    it('does not fetch or update mellomlagring', () => {
      cy.visit('/fyllut/testmellomlagring?sub=paper');
      cy.wait('@getForm');
      cy.wait('@getTranslations');
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
      cy.findByRole('group', { name: 'Annen dokumentasjon' }).within(() => {
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
      cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.cancelAndDelete }).should('not.exist');
      cy.findByRole('link', { name: TEXTS.grensesnitt.summaryPage.editAnswers })
        .should('exist')
        .and('have.attr', 'href', '/fyllut/testmellomlagring/valgfrieOpplysninger?sub=paper');
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
      cy.wait('@getForm');
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
      cy.findByRole('link', { name: TEXTS.grensesnitt.summaryPage.editAnswers })
        .should('exist')
        .and(
          'have.attr',
          'href',
          '/fyllut/testmellomlagring/valgfrieOpplysninger?sub=digital&innsendingsId=75eedb4c-1253-44d8-9fde-3648f4bb1878#hvaDrakkDuTilFrokost',
        );
    });

    it('fetches mellomlagring and navigates to "/summary" on start, when url contains "innsendingsId"', () => {
      cy.visit('/fyllut/testmellomlagring?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3&lang=nb-NO');
      cy.wait('@getMellomlagringValid');
      cy.findByRole('heading', { name: TEXTS.statiske.introPage.title }).should('exist');
      cy.clickStart();
      cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
    });

    it('redirects to start of application if an application with the "innsendingsId" from the url is not found', () => {
      cy.mocksUseRouteVariant('get-soknad:not-found');

      cy.visit(
        '/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3&lang=nb-NO',
      );
      cy.wait('@getForm');
      cy.wait('@getMellomlagringValid');
      cy.url().should('not.include', '8e3c3621-76d7-4ebd-90d4-34448ebcccc3');
      cy.url().should('not.include', 'sub=digital');
      cy.url().should('not.include', 'oppsummering');
      cy.url().should('equal', `${Cypress.env('BASE_URL')}/fyllut/testmellomlagring`);
    });

    it('lets you delete mellomlagring', () => {
      cy.mocksUseRouteVariant('delete-soknad:failure');

      cy.visit(
        '/fyllut/testmellomlagring/gave?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3&lang=nb-NO',
      );
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
        cy.visit('/fyllut/testmellomlagring/oppsummering?sub=digital&lang=nb-NO');
        cy.wait('@getForm');
        cy.findByRole('heading', { name: TEXTS.statiske.introPage.title }).should('exist');
      });

      describe('When url contains query param "innsendingsId"', () => {
        beforeEach(() => {
          cy.fixture('mellomlagring/submitTestMellomlagring.json').then((fixture) => {
            cy.submitMellomlagring((req) => {
              const { submission: bodySubmission, ...bodyRest } = req.body;
              const { submission: fixtureSubmission, ...fixtureRest } = fixture;
              expect(bodySubmission.data).to.deep.eq(fixtureSubmission.data);
              expect(bodyRest).to.deep.eq(fixtureRest);
            });
          });
        });

        it('retrieves mellomlagring and redirects after submitting', () => {
          cy.visit(
            '/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3&lang=nb-NO',
          );
          cy.wait('@getMellomlagringValid');
          cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
          cy.findByText('Ønsker du å få gaven innpakket').should('exist');
          cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveAndContinue }).should('exist').click();
          cy.wait('@submitMellomlagring');
          cy.url().should('not.include', 'testMellomlagring');
        });

        it('retrieves mellomlagring and lets you navigate to first empty panel', () => {
          cy.visit(
            '/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3&lang=nb-NO',
          );
          cy.wait('@getMellomlagringValid');
          cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
          cy.findByRole('link', { name: TEXTS.grensesnitt.summaryPage.editAnswers }).should('exist').click();
          cy.url().should('include', '/valgfrieOpplysninger');
          cy.findByRole('textbox', { name: 'Hva drakk du til frokost (valgfritt)' }).should('have.focus');
        });

        it('lets you edit and update submission data', () => {
          cy.visit(
            '/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3&lang=nb-NO',
          );
          cy.wait('@getMellomlagringValid');
          cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
          cy.findByText('Ønsker du å få gaven innpakket').should('exist').next('dd').should('contain.text', 'Nei');
          cy.findByText('Farge').should('not.exist');
          cy.findByText('Tekst på kortet').should('not.exist');

          cy.findByRole('link', { name: 'Rediger gave' }).should('exist').click();
          cy.findByRole('heading', { name: 'Gave' }).should('exist');
          cy.findByRole('group', { name: 'Ønsker du å få gaven innpakket' })
            .should('exist')
            .within(() => {
              cy.findByLabelText('Ja').click();
              cy.findByLabelText('Ja').should('be.checked');
            });
          cy.clickSaveAndContinue();
          cy.get('@updateMellomlagringSpy').should('not.have.been.called');

          cy.findByRole('heading', { name: TEXTS.validering.error })
            .should('exist')
            .parent()
            .within(() => {
              cy.get('li').should('have.length', 2);
            });

          cy.findByRole('link', { name: 'Du må fylle ut: Farge' }).should('exist').click();
          cy.findByRole('radio', { name: 'Grønn' }).should('have.focus');
          cy.findByRole('radio', { name: 'Rød' }).should('exist').click();

          cy.findByRole('link', { name: 'Du må fylle ut: Tekst på kortet' }).should('exist').click();
          cy.findByLabelText('Tekst på kortet').should('have.focus').type('Takk for hjelpen!');

          cy.findByRole('link', { name: 'Oppsummering' }).click();
          cy.wait('@updateMellomlagring');
          cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
          cy.findByText('Ønsker du å få gaven innpakket').should('exist').next('dd').should('contain.text', 'Ja');
          cy.findByText('Farge').should('exist').next('dd').should('contain.text', 'Rød');
          cy.findByText('Tekst på kortet').should('exist').next('dd').should('contain.text', 'Takk for hjelpen!');
          cy.get('@updateMellomlagringSpy').should('have.been.calledOnce');
        });

        it('lets you delete mellomlagring', () => {
          cy.mocksUseRouteVariant('delete-soknad:failure');

          cy.visit(
            '/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3&lang=nb-NO',
          );
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
          });
        });

        it('removes the unused values from submission before submitting', () => {
          cy.visit(
            '/fyllut/testmellomlagring/oppsummering?sub=digital&innsendingsId=8e3c3621-76d7-4ebd-90d4-34448ebcccc3&lang=nb-NO',
          );
          cy.wait('@getMellomlagringValid');
          cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).should('exist');
          cy.findByText('Ønsker du å få gaven innpakket').should('exist');
          cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveAndContinue }).click();
          cy.wait('@submitMellomlagring');
        });
      });
    });
  });
});
