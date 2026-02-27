// Settings from Year.form.ts: label, description, additionalDescription, required, minYear, maxYear,
// customValidation.

describe('Year', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/year/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable', () => {
      const label = 'Årstall';
      cy.findByRole('textbox', { name: label }).should('exist');
      cy.findByLabelText(label).shouldBeVisible();
      cy.findByLabelText(label).should('be.enabled');
      cy.findByLabelText(label).should('not.have.attr', 'readonly');
    });

    it('should have description', () => {
      const label = 'Årstall med beskrivelse';
      const additionalDescription = 'Dette er utvidet beskrivelse';
      cy.withinComponent(label, () => {
        cy.contains('Dette er en beskrivelse').should('exist');
        cy.contains(additionalDescription).should('not.be.visible');
        cy.findByRole('button', { name: 'mer' }).click();
        cy.contains(additionalDescription).shouldBeVisible();
      });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/year/validering?sub=paper');
      cy.defaultWaits();
    });

    it('should validate with required', () => {
      const label = 'Årstall påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().type('2023');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should not be required', () => {
      const label = 'Årstall ikke påkrevd';
      cy.clickNextStep();
      cy.findByLabelOptional(label).should('exist');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should validate year length', () => {
      const label = 'Årstall påkrevd';
      const errorMessage = `${label} må ha 4 siffer`;
      cy.findByLabelText(label).type('99');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelText(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('2023');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });

    it('should validate minYear', () => {
      const label = 'Årstall tidligst 2000';
      const errorMessage = `${label} kan ikke være før 2000`;
      cy.findByLabelText(`${label} (valgfritt)`).type('1999');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelOptional(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('2010');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });

    it('should validate maxYear', () => {
      const label = 'Årstall senest 2030';
      const errorMessage = `${label} kan ikke være senere enn 2030`;
      cy.findByLabelText(`${label} (valgfritt)`).type('2031');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelOptional(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('2020');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });

    it('should support custom validation', () => {
      const label = 'Årstall egendefinert';
      const errorMessage = 'Kun 2000 er tillatt';
      cy.findByLabelText(`${label} (valgfritt)`).type('2023');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelOptional(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('2000');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/year?sub=paper');
      cy.defaultWaits();
    });

    it('should test filling out a full form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.findByRole('textbox', { name: 'Årstall' }).type('2023');
      cy.findByRole('textbox', { name: 'Årstall med beskrivelse' }).type('2024');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.findByRole('textbox', { name: 'Årstall påkrevd' }).type('2025');
      cy.findByRole('textbox', { name: 'Årstall ikke påkrevd (valgfritt)' }).type('2026');
      cy.findByRole('textbox', { name: 'Årstall tidligst 2000 (valgfritt)' }).type('2010');
      cy.findByRole('textbox', { name: 'Årstall senest 2030 (valgfritt)' }).type('2020');
      cy.findByRole('textbox', { name: 'Årstall egendefinert (valgfritt)' }).type('2000');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').eq(0).should('contain.text', 'Årstall');
        cy.get('dd').eq(0).should('contain.text', '2023');
        cy.get('dt').eq(1).should('contain.text', 'Årstall med beskrivelse');
        cy.get('dd').eq(1).should('contain.text', '2024');
      });
      cy.withinSummaryGroup('Validering', () => {
        cy.get('dt').eq(0).should('contain.text', 'Årstall påkrevd');
        cy.get('dd').eq(0).should('contain.text', '2025');
        cy.get('dt').eq(1).should('contain.text', 'Årstall ikke påkrevd');
        cy.get('dd').eq(1).should('contain.text', '2026');
        cy.get('dt').eq(2).should('contain.text', 'Årstall tidligst 2000');
        cy.get('dd').eq(2).should('contain.text', '2010');
        cy.get('dt').eq(3).should('contain.text', 'Årstall senest 2030');
        cy.get('dd').eq(3).should('contain.text', '2020');
        cy.get('dt').eq(4).should('contain.text', 'Årstall egendefinert');
        cy.get('dd').eq(4).should('contain.text', '2000');
      });
      cy.clickDownloadInstructions();

      cy.findByRole('heading', { name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.testDownloadPdf();
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/year/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should have english label and descriptions', () => {
      cy.withinComponent('Årstall med beskrivelse (en)', () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
        cy.findByRole('button', { name: 'mer (en)' }).click();
        cy.contains('Dette er utvidet beskrivelse (en)').shouldBeVisible();
      });
    });
  });
});
