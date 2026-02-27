describe('Accordion', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/accordion/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should show accordion item titles', () => {
      cy.findAllByRole('button', { name: 'Åpen seksjon' }).should('exist');
      cy.findAllByRole('button', { name: 'Lukket seksjon' }).should('exist');
    });

    it('should have content visible when defaultOpen is true', () => {
      cy.findByText('Innhold i åpen seksjon').should('be.visible');
    });

    it('should expand content on click', () => {
      cy.findAllByRole('button', { name: 'Lukket seksjon' }).click();
      cy.findByText('Innhold i lukket seksjon').should('be.visible');
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/accordion/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should have english titles', () => {
      cy.findAllByRole('button', { name: 'Åpen seksjon (en)' }).should('exist');
      cy.findAllByRole('button', { name: 'Lukket seksjon (en)' }).should('exist');
    });

    it('should have english content when expanded', () => {
      cy.findByText('Innhold i åpen seksjon (en)').should('be.visible');
    });
  });
});
