/*
 * Production form tests for Søknad om sykepenger utenfor arbeidsforhold
 * Form: nav080906
 * Submission types: PAPER, DIGITAL, DIGITAL_NO_LOGIN (using PAPER)
 *
 * Panels:
 *   - Veiledning (veiledning): 2 required checkboxes, no conditionals
 *   - Dine opplysninger (dineOpplysninger): 5 conditionals
 *       identitet.harDuFodselsnummer === "nei" → adresse (custom)
 *       adresse.borDuINorge + vegadresseEllerPostboksadresse → adresseVarighet (custom)
 *       identitet.harDuFodselsnummer === "ja" → alertstripe (custom)
 *       harIkkeTelefon === true → telefonnummer hidden (simple)
 *   - Yrkesstatus (yrkesstatus): 1 simple conditional
 *       hvaErDinYrkesstatus === "annet" → hvisAnnetOppgiHva
 *   - Lønn under sykdom (lonnUnderSykdom): 7 conditionals
 *       hvaErDinYrkesstatus === "arbeidstaker" → kunForArbeidstakere (simple, cross-panel)
 *       kunForArbeidstakere.hvorUtforerDuLonnetArbeid.iNorge → arbeidsgivere (simple)
 *       datagrid: betalerDenne === "nei" → alertstripe (simple)
 *       datagrid: harDuUtfort === "ja" → navSkjemagruppe Tidsrom (simple)
 *       datagrid: jobberDuTurnus === "ja" → navSkjemagruppe1 Avspaseringsperiode (simple)
 *       non-arbeidstaker → utforerDuLonnetArbeidUtenforNorge (custom, cross-panel)
 *       utforerDuLonnetArbeidUtenforNorge === "ja" → oppgiArbeidsgivereDuJobberForUtenforNorge (custom)
 *   - Sykefravær (sykefravaer): 2 simple conditionals
 *       harDuBlittFriskmeldt === "ja" → fraOgMedDdMmAaaa1 (Friskmeldt fra og med)
 *       harDuHattFeriePermisjon === "ja" → tidsromForFeriePermisjon datagrid
 *   - Sykepenger i andre EØS-land (sykepengerIAndreEosLand): 1 simple conditional
 *       harDuMottattSykepenger === "ja" → iHvilkenLand
 *   - Vedlegg (vedlegg): isAttachmentPanel=true — 2 required attachment fields
 */

describe('nav080906', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav080906/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('hides telefonnummer when harIkkeTelefon is checked', () => {
      cy.findByLabelText('Telefonnummer').should('exist');
      cy.findByRole('checkbox', { name: /Har ikke telefon/ }).check();
      cy.findByLabelText('Telefonnummer').should('not.exist');
      cy.findByRole('checkbox', { name: /Har ikke telefon/ }).uncheck();
      cy.findByLabelText('Telefonnummer').should('exist');
    });

    it('shows adresse when harDuFodselsnummer is Nei', () => {
      cy.findByLabelText(/Bor du i Norge\?/).should('not.exist');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(/Bor du i Norge\?/).should('exist');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(/Bor du i Norge\?/).should('not.exist');
    });
  });

  describe('Yrkesstatus conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav080906/yrkesstatus?sub=paper');
      cy.defaultWaits();
    });

    it('shows hvisAnnetOppgiHva when Annet is checked', () => {
      cy.findByRole('textbox', { name: 'Hvis annet, oppgi hva' }).should('not.exist');
      cy.findByRole('checkbox', { name: 'Annet' }).check();
      cy.findByRole('textbox', { name: 'Hvis annet, oppgi hva' }).should('exist');
      cy.findByRole('checkbox', { name: 'Annet' }).uncheck();
      cy.findByRole('textbox', { name: 'Hvis annet, oppgi hva' }).should('not.exist');
    });
  });

  describe('Lønn under sykdom — arbeidstaker flow', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav080906/yrkesstatus?sub=paper');
      cy.defaultWaits();
    });

    it('shows arbeidstaker fields and inner datagrid conditionals', () => {
      cy.findByRole('checkbox', { name: 'Arbeidstaker' }).check();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Lønn under sykdom' }).click();

      // kunForArbeidstakere shows → check iNorge to show arbeidsgivere datagrid
      cy.findByRole('group', { name: 'Hvor utfører du lønnet arbeid?' }).within(() => {
        cy.findByRole('checkbox', { name: 'I Norge' }).check();
      });
      cy.findByRole('textbox', { name: 'Navn på arbeidsgiver' }).should('exist');

      // Inner conditional: harDuUtfort === Ja → navSkjemagruppe (Tidsrom for arbeidet)
      cy.withinComponent(/Har du utført eller kommer du til å utføre arbeid for denne arbeidsgiveren/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Fra og med (dd.mm.åååå)' }).should('exist');

      // Inner conditional: jobberDuTurnus === Ja → navSkjemagruppe1 (Når var siste avspaseringsperiode?)
      cy.withinComponent('Jobber du turnus/rotasjon for denne arbeidsgiveren?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('exist');
    });
  });

  describe('Lønn under sykdom — non-arbeidstaker flow', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav080906/yrkesstatus?sub=paper');
      cy.defaultWaits();
    });

    it('shows utforerDuLonnetArbeid for frilanser and oppgiArbeidsgiver when Ja', () => {
      cy.findByRole('checkbox', { name: 'Frilanser' }).check();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Lønn under sykdom' }).click();

      cy.findByLabelText('Utfører du lønnet arbeid utenfor Norge?').should('exist');
      cy.findByRole('textbox', { name: /Oppgi nærmere opplysninger/ }).should('not.exist');

      cy.withinComponent('Utfører du lønnet arbeid utenfor Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Oppgi nærmere opplysninger/ }).should('exist');
    });
  });

  describe('Sykefravær conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav080906/sykefravaer?sub=paper');
      cy.defaultWaits();
    });

    it('shows friskmeldt date when harDuBlittFriskmeldt is Ja', () => {
      cy.findByRole('textbox', { name: 'Friskmeldt fra og med (dd.mm.åååå)' }).should('not.exist');
      cy.withinComponent('Har du blitt friskmeldt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Friskmeldt fra og med (dd.mm.åååå)' }).should('exist');
      cy.withinComponent('Har du blitt friskmeldt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Friskmeldt fra og med (dd.mm.åååå)' }).should('not.exist');
    });

    it('shows tidsrom datagrid when ferie/permisjon is Ja', () => {
      cy.findAllByRole('textbox', { name: 'Fra og med (dd.mm.åååå)' }).should('have.length', 1);
      cy.withinComponent(/Har du hatt eller kommer du til å ha ferie eller permisjon/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findAllByRole('textbox', { name: 'Fra og med (dd.mm.åååå)' }).should('have.length.at.least', 2);
      cy.withinComponent(/Har du hatt eller kommer du til å ha ferie eller permisjon/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findAllByRole('textbox', { name: 'Fra og med (dd.mm.åååå)' }).should('have.length', 1);
    });
  });

  describe('Sykepenger i andre EØS-land conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav080906/sykepengerIAndreEosLand?sub=paper');
      cy.defaultWaits();
    });

    it('shows iHvilkenLand when harDuMottattSykepenger is Ja', () => {
      cy.findByRole('combobox', { name: 'I hvilket land?' }).should('not.exist');
      cy.withinComponent(/Har du mottatt sykepenger eller lignende i andre EØS-land/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('combobox', { name: 'I hvilket land?' }).should('exist');
      cy.withinComponent(/Har du mottatt sykepenger eller lignende i andre EØS-land/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('combobox', { name: 'I hvilket land?' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav080906?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields across all panels and verifies summary', () => {
      // Veiledning
      cy.findByRole('checkbox', { name: /Jeg vet at jeg kan miste retten til sykepenger/ }).check();
      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig/ }).check();
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Yrkesstatus — choose Arbeidsledig so utforerDuLonnetArbeidUtenforNorge shows on next panel
      cy.findByRole('checkbox', { name: 'Arbeidsledig' }).check();
      cy.clickNextStep();

      // Lønn under sykdom — Arbeidsledig: utforerDuLonnetArbeidUtenforNorge is visible
      cy.withinComponent('Utfører du lønnet arbeid utenfor Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Sykefravær
      cy.findByRole('textbox', { name: 'Oppgi første fraværsdag på grunn av sykdom/skade (dd.mm.åååå)' }).type(
        '01.01.2025',
      );
      cy.findAllByRole('textbox', { name: 'Fra og med (dd.mm.åååå)' }).first().type('01.01.2025');
      cy.findAllByRole('textbox', { name: 'Til og med (dd.mm.åååå)' }).first().type('31.01.2025');
      cy.withinComponent('Har du blitt friskmeldt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(/Har du hatt eller kommer du til å ha ferie eller permisjon/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Sykepenger i andre EØS-land
      cy.withinComponent(/Har du mottatt sykepenger eller lignende i andre EØS-land/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // Vedlegg via stepper (isAttachmentPanel: true — Case A: last panel before Oppsummering)
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Sykemelding fra utenlandsk lege/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender/i }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/i }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Yrkesstatus', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hva er din yrkesstatus?');
        cy.get('dd').eq(0).should('contain.text', 'Arbeidsledig');
      });
      cy.withinSummaryGroup('Sykefravær', () => {
        cy.get('dt').eq(0).should('contain.text', 'Oppgi første fraværsdag');
        cy.get('dd').eq(0).should('contain.text', '01.01.2025');
      });
    });
  });
});
