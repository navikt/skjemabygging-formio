// Note: altText is rendered directly as the img alt attribute and is not translated.

describe('Image', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/image/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should render the image with alt text', () => {
      cy.get('.img-component').first().should('exist');
      cy.get('.img-component').first().should('have.attr', 'alt', 'Test bilde');
    });

    it('should apply widthPercent to image style', () => {
      cy.get('.img-component').eq(1).should('have.attr', 'style', 'width: 50%;');
    });

    it('should show description below image', () => {
      cy.get('.img-description').should('exist');
      cy.get('.img-description').contains('Bildetekst').should('be.visible');
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/image/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should show translated description', () => {
      cy.get('.img-description').contains('Bildetekst (en)').should('be.visible');
    });
  });
});
