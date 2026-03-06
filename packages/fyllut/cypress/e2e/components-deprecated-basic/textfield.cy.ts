import { expect } from 'chai';

/**
 * @deprecated
 * This is deprecated, please delete when this is covered in the correct component test suite.
 */
describe('textfield', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/testtekstfelt?sub=digital');
    cy.defaultWaits();
    cy.clickStart();
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
