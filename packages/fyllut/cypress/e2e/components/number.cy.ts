/*
 * Tests that the number component is working as expected
 */

import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';

describe('number component', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/testingnumber?sub=digital');
    cy.defaultWaits();
    cy.clickStart();
  });

  describe('decimals', () => {
    it('Try and set decimal values', () => {
      cy.findByRole('textbox', { name: /^Tall/ }).should('exist').type('10,1');
      cy.findByRole('textbox', { name: /^Desimaltall/ })
        .should('exist')
        .type('10,1');
      cy.clickSaveAndContinue();
      cy.findByRole('link', { name: `Oppgi et tall uten desimaler.` }).should('exist');
      cy.findByRole('textbox', { name: /^Tall/ }).should('exist').type('{selectall}10');
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
    });

    it('Set decimal value with dot, change to comma when going back from summary', () => {
      cy.findByRole('textbox', { name: /^Desimaltall/ })
        .should('exist')
        .type('10.1');
      cy.clickSaveAndContinue();
      cy.findByRoleWhenAttached('link', { name: TEXTS.grensesnitt.summaryPage.editAnswers }).should('exist').click();
      cy.findByRole('textbox', {
        name: /^Desimaltall/,
      }).should('have.value', '10,1');
    });

    it('Set decimal value with spaces, change to no spaces when going back from summary', () => {
      cy.findByRole('textbox', { name: /^Tall/ }).should('exist').type('12');
      cy.findByRole('textbox', { name: /^Desimaltall/ })
        .should('exist')
        .type('1000,1');
      cy.clickSaveAndContinue();

      cy.findByRoleWhenAttached('link', { name: TEXTS.grensesnitt.summaryPage.editAnswers }).should('exist').click();

      cy.findByRole('textbox', { name: /^Tall/ }).should('have.value', '12');
      cy.findByRole('textbox', { name: /^Desimaltall/ }).should('have.value', '1\u00a0000,1');

      cy.intercept('PUT', '/fyllut/api/send-inn/soknad', (req) => {
        const { submission } = req.body;
        expect(submission.data.number).to.eq(12);
        expect(submission.data.datagrid[0].number2).to.eq(1000.1);
      }).as('submitMellomlagring');

      cy.clickSaveAndContinue();
    });
  });

  describe('integer', () => {
    it('Try and set integer values', () => {
      cy.findByRole('textbox', { name: /^Tall/ }).should('exist').type('10');
      cy.findByRole('textbox', { name: /^Desimaltall/ })
        .should('exist')
        .type('10');
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
    });
  });

  describe('min/max values', () => {
    // Min = 10
    it('should show error for min value', () => {
      cy.findByRole('textbox', { name: /^Tall/ }).should('exist').type('9');
      cy.clickSaveAndContinue();
      cy.findByRole('link', { name: `Tall kan ikke være mindre enn 10.` }).should('exist');
    });

    // Max = 100
    it('should show error for max value', () => {
      cy.findByRole('textbox', { name: /^Tall/ }).should('exist').type('101');
      cy.clickSaveAndContinue();
      cy.findByRole('link', { name: `Tall kan ikke være større enn 100.` }).should('exist');
    });
  });
});
