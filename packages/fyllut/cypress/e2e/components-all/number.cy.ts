describe('Number', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/number/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable', () => {
      const label = 'Tall';
      cy.findByRole('textbox', { name: label }).should('exist');
      cy.findByLabelText(label).shouldBeVisible();
      cy.findByLabelText(label).should('be.enabled');
      cy.findByLabelText(label).should('not.have.attr', 'readonly');
    });

    it('should have description', () => {
      const label = 'Tall med beskrivelse';
      const additionalDescription = 'Dette er utvidet beskrivelse';
      cy.withinComponent(label, () => {
        cy.contains('Dette er en beskrivelse').should('exist');
        cy.contains(additionalDescription).should('not.be.visible');
        cy.findByRole('button', { name: 'mer' }).click();
        cy.contains(additionalDescription).shouldBeVisible();
      });
    });

    it('should support decimal inputType', () => {
      const label = 'Desimaltall';
      cy.findByLabelText(label).should('exist');
      cy.findByLabelText(label).shouldBeVisible();
      cy.findByLabelText(label).should('have.attr', 'inputmode', 'decimal');
    });

    it('should use numeric inputType for integer fields', () => {
      const label = 'Tall';
      cy.findByLabelText(label).should('have.attr', 'inputmode', 'numeric');
    });
  });

  describe('Data', () => {
    beforeEach(() => {
      cy.visit('/fyllut/number/data?sub=paper');
      cy.defaultWaits();
    });

    it('should calculate value', () => {
      const label = 'Kalkulert sum';
      cy.findByLabelText(label).should('have.value', '');
      cy.findByRole('textbox', { name: 'Tall A' }).type('3');
      cy.findByRole('textbox', { name: 'Tall B' }).type('5');
      cy.findByLabelText(label).should('have.value', '8');
      cy.findByLabelText(label).should('have.attr', 'readonly');
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/number/validering?sub=paper');
      cy.defaultWaits();
    });

    it('should validate with required', () => {
      const label = 'Tall påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().type('42');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should not be required', () => {
      const label = 'Tall ikke påkrevd';
      cy.clickNextStep();
      cy.findByLabelOptional(label).should('exist');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should validate min value', () => {
      const label = 'Tall min og max';
      const errorMessage = `${label} kan ikke være mindre enn 0.`;
      cy.findByLabelText(`${label} (valgfritt)`).type('-1');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelOptional(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('50');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });

    it('should validate max value', () => {
      const label = 'Tall min og max';
      const errorMessage = `${label} kan ikke være større enn 100.`;
      cy.findByLabelText(`${label} (valgfritt)`).type('101');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelOptional(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('50');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });

    it('should validate that numeric field only accepts integers', () => {
      const label = 'Tall påkrevd';
      const errorMessage = 'Oppgi et tall uten desimaler.';
      cy.findByLabelText(label).type('1.5');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelText(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('2');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });

    it('should support custom validation', () => {
      const label = 'Tall egendefinert';
      const errorMessage = 'Kun 5 er tillatt';
      cy.findByLabelText(`${label} (valgfritt)`).type('3');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelOptional(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('5');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/number?sub=paper');
      cy.defaultWaits();
    });

    it('should test filling out a full form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.findByRole('textbox', { name: 'Tall' }).type('10');
      cy.findByRole('textbox', { name: 'Tall med beskrivelse' }).type('20');
      cy.findByRole('textbox', { name: 'Desimaltall' }).type('3');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Data' }).should('exist');
      cy.findByRole('textbox', { name: 'Tall A' }).type('3');
      cy.findByRole('textbox', { name: 'Tall B' }).type('5');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.findByRole('textbox', { name: 'Tall påkrevd' }).type('42');
      cy.findByRole('textbox', { name: 'Tall ikke påkrevd (valgfritt)' }).type('7');
      cy.findByRole('textbox', { name: 'Tall min og max (valgfritt)' }).type('50');
      cy.findByRole('textbox', { name: 'Tall egendefinert (valgfritt)' }).type('5');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').eq(0).should('contain.text', 'Tall');
        cy.get('dd').eq(0).should('contain.text', '10');
        cy.get('dt').eq(1).should('contain.text', 'Tall med beskrivelse');
        cy.get('dd').eq(1).should('contain.text', '20');
        cy.get('dt').eq(2).should('contain.text', 'Desimaltall');
        cy.get('dd').eq(2).should('contain.text', '3');
      });
      cy.withinSummaryGroup('Data', () => {
        cy.get('dt').eq(0).should('contain.text', 'Tall A');
        cy.get('dd').eq(0).should('contain.text', '3');
        cy.get('dt').eq(1).should('contain.text', 'Tall B');
        cy.get('dd').eq(1).should('contain.text', '5');
        cy.get('dt').eq(2).should('contain.text', 'Kalkulert sum');
        cy.get('dd').eq(2).should('contain.text', '8');
      });
      cy.withinSummaryGroup('Validering', () => {
        cy.get('dt').eq(0).should('contain.text', 'Tall påkrevd');
        cy.get('dd').eq(0).should('contain.text', '42');
        cy.get('dt').eq(1).should('contain.text', 'Tall ikke påkrevd');
        cy.get('dd').eq(1).should('contain.text', '7');
        cy.get('dt').eq(2).should('contain.text', 'Tall min og max');
        cy.get('dd').eq(2).should('contain.text', '50');
        cy.get('dt').eq(3).should('contain.text', 'Tall egendefinert');
        cy.get('dd').eq(3).should('contain.text', '5');
      });
      cy.clickDownloadInstructions();

      cy.findByRole('heading', { name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.testDownloadPdf();
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/number/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should have english label and descriptions', () => {
      cy.withinComponent('Tall med beskrivelse (en)', () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
        cy.findByRole('button', { name: 'mer (en)' }).click();
        cy.contains('Dette er utvidet beskrivelse (en)').shouldBeVisible();
      });
    });
  });
});
