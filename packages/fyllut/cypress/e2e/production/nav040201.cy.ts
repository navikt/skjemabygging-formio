/*
 * Production form tests for Søknad om utstedelse av attest PD U2
 * Form: nav040201
 * Submission types: PAPER, DIGITAL
 *
 * Panels:
 *   - Veiledning (veiledning): 2 required checkboxes, no conditionals
 *   - Dine opplysninger (dineOpplysninger): 4 required fields, no conditionals
 *   - Utenlandsopphold (utenlandsopphold): 3 required fields, no conditionals
 *   - Vedlegg (vedlegg): 1 required attachment, no conditionals
 *   - Om avslag (page5): 1 required radiopanel, no conditionals
 *
 * 0 conditionals — one summary test covers the full happy path.
 * Note: Vedlegg has isAttachmentPanel=true; sequential clickNextStep() skips it.
 * Use cy.clickShowAllSteps() + stepper to navigate there, then two clickNextStep() to reach Oppsummering.
 */

describe('nav040201', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040201?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – check both required declarations
      cy.findByRole('checkbox', {
        name: 'Jeg er helt arbeidsløs, og er registrert som arbeidssøker hos Nav.',
      }).check();
      cy.findByRole('checkbox', {
        name: 'Jeg søker om å få beholde dagpengene i inntil tre måneder mens jeg søker arbeid i et annet EØS-land.',
      }).check();
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Statsborgerskap' }).type('Norsk');
      cy.clickNextStep();

      // Utenlandsopphold – fill without clicking Next (isAttachmentPanel skips Vedlegg in sequential nav)
      cy.findByRole('textbox', { name: /Hvilken dato reiser du til utlandet/ }).type('01.06.2025');
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).type('Testveien 1');
      cy.findByRole('textbox', { name: 'Land' }).type('Sverige');

      // Vedlegg – isAttachmentPanel=true skips this panel via sequential Next; use stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });

      // Om avslag – stepper already expanded; navigate directly
      cy.findByRole('link', { name: 'Om avslag' }).click();
      cy.withinComponent('Hva vil du gjøre hvis du får avslag på din søknad om utstedelse av Attest PD U2?', () => {
        cy.findByRole('radio', {
          name: 'Ved avslag reiser jeg ikke til det andre landet, da jeg ønsker å beholde dagpenger fra Norge',
        }).click();
      });

      // Two clickNextStep needed: wizard reinserts Vedlegg step, then advances to Oppsummering
      cy.clickNextStep(); // Om avslag → Vedlegg (wizard reinserts missed attachment panel)
      cy.clickNextStep(); // Vedlegg → Oppsummering

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Utenlandsopphold', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hvilken dato reiser du til utlandet?');
        cy.get('dd').eq(0).should('contain.text', '01.06.2025');
      });
    });
  });
});
