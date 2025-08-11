/*
 * Tests that accessibility is working as expected for various components using the axe library
 */

describe('Axe: Accessibility testing', () => {
  describe('Test on the intro page', () => {
    it('Static intro page', () => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/cypressaxe');
      cy.defaultWaits();
      // Sometimes checkA11y fails if you do it to early, so this is instead of doing cy.wait(1000) or similar.
      cy.findByRole('heading', { name: 'Axe testing i Cypress' }).should('exist');
      cy.injectAxe();
      cy.checkA11y();
    });
  });

  describe('Simple test for all tabs in one run', () => {
    before(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/cypressaxe');
      cy.defaultWaits();
      cy.clickStart();
      cy.injectAxe();
    });

    it('Person', () => {
      cy.findByRole('heading', { name: 'Person' }).should('exist');
      cy.checkA11y();
    });

    it('Penger og konto', () => {
      cy.clickShowAllSteps();
      cy.contains('Penger og konto').click();
      cy.findByRole('heading', { name: 'Penger og konto' }).should('exist');
      cy.checkA11y();
    });

    it('Bedrift / organisasjon', () => {
      cy.contains('Bedrift / organisasjon').click();
      cy.findByRole('heading', { name: 'Bedrift / organisasjon' }).should('exist');
      cy.checkA11y();
    });

    it('Dato og tid', () => {
      cy.contains('Dato og tid').click();
      cy.findByRole('heading', { name: 'Dato og tid' }).should('exist');
      cy.checkA11y();
    });

    it('Standard felter', () => {
      cy.contains('Standard felter').click();
      cy.findByRole('heading', { name: 'Standard felter' }).should('exist');
      cy.checkA11y();
    });

    it('Layout', () => {
      cy.contains('Layout').click();
      cy.findByRole('heading', { name: 'Layout' }).should('exist');
      cy.checkA11y();
    });

    it('Data', () => {
      cy.contains('Data').click();
      cy.findByRole('heading', { name: 'Data' }).should('exist');
      cy.checkA11y();
    });
  });
});
