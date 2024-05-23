/*
 * Tests that the checkbox component (react) renders and functions correctly
 */

import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';

describe('Checkbox', () => {
  before(() => {
    cy.configMocksServer();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Paper', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/checkboxtest/checkboxPage?sub=paper');
      cy.defaultWaits();
    });

    it('should check all checkboxes and show correct values in summary', () => {
      cy.findByRole('checkbox', { name: 'Normal checkbox (valgfritt)' }).check();
      cy.findByRole('checkbox', { name: 'Required checkbox' }).check();
      cy.findByRole('checkbox', { name: 'Checkbox description (valgfritt)' }).check();

      cy.clickNextStep();

      cy.findByRole('radio', { name: 'Jeg legger det ved dette skjemaet' }).check();

      cy.clickNextStep();

      // Summary
      cy.get('dl')
        .first()
        .within(() => {
          // All checkboxes are shown in summary (does not include readOnly checkbox that is not checked)
          cy.get('dt').eq(0).should('contain.text', 'Normal checkbox');
          cy.get('dt').eq(1).should('contain.text', 'Required checkbox');
          cy.get('dt').eq(2).should('contain.text', 'ReadOnly checkbox checked');
          cy.get('dt').eq(3).should('contain.text', 'Checkbox description');
        });
    });

    it('should check only required checkboxes and show corect values in summary', () => {
      cy.findByRole('checkbox', { name: 'Required checkbox' }).check();

      cy.clickNextStep();

      cy.findByRole('radio', { name: 'Jeg legger det ved dette skjemaet' }).check();

      cy.clickNextStep();

      // Summary
      cy.get('dl')
        .first()
        .within(() => {
          // All checkboxes are shown in summary (does not include readOnly checkbox that is not checked)
          cy.get('dt').eq(0).should('contain.text', 'Required checkbox');
          cy.get('dt').eq(1).should('contain.text', 'ReadOnly checkbox checked');
        });
    });

    it('should show error for required checkbox', () => {
      cy.clickNextStep();

      // Error summary
      cy.findByRole('region', { name: TEXTS.validering.error })
        .should('exist')
        .within(() => {
          cy.findByRole('link', { name: 'Du må fylle ut: Required checkbox' }).should('exist');
        });

      // Component error
      cy.findAllByText('Du må fylle ut: Required checkbox').should('have.length', 2);
    });
  });

  describe('Digital', () => {
    it('should have correct submission values', () => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/checkboxtest/checkboxPage?sub=digital');
      cy.defaultWaits();

      cy.findByRole('checkbox', { name: 'Normal checkbox (valgfritt)' }).check();
      cy.findByRole('checkbox', { name: 'Required checkbox' }).check();
      cy.findByRole('checkbox', { name: 'Checkbox description (valgfritt)' }).check();

      cy.clickSaveAndContinue();

      cy.submitMellomlagring((req) => {
        const {
          submission: { data },
        } = req.body;

        expect(data.normalCheckbox).to.equal(true);
        expect(data.requiredCheckbox).to.equal(true);
        expect(data.readOnlyCheckboxChecked).to.equal(true);
        expect(data.checkboxDescription).to.equal(true);

        expect(data.readOnlyCheckbox).to.equal(undefined);
      });

      cy.clickSaveAndContinue();
      cy.wait('@submitMellomlagring');
    });

    it('should load mellomlagring', () => {
      cy.mocksUseRouteVariant('get-soknad:success-checkbox');

      cy.defaultIntercepts();
      cy.visit('/fyllut/checkboxtest/checkboxPage?sub=digital&innsendingsId=1fa18260-cabd-437c-bd2a-9de16ac6f0e0');
      cy.defaultWaits();

      cy.findByRole('checkbox', { name: 'Normal checkbox (valgfritt)' }).should('be.checked');
      cy.findByRole('checkbox', { name: 'Required checkbox' }).should('be.checked');
      cy.findByRole('checkbox', { name: 'ReadOnly checkbox checked (valgfritt)' }).should('be.checked');
      cy.findByRole('checkbox', { name: 'Checkbox description (valgfritt)' }).should('be.checked');

      cy.findByRole('checkbox', { name: 'ReadOnly checkbox (valgfritt)' }).should('not.be.checked');
    });
  });
});
