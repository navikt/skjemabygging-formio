// Aksel includes the fieldset description in the group's accessible name.
const describedGroupName = 'Skjemagruppe med beskrivelse Dette er en beskrivelse av gruppen';
const translatedDescribedGroupName = 'Skjemagruppe med beskrivelse (en) Dette er en beskrivelse av gruppen (en)';

describe('FormGroup', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/formgroup/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should render a native legend and children with group spacing', () => {
      cy.findByRole('group', { name: 'Skjemagruppe' })
        .find('> legend')
        .should('contain.text', 'Skjemagruppe')
        .find('span')
        .should(($legend) => {
          const style = getComputedStyle($legend[0]);
          expect(style.fontSize).to.equal('20px');
          expect(style.lineHeight).to.equal('26px');
          expect(style.fontWeight).to.equal('400');
        });
      cy.findByRole('textbox', { name: 'Tekstfelt i gruppe' }).should('exist');
      cy.get('[data-component-key="skjemagruppe1"]').should(($group) => {
        const box = $group[0].firstElementChild!;
        const content = box.querySelector('[data-cy="fieldset-content"]')!;
        const childBox = content.querySelector('[data-component-key]')!.firstElementChild!;

        expect(getComputedStyle(box).marginBottom).to.equal('40px');
        expect(getComputedStyle(content).padding).to.equal('16px');
        expect(getComputedStyle(childBox).marginBottom).to.equal('0px');
      });
    });

    it('should show description', () => {
      cy.findByRole('group', { name: describedGroupName }).within(() => {
        cy.findByText('Dette er en beskrivelse av gruppen')
          .should('be.visible')
          .and('have.prop', 'tagName', 'P')
          .and('have.css', 'margin', '0px');
        cy.findByRole('textbox', { name: 'Tekstfelt i gruppe med beskrivelse' }).should('exist');
      });
    });

    it('should show a background color when backgroundColor is true', () => {
      cy.findByRole('group', { name: 'Skjemagruppe' })
        .find('[data-cy="fieldset-content"]')
        .should('not.have.css', 'background-color', 'rgba(0, 0, 0, 0)');
    });

    it('should have a transparent background when backgroundColor is false', () => {
      cy.findByRole('group', { name: 'Skjemagruppe uten bakgrunnsfarge' })
        .find('[data-cy="fieldset-content"]')
        .should('have.css', 'background-color', 'rgba(0, 0, 0, 0)');
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
      cy.findByRole('group', { name: 'Skjemagruppe (en)' })
        .find('> legend')
        .should('contain.text', 'Skjemagruppe (en)');
    });

    it('should translate description', () => {
      cy.findByRole('group', { name: translatedDescribedGroupName })
        .findByText('Dette er en beskrivelse av gruppen (en)')
        .should('be.visible');
    });

    it('should translate child component labels', () => {
      cy.findByRole('textbox', { name: 'Tekstfelt i gruppe (en)' }).should('exist');
    });
  });
});
