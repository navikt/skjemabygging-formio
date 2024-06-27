/*
 * Tests that "penger og konto" component works as expected
 */
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('Components', () => {
  describe('Penger og konto', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/pengerogkonto/skjema');
      cy.defaultWaits();
      cy.wait('@getCurrencies');
    });

    it('triggers errors', () => {
      cy.findByRole('textbox', { name: 'Kontonummer' }).should('exist');
      cy.findByRole('textbox', { name: 'Kontonummer' }).type('12345678980');
      cy.findByRole('textbox', { name: 'IBAN' }).should('exist').type('AB04RABO8424598490');
      cy.clickNextStep();

      cy.findByRole('region', { name: TEXTS.validering.error })
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Dette er ikke et gyldig kontonummer' }).should('exist');
          cy.findByRole('link', {
            name: 'Oppgitt IBAN inneholder ugyldig landkode (to store bokstaver i starten av IBAN-koden)',
          }).should('exist');
        });

      cy.findAllByText('Du må fylle ut: Velg valuta').should('have.length', 2);
      cy.findAllByText('Du må fylle ut: Beløp').should('have.length', 2);
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
