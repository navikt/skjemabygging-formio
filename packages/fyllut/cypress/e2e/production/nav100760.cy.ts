/*
 * Production form tests for Søknad om stønad til alminnelig fottøy ved ulik fotstørrelse
 * Form: nav100760
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Søknaden (soknaden): 4 same-panel conditionals
 *       soknadenGjelder → skoeneErKjopt container (harDetGattMerEnn6Maneder + oppgiArsaken)
 *       harDetGattMerEnn6ManederSidenDuAnskaffetSkoene → oppgiArsakenTilAt...
 *       oppgiAntallEkstraParSkoSomDuSokerStonadFor > 2 → hvaErArsakenTilAtDuSokerOmStonadTilMerEnnToPar
 *       hvaErArsakenTilAtDuSokerOmStonadTilMerEnnToPar → begrunnHvorforDuSokerOmStonadTilMerEnn2ParEkstraSko
 *   - Dine opplysninger (dineOpplysninger): 1 customConditional
 *       identitet.harDuFodselsnummer → adresse visibility
 *   - Tilleggsopplysninger (tilleggsopplysninger): 1 same-panel conditional
 *       harDuTilleggsopplysningerTilSoknaden → tilleggsopplysninger1
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): 3 cross-panel conditionals
 *       soknadenGjelder → spesifisertKvittering attachment
 *       erDetForsteGangDuSokerOmStonadPaGrunnAvUlikFotstorrelse → erklæringFraLege attachment
 *       hvaErArsakenTilAtDuSokerOmStonadTilMerEnnToPar → legeerklæring attachment
 */

describe('nav100760', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Søknaden – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100760/soknaden?sub=paper');
      cy.defaultWaits();
    });

    it('shows skoeneErKjopt fields when soknadenGjelder is kjøpt, hides for bekreftelse', () => {
      cy.findByLabelText('Har det gått mer enn 6 måneder siden du anskaffet skoene?').should('not.exist');

      cy.withinComponent('Søknaden gjelder', () => {
        cy.findByRole('radio', {
          name: 'Jeg har kjøpt ekstra sett med sko på grunn av ulik fotstørrelse og søker om refusjon',
        }).click();
      });
      cy.findByLabelText('Har det gått mer enn 6 måneder siden du anskaffet skoene?').should('exist');

      cy.withinComponent('Søknaden gjelder', () => {
        cy.findByRole('radio', {
          name: 'Jeg ønsker en bekreftelse på at folketrygden vil dekke utgiftene til et ekstra sett med sko før jeg kjøper skoene',
        }).click();
      });
      cy.findByLabelText('Har det gått mer enn 6 måneder siden du anskaffet skoene?').should('not.exist');
    });

    it('shows årsak textarea when harDetGatt > 6 mnd is ja, hides for nei', () => {
      cy.withinComponent('Søknaden gjelder', () => {
        cy.findByRole('radio', {
          name: 'Jeg har kjøpt ekstra sett med sko på grunn av ulik fotstørrelse og søker om refusjon',
        }).click();
      });

      cy.findByRole('textbox', {
        name: 'Oppgi årsaken til at du har ventet mer enn 6 måneder med å søke om refusjon',
      }).should('not.exist');

      cy.withinComponent('Har det gått mer enn 6 måneder siden du anskaffet skoene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', {
        name: 'Oppgi årsaken til at du har ventet mer enn 6 måneder med å søke om refusjon',
      }).should('exist');

      cy.withinComponent('Har det gått mer enn 6 måneder siden du anskaffet skoene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', {
        name: 'Oppgi årsaken til at du har ventet mer enn 6 måneder med å søke om refusjon',
      }).should('not.exist');
    });

    it('shows hvaErArsaken when antallPar > 2, hides for 1', () => {
      cy.findByLabelText('Hva er årsaken til at du søker om stønad til mer enn to par?').should('not.exist');

      cy.findByLabelText('Oppgi antall ekstra par sko som du søker stønad for').type('3');
      cy.findByLabelText('Hva er årsaken til at du søker om stønad til mer enn to par?').should('exist');

      cy.findByLabelText('Oppgi antall ekstra par sko som du søker stønad for').clear();
      cy.findByLabelText('Oppgi antall ekstra par sko som du søker stønad for').type('1');
      cy.findByLabelText('Hva er årsaken til at du søker om stønad til mer enn to par?').should('not.exist');
    });

    it('shows begrunnelse when hvaErArsaken is annet, hides for other values', () => {
      cy.findByLabelText('Oppgi antall ekstra par sko som du søker stønad for').type('3');

      cy.findByRole('textbox', {
        name: 'Begrunn hvorfor du søker om stønad til mer enn 2 par ekstra sko',
      }).should('not.exist');

      cy.withinComponent('Hva er årsaken til at du søker om stønad til mer enn to par?', () => {
        cy.findByRole('radio', { name: 'Annet' }).click();
      });
      cy.findByRole('textbox', {
        name: 'Begrunn hvorfor du søker om stønad til mer enn 2 par ekstra sko',
      }).should('exist');

      cy.withinComponent('Hva er årsaken til at du søker om stønad til mer enn to par?', () => {
        cy.findByRole('radio', { name: 'Søknaden gjelder et barn i vekst' }).click();
      });
      cy.findByRole('textbox', {
        name: 'Begrunn hvorfor du søker om stønad til mer enn 2 par ekstra sko',
      }).should('not.exist');
    });
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100760/dineOpplysninger?sub=paper');
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

  describe('Tilleggsopplysninger – same-panel conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100760/tilleggsopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows tilleggsopplysninger textarea when ja, hides for nei', () => {
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');

      cy.withinComponent('Har du tilleggsopplysninger som kan være relevante for saken?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('exist');

      cy.withinComponent('Har du tilleggsopplysninger som kan være relevante for saken?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');
    });
  });

  describe('Vedlegg – cross-panel conditionals from soknaden', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100760/soknaden?sub=paper');
      cy.defaultWaits();
    });

    it('shows kvittering attachment when soknadenGjelder is kjøpt', () => {
      cy.withinComponent('Søknaden gjelder', () => {
        cy.findByRole('radio', {
          name: 'Jeg har kjøpt ekstra sett med sko på grunn av ulik fotstørrelse og søker om refusjon',
        }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', {
        name: /Spesifisert kvittering som viser kjøpsdato/,
      }).should('exist');
    });

    it('hides kvittering attachment when soknadenGjelder is bekreftelse', () => {
      cy.withinComponent('Søknaden gjelder', () => {
        cy.findByRole('radio', {
          name: 'Jeg ønsker en bekreftelse på at folketrygden vil dekke utgiftene til et ekstra sett med sko før jeg kjøper skoene',
        }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', {
        name: /Spesifisert kvittering som viser kjøpsdato/,
      }).should('not.exist');
    });

    it('shows erklæring attachment when erDetForsteGang is ja', () => {
      cy.withinComponent('Er det første gang du søker om stønad på grunn av ulik fotstørrelse?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', {
        name: /Erklæring fra lege som dokumenterer at det er minst to hele skonummer/,
      }).should('exist');
    });

    it('hides erklæring attachment when erDetForsteGang is nei', () => {
      cy.withinComponent('Er det første gang du søker om stønad på grunn av ulik fotstørrelse?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', {
        name: /Erklæring fra lege som dokumenterer at det er minst to hele skonummer/,
      }).should('not.exist');
    });

    it('shows legeerklæring attachment when hvaErArsaken is funksjonsforstyrrelse', () => {
      cy.findByLabelText('Oppgi antall ekstra par sko som du søker stønad for').type('3');

      cy.withinComponent('Hva er årsaken til at du søker om stønad til mer enn to par?', () => {
        cy.findByRole('radio', {
          name: 'Jeg har en funksjonsforstyrrelse som gjør at jeg sliter fottøyet mer enn normalt',
        }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', {
        name: /Legeerklæring som dokumenterer at jeg har en funksjonsforstyrrelse/,
      }).should('exist');
    });
  });

  describe('Summary', () => {
    it('fills required fields and verifies summary', () => {
      cy.visit('/fyllut/nav100760?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();

      // Veiledning – no required fields, proceed
      cy.clickNextStep();

      // Dine opplysninger – use fnr path (adresse hidden when fnr provided)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: 'Bokommune' }).type('Oslo');
      cy.clickNextStep();

      // Søknaden – bekreftelse path (no skoeneErKjopt required fields), erDetForsteGang nei, antall 1
      cy.withinComponent('Søknaden gjelder', () => {
        cy.findByRole('radio', {
          name: 'Jeg ønsker en bekreftelse på at folketrygden vil dekke utgiftene til et ekstra sett med sko før jeg kjøper skoene',
        }).click();
      });
      cy.withinComponent('Er det første gang du søker om stønad på grunn av ulik fotstørrelse?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Oppgi antall ekstra par sko som du søker stønad for').type('1');
      cy.clickNextStep();

      // Tilleggsopplysninger – select nei (tilleggsopplysninger textarea hidden)
      cy.withinComponent('Har du tilleggsopplysninger som kan være relevante for saken?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Vedlegg (isAttachmentPanel=true) – only annenDokumentasjon shown (all conditional attachments hidden)
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Søknaden', () => {
        cy.get('dt').eq(0).should('contain.text', 'Søknaden gjelder');
        cy.get('dd').eq(0).should('contain.text', 'Jeg ønsker en bekreftelse på at folketrygden vil dekke utgiftene');
      });
    });
  });
});
