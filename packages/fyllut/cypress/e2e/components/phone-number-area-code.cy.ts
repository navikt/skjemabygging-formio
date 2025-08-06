describe('Phone number with area code', () => {
  describe('Telefonnummer med landskode', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/phonenumberareacode/skjema?sub=digital');
      cy.defaultWaits();
      // cy.wait('@getAreaCodes');
    });

    const fillForm = (areaCode: string, phoneNumber: string) => {
      cy.findByRole('combobox', { name: 'Velg landskode' }).should('exist').select(areaCode);
      cy.findByRole('textbox', { name: 'Telefonnummer' }).should('exist').type(phoneNumber);
    };

    it('triggers errors', () => {
      cy.clickSaveAndContinue();

      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Du må fylle ut: Velg landskode' }).should('exist');
          cy.findByRole('link', { name: 'Du må fylle ut: Telefonnummer' }).should('exist');
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
