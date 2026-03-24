/*
 * Production form tests for Søknad om gravferdsstønad og båretransport
 * Form: nav070208
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dødsfallet (dodsfallet): 6 same-panel conditionals
 *       hvorSkjeddeDodsfallet → iHvilketLandSkjeddeDodsfalletEuEos / iHvilketLandSkjeddeDodsfallet1
 *       hvorSkjeddeDodsfallet + varAvdodePaFerie... → skjeddeDodsfalletPaGrunnAvYrkesskade
 *       skjeddeDodsfalletPaGrunnAvYrkesskade → varAvdode
 *       varAvdode → erEktefelle... / membership alert
 *   - Hvem fyller ut søknaden (page19): 4 panel-level conditionals
 *       kryssAvForDetSomErAktuelt → opplysningerOmDegSomErSoker / opplysningerOmDenKommuneansatte / page22 / opplysningerOmAdvokaten
 *   - Søknaden (soknaden): 3 panel-level conditionals
 *       hvaGjelderSoknaden → stonadTilBaretransport / transport / stonadTilGravferd
 */

export {};

const selectRadio = (label: string, option: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const setApplicationType = (option: string, checked: boolean) => {
  cy.findByRole('group', { name: 'Hva gjelder søknaden?' }).within(() => {
    if (checked) {
      cy.findByRole('checkbox', { name: option }).check();
    } else {
      cy.findByRole('checkbox', { name: option }).uncheck();
    }
  });
};

const fillDodsfalletTransportPath = () => {
  cy.findByRole('textbox', { name: /Dato for dødsfallet/ }).type('01.01.2025');
  cy.findByRole('textbox', { name: /Dato for seremoni/ }).type('10.01.2025');
  selectRadio('Avdødes alder', '18 år eller eldre');
  selectRadio('Hvor skjedde dødsfallet?', 'I Norge');
  cy.clickNextStep();
};

const fillOpplysningerOmAvdodeTransportPath = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  selectRadio('Hadde avdøde norsk fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /fødselsnummer eller d-nummer/i }).type('17912099997');
  selectRadio('Var avdøde bosatt i Norge på dødstidspunktet?', 'Ja');
  cy.findByRole('textbox', { name: 'Vegadresse' }).type('Minnes vei 1');
  cy.findByRole('textbox', { name: 'Postnummer' }).type('0150');
  cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
  selectRadio('Bodde avdøde på institusjon da dødsfallet skjedde?', 'Nei');
  cy.clickNextStep();
};

const fillApplicantPanelTransportPath = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Søker');
  selectRadio('Har du utgifter til gravferd eller er fakturaen fra begravelsesbyrået adressert til deg?', 'Ja');
  selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /ditt fødselsnummer eller d-nummer/i }).type('17912099997');
  cy.findByRole('textbox', { name: 'Hva var din relasjon til avdøde?' }).type('Datter');
  selectRadio('Bor du i Norge?', 'Ja');
  selectRadio('Er din adresse en vegadresse eller postboksadresse?', 'Vegadresse');
  cy.findByRole('textbox', { name: 'Vegadresse' }).type('Søkerveien 2');
  cy.findByRole('textbox', { name: 'Postnummer' }).type('0190');
  cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
  cy.clickNextStep();
};

const fillTransportPanelMinimum = () => {
  cy.findByRole('textbox', {
    name: /Oppgi hvor dødsfallet skjedde eller eventuelt hvor avdøde ble funnet/,
  }).type('Ullevål sykehus');
  selectRadio('Nærmere beskrivelse av stedet', 'Adresse');
  cy.findAllByRole('textbox', { name: 'Vegadresse' }).first().type('Kirkeveien 166');
  cy.findAllByRole('textbox', { name: 'Postnummer' }).first().type('0450');
  cy.findAllByRole('textbox', { name: 'Poststed' }).first().type('Oslo');

  cy.findByRole('group', { name: /Hva gjaldt transporten\?/ }).within(() => {
    cy.findByRole('checkbox', { name: 'Transport til bårerom' }).check();
  });

  cy.findByLabelText('Angi samlet kjørelengde').type('30');
  cy.findByRole('textbox', { name: 'Navn på bårerommet' }).type('Oslo bårerom');
  cy.findAllByRole('textbox', { name: 'Vegadresse' }).eq(1).type('Båreromsveien 4');
  cy.findAllByRole('textbox', { name: 'Postnummer' }).eq(1).type('0580');
  cy.findAllByRole('textbox', { name: 'Poststed' }).eq(1).type('Oslo');
  cy.findByRole('textbox', { name: 'Adressen til bårebilens parkering' }).type('Parkeringsveien 6, Oslo');
  cy.findByLabelText('Angi den totale kjørelengden bårebilen har kjørt i kilometer').type('30');
  cy.clickNextStep();
};

const fillBegravelsesbyra = () => {
  cy.findByRole('textbox', { name: 'Begravelsesbyråets navn' }).type('Trygt Farvel AS');
  cy.findByRole('textbox', { name: 'Begravelsesbyråets organisasjonsnummer' }).type('889640782');
  cy.findByRole('textbox', { name: 'Adressen som brev skal sendes til' }).type('Byråveien 10');
  cy.findByRole('textbox', { name: 'Postnummer' }).type('0181');
  cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
  cy.findByLabelText('Telefonnummer').type('12345678');
  cy.clickNextStep();
};

const chooseRegisteredNavAccount = () => {
  selectRadio(
    'Hvor ønsker du stønaden utbetalt?',
    'Jeg ønsker å få pengene utbetalt til mitt kontonummer som er registrert hos Nav.',
  );
};

describe('nav070208', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Dødsfallet conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav070208/dodsfallet?sub=paper');
      cy.defaultWaits();
    });

    it('switches country inputs and follow-up questions when death location changes', () => {
      cy.findByLabelText('I hvilket land skjedde dødsfallet?').should('not.exist');
      cy.findByLabelText(/Var avdøde på ferie eller annet midlertidig opphold/).should('not.exist');
      cy.findByLabelText('Skjedde dødsfallet på grunn av yrkesskade?').should('not.exist');

      selectRadio('Avdødes alder', '18 år eller eldre');
      selectRadio('Hvor skjedde dødsfallet?', 'I et EU/EØS-land');

      cy.findByLabelText('I hvilket land skjedde dødsfallet?').should('exist');
      cy.findByLabelText(/Var avdøde på ferie eller annet midlertidig opphold/).should('exist');
      cy.findByLabelText('Skjedde dødsfallet på grunn av yrkesskade?').should('not.exist');

      selectRadio('Var avdøde på ferie eller annet midlertidig opphold da dødsfallet skjedde?', 'Nei');
      cy.findByLabelText('Skjedde dødsfallet på grunn av yrkesskade?').should('exist');

      selectRadio('Skjedde dødsfallet på grunn av yrkesskade?', 'Nei');
      cy.findByLabelText('Var avdøde').should('exist');

      selectRadio('Var avdøde', 'Ingen av delene');
      cy.contains('For å kunne ha rett på gravferdsstønad').should('exist');
      cy.findByLabelText(/Er ektefelle, registrert partner eller samboer/).should('exist');

      selectRadio('Hvor skjedde dødsfallet?', 'Utenfor EU/EØS');
      cy.findAllByLabelText('I hvilket land skjedde dødsfallet?').should('have.length', 1);
      cy.findByLabelText(/Var avdøde på ferie eller annet midlertidig opphold/).should('not.exist');
      cy.findByLabelText('Skjedde dødsfallet på grunn av yrkesskade?').should('exist');
    });
  });

  describe('Hvem fyller ut søknaden conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav070208/page19?sub=paper');
      cy.defaultWaits();
    });

    it('shows the matching applicant panel in the stepper for each role', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Opplysninger om deg som er søker' }).should('not.exist');
      cy.findByRole('link', { name: 'Opplysninger om den kommuneansatte' }).should('not.exist');
      cy.findByRole('link', { name: 'Opplysninger om ansatt i begravelsesbyrå' }).should('not.exist');
      cy.findByRole('link', { name: 'Opplysninger om advokaten' }).should('not.exist');

      selectRadio('Kryss av for det som er aktuelt', 'Jeg er privatperson');
      cy.findByRole('link', { name: 'Opplysninger om deg som er søker' }).should('exist');

      selectRadio('Kryss av for det som er aktuelt', 'Jeg er ansatt i kommunen som har ansvar for gravferden');
      cy.findByRole('link', { name: 'Opplysninger om den kommuneansatte' }).should('exist');
      cy.findByRole('link', { name: 'Opplysninger om deg som er søker' }).should('not.exist');

      selectRadio(
        'Kryss av for det som er aktuelt',
        'Jeg er ansatt i begravelsesbyrå som har fullmakt til å søke om stønad til båretransport og gravferdsstønad fra Nav',
      );
      cy.findByRole('link', { name: 'Opplysninger om ansatt i begravelsesbyrå' }).should('exist');
      cy.findByRole('link', { name: 'Opplysninger om den kommuneansatte' }).should('not.exist');

      selectRadio('Kryss av for det som er aktuelt', 'Jeg er advokat og representerer boet');
      cy.findByRole('link', { name: 'Opplysninger om advokaten' }).should('exist');
      cy.findByRole('link', { name: 'Opplysninger om ansatt i begravelsesbyrå' }).should('not.exist');
    });
  });

  describe('Søknaden conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav070208/soknaden?sub=paper');
      cy.defaultWaits();
    });

    it('shows the right downstream panels for each application type', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Stønad til båretransport' }).should('not.exist');
      cy.findByRole('link', { name: 'Transport' }).should('not.exist');
      cy.findByRole('link', { name: 'Stønad til gravferd' }).should('not.exist');

      setApplicationType('Stønad til båretransport', true);
      cy.findByRole('link', { name: 'Stønad til båretransport' }).should('exist');
      cy.findByRole('link', { name: 'Transport' }).should('exist');
      cy.findByRole('link', { name: 'Stønad til gravferd' }).should('not.exist');

      setApplicationType('Gravferdsstønad', true);
      cy.findByRole('link', { name: 'Stønad til gravferd' }).should('exist');

      setApplicationType('Stønad til båretransport', false);
      cy.findByRole('link', { name: 'Stønad til båretransport' }).should('not.exist');
      cy.findByRole('link', { name: 'Transport' }).should('not.exist');
      cy.findByRole('link', { name: 'Stønad til gravferd' }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav070208/dodsfallet?sub=paper');
      cy.defaultWaits();
    });

    it('fills the private-person båretransport path and verifies summary', () => {
      fillDodsfalletTransportPath();
      fillOpplysningerOmAvdodeTransportPath();

      selectRadio('Kryss av for det som er aktuelt', 'Jeg er privatperson');
      cy.clickNextStep();

      fillApplicantPanelTransportPath();

      setApplicationType('Stønad til båretransport', true);
      cy.clickNextStep();

      cy.clickNextStep();

      fillTransportPanelMinimum();
      fillBegravelsesbyra();
      chooseRegisteredNavAccount();
      cy.clickNextStep();

      selectRadio('Har du andre opplysninger som kan ha betydning for søknaden?', 'Nei');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', {
        name: /Kopi av spesifisert dokumentasjon for nødvendige utgifter til båretransporten/,
      }).within(() => {
        cy.findByRole('radio', { name: /ettersender/i }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });

      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Opplysninger om avdøde', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Opplysninger om deg som er søker', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });
      cy.withinSummaryGroup('Transport', () => {
        cy.contains('dd', 'Ullevål sykehus').should('exist');
        cy.contains('dd', 'Transport til bårerom').should('exist');
      });
    });
  });
});
