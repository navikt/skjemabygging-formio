/*
 * Production form tests for Søknad om refusjon av betalt egenandel for fottøy, fotseng og høreapparat ved yrkesskade
 * Form: nav100761
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Hvem som fyller ut skjemaet (hvemSomFyllerUtSkjemaet): 2 same-panel conditionals
 *       fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv → erDuOver18Ar (nei path)
 *       fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv → hvorforSokerDuPaVegneAvEnAnnenPerson (ja path)
 *       + 2 cross-panel triggers to Vedlegg (fullmakt, dokumentasjonPaAtDuErVerge)
 *   - Dine opplysninger (dineOpplysninger): 1 customConditional
 *       identitet.harDuFodselsnummer → adresse visibility
 *   - Søknaden (soknaden): 1 same-panel conditional + 1 cross-panel trigger to Vedlegg
 *       harDetGattMerEnn6ManederSidenDuAnskaffetHjelpemidlet → oppgiArsaken textarea
 *       harDuSendtInnDokumentasjonPaGodkjentYrkesskadeTidligere → kopiAvVedtak attachment
 *   - Tilleggsopplysninger (tilleggsopplysninger): 1 same-panel conditional
 *       harDuTilleggsopplysningerTilSoknaden → tilleggsopplysninger textarea
 *   - Vedlegg (vedlegg): isAttachmentPanel=true — 3 cross-panel conditional attachments
 */

describe('nav100761', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Hvem som fyller ut skjemaet – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100761/hvemSomFyllerUtSkjemaet?sub=paper');
      cy.defaultWaits();
    });

    it('shows erDuOver18Ar question only when not filling for yourself', () => {
      cy.findByLabelText('Er du over 18 år?').should('not.exist');

      cy.withinComponent('Fyller du ut søknaden på vegne av andre enn deg selv?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Er du over 18 år?').should('exist');

      cy.withinComponent('Fyller du ut søknaden på vegne av andre enn deg selv?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Er du over 18 år?').should('not.exist');
    });

    it('shows role question only when filling on behalf of someone else', () => {
      cy.findByLabelText('Hva er din rolle?').should('not.exist');

      cy.withinComponent('Fyller du ut søknaden på vegne av andre enn deg selv?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Hva er din rolle?').should('exist');

      cy.withinComponent('Fyller du ut søknaden på vegne av andre enn deg selv?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Hva er din rolle?').should('not.exist');
    });
  });

  describe('Vedlegg – cross-panel conditionals from hvemSomFyllerUtSkjemaet', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100761/hvemSomFyllerUtSkjemaet?sub=paper');
      cy.defaultWaits();
    });

    it('shows fullmakt attachment when role is jegHarFullmakt', () => {
      cy.withinComponent('Fyller du ut søknaden på vegne av andre enn deg selv?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Hva er din rolle?', () => {
        cy.findByRole('radio', { name: 'Jeg har fullmakt' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Fullmakt/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon på at du er verge/ }).should('not.exist');
    });

    it('shows dokumentasjonPaAtDuErVerge attachment when role is jegErVerge', () => {
      cy.withinComponent('Fyller du ut søknaden på vegne av andre enn deg selv?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Hva er din rolle?', () => {
        cy.findByRole('radio', { name: 'Jeg er verge' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon på at du er verge/ }).should('exist');
      cy.findByRole('group', { name: /Fullmakt/ }).should('not.exist');
    });
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100761/dineOpplysninger?sub=paper');
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
  });

  describe('Søknaden – same-panel conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100761/soknaden?sub=paper');
      cy.defaultWaits();
    });

    it('shows reason textarea only when more than 6 months since purchase', () => {
      cy.findByLabelText('Oppgi årsaken til at du har ventet mer enn 6 måneder med å søke om refusjon').should(
        'not.exist',
      );

      cy.withinComponent('Har det gått mer enn 6 måneder siden du anskaffet hjelpemidlet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Oppgi årsaken til at du har ventet mer enn 6 måneder med å søke om refusjon').should('exist');

      cy.withinComponent('Har det gått mer enn 6 måneder siden du anskaffet hjelpemidlet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Oppgi årsaken til at du har ventet mer enn 6 måneder med å søke om refusjon').should(
        'not.exist',
      );
    });
  });

  describe('Vedlegg – cross-panel conditional from harDuSendtInnDokumentasjonPaGodkjentYrkesskadeTidligere', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100761/soknaden?sub=paper');
      cy.defaultWaits();
    });

    it('shows kopiAvVedtak attachment when no prior documentation sent', () => {
      cy.withinComponent('Har du sendt inn dokumentasjon på godkjent yrkesskade tidligere?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Kopi av vedtak om godkjent yrkesskade/ }).should('exist');
    });

    it('hides kopiAvVedtak attachment when prior documentation was sent', () => {
      cy.withinComponent('Har du sendt inn dokumentasjon på godkjent yrkesskade tidligere?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Kopi av vedtak om godkjent yrkesskade/ }).should('not.exist');
    });
  });

  describe('Tilleggsopplysninger – same-panel conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100761/tilleggsopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows tilleggsopplysninger textarea only when ja', () => {
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');

      cy.withinComponent(/Har du tilleggsopplysninger som kan være relevante for saken/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('exist');

      cy.withinComponent(/Har du tilleggsopplysninger som kan være relevante for saken/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100761?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Hvem som fyller ut skjemaet – filling for yourself (nei path)
      cy.withinComponent('Fyller du ut søknaden på vegne av andre enn deg selv?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Er du over 18 år?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      // Veiledning – no required fields
      cy.clickNextStep();

      // Dine opplysninger – fnr path (adresse hidden)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: 'Bokommune' }).type('Oslo');
      cy.clickNextStep();

      // Søknaden – select one item, answered prior docs yes, not more than 6 months
      cy.findByRole('group', { name: 'Søknaden gjelder' }).within(() => {
        cy.findByRole('checkbox', { name: 'Refusjon av egenandel for fotseng ved yrkesskade' }).check();
      });
      cy.withinComponent('Har du sendt inn dokumentasjon på godkjent yrkesskade tidligere?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Har det gått mer enn 6 måneder siden du anskaffet hjelpemidlet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Tilleggsopplysninger – nei, then navigate via stepper to Vedlegg (isAttachmentPanel=true)
      cy.withinComponent(/Har du tilleggsopplysninger som kan være relevante for saken/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // Vedlegg – fill always-visible required attachments
      cy.findByRole('group', { name: /Spesifisert kvittering som dokumenterer kjøpsdato/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Hvem som fyller ut skjemaet', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fyller du ut søknaden på vegne av andre enn deg selv?');
        cy.get('dd').eq(0).should('contain.text', 'Nei');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Søknaden', () => {
        cy.get('dt').eq(0).should('contain.text', 'Søknaden gjelder');
        cy.get('dd').eq(0).should('contain.text', 'Refusjon av egenandel for fotseng ved yrkesskade');
      });
    });
  });
});
