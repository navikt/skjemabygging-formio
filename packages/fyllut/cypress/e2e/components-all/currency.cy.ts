// Currency (navCurrency) settings from Currency.form.ts:
// - label: field label
// - inputType: 'decimal' (default) or 'numeric' — controls inputmode attribute and
//   decimal vs integer validation
// - fieldSize: visual width of the input (not easily testable)
// - description: description text shown below the label
// - additionalDescription: expandable "read more" section (label + text)
// - calculateValue: JS expression to calculate the field value automatically
// - validate.required: whether the field is required
// - validate.customValidation: custom JS validation expression
//
// Note: Currency has no min/max validation settings (unlike Number).
// Note: Currency sets currency: 'nok' internally but this has no visual effect in the
//   rendered form (no "kr" suffix is appended to the input).

describe('Currency', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/currency/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable', () => {
      cy.findByRole('textbox', { name: 'Beløp' }).should('exist');
      cy.findByLabelText('Beløp').shouldBeVisible();
      cy.findByLabelText('Beløp').should('be.enabled');
      cy.findByLabelText('Beløp').should('not.have.attr', 'readonly');
    });

    it('should default to decimal inputmode', () => {
      cy.findByLabelText('Beløp').should('have.attr', 'inputmode', 'decimal');
    });

    it('should have description and additional description', () => {
      const label = 'Beløp med beskrivelse';
      const additionalDescription = 'Dette er utvidet beskrivelse';
      cy.withinComponent(label, () => {
        cy.contains('Dette er en beskrivelse').should('exist');
        cy.contains(additionalDescription).should('not.be.visible');
        cy.findByRole('button', { name: 'mer' }).click();
        cy.contains(additionalDescription).shouldBeVisible();
      });
    });

    it('should support numeric inputType for integer fields', () => {
      cy.findByLabelText('Heltall').should('have.attr', 'inputmode', 'numeric');
    });
  });

  describe('Data', () => {
    beforeEach(() => {
      cy.visit('/fyllut/currency/data?sub=paper');
      cy.defaultWaits();
    });

    it('should calculate value', () => {
      cy.findByLabelText('Kalkulert sum').should('have.value', '');
      cy.findByRole('textbox', { name: 'Beløp A' }).type('100');
      cy.findByRole('textbox', { name: 'Beløp B' }).type('50');
      cy.findByLabelText('Kalkulert sum').should('have.value', '150');
      cy.findByLabelText('Kalkulert sum').should('have.attr', 'readonly');
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/currency/validering?sub=paper');
      cy.defaultWaits();
    });

    it('should validate with required', () => {
      const label = 'Beløp påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().type('100');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should not be required', () => {
      const label = 'Beløp ikke påkrevd';
      cy.clickNextStep();
      cy.findByLabelOptional(label).should('exist');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should validate that decimal field rejects invalid input', () => {
      const label = 'Beløp påkrevd';
      const errorMessage = 'Oppgi et tall med maksimalt to desimaler.';
      cy.findByLabelText(label).type('abc');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelText(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('100');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });

    it('should support custom validation', () => {
      const label = 'Beløp egendefinert';
      const errorMessage = 'Kun 100 er tillatt';
      cy.findByLabelText(`${label} (valgfritt)`).type('50');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelOptional(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('100');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/currency/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should have english label and descriptions', () => {
      cy.withinComponent('Beløp med beskrivelse (en)', () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
        cy.findByRole('button', { name: 'mer (en)' }).click();
        cy.contains('Dette er utvidet beskrivelse (en)').shouldBeVisible();
      });
    });
  });
});
