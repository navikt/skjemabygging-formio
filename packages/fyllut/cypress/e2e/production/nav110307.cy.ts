/*
 * Production form tests for Søknad om å beholde arbeidsavklaringspenger under opphold i utlandet
 * Form: nav110307
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Utenlandsopphold (utenlandsopphold): 2 same-panel conditionals
 *       skalDuOppholdeDegIFlereLand=nei → navSkjemagruppe (land1, fra, til)
 *       skalDuOppholdeDegIFlereLand=ja  → datagrid (land, fra, til)
 *
 * Note: Vedlegg has isAttachmentPanel=true; sequential clickNextStep() skips it.
 * Use cy.clickShowAllSteps() + stepper to navigate there, then two clickNextStep() from Erklæring.
 */

describe('nav110307', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Utenlandsopphold conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav110307/utenlandsopphold?sub=paper');
      cy.defaultWaits();
    });

    it('shows single-country fields when nei', () => {
      // Initially, no country fields visible
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');

      cy.withinComponent('Skal du oppholde deg i flere land?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // navSkjemagruppe fields appear; datagrid add-row button does not
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: /Fra og med dato/ }).should('exist');
      cy.findByRole('textbox', { name: /Til og med dato/ }).should('exist');
      cy.findByRole('button', { name: /Legg til/ }).should('not.exist');
    });

    it('shows multi-country datagrid when ja', () => {
      cy.withinComponent('Skal du oppholde deg i flere land?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      // Datagrid with add-row button appears
      cy.findByRole('button', { name: /Legg til/ }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');

      // Toggle back to nei — datagrid add-row button disappears
      cy.withinComponent('Skal du oppholde deg i flere land?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('button', { name: /Legg til/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav110307?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Introduksjon — HTML only, advance
      cy.clickNextStep();

      // Personinformasjon
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.clickNextStep();

      // Utenlandsopphold — nei path (single country), do NOT click Next yet
      cy.withinComponent('Skal du oppholde deg i flere land?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Land' }).type('Frankrike');
      cy.findByRole('textbox', { name: /Fra og med dato/ })
        .first()
        .type('01.06.2025');
      cy.findByRole('textbox', { name: /Til og med dato/ })
        .first()
        .type('30.06.2025');

      // Vedlegg (isAttachmentPanel=true) — sequential Next skips it, use stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });

      // Erklæring — navigate via stepper (still expanded after clicking Vedlegg link)
      cy.findByRole('link', { name: 'Erklæring' }).click();
      cy.findByRole('checkbox', { name: /Jeg bekrefter med dette at utenlandsoppholdet/ }).check();

      // Two clickNextStep: wizard reinserts Vedlegg (skipped earlier), then advances to Oppsummering
      cy.clickNextStep(); // Erklæring → Vedlegg (wizard reinserts missed attachment panel)
      cy.clickNextStep(); // Vedlegg → Oppsummering

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Personinformasjon', () => {
        cy.get('dt').eq(1).should('contain.text', 'Fornavn');
        cy.get('dd').eq(1).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Utenlandsopphold', () => {
        cy.get('dt').eq(0).should('contain.text', 'Skal du oppholde deg i flere land?');
        cy.get('dd').eq(0).should('contain.text', 'Nei');
      });
    });
  });
});
