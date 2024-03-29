/*
 * Tests that accessibility is working as expected for various components using the axe library
 */

describe('Axe: Accessibility testing', () => {
  describe('Simple test for all tabs in one run', () => {
    before(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/cypressaxe');
      cy.defaultWaits();
      cy.injectAxe();
    });

    it('Start page', () => {
      // Sometimes checkA11y fails if you do it to early, so this is instead of doing cy.wait(1000) or similar.
      cy.findByRole('main').should('exist');
      cy.checkA11y();
    });

    it('Person', () => {
      cy.contains('Start').click();
      cy.checkA11y();
    });

    it('Penger og konto', () => {
      cy.contains('Penger og konto').click();
      cy.checkA11y();
    });

    it('Bedrift / organisasjon', () => {
      cy.contains('Bedrift / organisasjon').click();
      cy.checkA11y();
    });

    it('Dato og tid', () => {
      cy.contains('Dato og tid').click();
      cy.checkA11y();
    });

    it('Standard felter', () => {
      cy.contains('Standard felter').click();
      cy.checkA11y();
    });

    it('Layout', () => {
      cy.contains('Layout').click();
      cy.checkA11y();
    });

    it('Data', () => {
      cy.contains('Data').click();
      cy.checkA11y();
    });
  });
});
