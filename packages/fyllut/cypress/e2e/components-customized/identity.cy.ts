describe('Identity', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Default label', () => {
    beforeEach(() => {
      cy.visit('/fyllut/identity/standard?sub=paper');
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
      cy.visit('/fyllut/identity/tilpassetledetekst?sub=paper');
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
      cy.visit('/fyllut/identity/tilpassetledetekst?sub=paper&lang=en');
      cy.defaultWaits();
    });

    it('should translate the custom radio question label', () => {
      cy.findByRole('group', { name: 'Har du et gyldig identitetsdokument? (en)' }).should('exist');
    });
  });
});
