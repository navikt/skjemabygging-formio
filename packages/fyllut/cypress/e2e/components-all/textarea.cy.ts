// Settings from TextArea.form.ts: label, fieldSize, description, additionalDescription, autoExpand,
// required, minLength, maxLength, customValidation.
//
// Note: fieldSize controls the visual width of the textarea and is not specifically tested.

describe('TextArea', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/textarea/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable', () => {
      const label = 'Tekstområde';
      cy.findByRole('textbox', { name: label }).should('exist');
      cy.findByLabelText(label).shouldBeVisible();
      cy.findByLabelText(label).should('be.enabled');
      cy.findByLabelText(label).should('not.have.attr', 'readonly');
    });

    it('should have description', () => {
      const label = 'Tekstområde med beskrivelse';
      const additionalDescription = 'Dette er utvidet beskrivelse';
      cy.withinComponent(label, () => {
        cy.contains('Dette er en beskrivelse').should('exist');
        cy.contains(additionalDescription).should('not.be.visible');
        cy.findByRole('button', { name: 'mer' }).click();
        cy.contains(additionalDescription).shouldBeVisible();
      });
    });

    it('should support fixed height (autoExpand disabled)', () => {
      const label = 'Tekstområde fast høyde';
      cy.findByLabelText(label).shouldBeVisible();
      cy.findByLabelText(label).should('be.enabled');
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/textarea/validering?sub=paper');
      cy.defaultWaits();
    });

    it('should validate with required', () => {
      const label = 'Tekstområde påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().type('noe tekst');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should not be required', () => {
      const label = 'Tekstområde ikke påkrevd';
      cy.clickNextStep();
      cy.findByLabelOptional(label).should('exist');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should validate the min length', () => {
      const label = 'Tekstområde min og max';
      cy.findByLabelText(label).type('ab');
      cy.clickNextStep();
      cy.findAllByErrorMessageMinLength(label).should('have.length', 2);
      cy.clickErrorMessageMinLength(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('abcde');
      cy.clickErrorMessageMinLength(label).should('have.length', 0);
    });

    it('should validate the max length', () => {
      const label = 'Tekstområde min og max';
      cy.findByLabelText(label).invoke('removeAttr', 'maxlength').type('abcdefghijk');
      cy.clickNextStep();
      cy.findAllByErrorMessageMaxLength(label).should('have.length', 2);
      cy.clickErrorMessageMaxLength(label);
      cy.findByLabelText(label).should('have.focus');
      cy.focused().clear();
      cy.focused().type('abcde');
      cy.clickErrorMessageMaxLength(label).should('have.length', 0);
    });

    it('should support custom validation', () => {
      const label = 'Tekstområde egendefinert';
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
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/textarea?sub=paper');
      cy.defaultWaits();
    });

    it('should test filling out a full form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.findByRole('textbox', { name: 'Tekstområde' }).type('vis1');
      cy.findByRole('textbox', { name: 'Tekstområde med beskrivelse' }).type('vis2');
      cy.findByRole('textbox', { name: 'Tekstområde fast høyde' }).type('vis3');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.findByRole('textbox', { name: 'Tekstområde påkrevd' }).type('valid1');
      cy.findByRole('textbox', { name: 'Tekstområde ikke påkrevd (valgfritt)' }).type('valid2');
      cy.findByRole('textbox', { name: 'Tekstområde min og max' }).type('valid3');
      cy.findByRole('textbox', { name: 'Tekstområde egendefinert' }).type('abc');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').eq(0).should('contain.text', 'Tekstområde');
        cy.get('dd').eq(0).should('contain.text', 'vis1');
        cy.get('dt').eq(1).should('contain.text', 'Tekstområde med beskrivelse');
        cy.get('dd').eq(1).should('contain.text', 'vis2');
        cy.get('dt').eq(2).should('contain.text', 'Tekstområde fast høyde');
        cy.get('dd').eq(2).should('contain.text', 'vis3');
      });
      cy.withinSummaryGroup('Validering', () => {
        cy.get('dt').eq(0).should('contain.text', 'Tekstområde påkrevd');
        cy.get('dd').eq(0).should('contain.text', 'valid1');
        cy.get('dt').eq(1).should('contain.text', 'Tekstområde ikke påkrevd');
        cy.get('dd').eq(1).should('contain.text', 'valid2');
        cy.get('dt').eq(2).should('contain.text', 'Tekstområde min og max');
        cy.get('dd').eq(2).should('contain.text', 'valid3');
        cy.get('dt').eq(3).should('contain.text', 'Tekstområde egendefinert');
        cy.get('dd').eq(3).should('contain.text', 'abc');
      });
      cy.clickDownloadInstructions();

      cy.findByRole('heading', { name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.testDownloadPdf();
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/textarea/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should have english label and descriptions', () => {
      cy.withinComponent('Tekstområde med beskrivelse (en)', () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
        cy.findByRole('button', { name: 'mer (en)' }).click();
        cy.contains('Dette er utvidet beskrivelse (en)').shouldBeVisible();
      });
    });
  });
});
