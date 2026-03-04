/*
 * Tests that the alert component (react) renders correctly
 * Also tests that exisiting alerts in older form definitions renders correctly
 */

describe('Alert', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/testingalert/page1?sub=paper');
    cy.defaultWaits();
  });

  // New alerts (using react)
  it('should show default info with content', () => {
    cy.get('.aksel-alert').contains('New alert 1');
  });

  it('should show success variant with content', () => {
    cy.get('.aksel-alert--success').contains('New alert 2');
  });

  it('should not show any labels', () => {
    cy.get('.formio-form').should('not.have.descendants', 'label');
  });

  it('should display html content - h1 and a link to nav.no', () => {
    cy.get('.formio-component-alertstripehtml').find('h1').should('have.text', 'Tittel');
    cy.get('.formio-component-alertstripehtml').find('a').should('have.attr', 'href', 'https://www.nav.no/');
  });

  it('should display alert with norwegian alerttype (suksess instead of success)', () => {
    cy.get('.formio-component-alertstripenorwegian').find('.aksel-alert--success').contains('Norwegian alertType');
  });
});
