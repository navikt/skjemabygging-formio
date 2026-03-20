/*
 * Production form tests for Søknad om attest PD U1/N-301 til bruk ved overføring av dagpengerettigheter
 * Form: nav040205
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (personopplysninger): 2 same-panel conditional chains
 *       harDuNorskFodselsnummerEllerDNummer → fodselsnummerDNummerSoker, statsborgerskap, harDuFlyttetFraNorge
 *       harDuFlyttetFraNorge → narFlyttetDuFraNorgeDdMmAaaa
 *       + panel-level visibility for Arbeidsforhold, Andre ytelser, Forsendelse and Vedlegg
 *   - Arbeidsforhold (arbeidsforhold): 2 panel-level conditionals and 1 cross-panel attachment conditional
 *       angiArbeidsforhold → Ansatt / Selvstendig næringsdrivende panels
 *       angiArbeidsforhold → kopiAvAlleOppdragsbekreftelser on Vedlegg
 *   - Ansatt (ansatt): 5 custom attachment conditionals triggered by one datagrid row
 *       arbeidsgiver / oppgiSluttarsak / bleDetInngattSluttavtale / harDuHattFastArbeidstid / gikkBedriftenKonkurs
 *   - Andre ytelser (andreYtelser): 1 same-panel conditional
 *       harDuMottattAndreYtelserINorge → angiAndreYtelserDuHarMottattINorge
 *   - Forsendelse (forsendelse): 1 same-panel conditional
 *       vilDuAtDinPdU1SkalSendesTilAdressenDuErRegistrertMedIFolkeregisteretINorge → oppgiOnsketAdresseForMottakAvAttest
 *   - Vedlegg (vedlegg): 1 custom date conditional
 *       hvilkenPeriodeSokerDuPdU1For.fraDatoDdMmAaaa → lonnsOgTrekkoppgaveFraAlleArDuSokerForFor2015
 */

describe('nav040205', () => {
  const fillRequestedPeriod = (fromDate: string, toDate: string) => {
    cy.findByRole('textbox', { name: 'I hvilket EØS-land skal du bruke attesten?' }).type('Sverige');
    cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).type(fromDate);
    cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).type(toDate);
  };

  const fillPersonopplysningerWithFnr = () => {
    cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
    cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
    cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
      cy.findByRole('radio', { name: 'Ja' }).click();
    });
    cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
    cy.findByRole('textbox', { name: 'Statsborgerskap' }).type('Norsk');
    cy.withinComponent('Har du flyttet fra Norge?', () => {
      cy.findByRole('radio', { name: 'Nei' }).click();
    });
  };

  const goToPanelAfterPersonopplysninger = (panelTitle: string) => {
    cy.visit('/fyllut/nav040205/personopplysninger?sub=paper');
    cy.defaultWaits();
    fillPersonopplysningerWithFnr();
    cy.clickShowAllSteps();
    cy.findByRole('link', { name: panelTitle }).click();
  };

  const goToVedleggWithDates = (fromDate: string, toDate: string) => {
    cy.visit('/fyllut/nav040205/hvaSokerDuOm?sub=paper');
    cy.defaultWaits();
    fillRequestedPeriod(fromDate, toDate);
    cy.clickNextStep();
    fillPersonopplysningerWithFnr();
    cy.clickShowAllSteps();
    cy.findByRole('link', { name: 'Vedlegg' }).click();
  };

  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040205/personopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('toggles fnr-specific fields and later panels when id answer changes', () => {
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: 'Statsborgerskap' }).should('not.exist');
      cy.findByLabelText('Har du flyttet fra Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
      cy.findByRole('textbox', { name: 'Statsborgerskap' }).should('exist');
      cy.findByLabelText('Har du flyttet fra Norge?').should('exist');

      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Statsborgerskap' }).type('Norsk');
      cy.withinComponent('Har du flyttet fra Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Arbeidsforhold' }).should('exist');
      cy.findByRole('link', { name: 'Andre ytelser' }).should('exist');
      cy.findByRole('link', { name: 'Forsendelse' }).should('exist');
      cy.findByRole('link', { name: 'Vedlegg' }).should('exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: 'Statsborgerskap' }).should('not.exist');
      cy.findByLabelText('Har du flyttet fra Norge?').should('not.exist');
    });

    it('shows move date only when user has moved from Norway', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Statsborgerskap' }).type('Norsk');
      cy.findByRole('textbox', { name: /Når flyttet du fra Norge/ }).should('not.exist');

      cy.withinComponent('Har du flyttet fra Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Når flyttet du fra Norge/ }).should('exist');

      cy.withinComponent('Har du flyttet fra Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Når flyttet du fra Norge/ }).should('not.exist');
    });
  });

  describe('Arbeidsforhold conditionals', () => {
    beforeEach(() => {
      goToPanelAfterPersonopplysninger('Arbeidsforhold');
    });

    it('toggles employee and self-employed panels from work type selection', () => {
      cy.findByRole('link', { name: 'Ansatt' }).should('not.exist');
      cy.findByRole('link', { name: 'Selvstendig næringsdrivende' }).should('not.exist');

      cy.findByRole('group', { name: 'Angi arbeidsforhold i perioden du søker for' }).within(() => {
        cy.findByRole('checkbox', { name: /^Ansatt$/ }).check();
      });
      cy.findByRole('link', { name: 'Ansatt' }).should('exist');
      cy.findByRole('link', { name: 'Selvstendig næringsdrivende' }).should('not.exist');

      cy.findByRole('group', { name: 'Angi arbeidsforhold i perioden du søker for' }).within(() => {
        cy.findByRole('checkbox', { name: /^Selvstendig næringsdrivende$/ }).check();
      });
      cy.findByRole('link', { name: 'Selvstendig næringsdrivende' }).should('exist');

      cy.findByRole('group', { name: 'Angi arbeidsforhold i perioden du søker for' }).within(() => {
        cy.findByRole('checkbox', { name: /^Ansatt$/ }).uncheck();
      });
      cy.findByRole('link', { name: 'Ansatt' }).should('not.exist');
      cy.findByRole('link', { name: 'Selvstendig næringsdrivende' }).should('exist');
    });

    it('shows the self-employed attachment only when self-employed is selected', () => {
      cy.findByRole('group', { name: 'Angi arbeidsforhold i perioden du søker for' }).within(() => {
        cy.findByRole('checkbox', { name: /^Selvstendig næringsdrivende$/ }).check();
      });
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Kopi av alle oppdragsbekreftelser/ }).should('exist');

      cy.findByRole('link', { name: 'Arbeidsforhold' }).click();
      cy.findByRole('group', { name: 'Angi arbeidsforhold i perioden du søker for' }).within(() => {
        cy.findByRole('checkbox', { name: /^Selvstendig næringsdrivende$/ }).uncheck();
        cy.findByRole('checkbox', { name: /^Ansatt$/ }).check();
      });
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Kopi av alle oppdragsbekreftelser/ }).should('not.exist');
    });
  });

  describe('Ansatt attachment conditionals', () => {
    beforeEach(() => {
      goToPanelAfterPersonopplysninger('Arbeidsforhold');
      cy.findByRole('group', { name: 'Angi arbeidsforhold i perioden du søker for' }).within(() => {
        cy.findByRole('checkbox', { name: /^Ansatt$/ }).check();
      });
      cy.clickNextStep();
    });

    it('shows employee-specific attachments for one qualifying employment row', () => {
      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).type('Test AS');
      cy.findByRole('textbox', { name: 'Adresse' }).type('Testveien 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0123');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: 'Yrke/ stilling' }).type('Utvikler');
      cy.findByRole('textbox', { name: 'Fra og med dato (dd.mm.åååå)' }).type('01.01.2023');
      cy.findByRole('textbox', { name: 'Til og med dato (dd.mm.åååå)' }).type('31.12.2023');
      cy.findByLabelText('Arbeidstimer per uke').type('37');

      cy.withinComponent('Har du hatt fast arbeidstid?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Oppgi sluttårsak', () => {
        cy.findByRole('radio', { name: 'Oppsagt' }).click();
      });
      cy.withinComponent('Ble det inngått sluttavtale?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Har du hatt permisjon eller ferie uten lønn?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du arbeidet hele oppsigelsestiden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du arbeidet rotasjon?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', {
        name: /Når var din siste faktiske arbeidsdag\/ avmønstring\? Dato/,
      }).type('31.12.2023');
      cy.withinComponent(/Har du arbeidet i flere land i denne perioden\?/i, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Gikk bedriften konkurs?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Bekreftelse på ansettelsesforhold/ }).should('exist');
      cy.findByRole('group', { name: /Kopi av alle arbeidsavtaler/ }).should('exist');
      cy.findByRole('group', { name: /Kopi av oppsigelse/ }).should('exist');
      cy.findByRole('group', { name: /Kopi av sluttavtale/ }).should('exist');
      cy.findByRole('group', {
        name: /timelister som viser de eksakte dagene du har arbeidet/i,
      }).should('exist');
      cy.findByRole('group', { name: /Alle papirer du har vedr konkursen/ }).should('exist');
    });
  });

  describe('Andre ytelser conditionals', () => {
    beforeEach(() => {
      goToPanelAfterPersonopplysninger('Andre ytelser');
    });

    it('toggles other benefits checkboxes when answer changes', () => {
      cy.findByRole('group', { name: 'Angi andre ytelser du har mottatt i Norge' }).should('not.exist');

      cy.withinComponent('Har du mottatt andre ytelser i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('group', { name: 'Angi andre ytelser du har mottatt i Norge' }).should('exist');

      cy.withinComponent('Har du mottatt andre ytelser i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('group', { name: 'Angi andre ytelser du har mottatt i Norge' }).should('not.exist');
    });
  });

  describe('Forsendelse conditionals', () => {
    beforeEach(() => {
      goToPanelAfterPersonopplysninger('Forsendelse');
    });

    it('shows and hides the alternative delivery address fields', () => {
      cy.findByRole('textbox', { name: 'Navn' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Adresse' }).should('not.exist');
      cy.findByRole('textbox', { name: /Postnummer/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Poststed' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');

      cy.withinComponent(
        'Vil du at din PD U1 skal sendes til adressen du er registrert med i folkeregisteret i Norge?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.findByRole('textbox', { name: 'Navn' }).should('exist');
      cy.findByRole('textbox', { name: 'Adresse' }).should('exist');
      cy.findByRole('textbox', { name: /Postnummer/ }).should('exist');
      cy.findByRole('textbox', { name: 'Poststed' }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');

      cy.withinComponent(
        'Vil du at din PD U1 skal sendes til adressen du er registrert med i folkeregisteret i Norge?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.findByRole('textbox', { name: 'Navn' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Adresse' }).should('not.exist');
      cy.findByRole('textbox', { name: /Postnummer/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'Poststed' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows the pre-2015 attachment when the requested period starts before 2015', () => {
      goToVedleggWithDates('11.12.2014', '31.12.2014');
      cy.findByRole('group', {
        name: /Lønns- og trekkoppgave.*før 2015/i,
      }).should('exist');
    });

    it('hides the pre-2015 attachment when the requested period starts in 2015 or later', () => {
      goToVedleggWithDates('01.01.2015', '31.12.2015');
      cy.findByRole('group', {
        name: /Lønns- og trekkoppgave.*før 2015/i,
      }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040205?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      cy.clickNextStep();

      fillRequestedPeriod('01.01.2023', '31.12.2023');
      cy.clickNextStep();

      fillPersonopplysningerWithFnr();
      cy.clickNextStep();

      cy.findByRole('group', { name: 'Angi arbeidsforhold i perioden du søker for' }).within(() => {
        cy.findByRole('checkbox', { name: /^Selvstendig næringsdrivende$/ }).check();
      });
      cy.clickNextStep();

      cy.findByRole('textbox', { name: 'Firmaets navn' }).type('Nordmann Konsult');
      cy.findByLabelText('Organisasjonsnummer').type('889640782');
      cy.findByRole('textbox', { name: 'Fra og med dato (dd.mm.åååå)' }).type('01.01.2023');
      cy.findByRole('textbox', { name: 'Til og med dato (dd.mm.åååå)' }).type('31.12.2023');
      cy.withinComponent('Gikk bedriften konkurs?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.withinComponent('Har du mottatt andre ytelser i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.withinComponent(
        'Vil du at din PD U1 skal sendes til adressen du er registrert med i folkeregisteret i Norge?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.clickNextStep();

      cy.findByRole('group', { name: /Kopi av alle oppdragsbekreftelser/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', {
          name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved',
        }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Hva søker du om?', () => {
        cy.get('dt').eq(0).should('contain.text', 'I hvilket EØS-land skal du bruke attesten?');
        cy.get('dd').eq(0).should('contain.text', 'Sverige');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Selvstendig næringsdrivende', () => {
        cy.get('dt').eq(0).should('contain.text', 'Firmaets navn');
        cy.get('dd').eq(0).should('contain.text', 'Nordmann Konsult');
      });
    });
  });
});
