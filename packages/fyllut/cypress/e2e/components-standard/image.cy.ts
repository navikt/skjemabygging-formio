describe('Image', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/image/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should render the images with alt text', () => {
      cy.findByRole('img', { name: 'Test bilde' }).should('be.visible');
      cy.findByRole('img', { name: 'Halvt bilde' }).should('be.visible');
      cy.findByRole('img', { name: 'Bilde med tekst' }).should('be.visible');
      cy.contains('Unsupported component type').should('not.exist');
    });

    it('should apply widthPercent to the image', () => {
      cy.findByRole('img', { name: 'Test bilde' }).should('have.attr', 'style', 'width: 100%;');
      cy.findByRole('img', { name: 'Halvt bilde' }).should('have.attr', 'style', 'width: 50%;');
    });

    it('should show description below the image', () => {
      cy.findByText('Bildetekst').should('be.visible');
    });

    it('should not validate images and not show them in the summary', () => {
      cy.findByRole('textbox', { name: 'Tekstfelt (valgfritt)' }).type('Svar');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').should('have.length', 1);
        cy.get('dt').eq(0).should('contain.text', 'Tekstfelt');
        cy.get('dd').eq(0).should('contain.text', 'Svar');
      });
      cy.findAllByRole('img', { name: /bilde/i }).should('not.exist');
      cy.contains('Unsupported component type').should('not.exist');
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/image/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should show translated alt text and description', () => {
      cy.findByRole('img', { name: 'Test bilde (en)' }).should('be.visible');
      cy.findByText('Bildetekst (en)').should('be.visible');
    });
  });
});
