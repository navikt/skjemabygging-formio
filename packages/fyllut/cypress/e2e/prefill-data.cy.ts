describe('Prefill data', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.defaultInterceptsPrefillData();
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe.only('new application', () => {
    it('should prefill data for new application on the first page (name)', () => {
      cy.visit('/fyllut/testprefilldata?sub=digital');
      cy.wait('@getTestFormPrefillData');
      cy.clickStart();
      cy.wait('@getPrefillData');
      cy.wait('@createMellomlagring');

      cy.findByRole('heading', { name: 'Side 1' }).should('exist');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', 'Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('have.value', 'Nordmann');
    });

    it.only('should not prefill data for new application if submissionMethod is paper', () => {
      cy.visit('/fyllut/testprefilldata?sub=paper');
      cy.wait('@getTestFormPrefillData');
      cy.clickStart();

      // Should not make a request to get prefill data
      cy.get('@getPrefillData').then((interception) => {
        assert.isNull(interception);
      });

      cy.findByRole('heading', { name: 'Side 1' }).should('exist');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.have.value', 'Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('not.have.value', 'Nordmann');
    });
  });

  it('should prefill data for new application on the second page (name)', () => {
    cy.visit('/fyllut/testprefilldata?sub=digital');
    cy.wait('@getTestFormPrefillData');
    cy.clickStart();
    cy.wait('@getPrefillData');
    cy.wait('@createMellomlagring');
    cy.clickSaveAndContinue();

    cy.findByRole('heading', { name: 'Side 2' }).should('exist');
    cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', 'Ola');
    cy.findByRole('textbox', { name: 'Etternavn' }).should('have.value', 'Nordmann');
  });

  describe('existing application', () => {
    it('should not prefill data for existing application on the first page (name)', () => {
      cy.mocksUseRouteVariant('get-soknad:success-prefill-data');

      cy.visit('/fyllut/testprefilldata/side1?sub=digital&innsendingsId=d2f41ebc-ba98-4fc5-a195-29b098bf50a7');
      cy.wait('@getTestFormPrefillData');
      cy.wait('@getPrefillData');

      cy.findByRole('heading', { name: 'Side 1' }).should('exist');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.have.value', 'Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('not.have.value', 'Nordmann');

      // Should instead use existing data from innsending-api (database)
      cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', 'John');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('have.value', 'Doe');
    });

    it('should not prefill data for existing application on the second page (name)', () => {
      cy.mocksUseRouteVariant('get-soknad:success-prefill-data');

      cy.visit('/fyllut/testprefilldata/side1?sub=digital&innsendingsId=d2f41ebc-ba98-4fc5-a195-29b098bf50a7');
      cy.wait('@getTestFormPrefillData');
      cy.wait('@getPrefillData');
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Side 2' }).should('exist');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.have.value', 'Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('not.have.value', 'Nordmann');

      // Should instead use existing data from innsending-api (database)
      cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', 'John');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('have.value', 'Cena');
    });
  });
});
