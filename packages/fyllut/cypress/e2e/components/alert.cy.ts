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
    cy.get('.navds-alert').contains('New alert 1');
  });

  it('should show success variant with content', () => {
    cy.get('.navds-alert--success').contains('New alert 2');
  });

  it('should have marginBottom of var(--a-spacing-10) which is 2.5rem = 40px', () => {
    cy.contains('.formio-component-alertstripe', 'New alert 1').should('have.css', 'marginBottom', '40px');
  });

  it('should have marginBottom of 0px as the last element in the group', () => {
    cy.contains('.formio-component-alertstripe', 'New alert 2').should('have.css', 'marginBottom', '0px');
  });

  it('should not show any labels', () => {
    cy.get('.formio-form').should('not.have.descendants', 'label');
  });

  it('should display html content - h1 and a link to nav.no', () => {
    cy.get('.formio-component-alertstripehtml').find('h1').should('have.text', 'Tittel');
    cy.get('.formio-component-alertstripehtml').find('a').should('have.attr', 'href', 'https://www.nav.no/');
  });

  it('should display alert with norwegian alerttype (suksess instead of success)', () => {
    cy.get('.formio-component-alertstripenorwegian').find('.navds-alert--success').contains('Norwegian alertType');
  });

  // Old alerts (components have input=true on component and label defined)
  it('should have marginBottom from input=true of var(--a-spacing-10) which is 2.5rem = 40px', () => {
    cy.contains('.formio-component-alertstripe', 'Old alert 1').should('have.css', 'marginBottom', '40px');
  });

  it('should have marginBottom from input=true of var(--a-spacing-10) which is 2.5rem = 40px for last element in group', () => {
    cy.contains('.formio-component-alertstripe', 'Old alert 2').should('have.css', 'marginBottom', '40px');
  });
});
