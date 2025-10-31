import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('Digital no login', () => {
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
      cy.findByText(TEXTS.statiske.uploadFile.uploadFileError).should('exist');
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
