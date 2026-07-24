describe('Phone number with area code', () => {
  describe('Telefonnummer med landskode', () => {
    const areaCodeLabel = 'Landskode';

    beforeEach(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/phonenumberareacode/skjema?sub=digital');
      cy.defaultWaits();
      cy.wait('@getAreaCodes');
    });

    const fillForm = (phoneNumber: string, areaCode?: string | RegExp) => {
      if (areaCode) {
        cy.withinComponent(/Telefonnummer med landskode/, () => {
          cy.assertCombobox(areaCode);
          cy.findByRole('textbox').clear();
          cy.findByRole('textbox').type(phoneNumber);
        });
      } else {
        cy.withinComponent(/Telefonnummer ikke påkrevd/, () => {
          cy.findByRole('textbox').clear();
          cy.findByRole('textbox').type(phoneNumber);
        });
      }
    };

    it.only('triggers errors', () => {
      cy.clickSaveAndContinue();

      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Du må fylle ut: Telefonnummer' }).should('exist');
        });
      fillForm('sdfd', '+47');
      fillForm('sdfd');
      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Telefonnummer kan bare inneholde tall' }).should('exist');
        });

      fillForm('888', '+47');

      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Telefonnummer med landskode må ha 8 siffer' }).should('exist');
        });
      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Du må fylle ut: Telefonnummer ikke påkrevd' }).should('not.exist');
        });
    });

    it('should format phone number when area code is +47 and phone numer length is 8', () => {
      fillForm('12345678', '+47');
      cy.assertCombobox(areaCodeLabel, '+47');
      fillForm('12345678');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Oppsummering' }).click();

      cy.findByText('+47 12 34 56 78').should('exist');
      cy.findByText('12345678').should('exist');
    });

    it('should not format phone number when area code is +48 and phone number length is 8', () => {
      fillForm('12345678', '+48');
      cy.assertCombobox(areaCodeLabel, '+48');
      fillForm('12345678');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Oppsummering' }).click();

      cy.findByText('+48 12345678').should('exist');
      cy.findByText('12345678').should('exist');
    });

    it('displays phone number label inside datagrid', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Telefonnummer og datagrid' }).click();
      cy.findByText('Telefonnummer utenfor datagrid (valgfritt)').should('exist');
      cy.findByRole('button', { name: 'Legg til' }).click();
      cy.findAllByText('Telefonnummer inni datagrid (valgfritt)').should('have.length', 2);
    });
  });

  describe('Telefonnummer uten landskode', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/phonenumberareacode/valideringAvSkjultTelefonnummer?sub=paper');
      cy.defaultWaits();
    });

    it('removes error when input is hidden', () => {
      cy.clickNextStep();

      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findAllByRole('link', { name: /^Du må fylle ut: .*/ }).should('have.length', 1);
        });
      cy.findByRole('checkbox', { name: /Har ikke telefonnummer/ }).check();
      cy.get('[data-cy=error-summary]').should('not.exist');
    });
  });
});
