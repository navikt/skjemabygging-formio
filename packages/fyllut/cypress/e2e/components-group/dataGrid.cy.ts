// Aksel includes the fieldset description in the group's accessible name.
const groupName = 'Repeterende data Beskrivelse av tabellen';
const translatedGroupName = 'Repeterende data (en) Beskrivelse av tabellen (en)';

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
      cy.findByRole('group', { name: groupName }).find('> legend').should('contain.text', 'Repeterende data');
    });

    it('should render description', () => {
      cy.findByRole('group', { name: groupName })
        .findByText('Beskrivelse av tabellen')
        .should('be.visible')
        .and('have.css', 'margin', '0px');
    });

    it('should render rowTitle per row without numbering', () => {
      cy.findByRole('group', { name: groupName }).findByRole('heading', { level: 3, name: 'Rad' }).should('be.visible');
    });

    it('should not show remove button on the only row', () => {
      cy.get('[data-component-key="datagrid1"]').within(() => {
        cy.findByRole('button', { name: 'Fjern rad' }).should('not.exist');
      });
    });

    it('should keep focus while typing in the first row after removing the second row', () => {
      cy.get('[data-component-key="datagrid1"]')
        .findByRole('button', { name: /Legg til rad/i })
        .click();
      cy.findAllByRole('button', { name: 'Fjern rad' }).last().click();
      cy.findAllByRole('textbox', { name: 'Navn' }).should('have.length', 1);
      cy.findByRole('textbox', { name: 'Navn' }).type('Test');
      cy.findByRole('textbox', { name: 'Navn' }).should('have.value', 'Test').and('have.focus');
      cy.get('[data-component-key="datagrid1"]').within(() => {
        cy.findByRole('button', { name: 'Fjern rad' }).should('not.exist');
      });
    });

    it('should show custom addAnother button text', () => {
      cy.get('[data-component-key="datagrid1"]')
        .findByRole('button', { name: /Legg til rad/i })
        .should('exist');
    });

    it('should show default addAnother button text when not customized', () => {
      cy.get('[data-component-key="datagrid2"]')
        .findByRole('button', { name: /Legg til/i })
        .should('exist');
    });

    it('should show custom removeAnother text after adding a row', () => {
      cy.get('[data-component-key="datagrid1"]')
        .findByRole('button', { name: /Legg til rad/i })
        .click();
      cy.findAllByRole('textbox', { name: 'Navn' }).should('have.length', 2);
      cy.findByRole('group', { name: groupName }).within(() => {
        cy.findAllByRole('heading', { level: 3, name: 'Rad' }).should('have.length', 2);
        cy.findAllByRole('button', { name: 'Fjern rad' }).should('have.length', 2);
      });
    });

    it('child textfield should be interactable', () => {
      cy.findAllByRole('textbox', { name: 'Navn' }).first().type('Test');
      cy.findAllByRole('textbox', { name: 'Navn' }).first().should('have.value', 'Test');
    });

    it('should use compact blue row cards with the remove action below the fields', () => {
      cy.get('[data-component-key="datagrid1"]')
        .findByRole('button', { name: /Legg til rad/i })
        .click();
      cy.findByRole('group', { name: groupName })
        .find('[data-cy="fieldset-content"]')
        .should('have.css', 'padding', '0px');
      cy.findAllByRole('textbox', { name: 'Navn' })
        .first()
        .closest('[data-component-key]')
        .should(($field) => {
          const content = $field[0].parentElement!;
          const row = content.parentElement!;
          const fieldBox = $field[0].firstElementChild!;
          const remove = row.lastElementChild!;
          const rowStyle = getComputedStyle(row);

          expect(rowStyle.padding).to.equal('16px');
          expect(rowStyle.backgroundColor).to.equal('rgb(238, 246, 252)');
          expect(getComputedStyle(fieldBox).marginBottom).to.equal('0px');
          expect(remove.textContent).to.equal('Fjern rad');
          expect(getComputedStyle(remove).marginTop).to.equal('8px');
          expect(remove.getBoundingClientRect().top).to.be.at.least(content.getBoundingClientRect().bottom);
        });
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/datagrid/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should translate label', () => {
      cy.findByRole('group', { name: translatedGroupName })
        .find('> legend')
        .should('contain.text', 'Repeterende data (en)');
    });

    it('should translate description', () => {
      cy.findByRole('group', { name: translatedGroupName })
        .findByText('Beskrivelse av tabellen (en)')
        .should('be.visible');
    });

    it('should translate rowTitle', () => {
      cy.findByRole('group', { name: translatedGroupName })
        .findByRole('heading', { level: 3, name: 'Rad (en)' })
        .should('be.visible');
    });

    it('should translate addAnother button text', () => {
      cy.get('[data-component-key="datagrid1"]')
        .findByRole('button', { name: /Legg til rad \(en\)/i })
        .should('exist');
    });

    it('should translate child component labels', () => {
      cy.findAllByRole('textbox', { name: 'Navn (en)' }).first().should('exist');
    });
  });
});
