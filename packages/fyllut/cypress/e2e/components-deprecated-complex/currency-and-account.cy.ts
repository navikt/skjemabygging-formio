/*
 * Tests that "penger og konto" component works as expected
 */

describe('Components', () => {
  describe('Penger og konto', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/pengerogkonto/skjema?sub=paper');
      cy.defaultWaits();
      cy.wait('@getCurrencies');
    });

    it('triggers errors', () => {
      cy.findByRole('textbox', { name: 'Kontonummer' }).should('exist').type('12345678980');
      cy.clickNextStep();

      cy.get('[data-cy=error-summary]')
        .should('exist')
        .within(() => {
          cy.findByRole('link', {
            name: 'Dette er ikke et gyldig kontonummer. Sjekk at du har tastet riktig.',
          }).should('exist');
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

      cy.contains('dt', 'Kontonummer').next('dd').should('contain.text', '0123 45 67892');
      cy.contains('dt', 'IBAN').next('dd').should('contain.text', 'NL04 RABO 8424 5984 90');
      cy.contains('dd', '450').should('exist');
    });
  });
});
