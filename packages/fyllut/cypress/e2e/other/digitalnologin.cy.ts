import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

function uploadFile(fileName: string) {
  cy.get('input[type="file"]').selectFile(
    {
      contents: Cypress.Buffer.from('file content'),
      fileName,
    },
    { force: true },
  );
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
      uploadFile('test.txt');
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

  describe('Attachments page', () => {
    beforeEach(() => {
      cy.visit('/fyllut/stdigitalnologin/vedlegg');
    });

    it('should display validation errors when next step button is clicked', () => {
      cy.findByText('Informasjon om din næringsinntekt fra Norge eller utlandet').should('exist');
      cy.findByText('Annen dokumentasjon').should('exist');
      cy.clickNextStep();
      cy.findAllByText(TEXTS.statiske.attachment.attachmentError).should('have.length', 2);
    });

    it('should remove all attachments when delete all button is clicked', () => {
      cy.intercept('/fyllut/api/nologin-file?attachmentId=eiajfi8&innsendingId=innsending-id').as(
        'deleteAllFilesByAttachmentId',
      );
      cy.findAllByLabelText(TEXTS.statiske.attachment.leggerVedNaa).first().click();
      uploadFile('attachment1.txt');
      cy.findByText('test.txt').should('exist');
      uploadFile('attachment2.txt');
      cy.findByText('test.txt').should('exist');
      cy.findByRole('button', { name: TEXTS.statiske.attachment.deleteAllFiles }).click();
      cy.wait('@deleteAllFilesByAttachmentId');
    });

    it('should remove all attachments on cancel', () => {
      cy.intercept('/fyllut/api/nologin-file?innsendingId=innsending-id').as('deleteAllFiles');
      cy.findAllByLabelText(TEXTS.statiske.attachment.leggerVedNaa).first().click();
      uploadFile('attachment1.txt');
      cy.findByText('test.txt').should('exist');
      cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.cancelAndDelete }).click();
      cy.wait('@deleteAllFiles');
    });

    it('should render additional description and deadline when existing', () => {
      cy.findByLabelText(TEXTS.statiske.attachment.ettersender).click();
      cy.findByText(
        'Hvis vi ikke har mottatt dette vedlegget innen 14 dager blir saken behandlet med de opplysningene som foreligger.',
      ).should('exist');
      cy.findByLabelText(TEXTS.statiske.attachment.levertTidligere).click();
      cy.findByLabelText('Tittel tilleggsinformasjon').should('exist');
      cy.findByText('Beskrivelse tilleggsinformasjon').should('exist');
    });
  });
});
