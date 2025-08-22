describe('Phone number with area code', () => {
  describe('Telefonnummer med landskode', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/phonenumberareacode/skjema?sub=digital');
      cy.defaultWaits();
      cy.wait('@getAreaCodes');
    });

    const fillForm = (areaCode: string, phoneNumber: string) => {
      cy.findByRole('combobox').should('exist').select(areaCode);
      cy.findByRole('textbox').should('exist').type(phoneNumber);
    };

    it('triggers errors', () => {
      cy.clickSaveAndContinue();

      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Du må fylle ut: Telefonnummer' }).should('exist');
        });
      fillForm('+47', 'sdfd');
      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Telefonnummer kan bare inneholde tall' }).should('exist');
        });

      cy.findByRole('textbox').should('exist').clear();
      fillForm('+47', '888');
      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Telefonnummer må ha 8 siffer' }).should('exist');
        });
    });

    it('should format phone number when area code is +47 and phone numer length is 8', () => {
      fillForm('+47', '12345678');
      cy.clickSaveAndContinue();

      cy.get('[data-cy=summary]')
        .should('exist')
        .within(() => {
          cy.findByText('+47 123 45 678').should('exist');
        });
    });

    it('should not format phone number when area code is +48 and phone number length is 8', () => {
      fillForm('+48', '12345678');
      cy.clickSaveAndContinue();

      cy.get('[data-cy=summary]')
        .should('exist')
        .within(() => {
          cy.findByText('+48 12345678').should('exist');
        });
    });
  });
});
