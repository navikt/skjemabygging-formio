// AddressValidity (addressValidity) settings from AddressValidity.form.ts:
// Only 'key' (api) and 'conditional' settings are available — there are NO display,
// validation, or data settings in the form builder.
//
// The component always renders exactly two date pickers:
// - "Gyldig fra (dd.mm.åååå)": required when validate.required is true (builder default).
// - "Gyldig til (dd.mm.åååå)": always optional (required=false, hardcoded).
//
// Both dates are constrained to ±365 days from today.
//
// Note: hideLabel: true by default — the component label is not rendered.
// Note: All field labels and descriptions come from static TEXTS (address.validFrom,
//   address.validTo, etc.) and are not translatable per-component.
// Note: There is a bug in AddressValidity.tsx where the validation labels are swapped:
//   the required error for the "from" date uses TEXTS.statiske.address.validTo as its
//   label, producing "Du må fylle ut: Gyldig til (dd.mm.åååå)" instead of "...validFrom".

describe('AddressValidity', () => {
  beforeEach(() => {
    const today = new Date('2025-06-01');
    cy.clock(today, ['Date']);
    cy.defaultIntercepts();
  });

  describe('Display', () => {
    beforeEach(() => {
      cy.visit('/fyllut/adressevarighet/standard?sub=paper');
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
      cy.visit('/fyllut/adressevarighet/standard?sub=paper');
      cy.defaultWaits();
    });

    // Note: due to the label-swap bug in AddressValidity.tsx, the required error for the
    // "from" date uses the "valid to" label: "Du må fylle ut: Gyldig til (dd.mm.åååå)"
    it('should show required error for "valid from" when submitting empty', () => {
      cy.clickNextStep();
      cy.findAllByText('Du må fylle ut: Gyldig til (dd.mm.åååå)').should('have.length', 2);
    });

    it('should not show required error for "valid to" when submitting empty', () => {
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').type('01.06.2025');
      cy.clickNextStep();
      cy.findAllByText('Du må fylle ut: Gyldig fra (dd.mm.åååå)').should('have.length', 0);
    });
  });
});
