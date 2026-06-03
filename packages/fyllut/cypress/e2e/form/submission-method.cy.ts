/*
 * Tests the stepper, form navigation, showing/hiding attachments etc for different submission methods
 */

import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
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

    it('Renders stepper with links to all panels', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Veiledning' }).should('exist');
      cy.findByRole('link', { name: 'Dine opplysninger' }).should('exist');
      cy.findByRole('link', { name: 'Vedlegg' }).should('exist');
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
        cy.get('.aksel-radio-group')
          .first()
          .should('exist')
          .within(() => cy.findByLabelText('Ja').should('exist').check({ force: true }));
        cy.findByRole('combobox', { name: 'Hva søker du støtte til?' }).should('exist');
        cy.findByRole('combobox', { name: 'Hva søker du støtte til?' }).type('Sykk{downArrow}{enter}');
        cy.clickSaveAndContinue();
        cy.findByLabelText(/Annen dokumentasjon/).within(() => {
          cy.findByRole('radio', { name: TEXTS.statiske.attachment.nei }).check();
        });
        cy.clickSaveAndContinue();
        cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
      });

      it('renders stepper with links to all panels on summary page', () => {
        cy.clickShowAllSteps();
        cy.findByRole('link', { name: 'Veiledning' }).should('exist');
        cy.findByRole('link', { name: 'Dine opplysninger' }).should('exist');
        cy.findByRole('link', { name: 'Vedlegg' }).should('exist');
        cy.findByRole('link', { name: 'Oppsummering' }).should('exist');
      });

      it('includes zero attachments, but has flag otherDocumentation', () => {
        cy.submitApplication((req) => {
          console.log(`req.body: ${JSON.stringify(req.body)}`);
          const { submission } = req.body;
          expect(submission.attachments).to.have.length(1);
          expect(submission.attachments[0].type).to.equal('other');
        });

        // submit application
        cy.clickSendNav();
        cy.wait('@submitApplication');
      });

      it('includes one attachment, and has flag otherDocumentation', () => {
        cy.clickShowAllSteps();
        cy.submitApplication((req) => {
          console.log(`req.body: ${JSON.stringify(req.body)}`);
          const { submission } = req.body;
          expect(submission.attachments).to.have.length(2);
        });

        // edit data so that conditional attachment is triggered
        cy.clickEditAnswer('Dine opplysninger');
        cy.findByRole('combobox', { name: 'Hva søker du støtte til?' }).should('exist');
        cy.findByRole('combobox', { name: 'Hva søker du støtte til?' }).type('Brill{downArrow}{enter}');
        cy.clickSaveAndContinue();

        cy.findByLabelText(/Bekreftelse fra optiker/).within(() => {
          cy.findByRole('radio', { name: TEXTS.statiske.attachment.alreadySent }).check();
        });
        cy.findByRole('link', { name: 'Oppsummering' }).click();

        // submit application
        cy.clickSendNav();
        cy.wait('@submitApplication');
      });
    });
  });

  describe("Subscription method 'paper'", () => {
    beforeEach(() => {
      cy.visit('/fyllut/bug101010/veiledning?sub=paper');
      cy.defaultWaits();
      cy.wait('@getGlobalTranslations');
    });

    it('Renders stepper with links to all panels', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Veiledning' }).should('exist');
      cy.findByRole('link', { name: 'Dine opplysninger' }).should('exist');
      cy.findByRole('link', { name: 'Vedlegg' }).should('exist');
      cy.findByRole('link', { name: 'Oppsummering' }).should('exist');
    });
  });
});
