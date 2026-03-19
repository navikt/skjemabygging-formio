/*
 * Production form tests for Uttalelse i barnebidragssaken din
 * Form: nav550071
 * Submission types: DIGITAL, PAPER, DIGITAL_NO_LOGIN
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 2 customConditionals
 *       identitet.harDuFodselsnummer → adresse (show when "nei")
 *       adresse.borDuINorge → adresseVarighet (show when "nei")
 *       + alertstripe shown when harDuFodselsnummer === "ja"
 *
 * Note: Vedlegg has isAttachmentPanel=true (last panel). Sequential clickNextStep() skips it.
 * Use cy.clickShowAllSteps() + stepper to navigate there, then ONE clickNextStep() to reach Oppsummering.
 */

describe('nav550071', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav550071/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows adresse section when user has no Norwegian identity number', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });

    it('shows adresseVarighet date fields when borDuINorge is nei', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('exist');

      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav550071?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // landing page → Veiledning
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – check required declaration checkbox
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).check();
      cy.clickNextStep();

      // Dine opplysninger – use fnr path (adresse/adresseVarighet hidden when fnr provided)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Uttalelse i bidragssaken – fill required textarea; do NOT click Next (Vedlegg is isAttachmentPanel)
      cy.findByRole('textbox', { name: 'Din uttalelse' }).type('Test uttalelse om bidragssaken.');

      // Vedlegg – isAttachmentPanel=true; sequential Next skips it — use stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });

      // ONE clickNextStep from Vedlegg (last panel) → Oppsummering
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Uttalelse i bidragssaken', () => {
        cy.get('dt').eq(0).should('contain.text', 'Din uttalelse');
        cy.get('dd').eq(0).should('contain.text', 'Test uttalelse om bidragssaken.');
      });
    });
  });
});
