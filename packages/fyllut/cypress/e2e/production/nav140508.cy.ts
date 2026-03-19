/*
 * Production form tests for Søknad om engangsstønad ved adopsjon
 * Form: nav140508
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Veiledning (panel1): 1 required checkbox, no conditionals
 *   - Dine opplysninger (dineOpplysninger): 3 required fields, no conditionals
 *   - Engangsstønad (page4): 1 required radiopanel, 1 required date, 1 datagrid (initEmpty=false)
 *   - Utenlandsopphold (page5): 2 same-panel conditionals
 *       hvorSkalDuBoDeNeste12Manedene → leggTilNyttUtenlandsoppholdDeNeste12Manedene datagrid
 *         (show when 'boIUtlandetHeltEllerDelvis')
 *       hvorHarDuBoddDeSiste12Manedene → leggTilNyttUtenlandsopphold datagrid
 *         (show when 'boddIUtlandetHeltEllerDelvis')
 *   - Tilleggsopplysninger (page6): 1 same-panel conditional
 *       harDuTilleggsopplysningerSomErRelevantForSoknaden → tilleggsopplysninger textarea
 *         (show when 'ja')
 *   - Vedlegg (vedlegg): isAttachmentPanel=true — 2 required attachment fields
 *       Sequential clickNextStep() skips Vedlegg; use stepper + 2×clickNextStep() to reach Oppsummering
 *   - Erklæring (page7): 1 required checkbox, no conditionals
 */

describe('nav140508', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Utenlandsopphold – datagrid conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140508/page5?sub=paper');
      cy.defaultWaits();
    });

    it('shows future stays datagrid when boIUtlandetHeltEllerDelvis', () => {
      cy.findByRole('combobox', { name: 'Hvilket land skal du bo i?' }).should('not.exist');

      cy.withinComponent('Hvor skal du bo de neste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Bo i utlandet helt eller delvis' }).click();
      });

      cy.findByRole('combobox', { name: 'Hvilket land skal du bo i?' }).should('exist');

      cy.withinComponent('Hvor skal du bo de neste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Kun bo i Norge' }).click();
      });

      cy.findByRole('combobox', { name: 'Hvilket land skal du bo i?' }).should('not.exist');
    });

    it('shows past stays datagrid when boddIUtlandetHeltEllerDelvis', () => {
      cy.findByRole('combobox', { name: 'Hvilket land bodde du i?' }).should('not.exist');

      cy.withinComponent('Hvor har du bodd de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Bodd i utlandet helt eller delvis' }).click();
      });

      cy.findByRole('combobox', { name: 'Hvilket land bodde du i?' }).should('exist');

      cy.withinComponent('Hvor har du bodd de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Kun bodd i Norge' }).click();
      });

      cy.findByRole('combobox', { name: 'Hvilket land bodde du i?' }).should('not.exist');
    });
  });

  describe('Tilleggsopplysninger – textarea conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140508/page6?sub=paper');
      cy.defaultWaits();
    });

    it('shows tilleggsopplysninger textarea when ja is selected', () => {
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');

      cy.withinComponent('Har du tilleggsopplysninger som er relevant for søknaden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('exist');

      cy.withinComponent('Har du tilleggsopplysninger som er relevant for søknaden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140508?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – check required declaration
      cy.findByRole('checkbox', {
        name: 'Jeg har lest og forstått det som står på nettsiden "Du har plikt til å gi NAV riktige opplysninger".',
      }).check();
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Engangsstønad
      cy.withinComponent('Hva søker du om?', () => {
        cy.findByRole('radio', { name: 'Engangsstønad ved adopsjon' }).click();
      });
      cy.findByRole('textbox', { name: /Dato for omsorgsovertakelsen av barnet.*dd\.mm\.åååå/ }).type('15.03.2024');
      // Datagrid leggTilBarnsFodselsdato has initEmpty=false — fill the pre-rendered first row
      cy.findByRole('textbox', { name: /Fødselsdato.*dd\.mm\.åååå/ }).type('01.01.2020');
      cy.clickNextStep();

      // Utenlandsopphold – no datagrid triggered (use "kun" options)
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Hvor skal du bo de neste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Kun bo i Norge' }).click();
      });
      cy.withinComponent('Hvor har du bodd de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Kun bodd i Norge' }).click();
      });
      cy.clickNextStep();

      // Tilleggsopplysninger – select Nei; do NOT call clickNextStep (Vedlegg is isAttachmentPanel=true)
      cy.withinComponent('Har du tilleggsopplysninger som er relevant for søknaden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // Vedlegg – isAttachmentPanel=true, skipped by sequential Next; use stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon av dato for overtakelse av omsorg/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender/ }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });

      // Erklæring – stepper still expanded; navigate directly
      cy.findByRole('link', { name: 'Erklæring' }).click();
      cy.findByRole('checkbox', {
        name: 'De opplysninger jeg har oppgitt er riktige og jeg har ikke holdt tilbake opplysninger som har betydning for min rett til engangsstønad.',
      }).check();

      // Two clickNextStep needed: wizard reinserts Vedlegg step, then advances to Oppsummering
      cy.clickNextStep(); // Erklæring → Vedlegg (wizard reinserts missed attachment panel)
      cy.clickNextStep(); // Vedlegg → Oppsummering

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Utenlandsopphold', () => {
        cy.get('dt').eq(0).should('contain.text', 'Bor du i Norge?');
        cy.get('dd').eq(0).should('contain.text', 'Ja');
      });
    });
  });
});
