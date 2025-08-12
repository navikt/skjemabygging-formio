describe('Form stepper', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Conditional rendering of steps', () => {
    it('should support use of utils in panel conditional', () => {
      cy.visit('/fyllut/checkcondition?sub=paper');
      cy.defaultWaits();
      cy.clickStart();

      cy.findByRole('navigation', { name: 'Søknadssteg' })
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Viktige data' }).should('not.exist');
          cy.findByRole('link', { name: 'Diverse data' }).should('exist').click();
        });

      cy.findByRole('textbox', { name: 'Startdato (dd.mm.åååå)' }).type('31.12.1989');

      cy.findByRole('navigation', { name: 'Søknadssteg' })
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Viktige data' }).should('exist');
        });
    });

    it('should support use of dataFetcher in panel conditional', () => {
      cy.mocksUseRouteVariant('get-register-data-activities:success-two-activities');

      cy.visit('/fyllut/checkcondition?sub=digital');
      cy.defaultWaits();
      cy.clickStart();

      cy.findByRole('link', { name: 'Diverse data' }).should('exist').click();
      cy.findByRole('group', { name: /Aktivitetsvelger.*/ })
        .should('exist')
        .within(() => {
          cy.findAllByRole('checkbox').should('have.length', 2);
        });

      cy.findByRole('navigation', { name: 'Søknadssteg' })
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Mer om aktiviteter' }).should('exist');
        });
    });

    it('should support use of lodash in panel conditional', () => {
      cy.visit('/fyllut/checkcondition/diversedata?sub=paper');
      cy.defaultWaits();

      cy.findByRole('navigation', { name: 'Søknadssteg' })
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Viktige data' }).should('not.exist');
          cy.findByRole('link', { name: 'World' }).should('not.exist');
        });

      cy.findByRole('textbox', { name: 'Startdato (dd.mm.åååå)' }).type('31.12.1989');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Viktige data' }).should('exist');
      cy.findByRole('textbox', { name: 'Hemmelig kodeord' }).should('exist').type('hello');
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'World' }).should('exist');
      cy.url().should('include', '/fyllut/checkcondition/world');

      cy.findByRole('navigation', { name: 'Søknadssteg' })
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Viktige data' }).should('exist');
          cy.findByRole('link', { name: 'World' }).should('exist');
        });
    });
  });
});
