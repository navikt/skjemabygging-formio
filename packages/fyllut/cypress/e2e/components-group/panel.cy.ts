describe('Panel', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/panel/oversiktsside?sub=paper');
      cy.defaultWaits();
    });

    it('should render panel title as heading', () => {
      cy.findByRole('heading', { level: 2, name: 'Oversiktsside' }).should('exist');
    });

    it('should render child components', () => {
      cy.findByRole('textbox', { name: 'Tekstfelt' }).should('exist');
    });

    it('child component should be interactable', () => {
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test verdi');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).should('have.value', 'Test verdi');
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/panel/oversiktsside?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should translate panel title', () => {
      cy.findByRole('heading', { level: 2, name: 'Oversiktsside (en)' }).should('exist');
    });

    it('should translate child component labels', () => {
      cy.findByRole('textbox', { name: 'Tekstfelt (en)' }).should('exist');
    });
  });
});
