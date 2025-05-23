describe('Mellomlagring nested values', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.defaultInterceptsExternal();
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  it('Should populate flat and nested fields from mellomlagring for Norwegian business', () => {
    cy.mocksUseRouteVariant('get-soknad:success-mellomlagring-nested-norwegian-business');
    cy.visit('/fyllut/nav020805/dineOpplysninger?sub=digital&innsendingsId=e212cb83-e1da-4134-a228-2809eede2b92');
    cy.defaultWaits();

    cy.findByRole('link', { name: 'Skatteforhold og inntekt' }).click();

    cy.contains('Betaler du skatt til Norge?').closest('fieldset').find('input[value="ja"]').should('be.checked');

    cy.contains('Hvilken virksomhet får du inntekten fra?')
      .closest('fieldset')
      .find('input[value="norskVirksomhet"]')
      .should('be.checked');

    cy.contains('Hva mottar du?').closest('fieldset').find('input[value="stipend"]').should('be.checked');

    cy.findByRole('textbox', { name: 'Hvem utbetaler stipendet?' }).should('have.value', 'Lånekassa');
    cy.findByRole('textbox', { name: 'Angi sum' }).should('have.value', '800,00');

    cy.contains('Mottar du pensjon (offentlig eller privat)?')
      .closest('fieldset')
      .find('input[value="nei"]')
      .should('be.checked');

    cy.contains('Har du andre arbeidsinntekter?').closest('fieldset').find('input[value="nei"]').should('be.checked');
  });

  it('Should populate flat and nested fields from mellomlagring for foreign business', () => {
    cy.mocksUseRouteVariant('get-soknad:success-mellomlagring-nested-foreign-business');
    cy.visit('/fyllut/nav020805/dineOpplysninger?sub=digital&innsendingsId=a212cb83-e1da-4134-a228-2809eede2b92');
    cy.defaultWaits();
    cy.findByRole('link', { name: 'Skatteforhold og inntekt' }).click();

    cy.contains('Betaler du skatt til Norge?').closest('fieldset').find('input[value="ja"]').should('be.checked');

    cy.contains('Hvilken virksomhet får du inntekten fra?')
      .closest('fieldset')
      .find('input[value="utenlandskVirksomhet"]')
      .should('be.checked');

    cy.contains('Hva mottar du?').closest('fieldset').find('input[value="lonn"]').should('be.checked');

    cy.findByRole('textbox', { name: 'Angi sum' }).should('have.value', '900,00');

    cy.contains('Mottar du pensjon (offentlig eller privat)?')
      .closest('fieldset')
      .find('input[value="nei"]')
      .should('be.checked');

    cy.contains('Har du andre arbeidsinntekter?').closest('fieldset').find('input[value="nei"]').should('be.checked');
  });
});
