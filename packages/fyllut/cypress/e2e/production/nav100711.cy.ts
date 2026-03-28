/*
 * Production form tests for Innsending av førstegangssøknad om ortopedisk hjelpemiddel
 * Form: nav100711
 * Submission types: PAPER
 *
 * Panels:
 *   - Veiledning (veiledning0): no fields, no conditionals
 *   - Opplysninger til forsendelsen (opplysningerTilForsendelsen): 2 required fields, 0 conditionals
 *       fodselsnummerDNummerSoker (fnrfield, required)
 *       firmanavnForOrtopediskVerksted (textfield, required)
 *   - Vedlegg (page3): 1 required attachment, 0 conditionals
 *       vedlegg: "Søknad som er utfylt av lege" (only leggerVedNaa enabled)
 *
 * 0 conditionals — one summary test only.
 */

describe('nav100711', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100711?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields, navigate forward
      cy.clickNextStep();

      // Opplysninger til forsendelsen – fill required fields
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Firmanavn for ortopedisk verksted' }).type('Test Ortopedi AS');
      cy.clickNextStep();

      // Vedlegg – check the only enabled attachment option (renders as checkbox)
      cy.findByRole('checkbox', { name: 'Jeg legger det ved dette skjemaet' }).check();
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Opplysninger til forsendelsen', () => {
        cy.get('dt').eq(0).should('contain.text', 'Angi søkers fødselsnummer / D-nummer');
        cy.get('dt').eq(1).should('contain.text', 'Firmanavn for ortopedisk verksted');
        cy.get('dd').eq(1).should('contain.text', 'Test Ortopedi AS');
      });
    });
  });
});
