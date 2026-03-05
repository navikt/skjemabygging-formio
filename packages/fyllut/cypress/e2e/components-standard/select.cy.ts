describe('Select', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/select/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable', () => {
      const label = 'Velg alternativ';
      cy.findByRole('combobox', { name: label }).should('exist');
      cy.findByRole('combobox', { name: label }).shouldBeVisible();
      cy.findByRole('combobox', { name: label }).should('be.enabled');
    });

    it('should be able to select an option', () => {
      const label = 'Velg alternativ';
      cy.findByRole('combobox', { name: label }).type('Alternativ 1{downArrow}{enter}');
      cy.withinComponent(label, () => {
        cy.contains('Alternativ 1').should('exist');
      });
    });

    it('should have description', () => {
      const label = 'Velg alternativ med beskrivelse';
      cy.withinComponent(label, () => {
        cy.contains('Dette er en beskrivelse').should('exist');
      });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/select/validering?sub=paper');
      cy.defaultWaits();
    });

    it('should validate with required', () => {
      const label = 'Alternativ påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByRole('combobox', { name: label }).type('{downArrow}{enter}');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should not be required', () => {
      const label = 'Alternativ ikke påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/select?sub=paper');
      cy.defaultWaits();
    });

    it('should test filling out a full form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.findByRole('combobox', { name: 'Velg alternativ' }).type('Alternativ 1{downArrow}{enter}');
      cy.findByRole('combobox', { name: 'Velg alternativ med beskrivelse' }).type('Alternativ 1{downArrow}{enter}');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.findByRole('combobox', { name: 'Alternativ påkrevd' }).type('Alternativ 1{downArrow}{enter}');
      // Skip 'Alternativ ikke påkrevd' (optional)
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').eq(0).should('contain.text', 'Velg alternativ');
        cy.get('dd').eq(0).should('contain.text', 'Alternativ 1');
        cy.get('dt').eq(1).should('contain.text', 'Velg alternativ med beskrivelse');
        cy.get('dd').eq(1).should('contain.text', 'Alternativ 1');
      });
      cy.withinSummaryGroup('Validering', () => {
        cy.get('dt').eq(0).should('contain.text', 'Alternativ påkrevd');
        cy.get('dd').eq(0).should('contain.text', 'Alternativ 1');
      });

      cy.clickDownloadInstructions();
      cy.testDownloadPdf();
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/select/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should have english label and description', () => {
      cy.findByRole('combobox', { name: 'Velg alternativ (en)' }).should('exist');
      cy.withinComponent('Velg alternativ med beskrivelse (en)', () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
      });
    });
  });
});
