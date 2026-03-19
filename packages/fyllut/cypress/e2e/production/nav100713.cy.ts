/*
 * Production form tests for Innsending av søknad om fornyelse av ortopedisk hjelpemiddel
 * Form: nav100713
 * Submission types: PAPER
 *
 * Panels:
 *   - Veiledning (veiledning): HTML only, no required fields, no conditionals
 *   - Opplysninger til forsendelsen (opplysningerTilForsendelsen): 2 required fields, 0 conditionals
 *       firmanavnForOrtopediskVerksted (textfield, required)
 *       fodselsnummerDNummerSoker (fnrfield, required)
 *   - Vedlegg (vedlegg): 1 required attachment, 0 conditionals
 *       soknadOmFornyelseSomErFyltUtAvOrtopediingenior (attachment, required)
 *
 * 0 conditionals — single summary test only.
 */

describe('nav100713', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100713?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields across all panels and verifies summary', () => {
      // Veiledning — HTML only, no required fields
      cy.clickNextStep();

      // Opplysninger til forsendelsen
      cy.findByRole('textbox', { name: 'Firmanavn for ortopedisk verksted' }).type('Test Verksted AS');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Vedlegg
      cy.findByRole('group', { name: /Søknad om fornyelse som er fylt ut av ortopediingeniør/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Jeg legger det ved dette skjemaet' }).check();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Opplysninger til forsendelsen', () => {
        cy.get('dt').eq(0).should('contain.text', 'Firmanavn for ortopedisk verksted');
        cy.get('dd').eq(0).should('contain.text', 'Test Verksted AS');
      });
    });
  });
});
