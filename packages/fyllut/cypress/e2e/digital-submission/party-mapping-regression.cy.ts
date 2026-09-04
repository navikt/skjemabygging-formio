describe('Party mapping regression', () => {
  const startNoLoginSubmission = (formPath: string) => {
    cy.visit(`/fyllut/${formPath}/legitimasjon?sub=digitalnologin`);
    cy.defaultWaits();

    cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
      cy.findByLabelText('Norsk pass').check(),
    );
    cy.uploadFile('id-billy-bruker.jpg', { verifyUpload: true });
    cy.clickNextStep();

    cy.clickIntroPageConfirmation();
    cy.clickNextStep();
    cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
  };

  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  it('submits a person sender and an identified concerned user', () => {
    startNoLoginSubmission('partymappingpersonsender');

    cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
    cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
    cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() =>
      cy.findByLabelText('Ja').check(),
    );
    cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).type('08842748500');
    cy.clickNextStep();

    cy.findByRole('textbox', { name: 'Representantens fødselsnummer eller d-nummer' }).type('13097248022');
    cy.findByRole('textbox', { name: 'Representantens fornavn' }).type('Kari');
    cy.findByRole('textbox', { name: 'Representantens etternavn' }).type('Sender');
    cy.clickNextStep();

    cy.mocksUseRouteVariant('post-nologin-soknad:success-tc22a');
    cy.mocksUseRouteVariant('post-familie-pdf:success');
    cy.clickSendNav();

    cy.findByRole('heading', { name: /Kvittering/ }).should('exist');
  });

  it('submits an organization sender and an unidentified concerned user', () => {
    startNoLoginSubmission('partymappingorganizationsender');

    cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
    cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
    cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() =>
      cy.findByLabelText('Nei').check(),
    );
    cy.findByRole('textbox', { name: /Fødselsdato/ }).type('01.01.1980');
    cy.findByRole('group', { name: 'Bor du i Norge?' }).within(() => cy.findByLabelText('Ja').check());
    cy.findByRole('group', { name: 'Er kontaktadressen en vegadresse eller postboksadresse?' }).within(() =>
      cy.findByLabelText('Vegadresse').check(),
    );
    cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testveien 1');
    cy.findByRole('textbox', { name: 'Postnummer' }).type('1234');
    cy.findByRole('textbox', { name: 'Poststed' }).type('Plassen');
    cy.findByRole('textbox', { name: /^Gyldig fra/ }).type('18.02.2026');
    cy.clickNextStep();

    cy.findByRole('textbox', {
      name: 'Organisasjonsnummeret til den virksomheten / underenheten du representerer',
    }).type('889640782');
    cy.findByRole('textbox', { name: 'Virksomhetens navn' }).type('Test organization');
    cy.clickNextStep();

    cy.mocksUseRouteVariant('post-nologin-soknad:success-tc22b');
    cy.mocksUseRouteVariant('post-familie-pdf:success');
    cy.clickSendNav();

    cy.findByRole('heading', { name: /Kvittering/ }).should('exist');
  });
});
