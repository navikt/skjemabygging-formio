/*
 * Production form tests for Melding om tildelt barnehageplass
 * Form: nav341601
 * Submission types: PAPER, DIGITAL, DIGITAL_NO_LOGIN
 *
 * Panels tested:
 *   - Veiledning (veiledning): 1 required checkbox, no conditionals
 *   - Dine opplysninger (dineOpplysninger): 2 same-panel conditionals
 *       identitet.harDuFodselsnummer → adresse (show when "nei")
 *       adresse.borDuINorge → adresseVarighet (show when "nei" or "ja" + address type selected)
 *   - Barn (barn): 1 same-panel conditional inside datagrid
 *       harBarnetFattFulltidsplassEllerDeltidsplass → hvorMangeTimerHarBarnetFattTildeltPerUke (show when "deltidsplass")
 *   - Vedlegg (vedlegg): isAttachmentPanel=true — handled via stepper in summary
 */

describe('nav341601', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – identity and address conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav341601/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows address fields when user has no Norwegian FNR', () => {
      // adresse (borDuINorge) not visible initially
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      // Select "Nei" for FNR → adresse becomes visible
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('exist');

      // Select "Ja" for FNR → adresse hidden again
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });

    it('shows adresseVarighet when borDuINorge is nei', () => {
      // Make adresse visible first
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('exist');

      // adresseVarighet not yet visible
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');

      // Select "Nei" for borDuINorge → adresseVarighet appears
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');

      // Select "Ja" for borDuINorge (without selecting address type) → adresseVarighet hidden
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');
    });
  });

  describe('Barn – deltidsplass conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav341601/barn?sub=paper');
      cy.defaultWaits();
    });

    it('shows timer field when deltidsplass is selected', () => {
      // Timer field not visible initially
      cy.findByRole('textbox', { name: 'Hvor mange timer har barnet fått tildelt per uke?' }).should('not.exist');

      // Select "Deltidsplass" → timer field appears
      cy.withinComponent('Har barnet fått fulltidsplass eller deltidsplass?', () => {
        cy.findByRole('radio', { name: 'Deltidsplass' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvor mange timer har barnet fått tildelt per uke?' }).should('exist');

      // Select "Fulltidsplass" → timer field hidden again
      cy.withinComponent('Har barnet fått fulltidsplass eller deltidsplass?', () => {
        cy.findByRole('radio', { name: 'Fulltidsplass' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvor mange timer har barnet fått tildelt per uke?' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav341601?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – check required confirmation checkbox
      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare/ }).check();
      cy.clickNextStep();

      // Dine opplysninger – use FNR "Ja" path (hides address fields)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Barn – fill first datagrid row with Fulltidsplass (no timer field needed)
      cy.findAllByRole('textbox', { name: 'Barnets navn' }).first().type('Kari');
      cy.findAllByRole('textbox', { name: /Barnets fødselsato/ })
        .first()
        .type('01.01.2022');
      cy.findAllByRole('textbox', { name: 'Navnet på barnehagen' }).first().type('Testbarnehagen');
      cy.findAllByRole('textbox', { name: /Fra hvilken dato har barnet/ })
        .first()
        .type('01.08.2025');
      cy.withinComponent('Har barnet fått fulltidsplass eller deltidsplass?', () => {
        cy.findByRole('radio', { name: 'Fulltidsplass' }).click();
      });

      // Vedlegg has isAttachmentPanel=true — use stepper to navigate there
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
      cy.withinSummaryGroup('Barn', () => {
        cy.get('dt').eq(1).should('contain.text', 'Barnets navn');
        cy.get('dd').eq(1).should('contain.text', 'Kari');
      });
    });
  });
});
