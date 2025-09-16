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

  it('submits application', () => {
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

    cy.findByRole('group', { name: 'Annen dokumentasjon' }).within(() =>
      cy.findByLabelText('Jeg legger det ved dette skjemaet').check(),
    );
    cy.findByLabelText('Gi vedlegget et beskrivende navn').type('Vitnemål');
    cy.get('input[type=file]').selectFile('cypress/fixtures/files/small-file.txt', { force: true });

    cy.findByRole('group', { name: 'Bekreftelse på utdanning' }).within(() =>
      cy.findByLabelText('Jeg legger det ved dette skjemaet').check(),
    );
    cy.get('input[type=file]').selectFile('cypress/fixtures/files/another-small-file.txt', { force: true });
    cy.clickNextStep();

    cy.findByRole('button', { name: 'Send til Nav' }).click();
    cy.findByText('Takk for at du sendte inn skjemaet.').should('exist');
  });
});
