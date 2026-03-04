describe('CountrySelect', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/countryselect/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable', () => {
      const label = 'Velg land';
      cy.findByRole('combobox', { name: label }).should('exist');
      cy.findByRole('combobox', { name: label }).shouldBeVisible();
      cy.findByRole('combobox', { name: label }).should('be.enabled');
    });

    it('should be able to select an option', () => {
      const label = 'Velg land';
      cy.findByRole('combobox', { name: label }).type('Norg{downArrow}{enter}');
      cy.withinComponent(label, () => {
        cy.contains('Norge').should('exist');
      });
    });

    it('should have description', () => {
      const label = 'Velg land med beskrivelse';
      cy.withinComponent(label, () => {
        cy.contains('Dette er en beskrivelse').should('exist');
      });
    });

    it('should exclude Norway when ignoreNorway is enabled', () => {
      const label = 'Velg land uten Norge';
      cy.findByRole('combobox', { name: label }).type('Norg');
      cy.findByRole('option', { name: 'Norge' }).should('not.exist');
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/countryselect/validering?sub=paper');
      cy.defaultWaits();
    });

    it('should validate with required', () => {
      const label = 'Land påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByRole('combobox', { name: label }).type('Norg{downArrow}{enter}');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should not be required', () => {
      const label = 'Land ikke påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/countryselect?sub=paper');
      cy.defaultWaits();
    });

    it('should test filling out a full form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.findByRole('combobox', { name: 'Velg land' }).type('Norg{downArrow}{enter}');
      cy.findByRole('combobox', { name: 'Velg land med beskrivelse' }).type('Norg{downArrow}{enter}');
      cy.findByRole('combobox', { name: 'Velg land uten Norge' }).type('Sver{downArrow}{enter}');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.findByRole('combobox', { name: 'Land påkrevd' }).type('Norg{downArrow}{enter}');
      // Skip 'Land ikke påkrevd' (optional)
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').eq(0).should('contain.text', 'Velg land');
        cy.get('dd').eq(0).should('contain.text', 'Norge');
        cy.get('dt').eq(1).should('contain.text', 'Velg land med beskrivelse');
        cy.get('dd').eq(1).should('contain.text', 'Norge');
        cy.get('dt').eq(2).should('contain.text', 'Velg land uten Norge');
        cy.get('dd').eq(2).should('contain.text', 'Sverige');
      });
      cy.withinSummaryGroup('Validering', () => {
        cy.get('dt').eq(0).should('contain.text', 'Land påkrevd');
        cy.get('dd').eq(0).should('contain.text', 'Norge');
      });

      cy.clickDownloadInstructions();
      cy.testDownloadPdf();
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/countryselect/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should have english label and description', () => {
      cy.findByRole('combobox', { name: 'Velg land (en)' }).should('exist');
      cy.withinComponent('Velg land med beskrivelse (en)', () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
      });
    });
  });
});
