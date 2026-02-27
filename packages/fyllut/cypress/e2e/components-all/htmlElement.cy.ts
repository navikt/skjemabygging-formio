describe('HtmlElement', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/htmlelement/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should show content when textDisplay is form', () => {
      cy.contains('Innhold i skjema').should('be.visible');
    });

    it('should show content when textDisplay is formPdf', () => {
      cy.contains('Innhold i skjema og PDF').should('be.visible');
    });

    it('should not show content when textDisplay is pdf', () => {
      cy.contains('Innhold kun i PDF').should('not.exist');
    });

    it('should show additionalDescription', () => {
      cy.contains('Innhold med tilleggsbeskrivelse').should('be.visible');
      cy.findByRole('button', { name: 'Vis mer' }).should('exist');
      cy.findByRole('button', { name: 'Vis mer' }).click();
      cy.contains('Tilleggsbeskrivelse').should('be.visible');
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/htmlelement/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should show translated content', () => {
      cy.contains('Innhold i skjema (en)').should('be.visible');
      cy.contains('Innhold i skjema og PDF (en)').should('be.visible');
    });

    it('should show translated additionalDescription', () => {
      cy.findByRole('button', { name: 'Vis mer (en)' }).should('exist');
      cy.findByRole('button', { name: 'Vis mer (en)' }).click();
      cy.contains('Tilleggsbeskrivelse (en)').should('be.visible');
    });
  });
});
