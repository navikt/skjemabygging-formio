describe('Data fetcher', () => {
  before(() => {
    cy.configMocksServer();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Rendering', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/datafetchertest/arbeidsrettetaktivitet?sub=digital');
      cy.defaultWaits();
      cy.mocksRestoreRouteVariants();
    });

    it('should render component data exists', () => {
      cy.findByRole('group', { name: 'Aktivitetsvelger (OBS! Skal ikke publiseres)' })
        .should('exist')
        .within(() => {
          cy.findAllByRole('checkbox').should('have.length', 3);
        });
    });

    it('should not render component when data is empty', () => {
      cy.mocksUseRouteVariant('get-register-data-activities:success-empty');
      cy.findByRole('group', { name: 'Aktivitetsvelger (OBS! Skal ikke publiseres)' }).should('not.exist');
    });

    it('should not render component when backend fails', () => {
      cy.mocksUseRouteVariant('get-register-data-activities:failure');
      cy.findByRole('group', { name: 'Aktivitetsvelger (OBS! Skal ikke publiseres)' }).should('not.exist');
      cy.get('.navds-alert--error').contains('Kall for å hente aktiviteter feilet');
    });
  });

  describe('Validation errors', () => {
    beforeEach(() => {
      cy.mocksRestoreRouteVariants();
    });

    it('should display validation error', () => {
      cy.visit('/fyllut/datafetchertest/arbeidsrettetaktivitet?sub=digital');
      cy.clickSaveAndContinue();
      cy.findByRole('link', { name: `Du må fylle ut: Aktivitetsvelger` }).should('exist');
    });
  });
});
