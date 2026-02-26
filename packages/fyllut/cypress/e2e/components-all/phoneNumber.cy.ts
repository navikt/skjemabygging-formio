describe('PhoneNumber', () => {
  // Note: PhoneNumber does not render description (form.ts lists it, but renderReact does not pass it to NavPhoneNumber).
  // Note: minLength, maxLength and customValidation from form.ts have no effect — checkComponentValidity is overridden
  //       without calling super, so only built-in validation (required, digitsOnly, phoneNumberLength) runs.
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/phonenumber/visning?sub=paper');
      cy.defaultWaits();
    });

    it('should be visible and interactable', () => {
      cy.contains('label', 'Telefonnummer').closest('.form-group').find('input[type="tel"]').should('exist');
      cy.contains('label', 'Telefonnummer').closest('.form-group').find('input[type="tel"]').shouldBeVisible();
      cy.contains('label', 'Telefonnummer').closest('.form-group').find('input[type="tel"]').should('be.enabled');
    });

    it('should show area code selector', () => {
      cy.contains('label', 'Telefonnummer med landkode')
        .closest('.form-group')
        .within(() => {
          cy.findByRole('combobox', { name: 'Landskode' }).should('exist');
          cy.findByRole('combobox', { name: 'Landskode' }).shouldBeVisible();
        });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/phonenumber/validering?sub=paper');
      cy.defaultWaits();
    });

    it('should validate with required', () => {
      const label = 'Telefonnummer påkrevd';
      cy.clickNextStep();
      cy.findAllByErrorMessageRequired(label).should('have.length', 2);
      cy.clickErrorMessageRequired(label);
      cy.contains('label', label).closest('.form-group').find('input[type="tel"]').should('have.focus');
      cy.focused().type('12345678');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should not be required', () => {
      const label = 'Telefonnummer ikke påkrevd';
      cy.clickNextStep();
      cy.contains('label', label).closest('.form-group').find('input[type="tel"]').should('exist');
      cy.findAllByErrorMessageRequired(label).should('have.length', 0);
    });

    it('should validate phone number length when area code is selected', () => {
      const label = 'Telefonnummer landkode påkrevd';
      const errorMessage = `${label} må ha 8 siffer`;
      cy.contains('label', label).closest('.form-group').find('input[type="tel"]').type('1234');
      cy.clickNextStep();
      cy.findAllByText(errorMessage).should('have.length', 2);
      cy.findByRole('link', { name: errorMessage }).click();
      cy.contains('label', label).closest('.form-group').find('input[type="tel"]').should('have.focus');
      cy.focused().clear();
      cy.focused().type('12345678');
      cy.findAllByText(errorMessage).should('have.length', 0);
    });
  });

  describe('Form', () => {
    beforeEach(() => {
      cy.visit('/fyllut/phonenumber?sub=paper');
      cy.defaultWaits();
    });

    it('should test filling out a full form', () => {
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Visning' }).should('exist');
      cy.contains('label', 'Telefonnummer').closest('.form-group').find('input[type="tel"]').type('12345678');
      cy.contains('label', 'Telefonnummer med landkode')
        .closest('.form-group')
        .find('input[type="tel"]')
        .type('12345678');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Validering' }).should('exist');
      cy.contains('label', 'Telefonnummer påkrevd').closest('.form-group').find('input[type="tel"]').type('11223344');
      cy.contains('label', 'Telefonnummer ikke påkrevd')
        .closest('.form-group')
        .find('input[type="tel"]')
        .type('55667788');
      cy.contains('label', 'Telefonnummer landkode påkrevd')
        .closest('.form-group')
        .find('input[type="tel"]')
        .type('12345678');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Visning', () => {
        cy.contains('Telefonnummer').should('exist');
        cy.contains('12345678').should('exist');
      });
      cy.withinSummaryGroup('Validering', () => {
        cy.contains('Telefonnummer påkrevd').should('exist');
        cy.contains('11223344').should('exist');
      });
      cy.clickDownloadInstructions();

      cy.findByRole('heading', { name: 'Skjemaet er ikke sendt ennå' }).should('exist');
      cy.testDownloadPdf();
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/phonenumber/visning?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should have english label', () => {
      cy.contains('label', 'Telefonnummer (en)').should('exist');
      cy.contains('label', 'Telefonnummer med landkode (en)').should('exist');
    });
  });
});
