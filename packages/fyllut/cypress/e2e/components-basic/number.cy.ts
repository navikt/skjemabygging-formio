/*
 * Tests that the number component is working as expected
 */

import { expect } from 'chai';

describe('number component', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/testingnumber?sub=digital');
    cy.defaultWaits();
    cy.clickStart();
  });

  describe('integer', () => {
    it('set integer values', () => {
      cy.findByRole('textbox', { name: 'Påkrevd' }).should('exist');
      cy.findByRole('textbox', { name: 'Påkrevd' }).type('123456789');
      cy.findByRole('textbox', { name: /^Minmax/ }).should('exist');
      cy.findByRole('textbox', { name: /^Minmax/ }).type('10');
      cy.findByRole('textbox', { name: 'Kalkulert verdi' }).should('have.value', '123\u00a0456\u00a0799');
      cy.clickSaveAndContinue();
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.get('dl')
        .eq(0)
        .within(() => {
          cy.get('dt').eq(0).should('contain.text', 'Påkrevd');
          cy.get('dd').eq(0).should('contain.text', '123\u00a0456\u00a0789');
          cy.get('dt').eq(1).should('contain.text', 'Minmax');
          cy.get('dd').eq(1).should('contain.text', '10');
          cy.get('dt').eq(2).should('contain.text', 'Kalkulert verdi');
          cy.get('dd').eq(2).should('contain.text', '123\u00a0456\u00a0799');
        });
    });

    it('set negative value', () => {
      cy.findByRole('textbox', { name: 'Påkrevd' }).should('exist');
      cy.findByRole('textbox', { name: 'Påkrevd' }).type('-20');
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Desimaltall' }).should('exist');
    });

    it('required values', () => {
      cy.clickSaveAndContinue();

      cy.findByRole('link', { name: `Du må fylle ut: Påkrevd` }).should('exist');
      cy.findByRole('textbox', { name: 'Påkrevd' }).should('exist');
      cy.findByRole('textbox', { name: 'Påkrevd' }).type('10');
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Desimaltall' }).should('exist');
    });

    it('click error message sets focus to element.', () => {
      cy.clickSaveAndContinue();

      cy.findByRole('link', { name: `Du må fylle ut: Påkrevd` }).should('exist');
      cy.findByRole('link', { name: `Du må fylle ut: Påkrevd` }).click();
      cy.focused().type('25');
      cy.findByRole('textbox', { name: 'Påkrevd' }).should('have.value', '25');
    });

    it('should show error for min value', () => {
      cy.findByRole('textbox', { name: /^Påkrevd/ }).should('exist');
      cy.findByRole('textbox', { name: /^Påkrevd/ }).type('0');
      cy.findByRole('textbox', { name: /^Minmax/ }).should('exist');
      cy.findByRole('textbox', { name: /^Minmax/ }).type('-1');
      cy.clickSaveAndContinue();

      cy.findByRole('link', { name: `Minmax kan ikke være mindre enn 0.` }).should('exist');
    });

    it('should show error for max value', () => {
      cy.findByRole('textbox', { name: /^Påkrevd/ }).should('exist');
      cy.findByRole('textbox', { name: /^Minmax/ }).type('101');
      cy.clickSaveAndContinue();

      cy.findByRole('link', { name: `Minmax kan ikke være større enn 100.` }).should('exist');
    });

    it('set illegal integer values', () => {
      cy.findByRole('textbox', { name: /^Påkrevd/ }).should('exist');
      cy.findByRole('textbox', { name: /^Påkrevd/ }).type('0,2');
      cy.findByRole('textbox', { name: /^Minmax/ }).should('exist');
      cy.findByRole('textbox', { name: /^Minmax/ }).type('0.1');
      cy.clickSaveAndContinue();

      cy.findAllByRole('link', { name: `Oppgi et tall uten desimaler.` }).should('have.length', 2);
      cy.findByRole('textbox', { name: /^Påkrevd/ }).should('exist');
      cy.findByRole('textbox', { name: /^Påkrevd/ }).type('{selectall}10');
      cy.findByRole('textbox', { name: /^Minmax/ }).should('exist');
      cy.findByRole('textbox', { name: /^Minmax/ }).type('{selectall}10');
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Desimaltall' }).should('exist');
    });
  });

  describe('decimals', () => {
    beforeEach(() => {
      cy.findByRole('textbox', { name: /^Påkrevd/ }).should('exist');
      cy.findByRole('textbox', { name: /^Påkrevd/ }).type('1');
      cy.clickSaveAndContinue();
    });

    it('set decimal values', () => {
      cy.findByRole('textbox', { name: /^Desimal 1/ }).should('exist');
      cy.findByRole('textbox', { name: /^Desimal 1/ }).type('10,1');
      cy.findByRole('textbox', { name: /^Desimal 2/ }).should('exist');
      cy.findByRole('textbox', { name: /^Desimal 2/ }).type('12345.23');
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.get('dl')
        .eq(1)
        .within(() => {
          cy.get('dt').eq(0).should('contain.text', 'Desimal 1');
          cy.get('dd').eq(0).should('contain.text', '10,1');
          cy.get('dt').eq(1).should('contain.text', 'Desimal 2');
          cy.get('dd').eq(1).should('contain.text', '12\u00a0345,23');
          cy.get('dt').eq(2).should('contain.text', 'Kalkulert verdi');
          cy.get('dd').eq(2).should('contain.text', '0');
        });
    });

    it('set integer value in decimal fields', () => {
      cy.findByRole('textbox', { name: /^Desimal 1/ }).should('exist');
      cy.findByRole('textbox', { name: /^Desimal 1/ }).type('10');
      cy.findByRole('textbox', { name: /^Desimal 2/ }).should('exist');
      cy.findByRole('textbox', { name: /^Desimal 2/ }).type('12345');
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      cy.get('dl')
        .eq(1)
        .within(() => {
          cy.get('dt').eq(0).should('contain.text', 'Desimal 1');
          cy.get('dd').eq(0).should('contain.text', '10');
          cy.get('dt').eq(1).should('contain.text', 'Desimal 2');
          cy.get('dd').eq(1).should('contain.text', '12\u00a0345');
          cy.get('dt').eq(2).should('contain.text', 'Kalkulert verdi');
          cy.get('dd').eq(2).should('contain.text', '0');
        });
    });

    it('check calculate value is correctly formated', () => {
      cy.findByRole('textbox', { name: /^Desimal 1/ }).should('exist');
      cy.findByRole('textbox', { name: /^Desimal 1/ }).type('1000005,1');
      cy.findByRole('textbox', { name: /^Desimal 2/ }).should('exist');
      cy.findByRole('textbox', { name: /^Desimal 2/ }).type('333,2');
      cy.findByRole('textbox', { name: 'Kalkulert verdi' }).should('have.value', '3\u00a0001,22');
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
    });

    it('set decimal value with dot, change to comma when going back from summary', () => {
      cy.findByRole('textbox', { name: /^Desimal 1/ }).should('exist');
      cy.findByRole('textbox', { name: /^Desimal 1/ }).type('10.10');
      cy.findByRole('textbox', { name: /^Desimal 2/ }).should('exist');
      cy.findByRole('textbox', { name: /^Desimal 2/ }).type('1010.10');
      cy.clickSaveAndContinue();

      cy.clickEditAnswer('Desimaltall');
      cy.findByRole('textbox', { name: /^Desimal 1/ }).should('exist');
      cy.findByRole('textbox', { name: /^Desimal 1/ }).should('have.value', '10,10');
      cy.findByRole('textbox', { name: /^Desimal 2/ }).should('have.value', '1\u00a0010,10');
    });

    it('check that all values are stored in submission as float', () => {
      cy.findByRole('textbox', { name: /^Desimal 1/ }).should('exist');
      cy.findByRole('textbox', { name: /^Desimal 1/ }).type('12');
      cy.findByRole('textbox', { name: /^Desimal 2/ }).should('exist');
      cy.findByRole('textbox', { name: /^Desimal 2/ }).type('1000,1');
      cy.findByRole('textbox', { name: /^Desimalgrid/ }).should('exist');
      cy.findByRole('textbox', { name: /^Desimalgrid/ }).type('1123000,34');
      cy.clickSaveAndContinue();

      cy.clickEditAnswer('Desimaltall');

      cy.findByRole('textbox', { name: /^Desimal 1/ }).should('exist');
      cy.findByRole('textbox', { name: /^Desimal 1/ }).should('have.value', '12,00');
      cy.findByRole('textbox', { name: /^Desimal 2/ }).should('have.value', '1\u00a0000,10');
      cy.findByRole('textbox', { name: /^Desimalgrid/ }).should('have.value', '1\u00a0123\u00a0000,34');

      cy.intercept('PUT', '/fyllut/api/send-inn/soknad', (req) => {
        const { submission } = req.body;
        expect(submission.data.desimal1).to.eq(12.0);
        expect(submission.data.desimal2).to.eq(1000.1);
        expect(submission.data.datagrid2[0].desimal3).to.eq(1123000.34);
      }).as('submitMellomlagring');

      cy.clickSaveAndContinue();
    });

    it('set illegal decimal values', () => {
      cy.findByRole('textbox', { name: /^Desimal 1/ }).should('exist');
      cy.findByRole('textbox', { name: /^Desimal 1/ }).type('10f');
      cy.findByRole('textbox', { name: /^Desimal 2/ }).should('exist');
      cy.findByRole('textbox', { name: /^Desimal 2/ }).type('Asdf');
      cy.findByRole('textbox', { name: /^Desimalgrid/ }).should('exist');
      cy.findByRole('textbox', { name: /^Desimalgrid/ }).type(',');
      cy.clickSaveAndContinue();

      cy.findAllByRole('link', { name: `Oppgi et tall med maksimalt to desimaler.` }).should('have.length', 3);
      cy.findByRole('textbox', { name: /^Desimal 1/ }).should('exist');
      cy.findByRole('textbox', { name: /^Desimal 1/ }).type('{selectall}10');
      cy.findByRole('textbox', { name: /^Desimal 2/ }).should('exist');
      cy.findByRole('textbox', { name: /^Desimal 2/ }).type('{selectall}11');
      cy.findByRole('textbox', { name: /^Desimalgrid/ }).should('exist');
      cy.findByRole('textbox', { name: /^Desimalgrid/ }).type('{selectall}12');
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
    });
  });
});
