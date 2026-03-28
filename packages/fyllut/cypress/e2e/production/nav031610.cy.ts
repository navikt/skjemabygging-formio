/*
 * Production form tests for Overføring av omsorgsopptjening
 * Form: nav031610
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Personen som har omsorgsopptjeningen (panel): 3 same-panel conditionals
 *       borDuINorgeSoker → postnrSoker (hidden when nei),
 *                          utenlandskPostkodeSoker (shown when nei),
 *                          landSoker (shown when nei)
 *   - Ny mottaker av omsorgsopptjeningen (page4): 3 same-panel conditionals
 *       borDuINorge → postnr (hidden when nei),
 *                     utenlandskPostkode (shown when nei),
 *                     land (shown when nei)
 *   - Erklæring (page6): 2 same-panel conditionals
 *       harDuSomSokerFyltUtSoknadenSelv → navSkjemagruppe (Opplysninger om bevitner, shown when nei),
 *                                          bevitnerBekrefterAt... checkbox (shown when nei)
 *       + nested: borDuINorge1 → postnr/utenlandskPostkode in bevitner address
 */

describe('nav031610', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Personen som har omsorgsopptjeningen – borDuINorge conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav031610/panel?sub=paper');
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

  describe('Ny mottaker – borDuINorge conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav031610/page4?sub=paper');
      cy.defaultWaits();
    });

    it('shows utenlandsk adresse fields when person not in Norway', () => {
      cy.findByRole('textbox', { name: /Utenlandsk postkode/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');

      cy.withinComponent('Bor personen i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Utenlandsk postkode/ }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('not.exist');
    });

    it('hides utenlandsk fields when person in Norway', () => {
      cy.withinComponent('Bor personen i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Utenlandsk postkode/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
    });
  });

  describe('Erklæring – bevitner conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav031610/page6?sub=paper');
      cy.defaultWaits();
    });

    it('shows bevitner fields when søker did not fill out form themselves', () => {
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');

      cy.withinComponent('Har du som søker fylt ut søknaden selv?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('exist');
      cy.findByRole('checkbox', { name: /Bevitner bekrefter/ }).should('exist');
    });

    it('hides bevitner fields when søker filled out form themselves', () => {
      cy.withinComponent('Har du som søker fylt ut søknaden selv?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
      cy.findByRole('checkbox', { name: /Bevitner bekrefter/ }).should('not.exist');
    });

    it('toggles bevitner address fields based on borDuINorge1', () => {
      cy.withinComponent('Har du som søker fylt ut søknaden selv?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // Default is no selection — select Nei to show utenlandsk fields
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Utenlandsk postkode/ }).should('exist');

      // Switch to Ja
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Utenlandsk postkode/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav031610?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no fields, just skip
      cy.clickNextStep();

      // Panel 1: Personen som har omsorgsopptjeningen
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

      // Panel 2: Ny mottaker av omsorgsopptjeningen
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Bor personen i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Gateadresse' }).type('Testveien 2');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0150');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.clickNextStep();

      // Panel 3: Fellesbarn – datagrid with required fields
      cy.findAllByRole('textbox', { name: /fødselsnummer/i })
        .first()
        .type('17912099997');
      cy.findAllByRole('textbox', { name: 'Fornavn' }).first().type('Barn');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).first().type('Nordmann');
      cy.findByRole('textbox', { name: /kalenderår/i }).type('2023');
      cy.clickNextStep();

      // Panel 4: Erklæring
      cy.withinComponent('Har du som søker fylt ut søknaden selv?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('checkbox', { name: /Jeg er kjent med at NAV/ }).check();
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Personen som har omsorgsopptjeningen', () => {
        cy.get('dt').eq(1).should('contain.text', 'Fornavn');
        cy.get('dd').eq(1).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Ny mottaker av omsorgsopptjeningen', () => {
        cy.get('dt').eq(1).should('contain.text', 'Fornavn');
        cy.get('dd').eq(1).should('contain.text', 'Kari');
      });
      cy.withinSummaryGroup('Erklæring', () => {
        cy.get('dt').eq(0).should('contain.text', 'Har du som søker fylt ut søknaden selv?');
        cy.get('dd').eq(0).should('contain.text', 'Ja');
      });
    });
  });
});
