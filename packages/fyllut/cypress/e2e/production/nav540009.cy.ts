/*
 * Production form tests for Søknad om bidragsforskudd
 * Form: nav540009
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 1 observable customConditional
 *       identitet.harDuFodselsnummer → adresse / folkeregister alert
 *   - Situasjonen din (situasjonenDin): 2 same-panel conditionals
 *       hvaErDinSivilstand → harDuVaertSamboerIMinst12AvDeSiste18Manedene
 *       erDuIJobb → kryssAvForDetSomGjelderForDeg
 *   - Barn søknaden gjelder for (barnSoknadenGjelderFor): 5 same-panel conditionals
 *       barnetHarIkkeNorskFodselsnummerEllerDNummer → barnetsFodselsdatoDdMmAaaa / barnetsFodselsnummerEllerDNummer
 *       borBarnetFastHosDeg → harBarnetBoddSammenMedDegSidenFodselen / alert
 *       harBarnetBoddSammenMedDegSidenFodselen → fraHvilkenDatoHarBarnetBoddFastSammenMedDegDdMmAaaa
 *       harBarnetDeltFastBosted → alert + attachment on Vedlegg
 *       erBarnetBosattUtenforNorge → hvilketLandBorBarnet + utland alert
 *   - Opplysninger om den andre parten (opplysningerOmDenAndreParten): 6 custom/same-panel conditionals
 *       harMotpartenNorskFodselsnummerEllerDNummer → vetDuFodselsdatoenTilDenAndreParten / motpartensFodselsnummerEllerDNummer
 *       vetDuFodselsdatoenTilDenAndreParten → MotpartensFodselsdatoDdMmAaaa
 *       borMotpartenINorge + vetDuAdressen → norsk/utenlandsk adresse / landvelger
 *   - Samlivsbrudd (samlivsbrudd): 2 same-panel conditionals
 *       herAngirDuLivssituasjonenMellomPartene → datoForFaktiskSamlivsbrudd / samlivsbrudd alert
 *   - Nåværende avtale om bidrag (navaerendeAvtaleOmBidrag): 10 same-panel/custom conditionals
 *       harDuAvtale... → alert / kommerDuTilASendeInn... / datagrid
 *       kommerDuTilASendeInn... → info checkbox
 *       bidragetErFastsattVed → oppgiAvtaleform / erBidragFastsattINorge / amount / receipt branches
 *       oppgiAvtaleform → month pickers / alerts / private agreement attachment
 *       harDuOppgittBelopeneINorskeKroner → valuta
 *       harDuTidligereMottattBidrag... → textarea
 *       kreverSkatteetatenInnDetteBarnebidraget → onskerDuAtSkatteetatenSkalKreveInnBidraget + alerts
 *   - Vedlegg (vedlegg): 3 cross-panel attachment conditionals
 *       harBarnetDeltFastBosted → kopiAvvtaleOmDeltFastBosted
 *       oppgiAvtaleform=skriftlig → kopiAvPrivatAvtaleOmBarnebidrag
 *       bidragetErFastsattVed=dom → kopiAvDomOmFastsettelseAvBarnebidrag
 */

const formPath = 'nav540009';
const submissionMethod = '?sub=paper';

const futureMonth = (months = 1) => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);

  return `${`${date.getMonth() + 1}`.padStart(2, '0')}.${date.getFullYear()}`;
};

const visitPath = (path = '') => {
  cy.visit(`/fyllut/${formPath}${path}${submissionMethod}`);
  cy.defaultWaits();
};

const advancePastIntroduksjon = () => {
  cy.get('h2#page-title')
    .invoke('text')
    .then((title) => {
      if (title.trim() === 'Introduksjon') {
        cy.clickNextStep();
      }
    });
};

const answerRadio = (label: string | RegExp, value: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: value }).click();
  });
};

const fillApplicantWithFnr = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  answerRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
};

const fillSituasjonenDinMinimal = () => {
  answerRadio('Hva er din sivilstand?', 'Jeg er enslig');
  cy.findByLabelText('Hvor mange egne barn har du i husstanden din?').type('1');
  answerRadio('Er du i jobb?', 'Nei');
};

const fillBarnRowMinimal = ({ sharedResidence = 'Nei' }: { sharedResidence?: 'Ja' | 'Nei' } = {}) => {
  cy.findByRole('textbox', { name: 'Barnets fornavn' }).type('Sara');
  cy.findByRole('textbox', { name: 'Barnets etternavn' }).type('Nordmann');
  cy.findByRole('textbox', { name: /Barnets fødselsnummer eller d-nummer/i }).type('17912099997');
  answerRadio('Bor barnet fast hos deg?', 'Ja');
  answerRadio('Har barnet bodd sammen med deg siden fødselen?', 'Ja');
  answerRadio('Har barnet delt fast bosted?', sharedResidence);
  answerRadio('Bor barnet i Norge?', 'Ja');
};

const fillOtherPartyWithFnr = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Per');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Motpart');
  answerRadio('Kjenner du den andre partens norske fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /Den andre partens fødselsnummer eller d-nummer/i }).type('17912099997');
  answerRadio('Bor den andre parten på sin folkeregistrerte adresse?', 'Ja');
};

const openVedleggFromCurrentAgreement = () => {
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: 'Vedlegg' }).click();
};

describe('nav540009', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      visitPath('/dineOpplysninger');
    });

    it('shows the folkeregister alert for norsk fødselsnummer and address fields without it', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      answerRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByText(/Nav sender svar på søknad og annen kommunikasjon/).should('exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      answerRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByText(/Nav sender svar på søknad/).should('not.exist');
      cy.findByLabelText('Bor du i Norge?').should('exist');
    });
  });

  describe('Situasjonen din conditionals', () => {
    beforeEach(() => {
      visitPath('/situasjonenDin');
    });

    it('toggles samboer and work follow-up questions', () => {
      cy.findByLabelText('Har du vært samboer i minst 12 av de siste 18 månedene?').should('not.exist');
      cy.findByRole('group', { name: /Kryss av for det som gjelder for deg/ }).should('not.exist');

      answerRadio('Hva er din sivilstand?', 'Jeg er samboer');
      cy.findByLabelText('Har du vært samboer i minst 12 av de siste 18 månedene?').should('exist');

      answerRadio('Hva er din sivilstand?', 'Jeg er enslig');
      cy.findByLabelText('Har du vært samboer i minst 12 av de siste 18 månedene?').should('not.exist');

      answerRadio('Er du i jobb?', 'Ja');
      cy.findByText('Kryss av for det som gjelder for deg').should('exist');

      answerRadio('Er du i jobb?', 'Nei');
      cy.findByText('Kryss av for det som gjelder for deg').should('not.exist');
    });
  });

  describe('Barn søknaden gjelder for conditionals', () => {
    beforeEach(() => {
      visitPath('/barnSoknadenGjelderFor');
    });

    it('switches between norsk identitet and birth-date/address follow-ups', () => {
      cy.findByRole('textbox', { name: /Barnets fødselsnummer eller d-nummer/i }).should('exist');
      cy.findByRole('textbox', { name: /Barnets fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Har barnet bodd sammen med deg siden fødselen?').should('not.exist');

      cy.findByRole('checkbox', { name: /Barnet har ikke\s+norsk fødselsnummer eller d-nummer/ }).click();
      cy.findByRole('textbox', { name: /Barnets fødselsnummer eller d-nummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Barnets fødselsdato/ }).should('exist');

      answerRadio('Bor barnet fast hos deg?', 'Ja');
      cy.findByLabelText('Har barnet bodd sammen med deg siden fødselen?').should('exist');

      answerRadio('Har barnet bodd sammen med deg siden fødselen?', 'Nei');
      cy.findByRole('textbox', {
        name: /Fra hvilken dato har barnet bodd fast sammen med deg/,
      }).should('exist');

      answerRadio('Har barnet bodd sammen med deg siden fødselen?', 'Ja');
      cy.findByRole('textbox', {
        name: /Fra hvilken dato har barnet bodd fast sammen med deg/,
      }).should('not.exist');
    });

    it('shows delt bosted and utland follow-up content for the child row', () => {
      cy.contains('kopi av avtalen om delt fast bosted').should('not.exist');
      cy.findByRole('combobox', { name: 'Hvilket land bor barnet i?' }).should('not.exist');

      answerRadio('Har barnet delt fast bosted?', 'Ja');
      cy.contains('kopi av avtalen om delt fast bosted').should('exist');

      answerRadio('Har barnet delt fast bosted?', 'Nei');
      cy.contains('kopi av avtalen om delt fast bosted').should('not.exist');

      answerRadio('Bor barnet i Norge?', 'Nei');
      cy.findByRole('combobox', { name: 'Hvilket land bor barnet i?' }).should('exist');
      cy.contains('Normalt får du ikke bidragsforskudd fra Norge').should('exist');

      answerRadio('Bor barnet i Norge?', 'Ja');
      cy.findByRole('combobox', { name: 'Hvilket land bor barnet i?' }).should('not.exist');
    });
  });

  describe('Opplysninger om den andre parten conditionals', () => {
    beforeEach(() => {
      visitPath('/opplysningerOmDenAndreParten');
      advancePastIntroduksjon();
    });

    it('switches between fnr, birth-date, address, and country discovery flows', () => {
      cy.findByLabelText('Vet du fødselsdatoen til den andre parten?').should('not.exist');

      answerRadio('Kjenner du den andre partens norske fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Vet du fødselsdatoen til den andre parten?').should('exist');
      cy.findByRole('textbox', { name: /Den andre partens fødselsnummer eller d-nummer/i }).should('not.exist');

      answerRadio('Vet du fødselsdatoen til den andre parten?', 'Ja');
      cy.findByRole('textbox', { name: /Den andre partens fødselsdato/ }).should('exist');

      answerRadio('Bor den andre parten i Norge?', 'Ja');
      answerRadio('Vet du adressen?', 'Ja');
      cy.findByLabelText(/Vegadresse/).should('exist');

      answerRadio('Bor den andre parten i Norge?', 'Nei');
      cy.findByLabelText(/Vegadresse/).should('not.exist');
      cy.findByLabelText(/Vegnavn og husnummer, eller postboks/).should('exist');
      cy.findByRole('combobox', { name: 'Hvilket land bor den andre parten i?' }).should('not.exist');

      answerRadio('Vet du adressen?', 'Ja');
      cy.findByLabelText(/Vegnavn og husnummer, eller postboks/).should('exist');
      cy.findByLabelText(/Land/).should('exist');

      answerRadio('Vet du adressen?', 'Nei');
      cy.findByLabelText(/Vegnavn og husnummer, eller postboks/).should('not.exist');
      cy.findByLabelText(/Land/).should('not.exist');

      answerRadio('Kjenner du den andre partens norske fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /Den andre partens fødselsnummer eller d-nummer/i }).should('exist');
      cy.findByLabelText('Vet du fødselsdatoen til den andre parten?').should('not.exist');
      cy.findByLabelText('Bor den andre parten på sin folkeregistrerte adresse?').should('exist');
    });
  });

  describe('Samlivsbrudd conditionals', () => {
    beforeEach(() => {
      visitPath('/samlivsbrudd');
    });

    it('switches between separation date and cannot-submit warning', () => {
      cy.findByRole('textbox', { name: /Når flyttet dere fra hverandre/ }).should('not.exist');

      answerRadio('Du og den andre partens boforhold', 'Vi har ikke flyttet fra hverandre enda');
      cy.contains('Dere må ha flyttet fra hverandre').should('exist');

      answerRadio('Du og den andre partens boforhold', 'Vi har flyttet fra hverandre');
      cy.contains('Dere må ha flyttet fra hverandre').should('not.exist');
      cy.findByRole('textbox', { name: /Når flyttet dere fra hverandre/ }).should('exist');

      answerRadio('Du og den andre partens boforhold', 'Vi har ikke bodd sammen');
      cy.findByRole('textbox', { name: /Når flyttet dere fra hverandre/ }).should('not.exist');
      cy.contains('Dere må ha flyttet fra hverandre').should('not.exist');
    });
  });

  describe('Nåværende avtale om bidrag conditionals', () => {
    beforeEach(() => {
      visitPath('/navaerendeAvtaleOmBidrag');
    });

    it('shows no-agreement follow-ups and the info checkbox only for the no-plan branch', () => {
      cy.findByLabelText(/Kommer du til å sende inn en privat avtale/).should('not.exist');

      answerRadio('Har du avtale om barnebidrag for barnet eller barna du søker bidragsforskudd for?', 'Nei');
      cy.contains('For at du skal få bidragsforskudd').should('exist');
      cy.findByLabelText(/Kommer du til å sende inn en privat avtale/).should('exist');
      cy.findByRole('checkbox', {
        name: /Jeg er gjort kjent med at Nav skal fastsette bidraget/,
      }).should('not.exist');

      answerRadio(
        /Kommer du til å sende inn en privat avtale, eller en søknad om at Nav skal fastsette bidraget/,
        'Nei, jeg kommer ikke til å gjøre noen av delene',
      );
      cy.findByRole('checkbox', {
        name: /Jeg er gjort kjent med at Nav skal fastsette bidraget/,
      }).should('exist');

      answerRadio(
        /Kommer du til å sende inn en privat avtale, eller en søknad om at Nav skal fastsette bidraget/,
        'Ja, jeg vil sende en kopi av privat avtale',
      );
      cy.findByRole('checkbox', {
        name: /Jeg er gjort kjent med at Nav skal fastsette bidraget/,
      }).should('not.exist');
    });

    it('shows oral and written private-agreement branches inside the datagrid', () => {
      answerRadio('Har du avtale om barnebidrag for barnet eller barna du søker bidragsforskudd for?', 'Ja');
      cy.findByLabelText('Barnets navn').type('Sara Nordmann');
      answerRadio('Bidraget er fastsatt ved', 'privat avtale');
      cy.findByLabelText('Oppgi avtaleform').should('exist');
      cy.findByRole('textbox', { name: /Bidragsavtalen gjelder fra/ }).should('not.exist');

      answerRadio('Oppgi avtaleform', 'muntlig');
      cy.contains('Skatteetaten kan ikke kreve inn en muntlig').should('exist');
      cy.findByRole('textbox', { name: /Bidragsavtalen gjelder fra/ }).should('exist');
      cy.findByLabelText('Har avtalen en sluttdato?').should('exist');

      answerRadio('Har avtalen en sluttdato?', 'Ja');
      cy.findByRole('textbox', { name: /Bidragsavtalen gjelder til/ }).should('exist');

      answerRadio('Oppgi avtaleform', 'skriftlig');
      cy.contains('Du må legge ved en kopi av den private avtalen').should('exist');
      cy.findByRole('textbox', { name: /Bidragsavtalen gjelder fra/ }).should('not.exist');
      cy.findByLabelText('Avtalt bidrag per måned').should('exist');
      cy.findByLabelText('Har du oppgitt beløpet i norske kroner?').should('exist');

      answerRadio('Har du oppgitt beløpet i norske kroner?', 'Nei');
      cy.findByText('Hvilken valuta har du oppgitt beløpet i?').should('exist');

      answerRadio('Har du fått barnebidraget i henhold til avtalen?', 'Jeg har fått noe');
      cy.findByRole('textbox', {
        name: 'Beskriv hva den andre parten har betalt, og for hvilke perioder det gjelder',
      }).should('exist');

      answerRadio('Krever Skatteetaten inn dette barnebidraget?', 'Nei');
      cy.findByLabelText('Ønsker du at Skatteetaten skal kreve inn bidraget?').should('exist');
      answerRadio('Ønsker du at Skatteetaten skal kreve inn bidraget?', 'Ja');
      cy.contains('Nav vil melde fra til Skatteetaten').should('exist');
    });

    it('shows court-settlement branches for dom with country and payment follow-ups', () => {
      answerRadio('Har du avtale om barnebidrag for barnet eller barna du søker bidragsforskudd for?', 'Ja');
      cy.findByLabelText('Barnets navn').type('Sara Nordmann');
      answerRadio('Bidraget er fastsatt ved', 'dom');

      cy.contains('Du må legge ved en kopi av dommen').should('exist');
      cy.findByLabelText('Er bidraget fastsatt i Norge?').should('exist');
      cy.findByLabelText('Oppgi avtaleform').should('not.exist');

      answerRadio('Er bidraget fastsatt i Norge?', 'Nei');
      cy.findByRole('combobox', { name: 'I hvilket land er bidraget fastsatt?' }).should('exist');
      cy.findByLabelText('Avtalt bidrag per måned').should('exist');
      cy.findByLabelText('Har du oppgitt beløpet i norske kroner?').should('exist');
      cy.findByLabelText('Har du fått barnebidraget i henhold til fastsettelsen?').should('exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows delt fast bosted attachment when shared residence is selected for the child', () => {
      visitPath('/barnSoknadenGjelderFor');
      fillBarnRowMinimal({ sharedResidence: 'Ja' });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Kopi av avtale om delt fast bosted|Avtale/ }).should('exist');
    });

    it('shows private-agreement attachment when the current agreement is written', () => {
      visitPath('/navaerendeAvtaleOmBidrag');
      answerRadio('Har du avtale om barnebidrag for barnet eller barna du søker bidragsforskudd for?', 'Ja');
      cy.findByLabelText('Barnets navn').type('Sara Nordmann');
      answerRadio('Bidraget er fastsatt ved', 'privat avtale');
      answerRadio('Oppgi avtaleform', 'skriftlig');

      openVedleggFromCurrentAgreement();
      cy.findByRole('group', { name: /Kopi av privat avtale om barnebidrag|Vedtak eller avtale om bidrag/ }).should(
        'exist',
      );
    });

    it('shows dom attachment when the current agreement is court-set by judgment', () => {
      visitPath('/navaerendeAvtaleOmBidrag');
      answerRadio('Har du avtale om barnebidrag for barnet eller barna du søker bidragsforskudd for?', 'Ja');
      cy.findByLabelText('Barnets navn').type('Sara Nordmann');
      answerRadio('Bidraget er fastsatt ved', 'dom');

      openVedleggFromCurrentAgreement();
      cy.findByRole('group', {
        name: /Kopi av dom om fastsettelse av barnebidrag|Vedtak eller avtale om bidrag/,
      }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      visitPath();
    });

    it('fills required fields and verifies the summary page', () => {
      advancePastIntroduksjon();
      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/ }).click();
      cy.clickNextStep();

      fillApplicantWithFnr();
      cy.clickNextStep();

      fillSituasjonenDinMinimal();
      cy.clickNextStep();

      fillBarnRowMinimal();
      cy.clickNextStep();

      fillOtherPartyWithFnr();
      cy.clickNextStep();

      answerRadio('Du og den andre partens boforhold', 'Vi har ikke bodd sammen');
      cy.clickNextStep();

      answerRadio('Har du avtale om barnebidrag for barnet eller barna du søker bidragsforskudd for?', 'Nei');
      answerRadio(
        /Kommer du til å sende inn en privat avtale, eller en søknad om at Nav skal fastsette bidraget/,
        'Nei, jeg kommer ikke til å gjøre noen av delene',
      );
      cy.findByRole('checkbox', {
        name: /Jeg er gjort kjent med at Nav skal fastsette bidraget/,
      }).click();
      cy.clickNextStep();

      cy.findByRole('textbox', { name: /Fra hvilken måned søker du bidragsforskudd fra/ }).type(futureMonth(1));
      cy.clickNextStep();

      cy.findByRole('group', { name: /Annen dokumentasjon|Annet/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Barn søknaden gjelder for', () => {
        cy.contains('dt', 'Barnets fornavn').next('dd').should('contain.text', 'Sara');
      });
      cy.withinSummaryGroup('Nåværende avtale om bidrag', () => {
        cy.contains('dt', 'Har du avtale om barnebidrag for barnet eller barna du søker bidragsforskudd for?')
          .next('dd')
          .should('contain.text', 'Nei');
      });
    });
  });
});
