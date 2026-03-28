/*
 * Production form tests for Søknad om stønad til barnetilsyn på grunn av arbeid og stønad til skolepenger til gjenlevende ektefelle/partner/ samboer og til ugift familiepleier
 * Form: nav170901
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Din situasjon (dinSituasjon): 4 cross-panel conditionals
 *       hvaSokerDuOm → branch-specific panels for barnetilsyn/arbeid/sykdom vs tidligereUtdanning/arbeidserfaring/utdanningen
 *       hvaSokerDuOm → branch-specific declaration checkbox on Erklæring
 *   - Dine opplysninger (dineOpplysninger): 8 same-panel conditionals
 *       harDuNorskFodselsnummerEllerDNummer → fnr/date + alertstripe + address questions
 *       borDuINorge / vegadresseEllerPostboksadresse → Norwegian/foreign address groups
 *   - Barnetilsyn (barnetilsyn): 4 same-panel conditionals
 *       erBarnetIBarnehagealderEllerSkolealder → klassetrinn / kontantstøtte
 *       erBarnetFerdigMedFjerdeSkolear → begrunnelse selectboxes
 *   - Arbeid (arbeid): 7 conditionals
 *       harDuFastEllerMidlertidigStilling → framtidigSluttdatoDdMmAaaa
 *       jobberDuPaHeltidEllerDeltid → prosentDeltid
 *       hvilketArbeidsforholdHarDu → arbeidsgiver fields / entrepreneur alert
 *       + cross-panel attachments on Vedlegg
 *   - Utdanningen (utdanningen): 9 conditionals
 *       deltid / videre utdanning / selected expense types / privat utdanning
 *       + cross-panel attachments on Vedlegg
 */

const selectRadio = (label: string | RegExp, option: string | RegExp) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const answerAttachment = (label: RegExp, option: string | RegExp = 'Jeg ettersender dokumentasjonen senere') => {
  cy.findByRole('group', { name: label }).within(() => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const selectApplicationType = (applicationType: 'barnetilsyn' | 'skolepenger') => {
  selectRadio(
    'Hva søker du om?',
    applicationType === 'barnetilsyn' ? 'Stønad til barnetilsyn på grunn av arbeid' : 'Stønad til skolepenger',
  );
  selectRadio(
    /Mottar du stønad til tidligere familiepleier/,
    /Ja, jeg mottar stønad til gjenlevende ektefelle, partner eller samboer/,
  );
};

const goToApplicationPanel = (applicationType: 'barnetilsyn' | 'skolepenger', panelTitle: string) => {
  cy.visit('/fyllut/nav170901/dinSituasjon?sub=paper');
  cy.defaultWaits();
  selectApplicationType(applicationType);
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: panelTitle }).click();
};

const advancePastStartPanels = () => {
  cy.get('#page-title')
    .invoke('text')
    .then((title) => {
      const normalizedTitle = title.trim();

      if (normalizedTitle === 'Introduksjon' || normalizedTitle === 'Veiledning') {
        cy.clickNextStep();
        advancePastStartPanels();
      }
    });
};

describe('nav170901', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Din situasjon conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav170901/dinSituasjon?sub=paper');
      cy.defaultWaits();
      cy.clickShowAllSteps();
    });

    it('switches visible branch panels and declaration checkbox based on application type', () => {
      cy.findByRole('link', { name: 'Barnetilsyn' }).should('not.exist');
      cy.findByRole('link', { name: 'Utdanningen' }).should('not.exist');

      selectApplicationType('skolepenger');

      cy.findByRole('link', { name: 'Tidligere utdanning' }).should('exist');
      cy.findByRole('link', { name: 'Arbeidserfaring' }).should('exist');
      cy.findByRole('link', { name: 'Utdanningen' }).should('exist');
      cy.findByRole('link', { name: 'Barnetilsyn' }).should('not.exist');
      cy.findByRole('link', { name: 'Arbeid' }).should('not.exist');
      cy.findByRole('link', { name: 'Sykdom' }).should('not.exist');

      cy.findByRole('link', { name: 'Erklæring' }).click();
      cy.findByRole('checkbox', { name: /Stønad til skolepenger/ }).should('exist');
      cy.findByRole('checkbox', { name: /Stønad til barnetilsyn/ }).should('not.exist');

      cy.findByRole('link', { name: 'Din situasjon' }).click();
      selectApplicationType('barnetilsyn');

      cy.findByRole('link', { name: 'Barnetilsyn' }).should('exist');
      cy.findByRole('link', { name: 'Arbeid' }).should('exist');
      cy.findByRole('link', { name: 'Sykdom' }).should('exist');
      cy.findByRole('link', { name: 'Tidligere utdanning' }).should('not.exist');
      cy.findByRole('link', { name: 'Utdanningen' }).should('not.exist');

      cy.findByRole('link', { name: 'Erklæring' }).click();
      cy.findByRole('checkbox', { name: /Stønad til barnetilsyn/ }).should('exist');
      cy.findByRole('checkbox', { name: /Stønad til skolepenger/ }).should('not.exist');
    });
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav170901/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('toggles identity and address branches based on identity number and address answers', () => {
      cy.findByLabelText('Fødselsnummer / D-nummer').should('not.exist');
      cy.findByLabelText('Din fødselsdato (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByLabelText('Fødselsnummer / D-nummer').should('exist');
      cy.findByLabelText('Din fødselsdato (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Fødselsnummer / D-nummer').should('not.exist');
      cy.findByLabelText('Din fødselsdato (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      selectRadio('Bor du i Norge?', 'Ja');
      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('exist');

      selectRadio('Er kontaktadressen din en vegadresse eller postboksadresse?', 'Vegadresse');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer/ }).should('not.exist');

      selectRadio('Er kontaktadressen din en vegadresse eller postboksadresse?', 'Postboksadresse');
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');

      selectRadio('Bor du i Norge?', 'Nei');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer/ }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');
    });
  });

  describe('Barnetilsyn conditionals', () => {
    beforeEach(() => {
      goToApplicationPanel('barnetilsyn', 'Barnetilsyn');
    });

    it('toggles school-age and fourth-year follow-up questions', () => {
      cy.findByLabelText('Klassetrinn').should('not.exist');
      cy.findByLabelText('Mottar du kontantstøtte for dette barnet?').should('not.exist');

      selectRadio('Er barnet i barnehagealder eller skolealder?', 'Skolealder');
      cy.findByLabelText('Klassetrinn').should('exist');
      cy.findByLabelText('Mottar du kontantstøtte for dette barnet?').should('not.exist');

      selectRadio('Er barnet i barnehagealder eller skolealder?', 'Barnehagealder');
      cy.findByLabelText('Klassetrinn').should('not.exist');
      cy.findByLabelText('Mottar du kontantstøtte for dette barnet?').should('exist');

      cy.findByLabelText('Søker du om stønad til barnetilsyn for barn som ferdig med fjerde skoleår?').should('exist');
      selectRadio('Søker du om stønad til barnetilsyn for barn som ferdig med fjerde skoleår?', 'Ja');
      cy.findByRole('group', { name: /Hvorfor søker du om stønad for barn som er ferdig med fjerde skoleår/ }).should(
        'exist',
      );

      selectRadio('Søker du om stønad til barnetilsyn for barn som ferdig med fjerde skoleår?', 'Nei');
      cy.findByRole('group', { name: /Hvorfor søker du om stønad for barn som er ferdig med fjerde skoleår/ }).should(
        'not.exist',
      );
    });
  });

  describe('Arbeid conditionals', () => {
    beforeEach(() => {
      goToApplicationPanel('barnetilsyn', 'Arbeid');
    });

    it('shows temporary, part-time and employer follow-up fields for the matching answers', () => {
      cy.findByLabelText('Framtidig sluttdato (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Prosent deltid').should('not.exist');
      cy.findByRole('textbox', { name: 'Navn' }).should('not.exist');

      selectRadio('Har du fast eller midlertidig stilling?', 'Midlertidig');
      cy.findByLabelText('Framtidig sluttdato (dd.mm.åååå)').should('exist');
      selectRadio('Har du fast eller midlertidig stilling?', 'Fast');
      cy.findByLabelText('Framtidig sluttdato (dd.mm.åååå)').should('not.exist');

      selectRadio('Jobber du på heltid eller deltid?', 'Deltid');
      cy.findByLabelText('Prosent deltid').should('exist');
      selectRadio('Jobber du på heltid eller deltid?', 'Heltid');
      cy.findByLabelText('Prosent deltid').should('not.exist');

      cy.findByRole('group', { name: 'Hvilket arbeidsforhold har du?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Jeg er ansatt.' }).check();
      });
      cy.findByRole('textbox', { name: 'Navn' }).should('exist');
      cy.findByLabelText('Har arbeidsgiver adresse i Norge?').should('exist');

      selectRadio('Har arbeidsgiver adresse i Norge?', 'Nei');
      cy.findByRole('textbox', { name: /Utenlandsk postkode/ }).should('exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');

      cy.findByRole('group', { name: 'Hvilket arbeidsforhold har du?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Jeg er ansatt.' }).uncheck();
        cy.findByRole('checkbox', { name: 'Jeg etablerer egen virksomhet.' }).check();
      });
      cy.findByRole('textbox', { name: 'Navn' }).should('not.exist');
      cy.contains('Etablering av egen virksomhet må godkjennes av NAV').should('exist');
    });

    it('switches arbeid attachments on Vedlegg based on the selected work relationship', () => {
      cy.findByRole('group', { name: 'Hvilket arbeidsforhold har du?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Jeg er ansatt.' }).check();
      });

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon fra arbeidsgiver på at du er i arbeid/ }).should('exist');
      cy.findByRole('group', { name: /Siste skatteoppgjør eller skattemelding for egen næringsvirksomhet/ }).should(
        'not.exist',
      );

      cy.findByRole('link', { name: 'Arbeid' }).click();
      cy.findByRole('group', { name: 'Hvilket arbeidsforhold har du?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Jeg er ansatt.' }).uncheck();
        cy.findByRole('checkbox', { name: 'Jeg er selvstendig næringsdrivende.' }).check();
      });

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon fra arbeidsgiver på at du er i arbeid/ }).should('not.exist');
      cy.findByRole('group', { name: /Siste skatteoppgjør eller skattemelding for egen næringsvirksomhet/ }).should(
        'exist',
      );
    });
  });

  describe('Utdanningen conditionals', () => {
    beforeEach(() => {
      goToApplicationPanel('skolepenger', 'Utdanningen');
    });

    it('toggles study detail, expense and private education follow-up fields', () => {
      cy.findByLabelText('Deltidsprosent').should('not.exist');
      cy.findByRole('textbox', {
        name: 'Hva slags utdanning ønsker du å ta etter at nåværende utdanningsløp er fullført?',
      }).should('not.exist');
      cy.findAllByLabelText('Skolepenger').should('have.length', 1);
      cy.findByRole('textbox', { name: 'Hva slags andre utgifter har du?' }).should('not.exist');
      cy.findByRole('textbox', { name: /Forklar hvorfor du har valgt privat utdanning/ }).should('not.exist');

      selectRadio('Tar du utdanningen på heltid eller deltid?', 'Deltid');
      cy.findByLabelText('Deltidsprosent').should('exist');
      selectRadio('Tar du utdanningen på heltid eller deltid?', 'Heltid');
      cy.findByLabelText('Deltidsprosent').should('not.exist');

      selectRadio('Skal du ta mer utdanning etter at dette utdanningsløpet er ferdig?', 'Ja');
      cy.findByRole('textbox', {
        name: 'Hva slags utdanning ønsker du å ta etter at nåværende utdanningsløp er fullført?',
      }).should('exist');
      selectRadio('Skal du ta mer utdanning etter at dette utdanningsløpet er ferdig?', 'Nei');
      cy.findByRole('textbox', {
        name: 'Hva slags utdanning ønsker du å ta etter at nåværende utdanningsløp er fullført?',
      }).should('not.exist');

      cy.findByRole('group', { name: /Velg hvilke utgifter du har i forbindelse med utdanningen/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Skolepenger' }).check();
        cy.findByRole('checkbox', { name: 'Andre utgifter' }).check();
      });
      cy.findAllByLabelText('Skolepenger').should('have.length', 2);
      cy.findByRole('textbox', { name: 'Hva slags andre utgifter har du?' }).should('exist');
      cy.findAllByLabelText('Andre utgifter').should('have.length', 2);

      cy.findByRole('group', { name: /Velg hvilke utgifter du har i forbindelse med utdanningen/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Skolepenger' }).uncheck();
        cy.findByRole('checkbox', { name: 'Andre utgifter' }).uncheck();
      });
      cy.findAllByLabelText('Skolepenger').should('have.length', 1);
      cy.findByRole('textbox', { name: 'Hva slags andre utgifter har du?' }).should('not.exist');

      selectRadio('Har du valgt privat utdanning?', 'Ja');
      cy.findByRole('textbox', { name: /Forklar hvorfor du har valgt privat utdanning/ }).should('exist');
      selectRadio('Har du valgt privat utdanning?', 'Nei');
      cy.findByRole('textbox', { name: /Forklar hvorfor du har valgt privat utdanning/ }).should('not.exist');
    });

    it('shows school and private-education attachments on Vedlegg for the matching branch', () => {
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Opptaksbevis fra skole eller studiested/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon på utgifter i forbindelse med utdanningen/ }).should('exist');
      cy.findByRole('group', { name: /Bekreftelse som viser omfanget av utdanningen/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon på årsaken til at du har valgt privat utdanning/ }).should(
        'not.exist',
      );

      cy.findByRole('link', { name: 'Utdanningen' }).click();
      selectRadio('Har du valgt privat utdanning?', 'Ja');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon på årsaken til at du har valgt privat utdanning/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav170901?sub=paper');
      cy.defaultWaits();
      advancePastStartPanels();
    });

    it('fills the school-fee path and verifies the summary', () => {
      // Din situasjon
      selectApplicationType('skolepenger');
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Bokommune' }).type('Oslo');
      selectRadio('Mottar du utbetalinger fra NAV?', 'Ja');
      cy.clickNextStep();

      // Tidligere utdanning
      selectRadio('Har du utdanning etter grunnskolen?', 'Nei');
      cy.clickNextStep();

      // Arbeidserfaring
      selectRadio('Har du arbeidserfaring?', 'Nei');
      cy.clickNextStep();

      // Utdanningen
      cy.findByRole('textbox', { name: 'Skolens navn' }).type('Oslo fagskole');
      cy.findByRole('textbox', { name: 'Klasse/linje/kurs' }).type('Administrasjon');
      cy.findAllByRole('textbox', { name: 'Fra (mm.åååå)' }).first().type('08.2026');
      cy.findAllByRole('textbox', { name: 'Til (mm.åååå)' }).first().type('06.2027');
      selectRadio('Tar du utdanningen på heltid eller deltid?', 'Heltid');
      selectRadio('Skal du ta mer utdanning etter at dette utdanningsløpet er ferdig?', 'Nei');
      cy.findByRole('textbox', {
        name: 'Hvorfor mener du at utdanningen du skal ta er nødvendig for å få fast jobb?',
      }).type('Utdanningen er nødvendig for å kvalifisere til faste administrative stillinger.');
      cy.findByRole('group', { name: /Velg hvilke utgifter du har i forbindelse med utdanningen/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Skolepenger' }).check();
      });
      cy.findByRole('textbox', { name: 'Skolepenger' }).type('1500');
      selectRadio('Har du valgt privat utdanning?', 'Nei');
      cy.clickNextStep();
      cy.get('#page-title').should('contain.text', 'Tilleggsopplysninger');

      // Tilleggsopplysninger
      selectRadio('Har du tilleggsopplysninger som er relevant for søknaden?', 'Nei');
      cy.clickNextStep();

      // Erklæring
      cy.findByRole('checkbox', { name: /Stønad til skolepenger/ }).click();
      cy.findByRole('checkbox', {
        name: /mangelfulle eller feilaktige opplysninger kan medføre krav om tilbakebetaling/,
      }).click();
      cy.clickNextStep();

      // Vedlegg
      answerAttachment(/Opptaksbevis fra skole eller studiested/);
      answerAttachment(/Dokumentasjon på utgifter i forbindelse med utdanningen/);
      answerAttachment(/Bekreftelse som viser omfanget av utdanningen/);
      answerAttachment(/Annen dokumentasjon/, /Nei, jeg har ingen ekstra dokumentasjon/);
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Din situasjon', () => {
        cy.contains('dt', 'Hva søker du om?').next('dd').should('contain.text', 'Stønad til skolepenger');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Utdanningen', () => {
        cy.contains('dt', 'Skolens navn').next('dd').should('contain.text', 'Oslo fagskole');
        cy.contains('dt', 'Tar du utdanningen på heltid eller deltid?').next('dd').should('contain.text', 'Heltid');
      });
    });
  });
});
