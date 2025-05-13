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
});
