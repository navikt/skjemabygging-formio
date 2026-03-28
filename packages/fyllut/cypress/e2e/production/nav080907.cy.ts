/*
 * Production form tests for Søknad om å beholde sykepenger under opphold i utlandet
 * Form: nav080907
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Dine opplysninger (personopplysninger): 1 same-panel conditional
 *       identitet.harDuFodselsnummer=nei → adresse (navAddress, "Bor du i Norge?") shown
 *   - Sykmelding og arbeidsforhold (page5): 3 same-panel conditionals
 *       erDuDelvisSykmeldt=ja → "Delvis sykmeldt" info heading shown
 *       harDuArbeidsgiver=ja → navSkjemagruppe1 (Nærmeste leder fields) shown
 *       harDuArbeidsgiver=nei → "Har ikke arbeidsgiver" info heading shown
 *       + 1 cross-panel trigger to Egenerklæring (page6):
 *         harDuArbeidsgiver=ja → "Jeg bekrefter…arbeidsgiveren" checkbox shown
 *
 * Note: vedlegg panel has isAttachmentPanel=true — Case A (last panel before Oppsummering).
 *       Sequential clickNextStep() on Egenerklæring skips vedlegg.
 *       Use stepper to visit vedlegg, fill attachment, then ONE clickNextStep() → Oppsummering.
 */

describe('nav080907', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – address conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav080907/personopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows navAddress when user selects no Norwegian FNR', () => {
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
  });

  describe('Sykmelding og arbeidsforhold – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav080907/page5?sub=paper');
      cy.defaultWaits();
    });

    it('shows Delvis sykmeldt info when erDuDelvisSykmeldt is ja', () => {
      cy.findByRole('heading', { name: 'Delvis sykmeldt' }).should('not.exist');

      cy.withinComponent('Er du delvis sykmeldt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('heading', { name: 'Delvis sykmeldt' }).should('exist');

      cy.withinComponent('Er du delvis sykmeldt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('heading', { name: 'Delvis sykmeldt' }).should('not.exist');
    });

    it('shows Nærmeste leder fields when harDuArbeidsgiver is ja and info text when nei', () => {
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
      cy.findByRole('heading', { name: 'Har ikke arbeidsgiver' }).should('not.exist');

      cy.withinComponent('Har du arbeidsgiver?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('exist');
      cy.findByLabelText('Telefonnummer').should('exist');
      cy.findByRole('heading', { name: 'Har ikke arbeidsgiver' }).should('not.exist');

      cy.withinComponent('Har du arbeidsgiver?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
      cy.findByRole('heading', { name: 'Har ikke arbeidsgiver' }).should('exist');
    });
  });

  describe('Sykmelding og arbeidsforhold – cross-panel conditional to Egenerklæring', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav080907/page5?sub=paper');
      cy.defaultWaits();
    });

    it('shows employer-confirmation checkbox on Egenerklæring when harDuArbeidsgiver is ja', () => {
      cy.withinComponent('Har du arbeidsgiver?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Egenerklæring' }).click();

      cy.findByRole('checkbox', { name: /avklart utenlandsoppholdet med arbeidsgiveren/ }).should('exist');
    });

    it('hides employer-confirmation checkbox on Egenerklæring when harDuArbeidsgiver is nei', () => {
      cy.withinComponent('Har du arbeidsgiver?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Egenerklæring' }).click();

      cy.findByRole('checkbox', { name: /avklart utenlandsoppholdet med arbeidsgiveren/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav080907?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields
      cy.clickNextStep();

      // Dine opplysninger – choose Ja for Norwegian FNR to skip address fields
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Statsborgerskap' }).type('Norsk');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Periode
      cy.findByRole('textbox', { name: /Fra dato/ }).type('01.01.2025');
      cy.findByRole('textbox', { name: /Til dato/ }).type('15.01.2025');
      cy.findByRole('textbox', { name: /Reisemål \(land\)/ }).type('Spania');
      cy.clickNextStep();

      // Sykmelding og arbeidsforhold
      cy.withinComponent('Er du delvis sykmeldt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du arbeidsgiver?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      // Nærmeste leder fields appear when harDuArbeidsgiver=ja
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Leder');
      cy.findByLabelText('Telefonnummer').type('87654321');
      cy.clickNextStep();

      // Egenerklæring – three checkboxes (harDuArbeidsgiver=ja triggers the second one)
      cy.findByRole('checkbox', { name: /informasjonssiden/ }).check();
      cy.findByRole('checkbox', { name: /avklart utenlandsoppholdet med arbeidsgiveren/ }).check();
      cy.findByRole('checkbox', { name: /avklart utenlandsoppholdet med den som sykmeldte/ }).check();

      // Vedlegg – isAttachmentPanel=true (Case A: last panel before Oppsummering)
      // Do NOT call clickNextStep from Egenerklæring — use stepper to visit Vedlegg
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });

      // ONE clickNextStep — Vedlegg is the last panel, goes directly to Oppsummering
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Periode', () => {
        cy.get('dt').eq(1).should('contain.text', 'Fra dato');
        cy.get('dd').eq(1).should('contain.text', '01.01.2025');
      });
      cy.withinSummaryGroup('Sykmelding og arbeidsforhold', () => {
        cy.get('dt').eq(0).should('contain.text', 'Er du delvis sykmeldt?');
        cy.get('dd').eq(0).should('contain.text', 'Nei');
      });
    });
  });
});
