/*
 * Tests that accessibility is working as expected for various components using the axe library
 */

const checkA11yWhenStable = () => {
  cy.document().should((document) => {
    const runningAnimations = document.getAnimations().filter((animation) => animation.playState === 'running');
    expect(runningAnimations).to.have.length(0);
  });
  cy.checkA11y();
};

describe('Axe: Accessibility testing', () => {
  describe('Test on the intro page', () => {
    it('Static intro page', () => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/cypressaxe');
      cy.defaultWaits();
      cy.contains('Axe testing i Cypress').should('exist');
      cy.injectAxe();
      checkA11yWhenStable();
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
      checkA11yWhenStable();
    });

    it('Penger og konto', () => {
      cy.clickShowAllSteps();
      cy.contains('Penger og konto').click();
      cy.findByRole('heading', { name: 'Penger og konto' }).should('exist');
      checkA11yWhenStable();
    });

    it('Bedrift / organisasjon', () => {
      cy.contains('Bedrift / organisasjon').click();
      cy.findByRole('heading', { name: 'Bedrift / organisasjon' }).should('exist');
      checkA11yWhenStable();
    });

    it('Dato og tid', () => {
      cy.contains('Dato og tid').click();
      cy.findByRole('heading', { name: 'Dato og tid' }).should('exist');
      checkA11yWhenStable();
    });

    it('Standard felter', () => {
      cy.contains('Standard felter').click();
      cy.findByRole('heading', { name: 'Standard felter' }).should('exist');
      checkA11yWhenStable();
    });

    it('Layout', () => {
      cy.contains('Layout').click();
      cy.findByRole('heading', { name: 'Layout' }).should('exist');
      checkA11yWhenStable();
    });

    it('Data', () => {
      cy.contains('Data').click();
      cy.findByRole('heading', { name: 'Data' }).should('exist');
      checkA11yWhenStable();
    });
  });
});
