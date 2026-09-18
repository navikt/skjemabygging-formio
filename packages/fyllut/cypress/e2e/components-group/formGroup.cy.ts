describe('FormGroup', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/formgroup/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should render legend and children', () => {
      cy.getComponent('skjemagruppe1')
        .find('.aksel-fieldset__legend-formio-template')
        .should('contain.text', 'Skjemagruppe');
      cy.findByRole('textbox', { name: 'Tekstfelt i gruppe' }).should('exist');
    });

    it('should show description', () => {
      cy.getComponent('skjemagruppe2').within(() => {
        cy.get('.description').should('contain.text', 'Dette er en beskrivelse av gruppen');
        cy.findByRole('textbox', { name: 'Tekstfelt i gruppe med beskrivelse' }).should('exist');
      });
    });

    it('should apply background color class when backgroundColor is true', () => {
      cy.getComponent('skjemagruppe1').find('.aksel-fieldset__content--background-color').should('exist');
    });

    it('should not apply background color class when backgroundColor is false', () => {
      cy.getComponent('skjemagruppe3').find('.aksel-fieldset__content--background-color').should('not.exist');
    });

    it('child components should be interactable', () => {
      cy.findByRole('textbox', { name: 'Tekstfelt i gruppe' }).type('Test verdi');
      cy.findByRole('textbox', { name: 'Tekstfelt i gruppe' }).should('have.value', 'Test verdi');
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/formgroup/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should translate legend', () => {
      cy.getComponent('skjemagruppe1')
        .find('.aksel-fieldset__legend-formio-template')
        .should('contain.text', 'Skjemagruppe (en)');
    });

    it('should translate description', () => {
      cy.getComponent('skjemagruppe2')
        .find('.description')
        .should('contain.text', 'Dette er en beskrivelse av gruppen (en)');
    });

    it('should translate child component labels', () => {
      cy.findByRole('textbox', { name: 'Tekstfelt i gruppe (en)' }).should('exist');
    });
  });
});
