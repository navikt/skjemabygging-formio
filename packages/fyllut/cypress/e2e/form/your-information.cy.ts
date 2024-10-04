/*
 * Tests that the fields that have prefillKey set in the form definition will be prefilled with data
 */

describe('Your information', () => {
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

  describe('Digital', () => {
    describe('new application', () => {
      it('should prefill data for new application on the first page (name)', () => {
        cy.visit('/fyllut/your-information?sub=digital');
        cy.defaultWaits();
        cy.clickStart();
        cy.wait('@getPrefillData');
        cy.wait('@createMellomlagring');

        cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
        cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', 'Ola');
        cy.findByRole('textbox', { name: 'Etternavn' }).should('have.value', 'Nordmann');
        cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).should('have.value', '08842748500');
        cy.findByRole('textbox', { name: 'Vegadresse' }).should('have.value', 'Testveien 1C');
        cy.findByRole('textbox', { name: 'Postnummer' }).should('have.value', '1234');
        cy.findByRole('textbox', { name: 'Poststed' }).should('have.value', 'Plassen');
      });

      it('should prefill data for new application on the second page (name)', () => {
        cy.visit('/fyllut/your-information?sub=digital');
        cy.defaultWaits();
        cy.clickStart();
        cy.wait('@getPrefillData');
        cy.wait('@createMellomlagring');
        cy.clickSaveAndContinue();

        cy.findByRole('heading', { name: 'Navn' }).should('exist');
        cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', 'Ola');
        cy.findByRole('textbox', { name: 'Etternavn' }).should('have.value', 'Nordmann');
      });

      it('should not prefill data for new application if submissionMethod is paper', () => {
        cy.visit('/fyllut/your-information?sub=paper');
        cy.defaultWaits();
        cy.clickStart();

        // Should not make a request to get prefill data
        cy.get('@getPrefillData').then((interception) => {
          assert.isNull(interception);
        });

        cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
        cy.findByRole('textbox', { name: 'Fornavn' }).should('not.have.value', 'Ola');
        cy.findByRole('textbox', { name: 'Etternavn' }).should('not.have.value', 'Nordmann');
      });
    });

    describe('existing application', () => {
      it('should prefill data for existing application on the first page (name)', () => {
        cy.mocksUseRouteVariant('get-soknad:success-prefill-data');

        cy.visit('/fyllut/your-information/side1?sub=digital&innsendingsId=d2f41ebc-ba98-4fc5-a195-29b098bf50a7');
        cy.defaultWaits();
        cy.wait('@getPrefillData');

        cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
        cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', 'Ola');
        cy.findByRole('textbox', { name: 'Etternavn' }).should('have.value', 'Nordmann');

        // Should not use existing data from innsending-api (database)
        cy.findByRole('textbox', { name: 'Fornavn' }).should('not.have.value', 'John');
        cy.findByRole('textbox', { name: 'Etternavn' }).should('not.have.value', 'Doe');
      });

      it('should prefill data for existing application on the second page (name)', () => {
        cy.mocksUseRouteVariant('get-soknad:success-prefill-data');

        cy.visit('/fyllut/your-information/side1?sub=digital&innsendingsId=d2f41ebc-ba98-4fc5-a195-29b098bf50a7');
        cy.defaultWaits();
        cy.wait('@getPrefillData');
        cy.clickSaveAndContinue();

        cy.findByRole('heading', { name: 'Navn' }).should('exist');
        cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', 'Ola');
        cy.findByRole('textbox', { name: 'Etternavn' }).should('have.value', 'Nordmann');

        // Should not use existing data from innsending-api (database)
        cy.findByRole('textbox', { name: 'Fornavn' }).should('not.have.value', 'John');
        cy.findByRole('textbox', { name: 'Etternavn' }).should('not.have.value', 'Cena');
      });
    });
  });
});
