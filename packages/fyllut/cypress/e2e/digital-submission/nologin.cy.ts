import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('Digital submission without user login', () => {
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

  describe('Submission of application', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nologinform');
      cy.defaultWaits();
      cy.findByRole('link', { name: 'Kan ikke logge inn' }).click();
      cy.findByRole('link', { name: 'Send digitalt uten å logge inn' }).click();
      cy.findByRole('heading', { name: 'Legitimasjon' }).should('exist');

      cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
        cy.findByLabelText('Norsk pass').check(),
      );
      cy.get('input[type=file]').selectFile('cypress/fixtures/files/id-billy-bruker.jpg', { force: true });
      cy.clickNextStep();

      cy.clickStart();
      cy.findByRole('heading', { name: 'Veiledning' }).should('exist');

      cy.clickNextStep();
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');

      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() =>
        cy.findByLabelText('Ja').check(),
      );
      cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).type('08842748500');
      cy.clickNextStep();

      cy.findByRole('group', { name: 'Høyeste fullførte utdanning' }).within(() => cy.findByLabelText('Annet').check());
      cy.clickNextStep();
    });

    it('is completed successfully', () => {
      cy.findByLabelText('Annen dokumentasjon').within(() =>
        cy.findByLabelText('Jeg legger det ved dette skjemaet').check(),
      );
      cy.findByLabelText('Gi vedlegget et beskrivende navn').type('Vitnemål');
      cy.get('input[type=file]').selectFile('cypress/fixtures/files/small-file.txt', { force: true });

      cy.findByLabelText('Bekreftelse på utdanning').within(() =>
        cy.findByLabelText('Jeg legger det ved dette skjemaet').check(),
      );
      cy.get('input[type=file]').selectFile('cypress/fixtures/files/another-small-file.txt', { force: true });
      cy.clickNextStep();

      cy.findByRole('button', { name: 'Send til Nav' }).click();
      cy.findByText('Takk for at du sendte inn skjemaet.').should('exist');
      cy.findByRole('button', { name: 'Vis alle steg' }).should('not.exist');
      cy.findByRole('button', { name: 'Skjul alle steg' }).should('not.exist');
    });

    it('prevents further editing when navigating back after submission', () => {
      cy.findByLabelText('Annen dokumentasjon').within(() =>
        cy.findByLabelText('Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved').check(),
      );

      cy.findByLabelText('Bekreftelse på utdanning').within(() =>
        cy.findByLabelText('Jeg legger det ved dette skjemaet').check(),
      );
      cy.get('input[type=file]').selectFile('cypress/fixtures/files/another-small-file.txt', { force: true });
      cy.clickNextStep();

      cy.findByRole('button', { name: 'Send til Nav' }).click();
      cy.findByText('Takk for at du sendte inn skjemaet.').should('exist');

      cy.go('back');
      cy.findByText(TEXTS.statiske.error.alreadySubmitted).should('exist');
    });
  });

  it('should clear id when navigating back from id upload page', () => {
    cy.visit('/fyllut/nologinform');
    cy.defaultWaits();
    cy.findByRole('link', { name: 'Kan ikke logge inn' }).click();
    cy.findByRole('link', { name: 'Send digitalt uten å logge inn' }).click();
    cy.findByRole('heading', { name: 'Legitimasjon' }).should('exist');

    cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
      cy.findByLabelText('Norsk pass').check(),
    );
    cy.get('input[type=file]').selectFile('cypress/fixtures/files/id-billy-bruker.jpg', { force: true });
    cy.findByRole('button', { name: 'Slett filen' }).should('exist');
    cy.go('back');

    // have to choose the submission type again since the state is reset when going back
    cy.findByRole('link', { name: 'Kan ikke logge inn' }).click();
    cy.findByRole('link', { name: 'Send digitalt uten å logge inn' }).click();
    cy.findByRole('heading', { name: 'Legitimasjon' }).should('exist');
    cy.findByRole('button', { name: 'Slett filen' }).should('not.exist');

    cy.clickNextStep();
    cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() => {
      cy.findByText(TEXTS.statiske.uploadId.missingUploadError).should('exist');
    });
  });

  it('should redirect to id upload page on initial render of page', () => {
    cy.skipIfNoIncludeDistTests();

    cy.visit('/fyllut/nologinform/utdanning?sub=digitalnologin'); // <-- Directly visiting a later step in the form
    cy.defaultWaits();
    cy.url().should('include', '/fyllut/nologinform/legitimasjon?sub=digitalnologin');
    cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).should('exist');
  });
});
