/*
 * Production form tests for Søknad om høreapparat / tinnitusmaskerer / tilleggsutstyr
 * Form: nav100708
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Personinformasjon (personinformasjon): 2 conditionals
 *       identitet.harDuFodselsnummer → adresse visibility (navAddress)
 *       harDuFattHoreapparatTinnitusmaskererAvFolketrygdenTidligere → hvisMuligOppgiNar (datepicker)
 *   - Opplysninger fra avtalespesialist / høresentral (page4): 8 conditionals
 *       hvaSokerDuOm.horeapparat/tinnitusmaskerer → erHoreapparatetEllerTinnitusmaskererenPaRammeavtale
 *       hvaSokerDuOm.tilleggsutstyr (only) → harSokerenFattStonadTilHoreapparatetFraFolketrygden
 *       erHoreapparatet=nei → leverandorensNavn1 (textfield), =ja → leverandor2 (select)
 *       erHoreapparatet=nei → navSkjemagruppe2 fields
 *       hvaSokerDuOm.horeapparat+tilleggsutstyr → erTilleggsutstyretPaRammeavtale
 *       erTilleggsustyr=nei → gjelderSoknadenRite
 *       gjelderSoknadenRite=nei → tilleggsutstyr datagrid
 * Note: Vedlegg has isAttachmentPanel=true; use stepper + 1 clickNextStep to reach Oppsummering.
 */

describe('nav100708', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Personinformasjon – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100708/personinformasjon?sub=paper');
      cy.defaultWaits();
    });

    it('shows adresse section when user has no fnr', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('keeps adresse section hidden when user has fnr', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });

    it('shows datepicker when user previously had høreapparat', () => {
      cy.findByRole('textbox', { name: /oppgi når du fikk dette/i }).should('not.exist');

      cy.withinComponent('Har du fått høreapparat/tinnitusmaskerer av folketrygden tidligere?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /oppgi når du fikk dette/i }).should('exist');
    });

    it('hides datepicker when user has not previously had høreapparat', () => {
      cy.withinComponent('Har du fått høreapparat/tinnitusmaskerer av folketrygden tidligere?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /oppgi når du fikk dette/i }).should('not.exist');
    });
  });

  describe('Opplysninger – hvaSokerDuOm conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100708/page4?sub=paper');
      cy.defaultWaits();
    });

    it('shows rammeavtale question only when horeapparat or tinnitusmaskerer is selected', () => {
      cy.findByLabelText('Er høreapparatet eller tinnitusmaskereren på rammeavtale?').should('not.exist');

      cy.findByRole('checkbox', { name: 'Høreapparat' }).click();
      cy.findByLabelText('Er høreapparatet eller tinnitusmaskereren på rammeavtale?').should('exist');

      cy.findByRole('checkbox', { name: 'Høreapparat' }).click();
      cy.findByLabelText('Er høreapparatet eller tinnitusmaskereren på rammeavtale?').should('not.exist');

      cy.findByRole('checkbox', { name: 'Tinnitusmaskerer' }).click();
      cy.findByLabelText('Er høreapparatet eller tinnitusmaskereren på rammeavtale?').should('exist');
    });

    it('shows harSokerenFatt question only when tilleggsutstyr alone is selected', () => {
      cy.findByLabelText(/Har søkeren fått stønad/).should('not.exist');

      cy.findByRole('checkbox', { name: 'Tilleggsutstyr' }).click();
      cy.findByLabelText(/Har søkeren fått stønad/).should('exist');

      cy.findByRole('checkbox', { name: 'Høreapparat' }).click();
      cy.findByLabelText(/Har søkeren fått stønad/).should('not.exist');
    });

    it('shows leverandorensNavn when rammeavtale=nei, and leverandor dropdown when rammeavtale=ja', () => {
      cy.findByRole('checkbox', { name: 'Høreapparat' }).click();

      cy.withinComponent('Er høreapparatet eller tinnitusmaskereren på rammeavtale?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Leverandørens navn' }).should('exist');
      cy.findByLabelText('Leverandør').should('not.exist');

      cy.withinComponent('Er høreapparatet eller tinnitusmaskereren på rammeavtale?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Leverandør').should('exist');
      cy.findByRole('textbox', { name: 'Leverandørens navn' }).should('not.exist');
    });

    it('shows navSkjemagruppe2 fields when rammeavtale=nei', () => {
      cy.findByRole('textbox', { name: /Beskriv de særegne egenskapene/ }).should('not.exist');

      cy.findByRole('checkbox', { name: 'Høreapparat' }).click();
      cy.withinComponent('Er høreapparatet eller tinnitusmaskereren på rammeavtale?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Beskriv de særegne egenskapene/ }).should('exist');
    });

    it('shows tilleggsutstyr datagrid through erTilleggsutstyr=nei and gjelderRite=nei', () => {
      cy.findByRole('textbox', { name: 'Modell / type utstyr' }).should('not.exist');

      cy.findByRole('checkbox', { name: 'Høreapparat' }).click();
      cy.findByRole('checkbox', { name: 'Tilleggsutstyr' }).click();

      cy.withinComponent('Er høreapparatet eller tinnitusmaskereren på rammeavtale?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Er tilleggsutstyret på rammeavtale?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(
        'Gjelder søknaden RITE-lydgiver, softband til benforankret høreapparat eller pute til tinnitusmaskerer?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );

      cy.findByRole('textbox', { name: 'Modell / type utstyr' }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100708?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // start page → introduksjon
      cy.clickNextStep(); // introduksjon → personinformasjon (no required fields)
    });

    it('fills required fields and verifies summary', () => {
      // Personinformasjon – use fnr path (adresse/adresseVarighet hidden when fnr provided)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.withinComponent('Har du fått høreapparat/tinnitusmaskerer av folketrygden tidligere?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Opplysninger – horeapparat path, rammeavtale=nei (leverandorensNavn is a simple textfield)
      cy.findByRole('checkbox', { name: 'Høreapparat' }).click();
      cy.withinComponent('Er høreapparatet eller tinnitusmaskereren på rammeavtale?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Leverandørens navn' }).type('Test Leverandør');
      cy.findByRole('textbox', { name: /Beskriv de særegne egenskapene/ }).type('Test egenskaper');
      cy.findByRole('textbox', { name: /Forklar hvorfor disse egenskapene/ }).type('Test forklaring');
      cy.findByRole('checkbox', { name: /Jeg har påsett at hjelpemidlet/ }).check();
      cy.findByRole('textbox', { name: /Beskriv søkerens hørselstap/ }).type('Test hørselstap');

      // Vedlegg – isAttachmentPanel=true; navigate via stepper, then 1 clickNextStep to Oppsummering
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Personinformasjon', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Opplysninger fra avtalespesialist / høresentral', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hva søker du om?');
        cy.get('dd').eq(0).should('contain.text', 'Høreapparat');
      });
    });
  });
});
