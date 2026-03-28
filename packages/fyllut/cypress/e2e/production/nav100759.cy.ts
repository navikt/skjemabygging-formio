/*
 * Production form tests for Søknad om stønad til brystprotese eller spesialbrystholder
 * Form: nav100759
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): identity customConditionals
 *       identitet.harDuFodselsnummer → adresse (navAddress) visibility
 *   - Søknaden (soknaden): multiple same-panel conditionals
 *       kjopAvBrystproteseEllerSpesialbrystholder → erKjopt container
 *       erKjopt.harDetGattMerEnn6Maneder → oppgiArsaken textarea
 *       hvaGjelderSoknaden → spesialbrystholder container
 *       hvaGjelderSoknaden → brystprotese container
 *       spesialbrystholder.erDetForsteGang + cause → harDittBehovEndretSeg radiopanel
 *       brystprotese.erDetForsteGang → beskrivHvorfor textarea
 *       + 5 cross-panel triggers to Vedlegg
 *   - Tilleggsopplysninger (tilleggsopplysninger): 1 same-panel conditional
 *       harDuTilleggsopplysninger → tilleggsopplysninger1 textarea
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): 5 conditional attachments
 *       kjøp=jegHarKjopt → spesifisertKvittering
 *       spesialbrystholder.erDetForsteGang=ja + cause≠kjonnsinkongruens → legeerklaeringSomDokumentererBehovetForSpesialbrystholder
 *       (spesialbrystholder|brystprotese).erDetForsteGang=ja + cause=kjonnsinkongruens → dokumentasjonFraLegeKjonnsinkongruens
 *       spesialbrystholder.harDittBehovEndretSeg=ja → legeerklaeringSomDokumentererEndretBehov
 *       brystprotese.erDetForsteGang=ja + cause≠kjonnsinkongruens → legeerklaeringSomDokumentererArsakenBrystprotese
 */

describe('nav100759', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100759/dineOpplysninger?sub=paper');
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

  describe('Søknaden – kjøp conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100759/soknaden?sub=paper');
      cy.defaultWaits();
    });

    it('shows erKjopt container when jegHarKjopt is selected', () => {
      cy.findByLabelText(/Har det gått mer enn 6 måneder/).should('not.exist');

      cy.withinComponent('Søker du om refusjon eller forhåndsgodkjenning?', () => {
        cy.findByRole('radio', { name: /Jeg har kjøpt/ }).click();
      });

      cy.findByLabelText(/Har det gått mer enn 6 måneder/).should('exist');
    });

    it('shows årsak textarea when harDetGattMerEnn6Maneder is ja', () => {
      cy.withinComponent('Søker du om refusjon eller forhåndsgodkjenning?', () => {
        cy.findByRole('radio', { name: /Jeg har kjøpt/ }).click();
      });

      cy.findByRole('textbox', { name: /ventet mer enn 6 måneder/ }).should('not.exist');

      cy.withinComponent(/Har det gått mer enn 6 måneder/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /ventet mer enn 6 måneder/ }).should('exist');

      cy.withinComponent(/Har det gått mer enn 6 måneder/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /ventet mer enn 6 måneder/ }).should('not.exist');
    });
  });

  describe('Søknaden – hvaGjelderSoknaden conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100759/soknaden?sub=paper');
      cy.defaultWaits();
    });

    it('shows spesialbrystholder container when spesialbrystholder is selected', () => {
      cy.findByLabelText(/Er det første gang du søker om stønad til spesialbrystholder/).should('not.exist');

      cy.findByRole('checkbox', { name: 'Spesialbrystholder' }).click();

      cy.findByLabelText(/Er det første gang du søker om stønad til spesialbrystholder/).should('exist');

      cy.findByRole('checkbox', { name: 'Spesialbrystholder' }).click();

      cy.findByLabelText(/Er det første gang du søker om stønad til spesialbrystholder/).should('not.exist');
    });

    it('shows harDittBehovEndretSeg when erDetForsteGang spesialbrystholder is nei and cause is not kjonnsinkongruens', () => {
      cy.findByLabelText(/Har ditt behov for spesialbrystholder/).should('not.exist');

      cy.withinComponent(/Hva er årsaken til at du trenger/, () => {
        cy.findByRole('radio', { name: 'Operativt inngrep' }).click();
      });
      cy.findByRole('checkbox', { name: 'Spesialbrystholder' }).click();

      cy.withinComponent(/Er det første gang du søker om stønad til spesialbrystholder/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText(/Har ditt behov for spesialbrystholder/).should('exist');
    });

    it('shows brystprotese container when brystprotese is selected', () => {
      cy.findByLabelText(/Er det første gang du søker om stønad til brystprotese/).should('not.exist');

      cy.findByRole('checkbox', { name: /Brystprotese/ }).click();

      cy.findByLabelText(/Er det første gang du søker om stønad til brystprotese/).should('exist');
    });

    it('shows beskrivHvorfor textarea when erDetForsteGang brystprotese is nei', () => {
      cy.findByRole('checkbox', { name: /Brystprotese/ }).click();

      cy.findByRole('textbox', { name: /Beskriv hvorfor du har behov for en ny brystprotese/ }).should('not.exist');

      cy.withinComponent(/Er det første gang du søker om stønad til brystprotese/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Beskriv hvorfor du har behov for en ny brystprotese/ }).should('exist');

      cy.withinComponent(/Er det første gang du søker om stønad til brystprotese/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Beskriv hvorfor du har behov for en ny brystprotese/ }).should('not.exist');
    });
  });

  describe('Tilleggsopplysninger – same-panel conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100759/tilleggsopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows tilleggsopplysninger textarea only when ja is selected', () => {
      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');

      cy.withinComponent(/Har du tilleggsopplysninger/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('exist');

      cy.withinComponent(/Har du tilleggsopplysninger/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Tilleggsopplysninger' }).should('not.exist');
    });
  });

  describe('Vedlegg – conditional attachments', () => {
    it('shows kvittering attachment when jegHarKjopt is selected', () => {
      cy.visit('/fyllut/nav100759/soknaden?sub=paper');
      cy.defaultWaits();

      cy.findByRole('checkbox', { name: /Brystprotese/ }).click();
      cy.withinComponent('Søker du om refusjon eller forhåndsgodkjenning?', () => {
        cy.findByRole('radio', { name: /Jeg har kjøpt/ }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Spesifisert kvittering/ }).should('exist');
    });

    it('hides kvittering attachment when forhåndsgodkjenning is selected', () => {
      cy.visit('/fyllut/nav100759/soknaden?sub=paper');
      cy.defaultWaits();

      cy.findByRole('checkbox', { name: /Brystprotese/ }).click();
      cy.withinComponent('Søker du om refusjon eller forhåndsgodkjenning?', () => {
        cy.findByRole('radio', { name: /bekreftelse/ }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Spesifisert kvittering/ }).should('not.exist');
    });

    it('shows legeerklæring brystprotese årsak when erDetForsteGangBrystprotese is ja and cause is not kjonnsinkongruens', () => {
      cy.visit('/fyllut/nav100759/soknaden?sub=paper');
      cy.defaultWaits();

      cy.withinComponent(/Hva er årsaken til at du trenger/, () => {
        cy.findByRole('radio', { name: 'Operativt inngrep' }).click();
      });
      cy.findByRole('checkbox', { name: /Brystprotese/ }).click();
      cy.withinComponent('Søker du om refusjon eller forhåndsgodkjenning?', () => {
        cy.findByRole('radio', { name: /bekreftelse/ }).click();
      });
      cy.withinComponent(/Er det første gang du søker om stønad til brystprotese/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', {
        name: /Legeerklæring som dokumenterer årsaken til at du har behov for brystprotese/,
      }).should('exist');
    });

    it('shows kjønnsinkongruens dokumentasjon when cause is kjonnsinkongruens and erDetForsteGangBrystprotese is ja', () => {
      cy.visit('/fyllut/nav100759/soknaden?sub=paper');
      cy.defaultWaits();

      cy.withinComponent(/Hva er årsaken til at du trenger/, () => {
        cy.findByRole('radio', { name: 'Kjønnsinkongruens' }).click();
      });
      cy.findByRole('checkbox', { name: /Brystprotese/ }).click();
      cy.withinComponent('Søker du om refusjon eller forhåndsgodkjenning?', () => {
        cy.findByRole('radio', { name: /bekreftelse/ }).click();
      });
      cy.withinComponent(/Er det første gang du søker om stønad til brystprotese/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon fra lege eller annet helsepersonell/ }).should('exist');
    });

    it('shows legeerklæring spesialbrystholder behov when erDetForsteGangSpesialbrystholder is ja and cause is not kjonnsinkongruens', () => {
      cy.visit('/fyllut/nav100759/soknaden?sub=paper');
      cy.defaultWaits();

      cy.withinComponent(/Hva er årsaken til at du trenger/, () => {
        cy.findByRole('radio', { name: 'Operativt inngrep' }).click();
      });
      cy.findByRole('checkbox', { name: 'Spesialbrystholder' }).click();
      cy.withinComponent('Søker du om refusjon eller forhåndsgodkjenning?', () => {
        cy.findByRole('radio', { name: /bekreftelse/ }).click();
      });
      cy.withinComponent(/Er det første gang du søker om stønad til spesialbrystholder/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Legeerklæring som dokumenterer behovet for spesialbrystholder/ }).should('exist');
    });

    it('shows legeerklæring endret behov when harDittBehovEndretSeg is ja', () => {
      cy.visit('/fyllut/nav100759/soknaden?sub=paper');
      cy.defaultWaits();

      cy.withinComponent(/Hva er årsaken til at du trenger/, () => {
        cy.findByRole('radio', { name: 'Operativt inngrep' }).click();
      });
      cy.findByRole('checkbox', { name: 'Spesialbrystholder' }).click();
      cy.withinComponent('Søker du om refusjon eller forhåndsgodkjenning?', () => {
        cy.findByRole('radio', { name: /bekreftelse/ }).click();
      });
      cy.withinComponent(/Er det første gang du søker om stønad til spesialbrystholder/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(/Har ditt behov for spesialbrystholder/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Legeerklæring som dokumenterer endret behov/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100759?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields
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

      // Søknaden – brystprotese, forhåndsgodkjenning, first time (no erKjopt container)
      cy.withinComponent(/Hva er årsaken til at du trenger/, () => {
        cy.findByRole('radio', { name: 'Operativt inngrep' }).click();
      });
      cy.findByRole('checkbox', { name: /Brystprotese/ }).click();
      cy.withinComponent('Søker du om refusjon eller forhåndsgodkjenning?', () => {
        cy.findByRole('radio', { name: /bekreftelse/ }).click();
      });
      cy.withinComponent(/Er det første gang du søker om stønad til brystprotese/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent(/Søker du om reserveeksemplar av brystprotese/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Tilleggsopplysninger – nei (textarea hidden)
      cy.withinComponent(/Har du tilleggsopplysninger/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Vedlegg (isAttachmentPanel: true – navigate as normal wizard step)
      cy.findByRole('group', {
        name: /Legeerklæring som dokumenterer årsaken til at du har behov for brystprotese/,
      }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Søknaden', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hva er årsaken');
        cy.get('dd').eq(0).should('contain.text', 'Operativt inngrep');
      });
    });
  });
});
