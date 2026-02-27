describe('Container', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/container/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should render child components', () => {
      cy.findByRole('textbox', { name: 'Tekstfelt i beholder' }).should('exist');
      cy.findByRole('textbox', { name: 'Tekstfelt i beholder med skjult overskrift' }).should('exist');
    });

    it('should show label when hideLabel is false', () => {
      cy.contains('Beholder med synlig overskrift').should('be.visible');
    });

    it('should hide label when hideLabel is true', () => {
      // The label is not rendered when hideLabel is true
      cy.get('.formio-component-beholderSkjult').within(() => {
        cy.contains('Beholder med skjult overskrift').should('not.exist');
      });
    });

    it('child components should be interactable', () => {
      cy.findByRole('textbox', { name: 'Tekstfelt i beholder' }).type('Test verdi');
      cy.findByRole('textbox', { name: 'Tekstfelt i beholder' }).should('have.value', 'Test verdi');
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/container/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should translate container label', () => {
      cy.contains('Beholder med synlig overskrift (en)').should('be.visible');
    });

    it('should translate child component labels', () => {
      cy.findByRole('textbox', { name: 'Tekstfelt i beholder (en)' }).should('exist');
    });
  });
});
