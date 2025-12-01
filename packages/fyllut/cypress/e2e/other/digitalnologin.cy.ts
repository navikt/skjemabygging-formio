import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('Digital no login', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Form with attachments', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/digitalnologinwithattachmentpanel');
      cy.defaultWaits();
      cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigitalNoLogin }).click();
      cy.findByLabelText(TEXTS.statiske.uploadId.norwegianPassport).click();
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from('file content'),
          fileName: 'test.txt',
        },
        { force: true },
      );
      cy.clickNextStep();
    });

    it('navigates to attachment panel', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).should('exist');

      cy.clickStart();
      cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('abc');
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
      cy.findByRole('group', {
        name: 'Informasjon om din næringsinntekt fra Norge eller utlandet',
      }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.ettersender }).click();
      });
      cy.findByRole('group', {
        name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
      }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.nei }).click();
      });
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.findByRole('heading', { level: 2, name: 'Vedlegg' })
        .parent()
        .parent()
        .within(() => {
          cy.findByText('Informasjon om din næringsinntekt fra Norge eller utlandet');
          cy.findByText(TEXTS.statiske.attachment.ettersender);
          cy.findByText('Annen dokumentasjon');
          cy.findByText(TEXTS.statiske.attachment.nei);
        });

      cy.clickPreviousStep();
      cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
    });

    it('navigates to attachment panel using the link in the form stepper', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).should('exist');
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
      cy.findByRole('group', {
        name: 'Informasjon om din næringsinntekt fra Norge eller utlandet',
      }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.ettersender }).click();
      });
      cy.findByRole('group', {
        name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
      }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.nei }).click();
      });
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('heading', { level: 2, name: 'Vedlegg' }).should('exist');
    });
  });

  describe('Form without attachments', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/stdigitalnologin');
      cy.defaultWaits();
      cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigitalNoLogin }).click();
    });

    it('shows validation errors if no personal ID has been uploaded', () => {
      cy.findByRole('heading', { name: TEXTS.statiske.uploadId.title }).should('exist');
      cy.clickNextStep();
      cy.findByText(`Du må fylle ut: ${TEXTS.statiske.uploadId.label}`).should('exist');
      cy.findByLabelText(TEXTS.statiske.uploadId.norwegianPassport).click();
      cy.findByText(`Du må fylle ut: ${TEXTS.statiske.uploadId.title}`).should('not.exist');
      cy.clickNextStep();
      cy.findByText(TEXTS.statiske.uploadId.missingUploadError).should('exist');
    });

    it('lets you upload a file when selecting a type of personal ID', () => {
      cy.findByRole('heading', { name: TEXTS.statiske.uploadId.title }).should('exist');
      cy.findByRole('button', { name: TEXTS.statiske.uploadId.selectFileButton }).should('not.exist');
      cy.findByLabelText(TEXTS.statiske.uploadId.norwegianPassport).click();
      cy.findByText(TEXTS.statiske.uploadId.selectFileButton).should('exist').should('be.visible');

      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from('file content'),
          fileName: 'test.txt',
        },
        { force: true },
      );

      cy.findByText('test.txt').should('exist');
      cy.findByText('0,04 MB').should('exist');

      cy.clickNextStep();
      cy.clickStart();
      cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
    });

    it('redirect user if we get 403 from ID upload', () => {
      cy.mocksUseRouteVariant('upload-file:forbidden');

      cy.findByLabelText(TEXTS.statiske.uploadId.norwegianPassport).click();
      cy.findByText(TEXTS.statiske.uploadId.selectFileButton).should('exist').should('be.visible');

      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from('file content'),
          fileName: 'test.txt',
        },
        { force: true },
      );

      cy.findByRole('heading', { name: TEXTS.statiske.error.sessionExpired.title }).should('exist');
      cy.findByRole('link', { name: TEXTS.statiske.error.sessionExpired.buttonText }).should('exist');
    });

    it('does not navigate to attachment panel', () => {
      cy.findByLabelText(TEXTS.statiske.uploadId.norwegianPassport).click();
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from('file content'),
          fileName: 'test.txt',
        },
        { force: true },
      );
      cy.clickNextStep();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Dine opplysninger' }).should('exist');
      cy.findByRole('link', { name: 'Vedlegg' }).should('not.exist');

      cy.clickStart();
      cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('abc');
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.findAllByText('Vedlegg').should('have.length', 0);

      cy.clickPreviousStep();
      cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
    });

    describe('Captcha', () => {
      it('prevents uploading files when the captcha is incorrect', () => {
        cy.get('[data-cy=firstName]').type('Wrong answer', { force: true });
        cy.findByLabelText(TEXTS.statiske.uploadId.norwegianPassport).click();
        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from('file content'),
            fileName: 'test.txt',
          },
          { force: true },
        );
        cy.findAllByText(TEXTS.statiske.uploadFile.uploadFileError).eq(0).should('exist');
      });
    });

    describe('Deleting files', () => {
      beforeEach(() => {
        cy.findByLabelText(TEXTS.statiske.uploadId.norwegianPassport).click();
        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from('file content'),
            fileName: 'test.txt',
          },
          { force: true },
        );
      });

      it('deletes a file when clicking the delete button', () => {
        cy.findByText(TEXTS.statiske.uploadId.label).should('not.exist');
        cy.findByRole('button', { name: TEXTS.statiske.uploadId.selectFileButton }).should('not.exist');
        cy.findByText('test.txt').should('exist');
        cy.findByRole('button', { name: 'Slett filen' }).click();
        cy.findByText('test.txt').should('not.exist');
        cy.findByText(TEXTS.statiske.uploadId.label).should('exist');
        cy.findByText(TEXTS.statiske.uploadId.selectFileButton).should('exist').should('be.visible');
      });

      it('deletes files when clicking the cancel button', () => {
        cy.intercept('/fyllut/api/nologin-file').as('deleteAllFiles');
        cy.findByText(TEXTS.statiske.uploadId.label).should('not.exist');
        cy.findByRole('button', { name: TEXTS.statiske.uploadId.selectFileButton }).should('not.exist');
        cy.findByText('test.txt').should('exist');
        cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.cancelAndDelete }).click();
        cy.findByRole('button', { name: TEXTS.grensesnitt.confirmDiscardPrompt.confirm }).click();
        cy.wait('@deleteAllFiles');
      });
    });
  });
});
