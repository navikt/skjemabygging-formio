/*
 * Production form tests for Refusjonskrav til ekspertbistand
 * Form: nav761390
 * Submission types: PAPER
 *
 * Panels:
 *   - Arbeidstakeren (arbeidstakeren): 3 required fields, no conditionals
 *   - Arbeidsgiveren (arbeidsgiveren): 7 required fields, no conditionals
 *   - Refusjonskrav (refusjonskrav): 4 required fields + 1 required checkbox, no conditionals
 *   - Vedlegg (vedlegg): isAttachmentPanel=true, last panel, 2 required attachments
 *
 * 0 conditionals — one summary test covers the full happy path.
 * Note: introPage.enabled === true — cy.clickIntroPageConfirmation() required before cy.clickNextStep().
 * Note: Vedlegg has isAttachmentPanel=true and is the last panel before Oppsummering (Case A).
 *       Use cy.clickShowAllSteps() + stepper to visit Vedlegg, then ONE clickNextStep() to Oppsummering.
 */

describe('nav761390', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761390?sub=paper');
      cy.defaultWaits();
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Arbeidstakeren
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Arbeidsgiveren
      cy.findByRole('textbox', { name: 'Bedriftens navn' }).type('Test AS');
      cy.findByRole('textbox', { name: 'Hovedenhetens organisasjonsnummer' }).type('889640782');
      cy.findByRole('textbox', { name: 'Underenhetens organisasjonsnummer' }).type('974760673');
      cy.findByRole('textbox', { name: 'Kontonummer' }).type('01234567892');
      cy.findByRole('textbox', { name: 'Kontaktperson hos arbeidsgiver' }).type('Kari Nordmann');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: /[Ee]-post/ }).type('test@example.com');
      cy.clickNextStep();

      // Refusjonskrav — do NOT click Next here; use stepper to reach Vedlegg
      cy.findByRole('textbox', { name: 'Tilsagnsnummer' }).type('TS-001');
      cy.findByRole('textbox', {
        name: 'Hvilke utgifter skal tilskuddet til ekspertbistand dekke?',
      }).type('Testutgifter');
      cy.findByLabelText('Antall vedlegg til refusjonskravet').type('1');
      cy.findByRole('checkbox', {
        name: 'Jeg bekrefter at utgiftene som kreves refundert er betalt.',
      }).check();

      // Vedlegg — isAttachmentPanel=true, last panel (Case A): use stepper, then ONE clickNextStep
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Kvittering/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Jeg legger det ved dette skjemaet' }).check();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });

      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Arbeidstakeren', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Arbeidsgiveren', () => {
        cy.get('dt').eq(0).should('contain.text', 'Bedriftens navn');
        cy.get('dd').eq(0).should('contain.text', 'Test AS');
      });
      cy.withinSummaryGroup('Refusjonskrav', () => {
        cy.get('dt').eq(0).should('contain.text', 'Tilsagnsnummer');
        cy.get('dd').eq(0).should('contain.text', 'TS-001');
      });
    });
  });
});
