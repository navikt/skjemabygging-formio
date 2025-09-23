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

function goToAttachmentPage(fileName: string) {
  cy.findByRole('heading', { name: TEXTS.statiske.uploadId.title }).should('exist');
  cy.findByRole('button', { name: TEXTS.statiske.uploadId.selectFileButton }).should('not.exist');
  cy.findByLabelText(TEXTS.statiske.uploadId.norwegianPassport).click();
  cy.findByText(TEXTS.statiske.uploadId.selectFileButton).should('exist').should('be.visible');

  cy.get('input[type="file"]').selectFile(
    {
      contents: Cypress.Buffer.from('file content'),
      fileName,
    },
    { force: true },
  );

  cy.clickNextStep();
  cy.clickStart();
  cy.clickShowAllSteps();
  cy.findByText('Vedlegg').click();
}

describe('Attachments page', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/stdigitalnologin');
    cy.defaultWaits();
    cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendDigitalNoLogin }).click();
    goToAttachmentPage('attachment.txt');
  });

  it('should display validation errors when next step button is clicked', () => {
    cy.findByText('Informasjon om din næringsinntekt fra Norge eller utlandet').should('exist');
    cy.findByText('Annen dokumentasjon').should('exist');
    cy.clickNextStep();
    cy.findAllByText('Du må fylle ut: Informasjon om din næringsinntekt fra Norge eller utlandet').should(
      'have.length',
      2,
    );
    cy.findAllByText('Du må fylle ut: Annen dokumentasjon').should('be.visible').should('have.length', 2);
  });

  it('should remove all attachments when delete all button is clicked', () => {
    cy.intercept('/fyllut/api/nologin-file?attachmentId=eiajfi8').as('deleteAllFilesByAttachmentId');
    cy.findAllByLabelText(TEXTS.statiske.attachment.leggerVedNaa).first().click();
    uploadFile('test.txt');
    cy.findByText('test.txt').should('exist');
    uploadFile('test.txt');
    cy.findByText('test.txt').should('exist');
    cy.findByRole('button', { name: TEXTS.statiske.attachment.deleteAllFiles }).click();
    cy.wait('@deleteAllFilesByAttachmentId');
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

  it('should remove all attachments on cancel', () => {
    cy.intercept('/fyllut/api/nologin-file').as('deleteAllFiles');
    cy.findAllByLabelText(TEXTS.statiske.attachment.leggerVedNaa).first().click();
    uploadFile('attachment1.txt');
    cy.findByText('test.txt').should('exist');
    cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.cancelAndDelete }).click();
    cy.wait('@deleteAllFiles');
  });

  describe('Other attachments', () => {
    it('requires a title to upload file', () => {
      cy.findByRole('group', {
        name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
      }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.leggerVedNaa }).click();
      });
      cy.findByRole('button', { name: TEXTS.statiske.uploadFile.selectFile }).click();
      cy.findAllByText(`Du må fylle ut: ${TEXTS.statiske.attachment.attachmentTitle}`).should('have.length', 2);
      cy.findByLabelText(TEXTS.statiske.attachment.attachmentTitle).type('Vedleggstittel');
      uploadFile('other-attachment.txt');
      cy.findAllByText(`Du må fylle ut: ${TEXTS.statiske.attachment.attachmentTitle}`).should('not.exist');
    });

    it('lets you add several attachments', () => {
      cy.findByRole('group', {
        name: 'Annen dokumentasjon Har du noen annen dokumentasjon du ønsker å legge ved?',
      }).within(() => {
        cy.findByRole('radio', { name: TEXTS.statiske.attachment.leggerVedNaa }).click();
      });
      cy.findByLabelText(TEXTS.statiske.attachment.attachmentTitle).type('Vedleggstittel 1');
      uploadFile('test.txt');
      cy.findByRole('button', { name: TEXTS.statiske.attachment.addNewAttachment }).click();
      cy.findAllByLabelText(TEXTS.statiske.attachment.attachmentTitle).last().type('Vedleggstittel 2');
      uploadFile('test.txt');
      cy.findByText('Vedleggstittel 1').should('exist');
      cy.findByText('Vedleggstittel 2').should('exist');
      cy.findAllByText('test.txt').should('have.length', 2);
    });
  });
});
