import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('Digital submission with attachments uploaded in Fyllut', () => {
  const getUploadOnlyAttachment = () => cy.contains('[data-cy=attachment-upload]', 'Vedlegg upload-only');

  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Form with attachments', () => {
    beforeEach(() => {
      cy.visit('/fyllut/formwithattachments?sub=digital');
      cy.defaultWaits();

      cy.clickIntroPageConfirmation();
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { level: 2, name: 'Diverse' }).should('exist');
      cy.findByRole('group', { name: /Radiopanel 1/ }).within(() => cy.findByLabelText('Radiovalg 1').check());
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
    });

    it('shows validation errors when files are not uploaded', () => {
      cy.findByRole('group', { name: /Vedlegg 1/ }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).check();
      });
      cy.findByRole('group', { name: /Vedlegg 2/ }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).check();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).check();
      });
      cy.clickSaveAndContinue();

      const validationErrors = [
        'Du må laste opp fil: Vedlegg 1',
        'Du må laste opp fil: Vedlegg 2',
        'Du må laste opp fil: Annen dokumentasjon',
        'Du må laste opp fil: Vedlegg upload-only',
      ];
      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findAllByRole('link', { name: /^Du må laste opp fil: .*/ }).should('have.length', validationErrors.length);

          validationErrors.forEach((message) => {
            cy.findByRole('link', { name: message }).should('exist');
          });
        });

      cy.findByRole('link', { name: 'Du må laste opp fil: Vedlegg 1' }).click();
      cy.findAttachment(/Vedlegg 1/).within(() => {
        cy.findByRole('button', { name: TEXTS.statiske.uploadFile.selectFile }).should('have.focus');
      });
    });

    it('renders attachments together with regular components without attachment-panel metadata', () => {
      cy.findByText('Kontroller at vedleggene er riktige før du fortsetter.').should('be.visible');
      cy.findByRole('textbox', { name: /Kommentar til vedlegg/ }).type('Relevant kommentar');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Oppsummering' }).click();

      // The heading also contains the missing-information icon title while attachments are unanswered.
      cy.findByRole('heading', { level: 3, name: /^Vedlegg/ })
        .closest('[data-cy=form-summary-panel]')
        .within(() => {
          cy.findByText('Kommentar til vedlegg').should('exist');
          cy.findByText('Relevant kommentar').should('exist');
        });
    });

    describe('uploading files', () => {
      beforeEach(() => {
        cy.findAttachment(/Vedlegg 1/).within(() => {
          cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).check();
          cy.uploadFile('small-file.txt');
        });

        cy.findAttachment(/Vedlegg 2/).within(() => {
          cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).check();
          cy.uploadFile('another-small-file.txt');
        });
        getUploadOnlyAttachment().within(() => cy.uploadFile('test.txt'));

        cy.findAttachment(/Annen dokumentasjon/).within(() => {
          cy.findByRole('radio', { name: TEXTS.statiske.attachment.uploadNow }).check();
          cy.findByLabelText(TEXTS.statiske.attachment.attachmentTitle).type('Annet vedlegg 1');
          cy.uploadFile('test.txt');
        });
        cy.clickSaveAndContinue();

        cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      });

      it('shows uploaded attachments on summary page', () => {
        cy.findByRole('heading', { level: 3, name: 'Vedlegg' })
          .should('exist')
          .closest('[data-cy=form-summary-panel]')
          .within(() => {
            cy.findByText('Vedlegg 1').should('exist');
            cy.findByText('Vedlegg 2').should('exist');
            cy.findByText('Vedlegg upload-only').should('exist');
            cy.findByText('Annet vedlegg 1').should('exist');
          });
      });

      ['upload', 'delete'].forEach((operation) => {
        ['success', 'failure'].forEach((outcome) => {
          it(`blocks submission during a pending ${operation} and recovers after ${outcome}`, () => {
            let submitRequests = 0;
            cy.intercept('POST', '**/api/send-inn/digital-application/*', () => {
              submitRequests += 1;
            });
            let releaseResponse = () => {
              throw new Error('Attachment request has not been intercepted');
            };
            cy.intercept(
              operation === 'upload' ? 'POST' : 'DELETE',
              operation === 'upload'
                ? '**/api/send-inn/digital-application/*/attachments/*'
                : '**/api/send-inn/digital-application/*/attachments/*/*',
              (request) =>
                new Cypress.Promise<void>((resolve) => {
                  releaseResponse = () => {
                    if (outcome === 'failure') {
                      request.reply({ statusCode: 503, body: { errorCode: 'SERVICE_UNAVAILABLE' } });
                    } else {
                      request.continue();
                    }
                    resolve();
                  };
                }),
            ).as('pendingAttachment');

            cy.clickPreviousStep();
            cy.contains('[data-cy=attachment-upload]', 'Vedlegg 1').within(() => {
              if (operation === 'upload') {
                cy.uploadFile('another-small-file.txt');
              } else {
                cy.findByRole('button', { name: 'Slett filen' }).click();
              }
            });
            cy.findByRole('textbox', { name: /Kommentar til vedlegg/ }).type('Edited while pending');
            cy.clickSaveAndContinue();
            cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
            cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.sendToNav })
              .should('be.enabled')
              .and('have.attr', 'data-variant', 'secondary');
            cy.findByText(TEXTS.statiske.attachment.pendingOperations).should('not.exist');
            cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.sendToNav }).click();
            cy.findByRole('alert').should('contain.text', TEXTS.statiske.attachment.pendingOperations);
            cy.then(() => submitRequests).should('eq', 0);
            cy.findByText('Edited while pending').should('exist');

            cy.then(() => releaseResponse());
            cy.wait('@pendingAttachment');
            cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.sendToNav }).should('be.enabled');
            cy.findByText(TEXTS.statiske.attachment.pendingOperations).should('not.exist');
            if (operation === 'upload' || outcome === 'failure') {
              cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.sendToNav }).should(
                'have.attr',
                'data-variant',
                'primary',
              );
            }
          });
        });
      });

      it('submits attachments with the form', () => {
        cy.mocksUseRouteVariant('post-familie-pdf:success-tc07');
        cy.mocksUseRouteVariant('post-digital-soknad:success-tc07');
        cy.clickSendNav();

        cy.findByRole('heading', { level: 2, name: 'Kvittering' }).should('exist');
        cy.findByText('Vedlegg 1').should('exist');
        cy.findByText('Vedlegg 2').should('exist');
        cy.findByText('Vedlegg upload-only').should('exist');
        cy.findByText('Annet vedlegg 1').should('exist');
      });
    });
  });
});
