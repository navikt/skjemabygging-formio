// Settings from SelectBoxes.form.ts: label, description, additionalDescription, values (with per-option
// description), defaultValue (data), required, customValidation.
//
// Note: customValidation is available in SelectBoxes.form.ts but is not tested here
// as it requires custom server-side validation logic.

describe('SelectBoxes', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/selectboxes/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should render checkboxes with labels', () => {
      cy.withinComponent('Velg alternativer', () => {
        cy.findByRole('checkbox', { name: 'Alternativ 1' }).should('exist');
        cy.findByRole('checkbox', { name: 'Alternativ 2' }).should('exist');
      });
    });

    it('should be interactable', () => {
      cy.withinComponent('Velg alternativer', () => {
        cy.findByRole('checkbox', { name: 'Alternativ 1' }).check();
        cy.findByRole('checkbox', { name: 'Alternativ 1' }).should('be.checked');
      });
    });

    it('should show group description', () => {
      cy.withinComponent('Flervalg med beskrivelse', () => {
        cy.contains('Dette er en beskrivelse').should('be.visible');
      });
    });

    it('should show description on individual checkbox value', () => {
      cy.withinComponent('Flervalg med verdi-beskrivelser', () => {
        cy.contains('Beskrivelse for valg med info').should('be.visible');
      });
    });

    it('should show additionalDescription', () => {
      cy.withinComponent('Flervalg med tilleggsbeskrivelse', () => {
        cy.contains('Mer informasjon').should('exist');
        cy.contains('Mer informasjon').click();
        cy.contains('Dette er tilleggsbeskrivelse').should('be.visible');
      });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/selectboxes/validering?sub=paper');
      cy.defaultWaits();
    });

    it('should validate required', () => {
      const label = 'Flervalg påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.withinComponent(label, () => {
        cy.findByRole('checkbox', { name: 'Valg 1' }).check();
      });
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should not be required', () => {
      const label = 'Flervalg ikke påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should render with defaultValue pre-checked', () => {
      cy.withinComponent('Flervalg med standardverdi', () => {
        cy.findByRole('checkbox', { name: 'Valg 1' }).should('be.checked');
        cy.findByRole('checkbox', { name: 'Valg 2' }).should('not.be.checked');
      });
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/selectboxes/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should translate label and checkbox options', () => {
      cy.withinComponent('Velg alternativer (en)', () => {
        cy.findByRole('checkbox', { name: 'Alternativ 1 (en)' }).should('exist');
        cy.findByRole('checkbox', { name: 'Alternativ 2 (en)' }).should('exist');
      });
    });

    it('should translate group description', () => {
      cy.withinComponent('Flervalg med beskrivelse (en)', () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
      });
    });

    it('should translate checkbox value description', () => {
      cy.withinComponent('Flervalg med verdi-beskrivelser (en)', () => {
        cy.contains('Beskrivelse for valg med info (en)').should('be.visible');
      });
    });
  });
});
