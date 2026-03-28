/*
 * Production form tests for Inntektsopplysninger for selvstendig næringsdrivende og/eller frilansere
 * Form: nav083501
 * Submission types: PAPER, DIGITAL — using PAPER
 *
 * Panels (10):
 *   1. Veiledning (veiledning): no conditionals, no required fields
 *   2. Dine opplysninger (dineOpplysninger): 4 customConditionals
 *       identitet.harDuFodselsnummer → adresse (show when "nei")        [custom]
 *       adresse.borDuINorge → adresseVarighet (show when "nei")         [custom]
 *       identitet.harDuFodselsnummer → alertstripe (show when "ja")     [custom]
 *       identitet.identitetsnummer && !harDuFodselsnummer → alertstripePrefill [custom — prefill only]
 *   3. Egenerklæring (egenerklaering): no conditionals, 2 required checkboxes
 *   4. Sykefravær (sykefravaer): no conditionals, 1 required datepicker
 *   5. Type virksomhet (typeVirksomhet): 2 simple + panel-level conditionals
 *       hvaSlagsVirksomhetDriverDu === 'selvstendigNaeringsdrivende' → hvaSlagsSelvstendigNaeringsvirksomhetDriverDu
 *       hvaSlagsSelvstendigNaeringsvirksomhetDriverDu === 'annenVirksomhet' → spesifiserAnnenVirksomhet
 *       hvaSlagsVirksomhetDriverDu === 'selvstendigNaeringsdrivende' → panel opplysningerOmDenSelvstendigeVirksomheten
 *       hvaSlagsVirksomhetDriverDu === 'selvstendigNaeringsdrivende' → panel tilleggsopplysningerForSelvstendigNaeringsdrivende
 *       hvaSlagsVirksomhetDriverDu === 'selvstendigNaeringsdrivende' → harDuDokumentasjonDuOnskerALeggeVedSoknaden (andreOpplysninger)
 *       hvaSlagsVirksomhetDriverDu === 'frilanser' → panel tilleggsopplysningerForFrilanser
 *   6. Opplysninger om den selvstendige virksomheten (opplysningerOmDenSelvstendigeVirksomheten):
 *       harDetVaertDriftIVirksomhetenFremTilDuBleSykmeldt === 'nei' → datoForNarDriftenOpphorteDdMmAaaa
 *       vilDuFortsattHaNaeringsinntektMensDuErSykmeldt === 'ja' → oppgiAntattNaeringsinntekt (currency)
 *       erVirksomhetenRegistrertINorge === 'nei' → landvelger
 *   7. Tilleggsopplysninger for selvstendig næringsdrivende (tilleggsopplysningerForSelvstendigNaeringsdrivende):
 *       harDuFattEnVarigEndring... === 'ja' → beskrivEndringen + inntektEtterEndringen (currency)
 *   8. Tilleggsopplysninger for frilanser (tilleggsopplysningerForFrilanser): panel-level conditional only
 *   9. Andre opplysninger (andreOpplysninger): 2 simple + 1 both (test custom only)
 *       andreOpplysningerDuMenerErViktige... === 'ja' → andreViktigeOpplysninger
 *       harDuDokumentasjonDuOnskerALeggeVedSoknaden === 'ja' → hvaOnskerDuALeggeVed [custom tested]
 *  10. Vedlegg (vedlegg): isAttachmentPanel=true (last panel); use stepper + 1×clickNextStep
 *       hvaOnskerDuALeggeVed === 'personinntektsskjema' → personinntektsskjema1 attachment
 *       hvaOnskerDuALeggeVed === 'resultatregnskap' → resultatregnskap1 attachment
 *       hvaOnskerDuALeggeVed === 'naeringsoppgave' → naeringsoppgave1 attachment
 *       annenDokumentasjon: always visible
 */

const checkSelvstendigNaeringsdrivende = () => {
  cy.findByRole('group', { name: 'Hva slags virksomhet driver du?' }).within(() => {
    cy.findByRole('checkbox', { name: 'Selvstendig næringsdrivende' }).check();
  });
};

describe('nav083501', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  // ─── Dine opplysninger (identity conditionals) ────────────────────────────

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083501/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows adresse section when user has no fnr', () => {
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

    it('shows alertstripe when user has fnr', () => {
      cy.findByText(/Nav sender svar/).should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByText(/Nav sender svar/).should('exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByText(/Nav sender svar/).should('not.exist');
    });

    it('shows adresseVarighet date fields when living abroad', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('exist');

      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');
    });
  });

  // ─── Type virksomhet (same-panel + panel-level conditionals) ──────────────

  describe('Type virksomhet – same-panel and panel-level conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083501/typeVirksomhet?sub=paper');
      cy.defaultWaits();
    });

    it('shows selvstendig næringsvirksomhet types and panels when selvstendigNaeringsdrivende checked', () => {
      cy.findByLabelText('Hva slags selvstendig næringsvirksomhet driver du?').should('not.exist');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Opplysninger om den selvstendige virksomheten' }).should('not.exist');
      cy.findByRole('link', { name: 'Tilleggsopplysninger for selvstendig næringsdrivende' }).should('not.exist');

      checkSelvstendigNaeringsdrivende();

      cy.findByLabelText('Hva slags selvstendig næringsvirksomhet driver du?').should('exist');
      cy.findByRole('link', { name: 'Opplysninger om den selvstendige virksomheten' }).should('exist');
      cy.findByRole('link', { name: 'Tilleggsopplysninger for selvstendig næringsdrivende' }).should('exist');

      cy.findByRole('group', { name: 'Hva slags virksomhet driver du?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Selvstendig næringsdrivende' }).uncheck();
      });

      cy.findByLabelText('Hva slags selvstendig næringsvirksomhet driver du?').should('not.exist');
      cy.findByRole('link', { name: 'Opplysninger om den selvstendige virksomheten' }).should('not.exist');
    });

    it('shows frilanser panel when frilanser checked', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Tilleggsopplysninger for frilanser' }).should('not.exist');

      cy.findByRole('group', { name: 'Hva slags virksomhet driver du?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Frilanser' }).check();
      });

      cy.findByRole('link', { name: 'Tilleggsopplysninger for frilanser' }).should('exist');

      cy.findByRole('group', { name: 'Hva slags virksomhet driver du?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Frilanser' }).uncheck();
      });

      cy.findByRole('link', { name: 'Tilleggsopplysninger for frilanser' }).should('not.exist');
    });

    it('shows spesifiserAnnenVirksomhet when annenVirksomhet selected', () => {
      checkSelvstendigNaeringsdrivende();
      cy.findByRole('textbox', { name: 'Spesifiser annen virksomhet' }).should('not.exist');

      cy.findByRole('group', { name: /Hva slags selvstendig næringsvirksomhet/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Annen virksomhet' }).check();
      });

      cy.findByRole('textbox', { name: 'Spesifiser annen virksomhet' }).should('exist');

      cy.findByRole('group', { name: /Hva slags selvstendig næringsvirksomhet/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Annen virksomhet' }).uncheck();
      });

      cy.findByRole('textbox', { name: 'Spesifiser annen virksomhet' }).should('not.exist');
    });
  });

  // ─── Opplysninger om den selvstendige virksomheten (panel-level conditional) ─

  describe('Opplysninger om den selvstendige virksomheten – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083501/typeVirksomhet?sub=paper');
      cy.defaultWaits();
      checkSelvstendigNaeringsdrivende();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Opplysninger om den selvstendige virksomheten' }).click();
    });

    it('shows datoForNarDriftenOpphørte when drift opphørte', () => {
      cy.findByRole('textbox', { name: 'Dato for når driften opphørte (dd.mm.åååå)' }).should('not.exist');

      cy.withinComponent(/Har det vært drift i virksomheten frem til du ble\s+sykmeldt/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Dato for når driften opphørte (dd.mm.åååå)' }).should('exist');

      cy.withinComponent(/Har det vært drift i virksomheten frem til du ble\s+sykmeldt/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Dato for når driften opphørte (dd.mm.åååå)' }).should('not.exist');
    });

    it('shows antatt naeringsinntekt when vil fortsatt ha naeringsinntekt', () => {
      cy.findByRole('textbox', { name: 'Antatt overskudd i næring per måned' }).should('not.exist');

      cy.withinComponent(/Vil du fortsatt ha næringsinntekt mens du er sykmeldt/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Antatt overskudd i næring per måned' }).should('exist');

      cy.withinComponent(/Vil du fortsatt ha næringsinntekt mens du er sykmeldt/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Antatt overskudd i næring per måned' }).should('not.exist');
    });

    it('shows landvelger when virksomhet ikke registrert i Norge', () => {
      cy.findByLabelText('Hvilket annet land er virksomheten registrert i?').should('not.exist');

      cy.withinComponent('Er virksomheten registrert i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Hvilket annet land er virksomheten registrert i?').should('exist');

      cy.withinComponent('Er virksomheten registrert i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Hvilket annet land er virksomheten registrert i?').should('not.exist');
    });
  });

  // ─── Tilleggsopplysninger for selvstendig næringsdrivende (panel-level) ───

  describe('Tilleggsopplysninger for selvstendig næringsdrivende – conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083501/typeVirksomhet?sub=paper');
      cy.defaultWaits();
      checkSelvstendigNaeringsdrivende();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Tilleggsopplysninger for selvstendig næringsdrivende' }).click();
    });

    it('shows beskrivEndringen and inntektEtterEndringen when varig endring', () => {
      cy.findByRole('textbox', { name: 'Beskriv endringen her' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Årsinntekt etter endringen' }).should('not.exist');

      cy.withinComponent(
        'Har du fått en varig endring av arbeidssituasjonen/virksomheten i løpet av de siste fire årene?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );

      cy.findByRole('textbox', { name: 'Beskriv endringen her' }).should('exist');
      cy.findByRole('textbox', { name: 'Årsinntekt etter endringen' }).should('exist');

      cy.withinComponent(
        'Har du fått en varig endring av arbeidssituasjonen/virksomheten i løpet av de siste fire årene?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );

      cy.findByRole('textbox', { name: 'Beskriv endringen her' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Årsinntekt etter endringen' }).should('not.exist');
    });
  });

  // ─── Andre opplysninger – same-panel conditionals ─────────────────────────
  // Navigate via typeVirksomhet → stepper to avoid direct-panel rendering quirks.

  describe('Andre opplysninger – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083501/typeVirksomhet?sub=paper');
      cy.defaultWaits();
      checkSelvstendigNaeringsdrivende();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Andre opplysninger' }).click();
    });

    it('shows andreViktigeOpplysninger when ja', () => {
      cy.findByRole('textbox', { name: 'Andre viktige opplysninger' }).should('not.exist');

      cy.withinComponent(
        'Har du andre opplysninger du mener er viktige når NAV skal fastsette sykepengegrunnlaget ditt?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );

      cy.findByRole('textbox', { name: 'Andre viktige opplysninger' }).should('exist');

      cy.withinComponent(
        'Har du andre opplysninger du mener er viktige når NAV skal fastsette sykepengegrunnlaget ditt?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );

      cy.findByRole('textbox', { name: 'Andre viktige opplysninger' }).should('not.exist');
    });
  });

  // ─── Andre opplysninger – cross-panel + hvaOnskerDuALeggeVed conditional ─

  describe('Andre opplysninger – cross-panel and hvaOnskerDuALeggeVed conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083501/typeVirksomhet?sub=paper');
      cy.defaultWaits();
      checkSelvstendigNaeringsdrivende();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Andre opplysninger' }).click();
    });

    it('shows harDuDokumentasjonDuOnskerALeggeVedSoknaden when selvstendigNaeringsdrivende', () => {
      cy.findByLabelText('Har du dokumentasjon du ønsker å legge ved søknaden?').should('exist');
    });

    it('shows hvaOnskerDuALeggeVed when harDuDokumentasjonDuOnskerALeggeVedSoknaden is ja (custom)', () => {
      cy.findByLabelText('Hva ønsker du å legge ved?').should('not.exist');

      cy.withinComponent('Har du dokumentasjon du ønsker å legge ved søknaden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Hva ønsker du å legge ved?').should('exist');

      cy.withinComponent('Har du dokumentasjon du ønsker å legge ved søknaden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Hva ønsker du å legge ved?').should('not.exist');
    });
  });

  // ─── Vedlegg attachment conditionals ──────────────────────────────────────
  // hvaOnskerDuALeggeVed is on andreOpplysninger, not vedlegg.
  // Navigate: typeVirksomhet → andreOpplysninger (set Ja + check option) → stepper → Vedlegg

  describe('Vedlegg – attachment conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083501/typeVirksomhet?sub=paper');
      cy.defaultWaits();
      checkSelvstendigNaeringsdrivende();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Andre opplysninger' }).click();
      cy.withinComponent('Har du dokumentasjon du ønsker å legge ved søknaden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
    });

    it('shows personinntektsskjema on Vedlegg when personinntektsskjema checked', () => {
      cy.findByRole('group', { name: /Hva ønsker du å legge ved/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Personinntektsskjema' }).check();
      });
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Personinntektsskjema/ }).should('exist');
    });

    it('shows resultatregnskap on Vedlegg when resultatregnskap checked', () => {
      cy.findByRole('group', { name: /Hva ønsker du å legge ved/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Resultatregnskap' }).check();
      });
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Resultatregnskap/ }).should('exist');
    });

    it('shows næringsoppgave on Vedlegg when næringsoppgave checked', () => {
      cy.findByRole('group', { name: /Hva ønsker du å legge ved/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Næringsoppgave' }).check();
      });
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Næringsoppgave/ }).should('exist');
    });
  });

  // ─── Summary ──────────────────────────────────────────────────────────────

  describe('Summary', () => {
    beforeEach(() => {
      // Visit first required-fields panel directly to bypass start page and info-only Veiledning
      cy.visit('/fyllut/nav083501/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary', () => {
      // Dine opplysninger – use fnr path (adresse/adresseVarighet hidden)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Egenerklæring – check both required checkboxes
      cy.findByRole('checkbox', {
        name: /Jeg plikter å gi de opplysninger/,
      }).check();
      cy.findByRole('checkbox', {
        name: /Jeg har gjort meg kjent med min plikt/,
      }).check();
      cy.clickNextStep();

      // Sykefravær – fill required date
      cy.findByRole('textbox', { name: /Oppgi dato for første sykefraværsdag/ }).type('01.01.2025');
      cy.clickNextStep();

      // Type virksomhet – check selvstendigNaeringsdrivende (shows panels 6 and 7)
      checkSelvstendigNaeringsdrivende();
      cy.findByRole('group', { name: /Hva slags selvstendig næringsvirksomhet/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Enkeltpersonforetak' }).check();
      });
      cy.withinComponent(/Har du inntekter som arbeidstaker i tillegg/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Opplysninger om den selvstendige virksomheten
      cy.findByRole('textbox', { name: 'Når startet du virksomheten din? (dd.mm.åååå)' }).type('01.01.2020');
      cy.findByRole('textbox', {
        name: 'Hva har du hatt i næringsresultat før skatt de siste 12 månedene?',
      }).type('500000');
      cy.withinComponent(/Har det vært drift i virksomheten frem til du ble\s+sykmeldt/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent(/Vil du fortsatt ha næringsinntekt mens du er sykmeldt/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Er virksomheten registrert i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      // Tilleggsopplysninger for selvstendig næringsdrivende – no varig endring
      cy.withinComponent(
        'Har du fått en varig endring av arbeidssituasjonen/virksomheten i løpet av de siste fire årene?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.clickNextStep();

      // Andre opplysninger – Nei for both (no additional info, no documentation)
      cy.withinComponent(
        'Har du andre opplysninger du mener er viktige når NAV skal fastsette sykepengegrunnlaget ditt?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.withinComponent('Har du dokumentasjon du ønsker å legge ved søknaden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // Vedlegg – isAttachmentPanel=true (last panel); sequential clickNextStep skips it — use stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });

      // ONE clickNextStep — Vedlegg is the last panel → Oppsummering
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Opplysninger om den selvstendige virksomheten', () => {
        cy.get('dt').eq(0).should('contain.text', 'Når startet du virksomheten din?');
        cy.get('dd').eq(0).should('contain.text', '01.01.2020');
      });
    });
  });
});
