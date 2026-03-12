describe('AddressValidity', () => {
  beforeEach(() => {
    const today = new Date('2025-06-01');
    cy.clock(today, ['Date']);
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/addressvalidity/standard?sub=paper');
      cy.defaultWaits();
    });

    it('should render the "valid from" date field', () => {
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').shouldBeVisible();
    });

    it('should render the "valid to" date field as optional', () => {
      cy.findByLabelText('Gyldig til (dd.mm.åååå) (valgfritt)').should('exist');
      cy.findByLabelText('Gyldig til (dd.mm.åååå) (valgfritt)').shouldBeVisible();
    });

    it('should render description for the "valid from" field', () => {
      cy.contains('Fra hvilken dato skal denne adressen brukes?').should('exist');
    });

    it('should render description for the "valid to" field', () => {
      cy.contains('Du velger selv hvor lenge adressen skal være gyldig').should('exist');
    });

    it('should accept a valid date in the "valid from" field', () => {
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').type('01.06.2025');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('have.value', '01.06.2025');
    });

    it('should accept a valid date in the "valid to" field', () => {
      cy.findByLabelText('Gyldig til (dd.mm.åååå) (valgfritt)').type('01.12.2025');
      cy.findByLabelText('Gyldig til (dd.mm.åååå) (valgfritt)').should('have.value', '01.12.2025');
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/addressvalidity/standard?sub=paper');
      cy.defaultWaits();
    });

    it('should show required error for "valid from" when submitting empty', () => {
      cy.clickNextStep();
      cy.findAllByText('Du må fylle ut: Gyldig fra (dd.mm.åååå)').should('have.length', 2);
    });

    it('should not show required error for "valid to" when submitting empty', () => {
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').type('01.06.2025');
      cy.clickNextStep();
      cy.findAllByText('Du må fylle ut: Gyldig til (dd.mm.åååå)').should('have.length', 0);
    });
  });
});
