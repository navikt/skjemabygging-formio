import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

function goToVedleggPage() {
  cy.findByRole('heading', { name: TEXTS.statiske.uploadId.title }).should('exist');
  cy.findByRole('button', { name: TEXTS.statiske.uploadId.selectFileButton }).should('not.exist');
  cy.findByLabelText(TEXTS.statiske.uploadId.norwegianPassport).click();
  cy.findByText(TEXTS.statiske.uploadId.selectFileButton).should('exist');

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
  cy.clickShowAllSteps();

  cy.findByRole('link', { name: 'Vedlegg' }).click();
}

describe('Digital no login', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/stdigitalnologin');
    cy.defaultWaits();
    cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigitalNoLogin }).click();
  });

  it('shows an error message if no personal ID has been uploaded', () => {
    cy.findByRole('heading', { name: TEXTS.statiske.uploadId.title }).should('exist');
    cy.clickNextStep();
    cy.findByText(TEXTS.statiske.uploadId.missingUploadError).should('exist');
  });

  it('lets you upload a file when selecting a type of personal ID', () => {
    cy.findByRole('heading', { name: TEXTS.statiske.uploadId.title }).should('exist');
    cy.findByRole('button', { name: TEXTS.statiske.uploadId.selectFileButton }).should('not.exist');
    cy.findByLabelText(TEXTS.statiske.uploadId.norwegianPassport).click();
    cy.findByText(TEXTS.statiske.uploadId.selectFileButton).should('exist');

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
      cy.findByRole('button', { name: TEXTS.statiske.uploadId.selectFileButton }).should('exist');
    });

    it('deletes files when clicking the cancel button', () => {
      cy.intercept('/fyllut/api/nologin-file?innsendingId=innsending-id').as('deleteAllFiles');
      cy.findByText(TEXTS.statiske.uploadId.label).should('not.exist');
      cy.findByRole('button', { name: TEXTS.statiske.uploadId.selectFileButton }).should('not.exist');
      cy.findByText('test.txt').should('exist');
      cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.cancelAndDelete }).click();
      cy.wait('@deleteAllFiles');
    });
  });

  it('should display validation errors when next step button is clicked', () => {
    goToVedleggPage();
    cy.findByText('Vedlegg').should('exist');
    cy.findByText('Annen dokumentasjon').should('exist');
    cy.clickNextStep();
  });

  it('should remove all attachments when delete all button is clicked', () => {
    goToVedleggPage();
  });

  it('should remove all attachments on cancel', () => {
    goToVedleggPage();
  });

  it('should render additional description and deadline when existing', () => {
    goToVedleggPage();
  });
});
