/*
 * Production form tests for Søknad om menerstatning
 * Form: nav131705
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 2 customConditionals
 *       identitet.harDuFodselsnummer → adresse visibility
 *   - Varig skade eller sykdom (varigSkadeEllerSykdomDuSokerMenerstatningFor): 2 same-panel conditionals
 *       onskerDuASokeMenerstatningForNySkade → beskrivDenNyeSkaden + beskrivHvordan
 *   - Behandling (page5): 5 same-panel conditionals
 *       mottarDuBehandling → harDuMottattBehandling
 *       harDuMottattBehandling → anserDuDeg
 *       mottarDuBehandling/harDuMottattBehandling → behandlere container
 *       harDuFattUtredning → sykehusOgSpesialister datagrid
 *       harEtForsikringsselskap → navnPaForsikringsselskapet
 *   - Yrkessykdom (page6): 2 same-panel conditionals
 *       harDuYrkessykdom → erDuFortsattUtsatt
 *       erDuFortsattUtsatt → narOpphorteDenSkadeligePavirkningen (monthPicker)
 *   - Vedlegg (vedlegg): 1 cross-panel conditional from page5
 *       harEtForsikringsselskapUtredetEnEllerFlereAvDineSkaderSykdommer → dokumentasjonAvUtredningFraForsikringsselskap
 */

describe('nav131705', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav131705/dineOpplysninger?sub=paper');
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

  describe('Varig skade – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav131705/varigSkadeEllerSykdomDuSokerMenerstatningFor?sub=paper');
      cy.defaultWaits();
    });

    it('shows ny skade description fields when onskerDuASoke is ja', () => {
      cy.findByRole('textbox', { name: /Beskriv den nye skaden eller sykdommen/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Beskriv hvordan du mener den nye skaden/ }).should('not.exist');

      cy.withinComponent(
        'Ønsker du å søke menerstatning for ny skade eller ny sykdom som skyldes din allerede godkjente yrkesskade eller sykdom?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );

      cy.findByRole('textbox', { name: /Beskriv den nye skaden eller sykdommen/ }).should('exist');
      cy.findByRole('textbox', { name: /Beskriv hvordan du mener den nye skaden/ }).should('exist');

      cy.withinComponent(
        'Ønsker du å søke menerstatning for ny skade eller ny sykdom som skyldes din allerede godkjente yrkesskade eller sykdom?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );

      cy.findByRole('textbox', { name: /Beskriv den nye skaden eller sykdommen/ }).should('not.exist');
    });
  });

  describe('Behandling – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav131705/page5?sub=paper');
      cy.defaultWaits();
    });

    it('shows harDuMottattBehandling when mottarDu is nei', () => {
      cy.findByLabelText('Har du mottatt behandling for yrkesskaden/-sykdommen tidligere?').should('not.exist');

      cy.withinComponent('Mottar du behandling for din yrkesskade/-sykdom?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Har du mottatt behandling for yrkesskaden/-sykdommen tidligere?').should('exist');
    });

    it('shows anserDuDeg when harDuMottattBehandling is ja', () => {
      cy.withinComponent('Mottar du behandling for din yrkesskade/-sykdom?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Anser du deg ferdig behandlet?').should('not.exist');

      cy.withinComponent('Har du mottatt behandling for yrkesskaden/-sykdommen tidligere?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Anser du deg ferdig behandlet?').should('exist');
    });

    it('shows behandlere section when mottarDu is ja', () => {
      cy.findByLabelText('Har du vært til andre behandlere som ikke er leger?').should('not.exist');

      cy.withinComponent('Mottar du behandling for din yrkesskade/-sykdom?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Har du vært til andre behandlere som ikke er leger?').should('exist');
    });

    it('shows sykehus datagrid when harDuFattUtredning is ja', () => {
      cy.findByRole('textbox', { name: 'Navn på sykehus' }).should('not.exist');

      cy.withinComponent('Har du fått utredning på sykehus eller hos annen spesialist?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Navn på sykehus' }).should('exist');
    });

    it('shows forsikringsselskap name when harEtForsikringsselskap is ja', () => {
      cy.findByRole('textbox', { name: 'Navn på forsikringsselskapet' }).should('not.exist');

      cy.withinComponent('Har et forsikringsselskap utredet én eller flere av dine skader/sykdommer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Navn på forsikringsselskapet' }).should('exist');
    });
  });

  describe('Yrkessykdom – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav131705/page6?sub=paper');
      cy.defaultWaits();
    });

    it('shows erDuFortsattUtsatt when harDuYrkessykdom is ja', () => {
      cy.findByLabelText(/Er du fortsatt utsatt for skadelig påvirkning i arbeidet/).should('not.exist');

      cy.withinComponent('Har du yrkessykdom?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText(/Er du fortsatt utsatt for skadelig påvirkning i arbeidet/).should('exist');
    });

    it('shows narOpphorteDenSkadeligePavirkningen when erDuFortsatt is nei', () => {
      cy.withinComponent('Har du yrkessykdom?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Når opphørte den skadelige påvirkningen/ }).should('not.exist');

      cy.withinComponent('Er du fortsatt utsatt for skadelig påvirkning i arbeidet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Når opphørte den skadelige påvirkningen/ }).should('exist');
    });
  });

  describe('Vedlegg – cross-panel conditional from Behandling', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav131705/page5?sub=paper');
      cy.defaultWaits();
    });

    it('shows forsikringsdokumentasjon attachment when harEtForsikringsselskap is ja', () => {
      cy.withinComponent('Har et forsikringsselskap utredet én eller flere av dine skader/sykdommer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByLabelText('Dokumentasjon av utredning fra forsikringsselskap').should('exist');
    });

    it('hides forsikringsdokumentasjon attachment when harEtForsikringsselskap is nei', () => {
      cy.withinComponent('Har et forsikringsselskap utredet én eller flere av dine skader/sykdommer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByLabelText('Dokumentasjon av utredning fra forsikringsselskap').should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav131705?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // root screen → Veiledning
      cy.clickNextStep(); // Veiledning → Dine opplysninger
    });

    it('fills required fields and verifies summary', () => {
      // Dine opplysninger – use fnr path (adresse hidden when fnr provided)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Bokommune' }).type('Oslo');
      cy.clickNextStep();

      // Varig skade eller sykdom – choose nei for ny skade (hides the two extra required textareas)
      cy.findByRole('textbox', { name: 'Hvilken skade eller sykdom er godkjent?' }).type('Hørselsskade');
      cy.withinComponent('Har du allerede fått menerstatning og søker økning?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Beskriv de varige helseplagene/ }).type('Redusert hørsel og tinnitus.');
      cy.withinComponent(
        'Ønsker du å søke menerstatning for ny skade eller ny sykdom som skyldes din allerede godkjente yrkesskade eller sykdom?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.clickNextStep();

      // Behandling – mottarDu=nei, harDuMottattBehandling=nei (no behandlere datagrid, no anserDuDeg)
      cy.withinComponent('Mottar du behandling for din yrkesskade/-sykdom?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du mottatt behandling for yrkesskaden/-sykdommen tidligere?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Er behandling eller rehabilitering planlagt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har tilstanden stabilisert seg?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Har du fått utredning på sykehus eller hos annen spesialist?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har et forsikringsselskap utredet én eller flere av dine skader/sykdommer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Yrkessykdom – nei path (erDuFortsatt and narOpphørte hidden)
      cy.withinComponent('Har du yrkessykdom?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      // Vedlegg (isAttachmentPanel=true) – use stepper; sequential Next skips this panel
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // only annenDokumentasjon shown (no forsikring attachment)
      // annenDokumentasjon has nei and leggerVedNaa options (no ettersender)
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });

      // Erklæring
      cy.findByRole('link', { name: 'Erklæring' }).click();
      cy.findByRole('checkbox', { name: /Jeg er kjent med at Nav kan innhente/ }).click();
      cy.clickNextStep(); // wizard reinserts missed attachment step
      cy.clickNextStep(); // Vedlegg → Oppsummering

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Varig skade eller sykdom du søker menerstatning for', () => {
        cy.get('dt').eq(0).should('contain.text', 'Godkjent skade eller sykdom');
        cy.get('dd').eq(0).should('contain.text', 'Hørselsskade');
      });
    });
  });
});
