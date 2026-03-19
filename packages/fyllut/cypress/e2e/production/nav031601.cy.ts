/*
 * Production form tests for Søknad om godskriving av omsorgsopptjening
 * Form: nav031601
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 3 same-panel conditionals
 *       borDuINorgeSoker → postnrSoker (hidden when nei),
 *                          utenlandskPostkodeSoker (shown when nei),
 *                          landSoker (shown when nei)
 *   - Arbeid og opphold i utlandet (arbeidOgOppholdiUtlandet): 1 conditional
 *       harDuHattArbeidOgEllerOppholdIUtlandet → opplysningerOmArbeidOgOppholdIUtlandet (datagrid, shown when ja)
 */

describe('nav031601', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – borDuINorge conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav031601/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows utenlandsk adresse fields when not living in Norway', () => {
      cy.findByRole('textbox', { name: /Utenlandsk postkode/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Utenlandsk postkode/ }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('not.exist');
    });

    it('hides utenlandsk fields when living in Norway', () => {
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Utenlandsk postkode/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
    });
  });

  describe('Arbeid og opphold i utlandet – utland conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav031601/arbeidOgOppholdiUtlandet?sub=paper');
      cy.defaultWaits();
    });

    it('shows utland datagrid when had work or stay abroad', () => {
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');

      cy.withinComponent('Har du hatt arbeid og/eller opphold i utlandet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Land' }).should('exist');
    });

    it('hides utland datagrid when no work or stay abroad', () => {
      cy.withinComponent('Har du hatt arbeid og/eller opphold i utlandet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav031601?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – select what to apply for
      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', { name: /Godskriving.*før 1992/ }).click();
      });
      cy.clickNextStep();

      // Dine opplysninger – Norwegian address path
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Gateadresse' }).type('Testveien 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0150');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.clickNextStep();

      // Søknadsopplysninger – fill required fields including datagrid first row (initEmpty=false)
      cy.withinComponent('Er det mor eller far som søker?', () => {
        cy.findByRole('radio', { name: 'Mor' }).click();
      });
      cy.findByRole('textbox', { name: 'Kalenderåret / årene søknaden gjelder for' }).type('2023');
      cy.findAllByRole('textbox', { name: /fødselsnummer/i })
        .first()
        .type('17912099997');
      cy.findAllByRole('textbox', { name: 'Fornavn' }).first().type('Kari');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).first().type('Barn');
      cy.withinComponent('Har du søkt om alderspensjon?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Arbeid og opphold i utlandet – no abroad stay
      cy.withinComponent('Har du hatt arbeid og/eller opphold i utlandet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Erklæring – confirm checkbox
      cy.findByRole('checkbox', { name: /Jeg er kjent med at NAV/ }).check();
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(1).should('contain.text', 'Fornavn');
        cy.get('dd').eq(1).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Søknadsopplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Er det mor eller far som søker?');
        cy.get('dd').eq(0).should('contain.text', 'Mor');
      });
    });
  });
});
