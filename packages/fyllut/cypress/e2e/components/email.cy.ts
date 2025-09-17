describe('Email', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/eml123456/veiledning?sub=paper');
    cy.defaultWaits();
  });

  describe('Validation', () => {
    it('Allows valid mail address', () => {
      cy.findByRole('textbox', { name: 'E-post' }).should('exist').type('test@mail.no');
      cy.clickNextStep();

      cy.get('[data-cy=error-summary]').should('not.exist');
      cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
    });

    it('Shows error when mail address is required', () => {
      cy.findByRole('textbox', { name: 'E-post' }).should('exist');
      cy.clickNextStep();

      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Du må fylle ut: E-post' }).should('exist');
        });
    });

    it('Shows error when invalid mail address', () => {
      cy.findByRole('textbox', { name: 'E-post' }).should('exist').type('test@mail');
      cy.clickNextStep();

      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', {
            name: 'E-post må være en gyldig epost-adresse (for eksempel navn@eksempel.no)',
          }).should('exist');
        });
    });

    it('Validates ok even if user typed spaces', () => {
      cy.findByRole('textbox', { name: 'E-post' }).should('exist').type(' test@mail.no   ');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
    });
  });

  describe('Focus', () => {
    it('Puts focus on mail input', () => {
      cy.findByRole('textbox', { name: 'E-post' }).should('exist').type('test@mail');
      cy.clickNextStep();

      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'E-post må være en gyldig epost-adresse (for eksempel navn@eksempel.no)' })
            .should('exist')
            .click();
        });

      cy.findByRole('textbox', { name: 'E-post' }).should('exist').should('have.focus').type('.no');

      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
    });
  });

  describe('Submission', () => {
    it('Keeps value when navigating back from summary', () => {
      cy.findByRole('textbox', { name: 'E-post' }).should('exist').type(' test@mail.no   ');
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Vedlegg' }).should('exist');
      cy.findAllByRole('group')
        .should('exist')
        .should('have.length', 4)
        .each((radiogroup) => {
          cy.wrap(radiogroup).findByRole('radio', { name: 'Jeg legger det ved dette skjemaet' }).check();
        });
      cy.clickNextStep();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.clickEditAnswer('Veiledning');

      cy.findByRole('textbox', { name: 'E-post' }).should('exist').should('have.value', 'test@mail.no');
    });
  });
});
