// Identity (navIdentity) settings from Identity.form.ts:
// - customLabels.doYouHaveIdentityNumber: custom label for the opening radio question.
//   Default: 'Har du norsk fødselsnummer eller d-nummer?'
// - prefillKey: 'sokerIdentifikasjonsnummer' — prefills identity number from PDL in
//   digital mode. In paper mode (tested here) no prefill occurs, so this has no
//   visible effect and is not tested.
//
// Behaviour:
// - Renders a radio "Har du norsk fødselsnummer eller d-nummer?" (Ja / Nei).
// - Selecting "Ja" reveals the identity number field "Fødselsnummer eller d-nummer".
// - Selecting "Nei" reveals the birthdate datepicker "Fødselsdato (dd.mm.åååå)".
//
// Note: Identity has hideLabel: true by default — the component label is not rendered.
// Note: Internal field labels come from static TEXTS (identity.identityNumber,
//   identity.yourBirthdate), so there are no component-level translation tests for those.

describe('Identity', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Default label', () => {
    beforeEach(() => {
      cy.visit('/fyllut/identitet/standard?sub=paper');
      cy.defaultWaits();
    });

    it('should render the default radio question', () => {
      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).should('exist');
    });

    it('should show Ja and Nei options', () => {
      cy.findByLabelText('Ja').should('exist');
      cy.findByLabelText('Nei').should('exist');
    });

    it('should show identity number field when Ja is selected', () => {
      cy.findByLabelText('Ja').check();
      cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).should('exist');
    });

    it('should show birthdate field when Nei is selected', () => {
      cy.findByLabelText('Nei').check();
      cy.findByRole('textbox', { name: 'Fødselsdato (dd.mm.åååå)' }).should('exist');
    });
  });

  describe('Custom label (customLabels.doYouHaveIdentityNumber)', () => {
    beforeEach(() => {
      cy.visit('/fyllut/identitet/tilpassetledetekst?sub=paper');
      cy.defaultWaits();
    });

    it('should render the custom radio question label', () => {
      cy.findByRole('group', { name: 'Har du et gyldig identitetsdokument?' }).should('exist');
    });

    it('should show Ja and Nei options', () => {
      cy.findByLabelText('Ja').should('exist');
      cy.findByLabelText('Nei').should('exist');
    });
  });

  describe('Translation', () => {
    beforeEach(() => {
      cy.visit('/fyllut/identitet/tilpassetledetekst?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should translate the custom radio question label', () => {
      cy.findByRole('group', { name: 'Har du et gyldig identitetsdokument? (en)' }).should('exist');
    });
  });
});
