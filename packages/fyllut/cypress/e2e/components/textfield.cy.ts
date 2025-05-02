import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

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

  it('formats IBAN to correct format on blur', () => {
    const iban = 'NO1234567890123';
    cy.findByRole('textbox', { name: 'IBAN' }).should('exist');
    cy.findByRole('textbox', { name: 'IBAN' }).type(iban);
    cy.focused().blur();
    cy.findByRole('textbox', { name: 'IBAN' }).should('have.value', iban.replace(/(.{4})/g, '$1 ').trim());
  });

  it('formats national identity number to correct format on blur', () => {
    const fnr = '12345678901';
    cy.findByRole('textbox', { name: 'Fødselsnummer' }).should('exist');
    cy.findByRole('textbox', { name: 'Fødselsnummer' }).type(fnr);
    cy.focused().blur();
    cy.findByRole('textbox', { name: 'Fødselsnummer' }).should('have.value', fnr.replace(/(.{6})(.{5})/, '$1 $2'));
  });

  it('formats organization number to correct format on blur', () => {
    const orgnr = '123456789';
    cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).should('exist');
    cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).type(orgnr);
    cy.focused().blur();
    cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).should(
      'have.value',
      orgnr.replace(/(.{3})(.{3})/, '$1 $2'),
    );
  });

  it('formats account number to correct format on blur', () => {
    const accountNumber = '12345678901';
    cy.findByRole('textbox', { name: 'Kontonummer' }).should('exist');
    cy.findByRole('textbox', { name: 'Kontonummer' }).type(accountNumber);
    cy.focused().blur();
    cy.findByRole('textbox', { name: 'Kontonummer' }).should(
      'have.value',
      accountNumber.replace(/(.{4})(.{2})/, '$1 $2'),
    );
  });

  it('formats currency to correct format on blur', () => {
    const currency = '12345678901';
    cy.findByRole('textbox', { name: 'Beløp' }).should('exist');
    cy.findByRole('textbox', { name: 'Beløp' }).type(currency);
    cy.focused().blur();
    cy.findByRole('textbox', { name: 'Beløp' }).should('have.value', currency.replace(/(.{1,3})(.{3})/, '$1 $2'));
  });

  it('formats currency with decimals to correct format on blur', () => {
    const currency = '123456789.01';
    cy.findByRole('textbox', { name: 'Beløp' }).should('exist');
    cy.findByRole('textbox', { name: 'Beløp' }).type(currency);
    cy.focused().blur();
    cy.findByRole('textbox', { name: 'Beløp' }).should('have.value', currency.replace(/(.{1,3})(.{3})/, '$1 $2'));
  });
});
