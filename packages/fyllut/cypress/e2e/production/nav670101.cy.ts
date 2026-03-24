/*
 * Production form tests for Søknad om lønnsgarantidekning - melding av lønnskrav m.v. til konkursboet
 * Form: nav670101
 * Submission types: none
 *
 * Panels tested:
 *   - Dine opplysninger (personopplysninger): 8 same-panel conditionals
 *       harDuNorskFodselsnummerEllerDNummer → fodselsnummerDNummerSoker / fodselsdatoDdMmAaaaSoker
 *       borDuINorge → vegadresseEllerPostboksadresse / navSkjemagruppeUtland
 *       vegadresseEllerPostboksadresse → navSkjemagruppeVegadresse / navSkjemagruppePostboksadresse
 *       harIkkeEPost → ePostadresse (hidden)
 *       harDuNorskEllerUtenlandskKonto → kontoNummer / iban / swift
 *       onskerDuITilleggAOpplyseOmHvilkenSkattetabellDuHarHatt → oppgiDinSkattetabell
 *       harDuAndrePliktigeTrekkITilleggTilSkattetrekk → pliktigTrekkUtenomSkattetrekk
 *   - Opplysninger om arbeidsforhold (opplysningeromarbeidsforhold): 4 same-panel conditionals
 *       avtaltLonnPer → avtaltAntallTimerPerUke
 *       harDuMottattLonnFraArbeidsgiverenDinIPeriodenDuHarVaertAnsatt → mottattLonnFraOgMedDatoDdMmAaaa / mottattLonnTilOgMedDatoDdMmAaaa
 *       harDineLonnsEllerArbeidsvilkarBlittEndretITidenForKonkursapning → oppgiDatoForSisteEndringDdMmAaaa / hvaSlagsEndringHarDuHattILonnsEllerArbeidsvilkareneDine
 *   - Feriepenger og ferieavvikling (feriepengerogferieavvikling): 4 same-panel conditionals
 *       harDuAvvikletFerieEllerKommerDuTilAAvvikleFerieIDenPeriodenDuSokerDekketLonnFor → ferieperiodeR
 *       harDuHoyereProsentsatsEnnDetSomFolgerAvFerieloven10Nr2 → alertstripe1 / oppgiProsentsats
 *       harDuOverfortFeriedagerFraTidligereAr → hvorMangeFeriedagerErOverfortFraTidligereAr
 *   - Lønns- og feriepengekrav mv. (lonnsogferiepengekrav): 4 same-panel conditionals
 *       hvaSlagsKravOnskerDuASendeInn → fastBruttolonn / annetArbeidsvederlag / feriepenger / andreKrav
 *   - Fradrag for andre inntekter i søknadsperioden (fradragforandreinntekterisoknadsperioden): 7 same-panel conditionals
 *       harDuHattAndreInntekterISoknadsperioden → hvaSlagsInntektHarDuHattISoknadsperioden
 *       hvaSlagsInntektHarDuHattISoknadsperioden → navSkjemagruppe2-7
 */

const fillVeiledning = () => {
  cy.findByRole('textbox', { name: 'Hva er navnet på virksomheten som har gått konkurs?' }).type('Testbo AS');
  cy.clickNextStep();
};

const fillPersonopplysninger = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
  cy.withinComponent('Bor du i Norge?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).type('Testgata 1');
  cy.findByRole('textbox', { name: 'Land' }).type('Sverige');
  cy.findByLabelText('Telefonnummer').type('12345678');
  cy.findByRole('textbox', { name: /e-postadresse/i }).type('test@example.com');
  cy.findByRole('textbox', { name: 'Bostedskommune' }).type('Oslo');
  cy.withinComponent('Har du norsk eller utenlandsk bankkonto?', () => {
    cy.findByRole('radio', { name: 'Norsk' }).click();
  });
  cy.findByLabelText('Kontonummer').type('01234567892');
  cy.findByRole('textbox', { name: 'Oppgi prosenttrekket ditt' }).type('30');
  cy.withinComponent('Ønsker du i tillegg å opplyse om hvilken skattetabell du har hatt?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Har du andre pliktige trekk i tillegg til skattetrekk?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.clickNextStep();
};

const fillArbeidsforhold = () => {
  cy.findByRole('textbox', { name: 'Hva var stillingen din i virksomheten?' }).type('Butikkmedarbeider');
  cy.findByRole('textbox', { name: /Fra hvilken dato ble du ansatt/ }).type('01.01.2020');
  cy.findByRole('textbox', { name: /Hvilken dato mottok du oppsigelsen/ }).type('15.01.2025');
  cy.findByRole('textbox', { name: 'Oppgi lengden på oppsigelsestiden din.' }).type('1 måned');
  cy.withinComponent('Har du tariffavtale om oppsigelsestid?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.findByLabelText('Avtalt lønn').type('45000');
  cy.findByRole('group', { name: 'Avtalt lønn per' }).within(() => {
    cy.findByRole('checkbox', { name: 'Uke' }).check();
  });
  cy.findByRole('textbox', { name: 'Avtalt lønningsdato' }).type('Den 15. hver måned');
  cy.withinComponent('Har du mottatt lønn fra arbeidsgiveren din i perioden du har vært ansatt?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.withinComponent('Har dine lønns- eller arbeidsvilkår blitt endret i tiden før konkursåpning?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.clickNextStep();
};

const fillFeriepenger = () => {
  cy.withinComponent(
    'Har du avviklet ferie eller kommer du til å avvikle ferie i den perioden du søker dekket lønn for?',
    () => {
      cy.findByRole('radio', { name: 'Nei' }).click();
    },
  );
  cy.withinComponent('Har du høyere prosentsats på feriepenger enn det som følger av ferieloven § 10 nr. 2?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.findByLabelText('Hvor mange feriedager har du avviklet i år?').type('10');
  cy.withinComponent('Har du overført feriedager fra tidligere år?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.clickNextStep();
};

const fillLonnskrav = () => {
  cy.findByRole('group', { name: 'Hva slags krav ønsker du å sende inn?' }).within(() => {
    cy.findByRole('checkbox', { name: 'Feriepenger' }).check();
  });
  cy.findByLabelText('Feriepengekrav').type('12000');
  cy.findByRole('textbox', { name: /Opptjent fra og med dato/ }).type('01.01.2024');
  cy.findByRole('textbox', { name: /Opptjent til og med dato/ }).type('31.12.2024');
  cy.clickNextStep();
};

const fillErklaringAndVedlegg = () => {
  cy.findByRole('checkbox', {
    name: /Jeg bekrefter at opplysningene etter min oppfatning er korrekte/i,
  }).click();
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: 'Vedlegg' }).click();
  cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
    cy.findByRole('radio', { name: /Nei/ }).click();
  });
  cy.clickNextStep();
};

describe('nav670101', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav670101/personopplysninger');
      cy.defaultWaits();
    });

    it('toggles identity and address fields across Norwegian and foreign address paths', () => {
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('not.exist');
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('exist');
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).should('not.exist');

      cy.withinComponent('Er kontaktadressen din en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Er kontaktadressen din en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Postboksadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('not.exist');
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
    });

    it('toggles email, bank, tax table and pliktig trekk fields', () => {
      cy.findByRole('textbox', { name: /e-postadresse/i }).should('exist');
      cy.findByLabelText('Kontonummer').should('not.exist');
      cy.findByLabelText('IBAN').should('not.exist');
      cy.findByRole('textbox', { name: 'SWIFT' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Oppgi din skattetabell' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Type trekk' }).should('not.exist');

      cy.findByRole('checkbox', { name: /Jeg har ikke e-postadresse/ }).click();
      cy.findByRole('textbox', { name: /e-postadresse/i }).should('not.exist');

      cy.withinComponent('Har du norsk eller utenlandsk bankkonto?', () => {
        cy.findByRole('radio', { name: 'Norsk' }).click();
      });
      cy.findByLabelText('Kontonummer').should('exist');
      cy.findByLabelText('IBAN').should('not.exist');
      cy.findByRole('textbox', { name: 'SWIFT' }).should('not.exist');

      cy.withinComponent('Har du norsk eller utenlandsk bankkonto?', () => {
        cy.findByRole('radio', { name: 'Utenlandsk' }).click();
      });
      cy.findByLabelText('Kontonummer').should('not.exist');
      cy.findByLabelText('IBAN').should('exist');
      cy.findByRole('textbox', { name: 'SWIFT' }).should('exist');

      cy.withinComponent('Ønsker du i tillegg å opplyse om hvilken skattetabell du har hatt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Oppgi din skattetabell' }).should('exist');

      cy.withinComponent('Har du andre pliktige trekk i tillegg til skattetrekk?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Type trekk' }).should('exist');
      cy.findByLabelText('Beløp').should('exist');

      cy.withinComponent('Har du andre pliktige trekk i tillegg til skattetrekk?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Type trekk' }).should('not.exist');
      cy.findByLabelText('Beløp').should('not.exist');
    });
  });

  describe('Opplysninger om arbeidsforhold conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav670101/opplysningeromarbeidsforhold');
      cy.defaultWaits();
    });

    it('toggles hourly and employment-change follow-up fields', () => {
      cy.findByLabelText('Avtalt antall timer per uke').should('not.exist');
      cy.findByRole('textbox', { name: /Mottatt lønn fra og med dato/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Oppgi dato for siste endring/ }).should('not.exist');

      cy.findByRole('group', { name: 'Avtalt lønn per' }).within(() => {
        cy.findByRole('checkbox', { name: 'Time' }).check();
      });
      cy.findByLabelText('Avtalt antall timer per uke').should('exist');

      cy.findByRole('group', { name: 'Avtalt lønn per' }).within(() => {
        cy.findByRole('checkbox', { name: 'Time' }).uncheck();
        cy.findByRole('checkbox', { name: 'Måned' }).check();
      });
      cy.findByLabelText('Avtalt antall timer per uke').should('not.exist');

      cy.withinComponent('Har du mottatt lønn fra arbeidsgiveren din i perioden du har vært ansatt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Mottatt lønn fra og med dato/ }).should('exist');
      cy.findByRole('textbox', { name: /Mottatt lønn til og med dato/ }).should('exist');

      cy.withinComponent('Har du mottatt lønn fra arbeidsgiveren din i perioden du har vært ansatt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Mottatt lønn fra og med dato/ }).should('not.exist');

      cy.withinComponent('Har dine lønns- eller arbeidsvilkår blitt endret i tiden før konkursåpning?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Oppgi dato for siste endring/ }).should('exist');
      cy.findByRole('textbox', { name: /Hva slags endring har du hatt/ }).should('exist');

      cy.withinComponent('Har dine lønns- eller arbeidsvilkår blitt endret i tiden før konkursåpning?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Oppgi dato for siste endring/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Hva slags endring har du hatt/ }).should('not.exist');
    });
  });

  describe('Feriepenger og ferieavvikling conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav670101/feriepengerogferieavvikling');
      cy.defaultWaits();
    });

    it('toggles ferieperiode, alertstripe/prosentsats and transferred-day fields', () => {
      cy.findByRole('textbox', { name: /Fra dato/ }).should('not.exist');
      cy.findByText(
        'Du må legge frem dokumentasjon som viser at du har krav på feriepenger med en høyere sats.',
      ).should('not.exist');
      cy.findByLabelText('Oppgi prosentsats').should('not.exist');
      cy.findByLabelText('Hvor mange feriedager er overført fra tidligere år?').should('not.exist');

      cy.withinComponent(
        'Har du avviklet ferie eller kommer du til å avvikle ferie i den perioden du søker dekket lønn for?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.findByRole('textbox', { name: /Fra dato/ }).should('exist');
      cy.findByRole('textbox', { name: /Til dato/ }).should('exist');

      cy.withinComponent(
        'Har du høyere prosentsats på feriepenger enn det som følger av ferieloven § 10 nr. 2?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.findByText(
        'Du må legge frem dokumentasjon som viser at du har krav på feriepenger med en høyere sats.',
      ).should('exist');
      cy.findByLabelText('Oppgi prosentsats').should('exist');

      cy.withinComponent('Har du overført feriedager fra tidligere år?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Hvor mange feriedager er overført fra tidligere år?').should('exist');
    });
  });

  describe('Lønns- og feriepengekrav mv. conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav670101/lonnsogferiepengekrav');
      cy.defaultWaits();
    });

    it('toggles claim-specific datagrids for selected selectboxes options', () => {
      cy.findByRole('button', { name: 'Legg til flere lønnsperioder' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Forklaring/spesifisering av arbeidsvederlaget' }).should('not.exist');
      cy.findByLabelText('Feriepengekrav').should('not.exist');
      cy.findByRole('textbox', { name: 'Forklaring/spesifisering av kravet' }).should('not.exist');

      cy.findByRole('group', { name: 'Hva slags krav ønsker du å sende inn?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Lønn' }).check();
      });
      cy.findByRole('button', { name: 'Legg til flere lønnsperioder' }).should('exist');

      cy.findByRole('group', { name: 'Hva slags krav ønsker du å sende inn?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Lønn' }).uncheck();
        cy.findByRole('checkbox', { name: 'Annet arbeidsvederlag' }).check();
      });
      cy.findByRole('button', { name: 'Legg til flere lønnsperioder' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Forklaring/spesifisering av arbeidsvederlaget' }).should('exist');

      cy.findByRole('group', { name: 'Hva slags krav ønsker du å sende inn?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Annet arbeidsvederlag' }).uncheck();
        cy.findByRole('checkbox', { name: 'Feriepenger' }).check();
      });
      cy.findByRole('textbox', { name: 'Forklaring/spesifisering av arbeidsvederlaget' }).should('not.exist');
      cy.findByLabelText('Feriepengekrav').should('exist');

      cy.findByRole('group', { name: 'Hva slags krav ønsker du å sende inn?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Feriepenger' }).uncheck();
        cy.findByRole('checkbox', { name: 'Andre krav' }).check();
      });
      cy.findByLabelText('Feriepengekrav').should('not.exist');
      cy.findByRole('textbox', { name: 'Forklaring/spesifisering av kravet' }).should('exist');
    });
  });

  describe('Fradrag for andre inntekter i søknadsperioden conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav670101/fradragforandreinntekterisoknadsperioden');
      cy.defaultWaits();
    });

    it('toggles income groups from the parent radiopanel and selectboxes options', () => {
      cy.findByRole('group', { name: 'Hva slags inntekt har du hatt i søknadsperioden?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hva slags ytelse?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hva slags inntekt eller ytelse?' }).should('not.exist');

      cy.withinComponent('Har du hatt andre inntekter i søknadsperioden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('group', { name: 'Hva slags inntekt har du hatt i søknadsperioden?' }).should('exist');

      cy.findByRole('group', { name: 'Hva slags inntekt har du hatt i søknadsperioden?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Andre ytelser fra NAV' }).check();
        cy.findByRole('checkbox', { name: 'Eventuelle andre inntekter eller ytelser' }).check();
      });
      cy.findByRole('textbox', { name: 'Hva slags ytelse?' }).should('exist');
      cy.findByRole('textbox', { name: 'Hva slags inntekt eller ytelse?' }).should('exist');

      cy.findByRole('group', { name: 'Hva slags inntekt har du hatt i søknadsperioden?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Andre ytelser fra NAV' }).uncheck();
      });
      cy.findByRole('textbox', { name: 'Hva slags ytelse?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hva slags inntekt eller ytelse?' }).should('exist');

      cy.withinComponent('Har du hatt andre inntekter i søknadsperioden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('group', { name: 'Hva slags inntekt har du hatt i søknadsperioden?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hva slags inntekt eller ytelse?' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav670101/veiledning');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary', () => {
      fillVeiledning();
      fillPersonopplysninger();
      fillArbeidsforhold();
      fillFeriepenger();

      cy.withinComponent('Har du hatt eierandeler i virksomheten i hele eller deler av søknadsperioden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.withinComponent('Har du hatt en ledende stilling i virksomheten i søknadsperioden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du vært styremedlem i virksomheten i søknadsperioden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(
        'Har noen du har en nær relasjon til hatt eierandeler, en ledende stilling eller vært styremedlem i virksomheten?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.withinComponent('Har du tidligere fått lønnsgarantidekning i andre konkursbo?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.withinComponent(
        'Er kravet ditt helt eller delvis overdratt av eller på annen måte gått over til andre?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.clickNextStep();

      cy.withinComponent('Har du vært sykmeldt i hele eller deler av søknadsperioden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du vært permittert i hele eller deler av søknadsperioden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du hatt lønnet foreldrepermisjon i hele eller deler av søknadsperioden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du meldt deg for NAV som arbeidssøker?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', {
        name: 'Forklar årsaken til at du ikke har meldt deg for NAV som arbeidssøker',
      }).type('Var fortsatt i oppsigelsestiden.');
      cy.withinComponent('Har du allerede fått, eller regner du med å få arbeid igjen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      fillLonnskrav();

      cy.withinComponent('Har du hatt utgifter i forbindelse med konkursbegjæringen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.withinComponent('Har du hatt andre inntekter i søknadsperioden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.clickNextStep();
      fillErklaringAndVedlegg();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
        cy.contains('dt', 'Kontonummer').next('dd').should('contain.text', '0123 45 67892');
      });
      cy.withinSummaryGroup('Lønns- og feriepengekrav mv.', () => {
        cy.contains('dt', 'Hva slags krav ønsker du å sende inn?').next('dd').should('contain.text', 'Feriepenger');
        cy.contains('dt', 'Feriepengekrav').next('dd').should('contain.text', '12');
      });
    });
  });
});
