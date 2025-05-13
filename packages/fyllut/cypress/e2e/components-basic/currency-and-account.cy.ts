/*
 * Tests that "penger og konto" component works as expected
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
      cy.clickNextStep();

      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Dette er ikke et gyldig kontonummer' }).should('exist');
          cy.findByRole('link', { name: 'Du må fylle ut: IBAN' }).should('exist');
        });

      cy.findAllByText('Du må fylle ut: Velg valuta').should('have.length', 2);
      cy.findAllByText('Du må fylle ut: Beløp').should('have.length', 2);
    });

    it('triggers errors when IBAN has wrong country code', () => {
      cy.findByRole('textbox', { name: 'IBAN' }).should('exist').type('AB04RABO8424598490');
      cy.clickNextStep();

      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', {
            name: 'Oppgitt IBAN inneholder ugyldig landkode (to store bokstaver i starten av IBAN-koden)',
          }).should('exist');
        });
    });

    it('triggers error when IBAN is too long', () => {
      cy.findByRole('textbox', { name: 'IBAN' }).should('exist').type('NL04RABO84245984901');
      cy.clickNextStep();

      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', {
            name: 'Oppgitt IBAN har feil lengde.',
          }).should('exist');
        });
    });

    it('triggers error when IBAN has invalid checksum', () => {
      cy.findByRole('textbox', { name: 'IBAN' }).should('exist').type('NL04RABO8424598491');
      cy.clickNextStep();

      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', {
            name: 'Oppgitt IBAN er ugyldig. Sjekk at du har tastet riktig.',
          }).should('exist');
        });
    });

    it('allows kontonummer that starts with a 0', () => {
      cy.findByRole('textbox', { name: 'Kontonummer' }).should('exist');
      cy.findByRole('textbox', { name: 'Kontonummer' }).type('01234567892');
      cy.findByRole('textbox', { name: 'IBAN' }).should('exist');
      cy.findByRole('textbox', { name: 'IBAN' }).type('NL04RABO8424598490');
      cy.findByRole('textbox', { name: 'Beløp' }).should('exist');
      cy.findByRole('textbox', { name: 'Beløp' }).type('450');
      cy.findByRole('combobox', { name: 'Velg valuta' }).should('exist').click();
      cy.findByRole('combobox', { name: 'Velg valuta' }).click();
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
          // NOK might be placed before or after number depending on browser/node. So only check amount.
          cy.get('dd').eq(2).should('contain.text', '450,00');
        });
    });
  });
});
