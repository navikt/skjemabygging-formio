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
