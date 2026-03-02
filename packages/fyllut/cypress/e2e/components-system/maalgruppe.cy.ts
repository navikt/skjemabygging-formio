// Maalgruppe is a hidden data-only system component.

import { expect } from 'chai';

describe('Maalgruppe', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.mocksRestoreRouteVariants();
  });

  describe('Display', () => {
    it('should not render any visible UI element (component is always hidden)', () => {
      cy.visit('/fyllut/maalgruppe/beregning?sub=paper');
      cy.defaultWaits();
      cy.findByRole('heading', { name: 'Beregning' }).should('exist');
      // maalgruppe renders an empty fragment — no input element in DOM
      cy.get('[name="data[maalgruppe]"]').should('not.exist');
      // formio creates the wrapper div but it is hidden via formio-hidden class
      cy.get('[class*="formio-component-maalgruppe"]').should('not.be.visible');
    });
  });

  describe('Calculated value (digital submission)', () => {
    it('should calculate ANNET when no maalgruppe fields are selected', () => {
      cy.submitMellomlagring((req) => {
        const { data } = req.body.submission;
        expect(data.maalgruppe?.calculated?.maalgruppetype).to.equal('ANNET');
      });

      cy.visit('/fyllut/maalgruppe?sub=digital');
      cy.defaultWaits();
      cy.clickStart();
      cy.wait('@createMellomlagring');
      cy.findByRole('heading', { name: 'Beregning' }).should('exist');

      // Go to summary without selecting any maalgruppe fields
      cy.clickSaveAndContinue();
      cy.wait('@updateMellomlagring');
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');

      cy.clickSaveAndContinue();
      cy.wait('@submitMellomlagring');
      cy.verifySendInnRedirect();
    });

    it('should calculate ENSFORARBS when ensligArbSoker is selected', () => {
      cy.submitMellomlagring((req) => {
        const { data } = req.body.submission;
        expect(data.maalgruppe?.calculated?.maalgruppetype).to.equal('ENSFORARBS');
      });

      cy.visit('/fyllut/maalgruppe?sub=digital');
      cy.defaultWaits();
      cy.clickStart();
      cy.wait('@createMellomlagring');
      cy.findByRole('heading', { name: 'Beregning' }).should('exist');

      cy.findByRole('checkbox', { name: 'Enslig forsørger arbeidssøker' }).check();

      cy.clickSaveAndContinue();
      cy.wait('@updateMellomlagring');
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');

      cy.clickSaveAndContinue();
      cy.wait('@submitMellomlagring');
      cy.verifySendInnRedirect();
    });

    it('should use highest priority maalgruppe when multiple fields are selected', () => {
      cy.submitMellomlagring((req) => {
        const { data } = req.body.submission;
        // ensligArbSoker (priority 3) beats dagpenger (priority 8)
        expect(data.maalgruppe?.calculated?.maalgruppetype).to.equal('ENSFORARBS');
      });

      cy.visit('/fyllut/maalgruppe?sub=digital');
      cy.defaultWaits();
      cy.clickStart();
      cy.wait('@createMellomlagring');
      cy.findByRole('heading', { name: 'Beregning' }).should('exist');

      cy.findByRole('checkbox', { name: 'Enslig forsørger arbeidssøker' }).check();
      cy.findByRole('checkbox', { name: 'Dagpenger' }).check();

      cy.clickSaveAndContinue();
      cy.wait('@updateMellomlagring');
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');

      cy.clickSaveAndContinue();
      cy.wait('@submitMellomlagring');
      cy.verifySendInnRedirect();
    });

    it('should calculate MOTDAGPEN when only dagpenger is selected', () => {
      cy.submitMellomlagring((req) => {
        const { data } = req.body.submission;
        expect(data.maalgruppe?.calculated?.maalgruppetype).to.equal('MOTDAGPEN');
      });

      cy.visit('/fyllut/maalgruppe?sub=digital');
      cy.defaultWaits();
      cy.clickStart();
      cy.wait('@createMellomlagring');
      cy.findByRole('heading', { name: 'Beregning' }).should('exist');

      cy.findByRole('checkbox', { name: 'Dagpenger' }).check();

      cy.clickSaveAndContinue();
      cy.wait('@updateMellomlagring');
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');

      cy.clickSaveAndContinue();
      cy.wait('@submitMellomlagring');
      cy.verifySendInnRedirect();
    });
  });
});
