/*
 * Tests that various components behaves as expected
 * - Penger og konto
 */
describe('Components', () => {
  describe('Penger og konto', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/pengerogkonto/skjema');
      cy.defaultWaits();
      cy.wait('@getCurrencies');
    });

    it('triggers errors', () => {
      cy.findByRole('textbox', { name: 'Kontonummer' }).should('exist').type('12345678980');
      cy.findByRole('textbox', { name: 'IBAN' }).should('exist').type('AB04RABO8424598490');
      cy.clickNextStep();
      cy.findByText('Kontonummer: Dette er ikke et gyldig kontonummer').should('exist');
      cy.findByText(
        'IBAN: Oppgitt IBAN inneholder ugyldig landkode (to store bokstaver i starten av IBAN-koden)',
      ).should('exist');
      cy.findAllByText('Du må fylle ut: Velg valuta').should('have.length', 2);
      cy.findAllByText('Du må fylle ut: Beløp').should('have.length', 2);
    });

    it('allows kontonummer that starts with a 0', () => {
      cy.findByRole('textbox', { name: 'Kontonummer' }).should('exist').type('01234567892');
      cy.findByRole('textbox', { name: 'IBAN' }).should('exist').type('NL04RABO8424598490');
      cy.findByRole('textbox', { name: 'Beløp' }).should('exist').type('450');
      cy.findByRole('combobox', { name: 'Velg valuta' }).should('exist').click();
      cy.findByRole('combobox', { name: 'Velg valuta' }).type('Nor{enter}');

      cy.clickNextStep();

      cy.get('dl')
        .first()
        .within(() => {
          cy.get('dt').eq(0).should('contain.text', 'Kontonummer');
          cy.get('dd').eq(0).should('contain.text', '0123 45 67892');
          cy.get('dt').eq(1).should('contain.text', 'IBAN');
          cy.get('dd').eq(1).should('contain.text', 'NL04RABO8424598490');
          cy.get('dt').eq(2).should('contain.text', 'Angi valuta og beløp');
          cy.get('dd').eq(2).should('contain.text', 'NOK 450'.replace(' ', '\u00A0'));
        });
    });
  });
});