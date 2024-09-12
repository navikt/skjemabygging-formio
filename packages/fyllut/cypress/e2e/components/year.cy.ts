import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('year', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/testarstall?sub=digital');
    cy.defaultWaits();
    cy.clickStart();
  });

  it('displays years without space or decimals', () => {
    cy.findByRole('textbox', { name: 'Påkrevd årstall' }).should('exist');
    cy.findByRole('textbox', { name: 'Påkrevd årstall' }).type('2024');
    cy.findByRole('textbox', { name: 'MinMax årstall' }).should('exist');
    cy.findByRole('textbox', { name: 'MinMax årstall' }).type('1 9 9 5');
    cy.clickSaveAndContinue();

    cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');

    cy.get('dl')
      .eq(0)
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'Påkrevd årstall');
        cy.get('dd').eq(0).should('have.text', '2024');
        cy.get('dt').eq(1).should('contain.text', 'MinMax årstall');
        cy.get('dd').eq(1).should('have.text', '1995');
      });

    cy.findByRole('link', { name: 'Fortsett utfylling' }).shouldBeVisible();
    cy.findByRole('link', { name: 'Fortsett utfylling' }).click();
    cy.findByRole('textbox', { name: 'Påkrevd årstall' }).should('have.value', '2024');
    cy.findByRole('textbox', { name: 'MinMax årstall' }).should('have.value', '1995');
  });

  it('validates required', () => {
    cy.clickSaveAndContinue();
    cy.findByRole('link', { name: `Du må fylle ut: Påkrevd årstall` }).should('exist');
    cy.findByRole('link', { name: `Du må fylle ut: MinMax årstall` }).should('exist');
    cy.findByRole('textbox', { name: 'Påkrevd årstall' }).should('exist');
    cy.findByRole('textbox', { name: 'Påkrevd årstall' }).type('1789');
    cy.findByRole('link', { name: `Du må fylle ut: Påkrevd årstall` }).should('not.exist');
    cy.findByRole('link', { name: `Du må fylle ut: MinMax årstall` }).should('exist');
  });

  it('validates earliest/latest year', () => {
    cy.findByRole('textbox', { name: 'Påkrevd årstall' }).should('exist');
    cy.findByRole('textbox', { name: 'Påkrevd årstall' }).type('1030');
    cy.findByRole('textbox', { name: 'MinMax årstall' }).should('exist');
    cy.findByRole('textbox', { name: 'MinMax årstall' }).type('1814');
    cy.clickSaveAndContinue();

    cy.findByRole('link', { name: `MinMax årstall kan ikke være før 1992` }).should('exist');
    cy.findByRole('link', { name: `MinMax årstall kan ikke være før 1992` }).click();

    cy.focused().type('{selectall}2004');
    cy.clickSaveAndContinue();
    cy.findByRole('link', { name: `MinMax årstall kan ikke være senere enn 1998` }).should('exist');
    cy.findByRole('link', { name: `MinMax årstall kan ikke være senere enn 1998` }).click();

    cy.focused().type('{selectall}1995');
    cy.clickSaveAndContinue();

    cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
  });

  it('validates input length and decimals', () => {
    cy.findByRole('textbox', { name: 'Påkrevd årstall' }).should('exist');
    cy.findByRole('textbox', { name: 'Påkrevd årstall' }).type('123');
    cy.findByRole('textbox', { name: 'MinMax årstall' }).should('exist');
    cy.findByRole('textbox', { name: 'MinMax årstall' }).type('12345');
    cy.clickSaveAndContinue();

    cy.findByRole('link', { name: `Påkrevd årstall må ha 4 siffer` }).should('exist');
    cy.findByRole('link', { name: `MinMax årstall må ha 4 siffer` }).should('exist');
    cy.findByRole('link', { name: `Påkrevd årstall må ha 4 siffer` }).click();

    cy.focused().type('{selectall}20,04');
    cy.findByRole('link', { name: TEXTS.validering.integer }).should('exist');
    cy.findByRole('textbox', { name: 'Påkrevd årstall' }).type('{selectall}20.04');
    cy.findByRole('link', { name: TEXTS.validering.integer }).should('exist');
    cy.findByRole('textbox', { name: 'Påkrevd årstall' }).type('{selectall}2004');
    cy.findByRole('link', { name: TEXTS.validering.integer }).should('not.exist');
  });
});
