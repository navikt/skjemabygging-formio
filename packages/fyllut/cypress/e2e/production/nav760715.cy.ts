/*
 * Production form tests for Avtale om egenfinansiering av utdanning
 * Form: nav760715
 * Submission types: none (no ?sub= param, cy.clickNextStep())
 *
 * Panels:
 *   - Veiledning (veiledning): HTML only, no required fields — skipped by visiting dineOpplysninger directly
 *   - Dine opplysninger (dineOpplysninger): 3 required fields, no conditionals
 *       fornavnSoker, etternavnSoker, fodselsnummerDNummerSoker
 *   - Avtalen (avtalen): 3 selectboxes conditionals
 *       velgEttEllerFlereAvAlternativeneUnderIHenholdTilFinansieringsplanen →
 *         Helfinansiering  → shows navSkjemagruppe1 (Periode med helfinansiering)
 *         Delfinansiering  → shows navSkjemagruppe3 (Periode med delfinansiering)
 *         Egenfinansiering → shows navSkjemagruppe2 (Periode med egenfinansiering)
 */

describe('nav760715', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Avtalen – financing period conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav760715/avtalen');
      cy.defaultWaits();
    });

    it('shows Helfinansiering fields when Helfinansiering is checked', () => {
      cy.findByRole('textbox', { name: 'Startdato helfinansiering (dd.mm.åååå)' }).should('not.exist');

      cy.findByRole('group', { name: /Velg ett eller flere/ }).within(() => {
        cy.findByRole('checkbox', { name: /Helfinansiering/ }).check();
      });

      cy.findByRole('textbox', { name: 'Startdato helfinansiering (dd.mm.åååå)' }).should('exist');
      cy.findByRole('textbox', { name: /Sluttdato.*helfinansiering/ }).should('exist');

      cy.findByRole('group', { name: /Velg ett eller flere/ }).within(() => {
        cy.findByRole('checkbox', { name: /Helfinansiering/ }).uncheck();
      });

      cy.findByRole('textbox', { name: 'Startdato helfinansiering (dd.mm.åååå)' }).should('not.exist');
    });

    it('shows Delfinansiering fields when Delfinansiering is checked', () => {
      cy.findByRole('textbox', { name: 'Startdato delfinansiering (dd.mm.åååå)' }).should('not.exist');

      cy.findByRole('group', { name: /Velg ett eller flere/ }).within(() => {
        cy.findByRole('checkbox', { name: /Delfinansiering/ }).check();
      });

      cy.findByRole('textbox', { name: 'Startdato delfinansiering (dd.mm.åååå)' }).should('exist');
      cy.findByRole('textbox', { name: 'Sluttdato delfinansiering (dd.mm.åååå)' }).should('exist');

      cy.findByRole('group', { name: /Velg ett eller flere/ }).within(() => {
        cy.findByRole('checkbox', { name: /Delfinansiering/ }).uncheck();
      });

      cy.findByRole('textbox', { name: 'Startdato delfinansiering (dd.mm.åååå)' }).should('not.exist');
    });

    it('shows Egenfinansiering fields when Egenfinansiering is checked', () => {
      cy.findByRole('textbox', { name: 'Startdato egenfinansiering (dd.mm.åååå)' }).should('not.exist');

      cy.findByRole('group', { name: /Velg ett eller flere/ }).within(() => {
        cy.findByRole('checkbox', { name: /Egenfinansiering/ }).check();
      });

      cy.findByRole('textbox', { name: 'Startdato egenfinansiering (dd.mm.åååå)' }).should('exist');

      cy.findByRole('group', { name: /Velg ett eller flere/ }).within(() => {
        cy.findByRole('checkbox', { name: /Egenfinansiering/ }).uncheck();
      });

      cy.findByRole('textbox', { name: 'Startdato egenfinansiering (dd.mm.åååå)' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav760715/dineOpplysninger');
      cy.defaultWaits();
    });

    it('fills required fields across all panels and verifies summary', () => {
      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Avtalen – required fields
      cy.findByRole('textbox', { name: 'NAV-enhet som er part i avtalen' }).type('NAV Testkontor');
      cy.findByRole('textbox', { name: 'Navn på utdanningen' }).type('Testutdanning');
      cy.findByRole('textbox', { name: 'Fra og med dato (dd.mm.åååå)' }).type('01.01.2025');
      cy.findByRole('textbox', { name: 'Til og med dato (dd.mm.åååå)' }).type('31.12.2025');

      // Vedtak selectboxes — pick first option
      cy.findByRole('group', { name: /Vedtak om opplæringstiltak/ }).within(() => {
        cy.findByRole('checkbox', { name: /Kostnadene knyttet/ }).check();
      });

      // Financing period — choose Helfinansiering
      cy.findByRole('group', { name: /Velg ett eller flere/ }).within(() => {
        cy.findByRole('checkbox', { name: /Helfinansiering/ }).check();
      });

      cy.findByRole('textbox', { name: 'Startdato helfinansiering (dd.mm.åååå)' }).type('01.01.2025');
      cy.findByRole('textbox', { name: /Sluttdato.*helfinansiering/ }).type('31.12.2025');
      cy.findByRole('textbox', { name: 'Beløpet NAV betaler' }).type('10000');
      cy.findByRole('textbox', { name: 'Hva skal beløpet dekke?' }).type('Kursavgift');

      // Beskriv plan — always visible, required
      cy.findByRole('textbox', { name: 'Beskriv plan for egenfinansiering' }).type('Ingen plan');

      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');

      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });

      cy.withinSummaryGroup('Avtalen', () => {
        cy.get('dt').eq(0).should('contain.text', 'NAV-enhet som er part i avtalen');
        cy.get('dd').eq(0).should('contain.text', 'NAV Testkontor');
      });
    });
  });
});
