// Note: CurrencySelect has no dedicated CurrencySelect.form.ts; it uses Select.form.ts.
// Note: additionalDescription is NOT available for CurrencySelect: Select.form.ts does not
//       include additionalDescription, and Select.tsx does not render AdditionalDescription.

describe('CurrencySelect', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/currencyselect/visning?sub=paper');
      cy.defaultWaits();
      cy.wait('@getCurrencies');
    });

    it('should be visible and interactable', () => {
      const label = 'Velg valuta';
      cy.findByRole('combobox', { name: label }).should('exist');
      cy.findByRole('combobox', { name: label }).shouldBeVisible();
      cy.findByRole('combobox', { name: label }).should('be.enabled');
    });

    it('should be able to select an option', () => {
      const label = 'Velg valuta';
      cy.findByRole('combobox', { name: label }).type('Euro{downArrow}{enter}');
      cy.findByRole('combobox', { name: label }).should('have.value', '');
      cy.contains('Euro (EUR)').should('exist');
    });

    it('should have description', () => {
      const label = 'Velg valuta med beskrivelse';
      cy.withinComponent(label, () => {
        cy.contains('Dette er en beskrivelse').should('exist');
      });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/currencyselect/validering?sub=paper');
      cy.defaultWaits();
      cy.wait('@getCurrencies');
    });

    it('should validate with required', () => {
      const label = 'Valuta påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByRole('combobox', { name: label }).type('Euro{downArrow}{enter}');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should not be required', () => {
      const label = 'Valuta ikke påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/currencyselect?sub=paper');
      cy.defaultWaits();
    });

    it('should test filling out a full form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.wait('@getCurrencies');
      cy.findByRole('combobox', { name: 'Velg valuta' }).click();
      cy.findByRole('combobox', { name: 'Velg valuta' }).type('Euro{downArrow}{enter}');
      cy.findByRole('combobox', { name: 'Velg valuta med beskrivelse' }).click();
      cy.findByRole('combobox', { name: 'Velg valuta med beskrivelse' }).type('Euro{downArrow}{enter}');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.findByRole('combobox', { name: 'Valuta påkrevd' }).click();
      cy.findByRole('combobox', { name: 'Valuta påkrevd' }).type('Euro{downArrow}{enter}');
      // Skip 'Valuta ikke påkrevd' (optional)
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').eq(0).should('contain.text', 'Velg valuta');
        cy.get('dt').eq(1).should('contain.text', 'Velg valuta med beskrivelse');
      });
      cy.withinSummaryGroup('Validering', () => {
        cy.get('dt').eq(0).should('contain.text', 'Valuta påkrevd');
      });

      cy.clickDownloadInstructions();
      cy.testDownloadPdf();
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/currencyselect/visning?sub=paper&lang=en');
      cy.defaultWaits();
      cy.wait('@getCurrencies');
    });

    it('should have english label and description', () => {
      cy.findByRole('combobox', { name: 'Velg valuta (en)' }).should('exist');
      cy.withinComponent('Velg valuta med beskrivelse (en)', () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
      });
    });
  });
});
