// Note: beforeDateInputKey (fra-til-dato, date constraint relative to another field) and
// customValidation require more complex setup and are not tested here.

describe('DatePicker', () => {
  beforeEach(() => {
    const today = new Date('2025-01-15');
    cy.clock(today, ['Date']);
    cy.defaultIntercepts();
  });

  // Playwright: packages/fyllut/playwright/e2e/components-date/datePicker.spec.ts | DatePicker > should preserve the natural date width despite legacy input--xxl sizing
  it('should preserve the natural date width despite legacy input--xxl sizing', () => {
    cy.visit('/fyllut/components/datoogtid?sub=paper');
    cy.defaultWaits();

    cy.findByRole('textbox', { name: /Klokkeslett/ }).should(($time) => {
      expect($time[0].getBoundingClientRect().width).to.be.closeTo(420, 1);
    });
    cy.findByRole('textbox', { name: /Dato \(dd\.mm/ }).should(($date) => {
      const width = $date[0].getBoundingClientRect().width;
      expect(width).to.be.greaterThan(0);
      expect(width).to.be.lessThan(420);
    });
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/datepicker/visning?sub=paper');
      cy.defaultWaits();
    });

    // Playwright: packages/fyllut/playwright/e2e/components-date/datePicker.spec.ts | DatePicker > Display > should be visible and interactable
    it('should be visible and interactable', () => {
      const label = 'Dato (dd.mm.åååå)';
      cy.findByLabelText(label).should('exist');
      cy.findByLabelText(label).shouldBeVisible();
      cy.findByLabelText(label).should('be.enabled');
      cy.findByLabelText(label).should('not.have.attr', 'readonly');
    });

    // Playwright: packages/fyllut/playwright/e2e/components-date/datePicker.spec.ts | DatePicker > Display > should accept a valid date
    it('should accept a valid date', () => {
      const label = 'Dato (dd.mm.åååå)';
      cy.findByLabelText(label).type('15.01.2025');
      cy.findByLabelText(label).should('have.value', '15.01.2025');
    });

    // Playwright: packages/fyllut/playwright/e2e/components-date/datePicker.spec.ts | DatePicker > Display > should have description
    it('should have description', () => {
      cy.withinComponent('Dato med beskrivelse', () => {
        cy.contains('Velg ønsket dato').should('be.visible');
      });
    });

    // Playwright: packages/fyllut/playwright/e2e/components-date/datePicker.spec.ts | DatePicker > Display > should have additionalDescription
    it('should have additionalDescription', () => {
      cy.withinComponent('Dato med tilleggsbeskrivelse', () => {
        cy.contains('Mer informasjon').should('exist');
        cy.contains('Utvidet informasjon om dato').should('not.be.visible');
        cy.findByRole('button', { name: 'Mer informasjon' }).click();
        cy.contains('Utvidet informasjon om dato').should('be.visible');
      });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/datepicker/validering?sub=paper');
      cy.defaultWaits();
    });

    // Playwright: packages/fyllut/playwright/e2e/components-date/datePicker.spec.ts | DatePicker > Validation > should validate required
    it('should validate required', () => {
      const label = 'Dato påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.focused().type('15.01.2025');
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    // Playwright: packages/fyllut/playwright/e2e/components-date/datePicker.spec.ts | DatePicker > Validation > should not be required
    it('should not be required', () => {
      const label = 'Dato ikke påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    // Playwright: packages/fyllut/playwright/e2e/components-date/datePicker.spec.ts | DatePicker > Validation > should validate specificEarliestAllowedDate
    it('should validate specificEarliestAllowedDate', () => {
      const label = 'Dato fra og med 10.01.2025';
      const errorMessage = 'Datoen kan ikke være tidligere enn 10.01.2025';
      cy.findByLabelText(label).type('05.01.2025');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByLabelText(label).type('{selectAll}10.01.2025');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 0);
    });

    // Playwright: packages/fyllut/playwright/e2e/components-date/datePicker.spec.ts | DatePicker > Validation > should validate specificLatestAllowedDate
    it('should validate specificLatestAllowedDate', () => {
      const label = 'Dato til og med 20.01.2025';
      const errorMessage = 'Datoen kan ikke være senere enn 20.01.2025';
      cy.findByLabelText(label).type('25.01.2025');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByLabelText(label).type('{selectAll}15.01.2025');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 0);
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/datepicker/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    // Playwright: packages/fyllut/playwright/e2e/components-date/datePicker.spec.ts | DatePicker > Translation > should translate label
    it('should translate label', () => {
      cy.findByLabelText('Dato (dd.mm.åååå) (en)').should('exist');
    });

    // Playwright: packages/fyllut/playwright/e2e/components-date/datePicker.spec.ts | DatePicker > Translation > should translate description
    it('should translate description', () => {
      cy.withinComponent('Dato med beskrivelse (en)', () => {
        cy.contains('Velg ønsket dato (en)').should('be.visible');
      });
    });
  });
});
