describe('TextField', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/textfield/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable', () => {
      const label = 'Tekstfelt';
      cy.findByRole('textbox', { name: label }).should('exist');
      cy.findByLabelText(label).shouldBeVisible();
      cy.findByLabelText(label).should('be.enabled');
      cy.findByLabelText(label).should('not.have.attr', 'readonly');
    });

    it('should have description', () => {
      const label = 'Tekstfelt med beskrivelse';
      const additionalDescription = 'Dette er utvidet beskrivelse';
      cy.withinComponent(label, () => {
        cy.contains('Dette er en beskrivelse').should('exist');
        cy.contains(additionalDescription).should('not.be.visible');
        cy.findByRole('button', { name: 'mer' }).click();
        cy.contains(additionalDescription).shouldBeVisible();
      });
    });

    it('should have properties', () => {
      const label = 'Tekstfelt med egenskaper';
      cy.findByLabelText(label).should('have.attr', 'autocomplete', 'name');
      cy.findByLabelText(label).should('have.attr', 'spellcheck', 'true');
    });
  });

  describe('Data', () => {
    beforeEach(() => {
      cy.visit('/fyllut/textfield/data?sub=paper');
      cy.defaultWaits();
    });

    it('should calculate value', () => {
      const label = 'Tekstfelt A+B';
      const a = 'a';
      const b = 'b';
      cy.findByLabelText(label).should('have.value', '');
      cy.findByRole('textbox', { name: 'Tekstfelt A' }).type(a);
      cy.findByLabelText(label).should('have.value', a);
      cy.findByRole('textbox', { name: 'Tekstfelt B' }).type(b);
      cy.findByLabelText(label).should('have.value', a + b);
      cy.findByLabelText(label).should('have.attr', 'readonly');
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/textfield/validering?sub=paper');
      cy.defaultWaits();
    });

    it('should validate with required', () => {
      const label = 'Tekstfelt påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().type('asdf');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should not be required', () => {
      const label = 'Tekstfelt ikke påkrevd';
      cy.clickNextStep();
      cy.findByLabelOptional(label).should('exist');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should validate to make sure only numbers are allowed', () => {
      const label = 'Tekstfelt kun siffer';
      const errorMessage = `${label} kan bare inneholde tall`;
      cy.findByLabelText(label).type('abc');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelText(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('123');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });

    it('should validate the min length', () => {
      const label = 'Tekstfelt min og max lengde';
      cy.findByLabelText(label).type('a');
      cy.clickNextStep();
      cy.findAllByErrorMessageMinLength(label).should('have.length', 2);
      cy.clickErrorMessageMinLength(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('abcde');
      cy.clickErrorMessageMinLength(label).should('have.length', 0);
    });

    it('should validate the max length', () => {
      const label = 'Tekstfelt min og max lengde';
      cy.findByLabelText(label).type('abcdefghij');
      cy.clickNextStep();
      cy.findAllByErrorMessageMaxLength(label).should('have.length', 2);
      cy.clickErrorMessageMaxLength(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('abcd');
      cy.clickErrorMessageMaxLength(label).should('have.length', 0);
    });

    it('should support custom validation', () => {
      const label = 'Tekstfelt må være abc';
      const errorMessage = 'abc er eneste lovlige verdien';
      cy.findByLabelText(label).type('ab');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.findByLabelText(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('abc');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });

    /**
     * Skipped test case: We show both required and custom validation errors in the error summary.
     * This should be changed in the future so that only the required error message is shown.
     */
    it.skip('should not show custom validation in error summary, if it has required error message', () => {
      const label = 'Tekstfelt må være abc';
      const errorMessage = 'abc er eneste lovlige verdien';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.findAllByText(errorMessage).should('have.length', 0);
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/textfield?sub=paper');
      cy.defaultWaits();
    });

    it('should test filling out a full form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.findByRole('textbox', { name: 'Tekstfelt' }).type('vis1');
      cy.findByRole('textbox', { name: 'Tekstfelt med beskrivelse' }).type('vis2');
      cy.findByRole('textbox', { name: 'Tekstfelt med egenskaper' }).type('vis3');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Data' }).should('exist');
      cy.findByRole('textbox', { name: 'Tekstfelt A' }).type('data1');
      cy.findByRole('textbox', { name: 'Tekstfelt B' }).type('data2');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.findByRole('textbox', { name: 'Tekstfelt påkrevd' }).type('valid1');
      cy.findByRole('textbox', { name: 'Tekstfelt ikke påkrevd (valgfritt)' }).type('valid2');
      cy.findByRole('textbox', { name: 'Tekstfelt kun siffer' }).type('123');
      cy.findByRole('textbox', { name: 'Tekstfelt min og max lengde' }).type('valid3');
      cy.findByRole('textbox', { name: 'Tekstfelt må være abc' }).type('abc');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').eq(0).should('contain.text', 'Tekstfelt');
        cy.get('dd').eq(0).should('contain.text', 'vis1');
        cy.get('dt').eq(1).should('contain.text', 'Tekstfelt med beskrivelse');
        cy.get('dd').eq(1).should('contain.text', 'vis2');
        cy.get('dt').eq(2).should('contain.text', 'Tekstfelt med egenskaper');
        cy.get('dd').eq(2).should('contain.text', 'vis3');
      });
      cy.withinSummaryGroup('Data', () => {
        cy.get('dt').eq(0).should('contain.text', 'Tekstfelt A');
        cy.get('dd').eq(0).should('contain.text', 'data1');
        cy.get('dt').eq(1).should('contain.text', 'Tekstfelt B');
        cy.get('dd').eq(1).should('contain.text', 'data2');
        cy.get('dt').eq(2).should('contain.text', 'Tekstfelt A+B');
        cy.get('dd').eq(2).should('contain.text', 'data1data2');
      });
      cy.withinSummaryGroup('Validering', () => {
        cy.get('dt').eq(0).should('contain.text', 'Tekstfelt påkrevd');
        cy.get('dd').eq(0).should('contain.text', 'valid1');
        cy.get('dt').eq(1).should('contain.text', 'Tekstfelt ikke påkrevd');
        cy.get('dd').eq(1).should('contain.text', 'valid2');
        cy.get('dt').eq(2).should('contain.text', 'Tekstfelt kun siffer');
        cy.get('dd').eq(2).should('contain.text', '123');
        cy.get('dt').eq(3).should('contain.text', 'Tekstfelt min og max lengde');
        cy.get('dd').eq(3).should('contain.text', 'valid3');
        cy.get('dt').eq(4).should('contain.text', 'Tekstfelt må være abc');
        cy.get('dd').eq(4).should('contain.text', 'abc');
      });
      cy.clickDownloadInstructions();

      cy.findByRole('heading', { name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.testDownloadPdf();
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/textfield/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should have english label and descriptions', () => {
      cy.withinComponent('Tekstfelt med beskrivelse (en)', () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
        cy.findByRole('button', { name: 'mer (en)' }).click();
        cy.contains('Dette er utvidet beskrivelse (en)').shouldBeVisible();
      });
    });
  });
});
