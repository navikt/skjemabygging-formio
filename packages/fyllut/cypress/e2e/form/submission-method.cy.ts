/*
 * Tests the stepper, form navigation, showing/hiding attachments etc for different submission methods
 */

import { expect } from 'chai';

describe('Submission method', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
  });

  describe("Subscription method 'digital'", () => {
    beforeEach(() => {
      cy.visit('/fyllut/bug101010/veiledning?sub=digital');
      cy.defaultWaits();
      cy.wait('@getGlobalTranslations');
    });

    it("Renders stepper without 'Vedlegg'", () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Veiledning' }).should('exist');
      cy.findByRole('link', { name: 'Dine opplysninger' }).should('exist');
      cy.findByRole('link', { name: 'Vedlegg' }).should('not.exist');
      cy.findByRole('link', { name: 'Oppsummering' }).should('exist');
    });

    describe('Summary page', () => {
      beforeEach(() => {
        // fills out form and navigates to summary page
        cy.clickSaveAndContinue();
        cy.wait('@updateMellomlagring');
        cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
        cy.findByRole('textbox', { name: 'Fornavn' }).type('Test');
        cy.findByRole('textbox', { name: 'Etternavn' }).should('exist');
        cy.findByRole('textbox', { name: 'Etternavn' }).type('Testesen');
        cy.get('.navds-radio-group')
          .first()
          .should('exist')
          .within(() => cy.findByLabelText('Ja').should('exist').check({ force: true }));
        cy.findByRole('combobox', { name: 'Hva søker du støtte til?' }).should('exist');
        cy.findByRole('combobox', { name: 'Hva søker du støtte til?' }).type('Sykk{downArrow}{enter}');
        cy.clickSaveAndContinue();
        cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      });

      it('renders stepper without "Vedlegg" on summary page', () => {
        cy.clickShowAllSteps();
        cy.findByRole('link', { name: 'Veiledning' }).should('exist');
        cy.findByRole('link', { name: 'Dine opplysninger' }).should('exist');
        cy.findByRole('link', { name: 'Vedlegg' }).should('not.exist');
        cy.findByRole('link', { name: 'Oppsummering' }).should('exist');
      });

      it('includes zero attachments, but has flag otherDocumentation', () => {
        cy.submitMellomlagring((req) => {
          expect(req.body.attachments).to.have.length(0);
          expect(req.body.otherDocumentation).to.eq(true);
        });

        // submit application
        cy.clickSaveAndContinue();
        cy.wait('@submitMellomlagring');
      });

      it('includes one attachment, and has flag otherDocumentation', () => {
        cy.clickShowAllSteps();
        cy.submitMellomlagring((req) => {
          expect(req.body.attachments).to.have.length(1);
          expect(req.body.otherDocumentation).to.eq(true);
        });

        // edit data so that conditional attachment is triggered
        cy.clickEditAnswer('Dine opplysninger');
        cy.findByRole('combobox', { name: 'Hva søker du støtte til?' }).should('exist');
        cy.findByRole('combobox', { name: 'Hva søker du støtte til?' }).type('Brill{downArrow}{enter}');
        cy.findByRole('link', { name: 'Oppsummering' }).click();

        // submit application
        cy.findByRole('button', { name: 'Lagre og fortsett' }).click();
        cy.wait('@submitMellomlagring');
      });
    });
  });

  describe("Subscription method 'paper'", () => {
    beforeEach(() => {
      cy.visit('/fyllut/bug101010/veiledning?sub=paper');
      cy.defaultWaits();
      cy.wait('@getGlobalTranslations');
    });

    it("Renders stepper with 'Vedlegg'", () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Veiledning' }).should('exist');
      cy.findByRole('link', { name: 'Dine opplysninger' }).should('exist');
      cy.findByRole('link', { name: 'Vedlegg' }).should('exist');
      cy.findByRole('link', { name: 'Oppsummering' }).should('exist');
    });
  });
});
