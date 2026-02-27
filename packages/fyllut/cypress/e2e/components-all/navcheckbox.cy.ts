// Settings from Checkbox.form.ts: label, description, additionalDescription, required, customValidation.

describe('NavCheckbox', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/navcheckbox/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable', () => {
      const label = 'Avkryssingsboks';
      cy.findByRole('checkbox', { name: label }).should('exist');
      cy.findByRole('checkbox', { name: label }).shouldBeVisible();
      cy.findByRole('checkbox', { name: label }).should('be.enabled');
      cy.findByRole('checkbox', { name: label }).should('not.be.checked');
    });

    it('should have description', () => {
      const additionalDescription = 'Dette er utvidet beskrivelse';
      cy.contains('Dette er en beskrivelse').should('exist');
      cy.contains(additionalDescription).should('not.be.visible');
      cy.findByRole('button', { name: 'mer' }).click();
      cy.contains(additionalDescription).shouldBeVisible();
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/navcheckbox/validering?sub=paper');
      cy.defaultWaits();
    });

    it('should validate with required', () => {
      const label = 'Avkryssingsboks påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.findByRole('checkbox', { name: label }).check();
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should not be required', () => {
      const label = 'Avkryssingsboks ikke påkrevd';
      cy.clickNextStep();
      cy.findByLabelOptional(label).should('exist');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should support custom validation', () => {
      const label = 'Avkryssingsboks egendefinert';
      const errorMessage = 'Du må godta vilkårene';
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 1);
      cy.findByRole('checkbox', { name: label }).check();
      cy.findAllByText(errorMessage).should('have.length', 0);
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/navcheckbox?sub=paper');
      cy.defaultWaits();
    });

    it('should test filling out a full form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.findByRole('checkbox', { name: 'Avkryssingsboks' }).check();
      cy.findByRole('checkbox', { name: 'Avkryssingsboks med beskrivelse' }).check();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.findByRole('checkbox', { name: 'Avkryssingsboks påkrevd' }).check();
      cy.findByRole('checkbox', { name: 'Avkryssingsboks egendefinert' }).check();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.get('dt').eq(0).should('contain.text', 'Avkryssingsboks');
        cy.get('dd').eq(0).should('contain.text', 'Ja');
        cy.get('dt').eq(1).should('contain.text', 'Avkryssingsboks med beskrivelse');
        cy.get('dd').eq(1).should('contain.text', 'Ja');
      });
      cy.withinSummaryGroup('Validering', () => {
        cy.get('dt').eq(0).should('contain.text', 'Avkryssingsboks påkrevd');
        cy.get('dd').eq(0).should('contain.text', 'Ja');
        cy.get('dt').eq(1).should('contain.text', 'Avkryssingsboks egendefinert');
        cy.get('dd').eq(1).should('contain.text', 'Ja');
      });
      cy.clickDownloadInstructions();

      cy.findByRole('heading', { name: 'Skjemaet er ikke sendt ennå' }).should('exist');
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/navcheckbox/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should have english label and descriptions', () => {
      cy.withinComponent('Avkryssingsboks med beskrivelse (en)', () => {
        cy.contains('Dette er en beskrivelse (en)').should('exist');
        cy.findByRole('button', { name: 'mer (en)' }).click();
        cy.contains('Dette er utvidet beskrivelse (en)').shouldBeVisible();
      });
    });
  });
});
