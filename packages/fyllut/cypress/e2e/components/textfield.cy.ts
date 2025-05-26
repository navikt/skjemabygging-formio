import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';

describe('textfield', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/testtekstfelt?sub=digital');
    cy.defaultWaits();
    cy.clickStart();
  });

  it('validates required', () => {
    cy.clickSaveAndContinue();
    cy.findByRole('link', { name: `Du må fylle ut: Påkrevd tekstfelt` }).should('exist');
    cy.findByRole('textbox', { name: 'Påkrevd tekstfelt' }).should('exist');
    cy.findByRole('textbox', { name: 'Påkrevd tekstfelt' }).type('Lorem ipsum');
    cy.findByRole('link', { name: `Du må fylle ut: Påkrevd tekstfelt` }).should('not.exist');
  });

  it('validates length and digits only', () => {
    const digitsOnly = 'Tekstfelt kun siffer og lengde mellom 8 og 10';
    const digitsOnlyError = TEXTS.validering.digitsOnly.replace('{{field}}', digitsOnly);
    const minLengthError = TEXTS.validering.minLength.replace('{{field}}', digitsOnly).replace('{{length}}', 8);
    const maxLengthError = TEXTS.validering.maxLength.replace('{{field}}', digitsOnly).replace('{{length}}', 10);
    cy.findByRole('textbox', { name: 'Påkrevd tekstfelt' }).should('exist');
    cy.findByRole('textbox', { name: 'Påkrevd tekstfelt' }).type('ABC');
    cy.findByRole('textbox', { name: `${digitsOnly} (valgfritt)` }).should('exist');
    cy.findByRole('textbox', { name: `${digitsOnly} (valgfritt)` }).type('abcdefghi');
    cy.clickSaveAndContinue();

    cy.findByRole('link', { name: digitsOnlyError }).should('exist');
    cy.findByRole('link', { name: digitsOnlyError }).click();

    cy.focused().type('{selectall}012345');
    cy.clickSaveAndContinue();

    cy.findByRole('link', { name: minLengthError }).should('exist');
    cy.findByRole('link', { name: minLengthError }).click();

    cy.focused().type('{selectall}012345678910');
    cy.clickSaveAndContinue();

    cy.findByRole('link', { name: maxLengthError }).should('exist');
    cy.findByRole('link', { name: maxLengthError }).click();

    cy.focused().type('{selectall}01234567');
    cy.clickSaveAndContinue();

    cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
  });

  it('formats values to correct format on blur', () => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/kortskjema?sub=digital');
    cy.defaultWaits();
    cy.clickStart();

    const iban = 'NO9386011117947';
    cy.findByRole('textbox', { name: 'IBAN' }).should('exist');
    cy.findByRole('textbox', { name: 'IBAN' }).type(iban);
    cy.focused().blur();
    cy.findByRole('textbox', { name: 'IBAN' }).should('have.value', 'NO93 8601 1117 947');

    const accountNumber = '32601260246';
    cy.findByRole('textbox', { name: 'Kontonummer' }).should('exist');
    cy.findByRole('textbox', { name: 'Kontonummer' }).type(accountNumber);
    cy.focused().blur();
    cy.findByRole('textbox', { name: 'Kontonummer' }).should('have.value', '3260 12 60246');

    const fnr = '01029912345';
    cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).should('exist');
    cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).type(fnr);
    cy.focused().blur();
    cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).should('have.value', '010299 12345');

    const orgnr = '888888888';
    cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).should('exist');
    cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).type(orgnr);
    cy.focused().blur();
    cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).should('have.value', '888 888 888');

    const currency = '1 234 567 847';
    cy.findByRole('textbox', { name: 'Beløp heltall' }).should('exist');
    cy.findByRole('textbox', { name: 'Beløp heltall' }).type(currency);
    cy.focused().blur();
    cy.findByRole('textbox', { name: 'Beløp heltall' })
      .should('exist')
      .then(($input) => {
        const normalizedValue = $input
          .val()
          ?.toString()
          .replace(/\u00A0/g, ' ');
        expect(normalizedValue).to.equal('1 234 567 847');
      });

    const currencyDecimal = '1234567847,98';
    cy.findByRole('textbox', { name: 'Beløp desimaltall' }).should('exist');
    cy.findByRole('textbox', { name: 'Beløp desimaltall' }).type(currencyDecimal);
    cy.focused().blur();
    cy.findByRole('textbox', { name: 'Beløp desimaltall' })
      .should('exist')
      .then(($input) => {
        const normalizedValue = $input
          .val()
          ?.toString()
          .replace(/\u00A0/g, ' ');
        expect(normalizedValue).to.equal('1 234 567 847,98');
      });
  });
});
