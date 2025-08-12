import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

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
    cy.findByRole('button', { name: TEXTS.statiske.uploadId.selectFile }).should('not.exist');
    cy.findByLabelText(TEXTS.statiske.uploadId.norwegianPassport).click();
    cy.findByRole('button', { name: TEXTS.statiske.uploadId.selectFile }).should('exist');

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
});
