describe('Alert', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  it('should use the intended variants and align HTML content in the component showcase', () => {
    cy.visit('/fyllut/components/standardfelter?sub=paper');
    cy.defaultWaits();

    [
      { content: 'Alert info', variant: 'info' },
      { content: 'Alert suksess', variant: 'success' },
      { content: 'Alert error', variant: 'error' },
    ].forEach(({ content, variant }) => {
      cy.contains('p', content)
        .should('have.css', 'margin-top', '0px')
        .and('have.css', 'margin-bottom', '0px')
        .closest('.aksel-alert')
        .should('have.class', `aksel-alert--${variant}`);
    });
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/alert/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should show info alert with correct variant', () => {
      cy.get('.aksel-alert--info').contains('Info melding').should('exist');
    });

    it('should show warning alert with correct variant', () => {
      cy.get('.aksel-alert--warning').contains('Advarsel melding').should('exist');
    });

    it('should show success alert with correct variant', () => {
      cy.get('.aksel-alert--success').contains('Suksess melding').should('exist');
    });

    it('should show error alert with correct variant', () => {
      cy.get('.aksel-alert--error').contains('Feil melding').should('exist');
    });

    it('should show inline alert', () => {
      cy.contains('Inline melding').should('be.visible');
    });

    it('should not show content when textDisplay is pdf', () => {
      cy.contains('Kun i PDF').should('not.exist');
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/alert/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should show translated content', () => {
      cy.get('.aksel-alert--info').contains('Info melding (en)').should('exist');
      cy.get('.aksel-alert--warning').contains('Advarsel melding (en)').should('exist');
      cy.get('.aksel-alert--success').contains('Suksess melding (en)').should('exist');
      cy.get('.aksel-alert--error').contains('Feil melding (en)').should('exist');
    });
  });
});
