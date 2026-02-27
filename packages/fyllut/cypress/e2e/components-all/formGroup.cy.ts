// FormGroup (navSkjemagruppe) renders a <fieldset> with a <legend> and optional description.
// Settings from FormGroup.form.ts: legend (label), description, backgroundColor, conditional.
//
// Note: FormGroup uses a custom EJS template (navSkjemagruppe/form.ejs), not React.
// The legend is wrapped in a <span class="label-track-changes"> inside the <fieldset>,
// so findByRole('group', { name: ... }) does not resolve the accessible name correctly.
// Use .formio-component-{key} + .aksel-fieldset__legend-formio-template selectors instead.
//
// Description renders as <div class="description"> inside the fieldset.
// backgroundColor: true (default) adds CSS class 'aksel-fieldset__content--background-color'.
// backgroundColor: false removes the background color class.
//
// Note: FormGroup has no additionalDescription or validation settings.

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
      cy.get('.formio-component-skjemagruppe1')
        .find('.aksel-fieldset__legend-formio-template')
        .should('contain.text', 'Skjemagruppe');
      cy.findByRole('textbox', { name: 'Tekstfelt i gruppe' }).should('exist');
    });

    it('should show description', () => {
      cy.get('.formio-component-skjemagruppe2').within(() => {
        cy.get('.description').should('contain.text', 'Dette er en beskrivelse av gruppen');
        cy.findByRole('textbox', { name: 'Tekstfelt i gruppe med beskrivelse' }).should('exist');
      });
    });

    it('should apply background color class when backgroundColor is true', () => {
      cy.get('.formio-component-skjemagruppe1').find('.aksel-fieldset__content--background-color').should('exist');
    });

    it('should not apply background color class when backgroundColor is false', () => {
      cy.get('.formio-component-skjemagruppe3').find('.aksel-fieldset__content--background-color').should('not.exist');
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
      cy.get('.formio-component-skjemagruppe1')
        .find('.aksel-fieldset__legend-formio-template')
        .should('contain.text', 'Skjemagruppe (en)');
    });

    it('should translate description', () => {
      cy.get('.formio-component-skjemagruppe2')
        .find('.description')
        .should('contain.text', 'Dette er en beskrivelse av gruppen (en)');
    });

    it('should translate child component labels', () => {
      cy.findByRole('textbox', { name: 'Tekstfelt i gruppe (en)' }).should('exist');
    });
  });
});
