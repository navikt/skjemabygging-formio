describe('Data fetcher', () => {
  const LABEL_AKTIVITETSVELGER = 'Aktivitetsvelger (OBS! Skal ikke publiseres)';

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
      cy.findByRole('group', { name: LABEL_AKTIVITETSVELGER })
        .should('exist')
        .within(() => {
          cy.findAllByRole('checkbox').should('have.length', 3);
        });
    });

    it('should not render component when data is empty', () => {
      cy.mocksUseRouteVariant('get-register-data-activities:success-empty');
      cy.visit('/fyllut/datafetchertest/arbeidsrettetaktivitet?sub=digital');
      cy.findByRole('group', { name: LABEL_AKTIVITETSVELGER }).should('not.exist');
      cy.get('.navds-alert--warning').contains('Ingen aktiviteter ble hentet');
    });

    it('should not render component when backend fails', () => {
      cy.mocksUseRouteVariant('get-register-data-activities:error');
      cy.visit('/fyllut/datafetchertest/arbeidsrettetaktivitet?sub=digital');
      cy.findByRole('group', { name: LABEL_AKTIVITETSVELGER }).should('not.exist');
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

      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Du må fylle ut: Aktivitetsvelger' }).should('exist').click();
        });

      cy.findByRole('group', { name: LABEL_AKTIVITETSVELGER })
        .should('exist')
        .should('have.focus')
        .within(() => {
          cy.findByRole('checkbox', { name: 'Aktivitet 1' }).should('exist').check();
        });
      cy.get('[data-cy=error-summary]').should('not.exist');
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
    });

    it('should not display validation error when data is empty', () => {
      cy.mocksUseRouteVariant('get-register-data-activities:success-empty');
      cy.visit('/fyllut/datafetchertest/arbeidsrettetaktivitet?sub=digital');
      cy.clickSaveAndContinue();
      cy.findByRole('link', { name: `Du må fylle ut: Aktivitetsvelger` }).should('not.exist');
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
    });
  });

  describe('Conditionals', () => {
    beforeEach(() => {
      cy.mocksRestoreRouteVariants();
      cy.defaultIntercepts();
      cy.visit('/fyllut/datafetchertest/arbeidsrettetaktivitet?sub=digital');
      cy.defaultWaits();
    });

    it('should show component with conditional referring to chosed item', () => {
      cy.get('.navds-alert--info').should('not.exist');
      cy.findByRole('group', { name: LABEL_AKTIVITETSVELGER })
        .should('exist')
        .within(() => {
          cy.findByRole('checkbox', { name: 'Aktivitet 3' }).should('exist').check();
        });
      cy.get('.navds-alert--info').contains('Du har valgt aktivitet med type TILTAK');
    });
  });
});
