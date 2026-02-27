// DataGrid (isNavDataGrid) renders a <fieldset> with optional label, description, rowTitle,
// and add/remove buttons.
// Settings from DataGrid.form.ts: label, rowTitle, description, addAnother, removeAnother.
//
// The DataGrid uses a custom EJS template (navdesign/datagrid/form.ejs).
// - label is rendered as <legend class="aksel-fieldset__legend-formio-template"> for the fieldset
//   when hideLabel is false.
// - description is rendered as <div class="description"> inside the fieldset.
// - rowTitle is rendered as <legend class="aksel-fieldset__legend-formio-template"> per row.
// - addAnother sets the "Legg til" button text (defaults to 'Legg til').
// - removeAnother sets the "Fjern" button text (defaults to 'Fjern').
//   The remove button only appears when there are 2+ rows (index > 0 || rows.length > 1).
//
// Note: DataGrid has no validation settings — checkComponentValidity always returns true.

describe('DataGrid', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/datagrid/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should render label as legend', () => {
      cy.get('.formio-component-datagrid1')
        .find('fieldset > .aksel-fieldset__legend-formio-template')
        .first()
        .should('contain.text', 'Repeterende data');
    });

    it('should render description', () => {
      cy.get('.formio-component-datagrid1').find('.description').should('contain.text', 'Beskrivelse av tabellen');
    });

    it('should render rowTitle per row', () => {
      cy.get('.formio-component-datagrid1')
        .find('.aksel-fieldset__content .aksel-fieldset__legend-formio-template')
        .should('contain.text', 'Rad');
    });

    it('should show custom addAnother button text', () => {
      cy.get('.formio-component-datagrid1')
        .findByRole('button', { name: /Legg til rad/i })
        .should('exist');
    });

    it('should show default addAnother button text when not customized', () => {
      cy.get('.formio-component-datagrid2')
        .findByRole('button', { name: /Legg til/i })
        .should('exist');
    });

    it('should show custom removeAnother text after adding a row', () => {
      cy.get('.formio-component-datagrid1')
        .findByRole('button', { name: /Legg til rad/i })
        .click();
      cy.findAllByRole('textbox', { name: 'Navn' }).should('have.length', 2);
      cy.get('.formio-component-datagrid1').contains('button', 'Fjern rad').should('exist');
    });

    it('child textfield should be interactable', () => {
      cy.findAllByRole('textbox', { name: 'Navn' }).first().type('Test');
      cy.findAllByRole('textbox', { name: 'Navn' }).first().should('have.value', 'Test');
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/datagrid/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should translate label', () => {
      cy.get('.formio-component-datagrid1')
        .find('fieldset > .aksel-fieldset__legend-formio-template')
        .first()
        .should('contain.text', 'Repeterende data (en)');
    });

    it('should translate description', () => {
      cy.get('.formio-component-datagrid1').find('.description').should('contain.text', 'Beskrivelse av tabellen (en)');
    });

    it('should translate rowTitle', () => {
      cy.get('.formio-component-datagrid1')
        .find('.aksel-fieldset__content .aksel-fieldset__legend-formio-template')
        .should('contain.text', 'Rad (en)');
    });

    it('should translate addAnother button text', () => {
      cy.get('.formio-component-datagrid1')
        .findByRole('button', { name: /Legg til rad \(en\)/i })
        .should('exist');
    });

    it('should translate child component labels', () => {
      cy.findAllByRole('textbox', { name: 'Navn (en)' }).first().should('exist');
    });
  });
});
