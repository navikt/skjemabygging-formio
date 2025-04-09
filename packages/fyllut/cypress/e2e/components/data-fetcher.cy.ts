describe('Data fetcher', () => {
  before(() => {
    cy.configMocksServer();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Rendering', () => {
    it('should render component data exists', () => {
      cy.mocksUseRouteVariant('get-register-data-activities:success');
      cy.visit('/fyllut/datafetchertest/arbeidsrettetaktivitet?sub=digital');
      cy.findByRole('group', { name: 'Aktivitetsvelger (OBS! Skal ikke publiseres)' })
        .should('exist')
        .within(() => {
          cy.findAllByRole('checkbox').should('have.length', 3);
        });
    });

    it('should not render component when data is empty', () => {
      cy.mocksUseRouteVariant('get-register-data-activities:success-empty');
      cy.visit('/fyllut/datafetchertest/arbeidsrettetaktivitet?sub=digital');
      cy.findByRole('group', { name: 'Aktivitetsvelger (OBS! Skal ikke publiseres)' }).should('not.exist');
      cy.get('.navds-alert--warning').contains('Ingen aktiviteter ble hentet');
    });

    it('should not render component when backend fails', () => {
      cy.mocksUseRouteVariant('get-register-data-activities:error');
      cy.visit('/fyllut/datafetchertest/arbeidsrettetaktivitet?sub=digital');
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
