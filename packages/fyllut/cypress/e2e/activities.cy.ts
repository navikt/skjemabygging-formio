const defaultActivityText = 'Jeg får ikke opp noen aktiviteter her som stemmer med det jeg vil søke om';
const activityText = 'Arbeidstrening: 6.12.2023 - 6.04.2024';

describe('Activities', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.defaultInterceptsActivities();
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('activities from backend', () => {
    it('should show radiogroup with activity from backend and default activity', () => {
      cy.visit('/fyllut/testingactivities?sub=digital');
      cy.wait('@getTestFormActivities');
      cy.clickStart();
      cy.wait('@getActivities');

      cy.contains('Velg hvilken aktivitet du vil søke om stønad for');
      cy.findAllByRole('radio').should('have.length', 2);
      cy.findByRole('radio', { name: activityText }).should('exist');
      cy.findByRole('radio', { name: defaultActivityText }).should('exist');
    });
  });

  describe('no activities from backend', () => {
    it('should show checkbox with default activity', () => {
      cy.mocksUseRouteVariant('get-activities:success-empty');

      cy.visit('/fyllut/testingactivities?sub=digital');
      cy.wait('@getTestFormActivities');
      cy.clickStart();
      cy.wait('@getActivities');

      cy.contains('Velg hvilken aktivitet du vil søke om stønad for');
      cy.findAllByRole('checkbox').should('have.length', 1);
      cy.findByRole('checkbox', { name: activityText }).should('not.exist');
      cy.findByRole('checkbox', { name: defaultActivityText }).should('exist');
    });
  });

  describe('error from backend', () => {
    it('should show checkbox with default activity and info alert', () => {
      cy.mocksUseRouteVariant('get-activities:failure');

      cy.visit('/fyllut/testingactivities?sub=digital');
      cy.wait('@getTestFormActivities');
      cy.clickStart();
      cy.wait('@getActivities');

      cy.contains('Velg hvilken aktivitet du vil søke om stønad for');
      cy.findAllByRole('checkbox').should('have.length', 1);
      cy.findByRole('checkbox', { name: activityText }).should('not.exist');
      cy.findByRole('checkbox', { name: defaultActivityText }).should('exist');

      cy.get('.navds-alert--info').contains(
        'Kunne ikke hente aktiviteter. Du kan fortsatt gå videre uten å velge aktivitet.',
      );
    });
  });
});
