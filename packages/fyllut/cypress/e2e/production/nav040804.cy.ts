/*
 * Production form tests for Bekreftelse på arbeidsforhold og permittering
 * Form: nav040804
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Opplysninger om arbeidstaker (opplysningeromarbeidstaker): 3 same-panel conditional chains
 *       harDuNorskFodselsnummerEllerDNummer → fnr / fødselsdato / borDuINorge
 *       borDuINorge → norsk vs utenlandsk adresse
 *       vegadresseEllerPostboksadresse → vegadresse vs postboksadresse
 *   - Arbeidsforholdet (arbeidsforholdet): panel-level + same-panel conditionals
 *       hvordanHarArbeidstakersArbeidstidVaert → Stillingens størrelse, Tabell 1, Tabell 2
 *       stillingensStorrelse → oppgiStillingsprosenten
 *       hvaVarArbeidstakersArbeidstidsordning → fast timer / rotasjon / annen informasjon
 *       erDetILopetAvDeSiste36... → sykepengeperioder
 *       erOpptjentFerieAvviklet1 / erOpptjentFerieAvviklet → ferieperioder
 *   - Arbeidstid siste 12 måneder (arbeidstidSiste12Maneder): 1 same-panel conditional
 *       timelister-checkbox → alertstripe / datagrid
 *   - Arbeidstid siste 36 måneder (arbeidstidSiste36Maneder): 1 same-panel conditional
 *       timelister-checkbox → alertstripe / two datagrids
 *   - Om virksomheten og permitteringen (omvirksomhetenogpermitteringen): 3 same-panel conditionals
 *       tilbyrVirksomhetenKunArbeidDelerAvAret → spesifiser1
 *       erArbeidstakerHeltEllerDelvisPermittertFraSinStilling → prosent
 *       harArbeidstakerFattTilbudOmAnnetArbeidIVirksomheten → forklarKort...
 *   - Permitteringsårsak og protokoll (permitteringsarsakogprotokoll): 3 same-panel conditionals
 *       erDetDokumentertEnighet → erDokumentasjonenVedlagt
 *       erDokumentasjonenVedlagt → alertstripe
 *       skyldesPermitteringenForholdInterntIVirksomheten → beskrivNaermere
 *   - Vedlegg (vedlegg): 1 cross-panel customConditional
 *       table attachment checkboxes → timelister
 */

const workHistoryLabel = 'Hvordan har arbeidstakers arbeidstid vært?';
const workArrangementLabel = /^Hva er arbeidstakers arbeidstidsordning\?/;
const fnrLabel = 'Har arbeidstaker norsk fødselsnummer eller d-nummer?';
const timelisterInsteadLabel = /Jeg vil legge ved dette i et eget vedlegg istedenfor å fylle ut tabellen nedenfor/;

const setWorkHistory = (option: RegExp, checked: boolean) => {
  cy.findByRole('group', { name: workHistoryLabel }).within(() => {
    cy.findByRole('checkbox', { name: option })[checked ? 'check' : 'uncheck']();
  });
};

const setWorkArrangement = (option: RegExp, checked: boolean) => {
  cy.findByRole('group', { name: workArrangementLabel }).within(() => {
    cy.findByRole('checkbox', { name: option })[checked ? 'check' : 'uncheck']();
  });
};

const selectRadio = (label: string | RegExp, value: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: value }).click();
  });
};

const fillEmployerPanel = () => {
  cy.findByRole('textbox', { name: 'Arbeidsgiver' }).type('Test AS');
  cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).type('889640782');
  cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testveien 1');
  cy.findByRole('textbox', { name: 'Postnummer' }).type('0150');
  cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
  cy.findByLabelText('Telefonnummer').type('12345678');
};

const fillEmployeeWithFnr = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  selectRadio(fnrLabel, 'Ja');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
};

const fillArbeidsforholdSummary = () => {
  cy.findByRole('textbox', { name: 'Arbeidstaker tiltrådte (dd.mm.åååå)' }).type('01.01.2024');
  cy.findByRole('textbox', { name: 'Siste arbeidsdag før permittering (dd.mm.åååå)' }).type('31.01.2025');
  setWorkHistory(/^Arbeidstaker har hatt fast arbeidstid i minst seks måneder/, true);
  selectRadio('Stillingens størrelse', 'Heltid');
  setWorkArrangement(/^Fast ukentlig arbeidstid$/, true);
  cy.findByLabelText('Oppgi antall faste timer per uke').type('37');
  selectRadio(
    'Er det i løpet av de siste 36 avsluttede kalendermånedene utbetalt sykepenger som er innmeldt som lønn til A-ordningen?',
    'Nei',
  );
  selectRadio('Er opptjent ferie avviklet?', 'Ja');
};

describe('nav040804', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Opplysninger om arbeidstaker conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040804/opplysningeromarbeidstaker?sub=paper');
      cy.defaultWaits();
    });

    it('toggles fnr, Norwegian address and foreign address branches', () => {
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Arbeidstakers fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Bor arbeidstaker i Norge?').should('not.exist');

      selectRadio(fnrLabel, 'Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
      cy.findByRole('textbox', { name: /Arbeidstakers fødselsdato/ }).should('not.exist');
      cy.findByLabelText('Bor arbeidstaker i Norge?').should('not.exist');

      selectRadio(fnrLabel, 'Nei');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /Arbeidstakers fødselsdato/ }).should('exist');
      cy.findByLabelText('Bor arbeidstaker i Norge?').should('exist');

      selectRadio('Bor arbeidstaker i Norge?', 'Ja');
      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, evt. postboks/ }).should('not.exist');

      selectRadio('Er kontaktadressen din en vegadresse eller postboksadresse?', 'Vegadresse');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      selectRadio('Er kontaktadressen din en vegadresse eller postboksadresse?', 'Postboksadresse');
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');

      selectRadio('Bor arbeidstaker i Norge?', 'Nei');
      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('not.exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, evt. postboks/ }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
    });
  });

  describe('Arbeidsforholdet conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040804/arbeidsforholdet?sub=paper');
      cy.defaultWaits();
    });

    it('shows the right panel links for each work history path', () => {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Arbeidstid siste 12 måneder' }).should('not.exist');
      cy.findByRole('link', { name: 'Arbeidstid siste 36 måneder' }).should('not.exist');
      cy.findByLabelText('Stillingens størrelse').should('not.exist');

      setWorkHistory(/^Arbeidstaker har hatt fast arbeidstid i minst seks måneder/, true);
      cy.findByLabelText('Stillingens størrelse').should('exist');
      cy.findByRole('link', { name: 'Arbeidstid siste 12 måneder' }).should('not.exist');
      cy.findByRole('link', { name: 'Arbeidstid siste 36 måneder' }).should('not.exist');

      setWorkHistory(/^Arbeidstaker har hatt fast arbeidstid i minst seks måneder/, false);
      setWorkHistory(/^Arbeidstaker har hatt varierende arbeidstid eller ikke hatt fast arbeidstid/, true);
      cy.findByLabelText('Stillingens størrelse').should('not.exist');
      cy.findByRole('link', { name: 'Arbeidstid siste 12 måneder' }).should('exist');
      cy.findByRole('link', { name: 'Arbeidstid siste 36 måneder' }).should('not.exist');

      setWorkHistory(/^Arbeidstaker har hatt varierende arbeidstid eller ikke hatt fast arbeidstid/, false);
      setWorkHistory(/^Arbeidstaker ønsker at Nav vurderer den gjennomsnittlige arbeidstiden/, true);
      cy.findByRole('link', { name: 'Arbeidstid siste 12 måneder' }).should('exist');
      cy.findByRole('link', { name: 'Arbeidstid siste 36 måneder' }).should('exist');
    });

    it('toggles stillingsprosent and work arrangement details', () => {
      setWorkHistory(/^Arbeidstaker har hatt fast arbeidstid i minst seks måneder/, true);

      selectRadio('Stillingens størrelse', 'Deltid');
      cy.findByLabelText('Oppgi stillingsprosenten').should('exist');
      selectRadio('Stillingens størrelse', 'Heltid');
      cy.findByLabelText('Oppgi stillingsprosenten').should('not.exist');

      cy.findByRole('textbox', { name: 'Oppgi antall faste timer per uke' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Oppgi type rotasjon' }).should('not.exist');
      cy.findAllByRole('textbox', { name: /Annen informasjon om arbeidsforholdet/ }).should('have.length', 0);

      setWorkArrangement(/^Fast ukentlig arbeidstid$/, true);
      cy.findByRole('textbox', { name: 'Oppgi antall faste timer per uke' }).should('exist');
      cy.findAllByRole('textbox', { name: /Annen informasjon om arbeidsforholdet/ }).should('have.length', 1);

      setWorkArrangement(/^Fast ukentlig arbeidstid$/, false);
      cy.findAllByRole('textbox', { name: /Annen informasjon om arbeidsforholdet/ }).should('have.length', 0);

      setWorkArrangement(/^Skift\/turnus\/rotasjon$/, true);
      cy.findByRole('textbox', { name: 'Oppgi antall faste timer per uke' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Oppgi type rotasjon' }).should('exist');
      cy.findByRole('textbox', { name: 'Arbeidsperioden gjelder fra (dd.mm.åååå)' }).should('exist');
      cy.findByRole('textbox', { name: 'Friperioden skal avvikles fra (dd.mm.åååå)' }).should('exist');
    });

    it('toggles sykepenger and ferie fields', () => {
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Ferie skal avvikles fra (dd.mm.åååå)' }).should('not.exist');
      cy.findByLabelText('Skal opptjent ferie avvikles?').should('not.exist');

      selectRadio(
        'Er det i løpet av de siste 36 avsluttede kalendermånedene utbetalt sykepenger som er innmeldt som lønn til A-ordningen?',
        'Ja',
      );
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('exist');
      cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).should('exist');
      cy.findByLabelText('Beløp').should('exist');

      selectRadio('Er opptjent ferie avviklet?', 'Nei');
      cy.findByLabelText('Skal opptjent ferie avvikles?').should('exist');
      selectRadio('Skal opptjent ferie avvikles?', 'Ja');
      cy.findByRole('textbox', { name: 'Ferie skal avvikles fra (dd.mm.åååå)' }).should('exist');
      cy.findByRole('textbox', { name: 'Ferie skal avvikles til (dd.mm.åååå)' }).should('exist');

      selectRadio('Skal opptjent ferie avvikles?', 'Nei');
      cy.findByRole('textbox', { name: 'Ferie skal avvikles fra (dd.mm.åååå)' }).should('not.exist');
    });
  });

  describe('Arbeidstid siste 12 måneder conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040804/arbeidsforholdet?sub=paper');
      cy.defaultWaits();
      setWorkHistory(/^Arbeidstaker har hatt varierende arbeidstid eller ikke hatt fast arbeidstid/, true);
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Arbeidstid siste 12 måneder' }).click();
    });

    it('hides the 12-month datagrid when timelister will be attached', () => {
      cy.findByRole('textbox', { name: 'Uke/år' }).should('exist');
      cy.findByLabelText('Antall timer').should('exist');

      cy.findByRole('checkbox', { name: timelisterInsteadLabel }).click();
      cy.contains('Husk at i vedlegget').should('exist');
      cy.findByRole('textbox', { name: 'Uke/år' }).should('not.exist');
      cy.findByLabelText('Antall timer').should('not.exist');
    });
  });

  describe('Arbeidstid siste 36 måneder conditionals', () => {
    it('hides both 36-month datagrids when timelister will be attached', () => {
      cy.visit('/fyllut/nav040804/arbeidsforholdet?sub=paper');
      cy.defaultWaits();
      setWorkHistory(/^Arbeidstaker ønsker at Nav vurderer den gjennomsnittlige arbeidstiden/, true);
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Arbeidstid siste 36 måneder' }).click();

      cy.findAllByRole('textbox', { name: 'Uke/år' }).should('have.length', 2);
      cy.findAllByLabelText('Antall timer').should('have.length', 2);

      cy.findByRole('checkbox', { name: timelisterInsteadLabel }).click();
      cy.contains('Husk at i vedlegget').should('exist');
      cy.findAllByRole('textbox', { name: 'Uke/år' }).should('have.length', 0);
      cy.findAllByLabelText('Antall timer').should('have.length', 0);
    });
  });

  describe('Om virksomheten og permitteringen conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040804/omvirksomhetenogpermitteringen?sub=paper');
      cy.defaultWaits();
    });

    it('toggles seasonal work, permit percentage and alternative work explanation', () => {
      cy.findByRole('textbox', { name: 'Spesifiser' }).should('not.exist');
      cy.findByLabelText('Oppgi hvor mange prosent den ansatte er permittert').should('not.exist');
      cy.findByRole('textbox', {
        name: 'Forklar kort hvilken type arbeid, hvor og hvorfor arbeidstaker har takket nei',
      }).should('not.exist');

      selectRadio('Tilbyr virksomheten kun arbeid deler av året?', 'Ja');
      cy.findByRole('textbox', { name: 'Spesifiser' }).should('exist');
      selectRadio('Tilbyr virksomheten kun arbeid deler av året?', 'Nei');
      cy.findByRole('textbox', { name: 'Spesifiser' }).should('not.exist');

      selectRadio('Er arbeidstaker helt eller delvis permittert fra sin stilling?', 'Delvis permittert');
      cy.findByLabelText('Oppgi hvor mange prosent den ansatte er permittert').should('exist');
      selectRadio('Er arbeidstaker helt eller delvis permittert fra sin stilling?', 'Helt permittert');
      cy.findByLabelText('Oppgi hvor mange prosent den ansatte er permittert').should('not.exist');

      selectRadio('Har arbeidstaker fått tilbud om annet arbeid i virksomheten?', 'Ja');
      cy.findByRole('textbox', {
        name: 'Forklar kort hvilken type arbeid, hvor og hvorfor arbeidstaker har takket nei',
      }).should('exist');
      selectRadio('Har arbeidstaker fått tilbud om annet arbeid i virksomheten?', 'Nei');
      cy.findByRole('textbox', {
        name: 'Forklar kort hvilken type arbeid, hvor og hvorfor arbeidstaker har takket nei',
      }).should('not.exist');
    });
  });

  describe('Permitteringsårsak og protokoll conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040804/permitteringsarsakogprotokoll?sub=paper');
      cy.defaultWaits();
    });

    it('toggles documentation and internal-cause explanation fields', () => {
      cy.findByLabelText('Er dokumentasjonen vedlagt?').should('not.exist');
      cy.contains('skal dette legges ved i innsendingen av skjemaet').should('not.exist');
      cy.findByRole('textbox', { name: 'Beskriv nærmere' }).should('not.exist');

      selectRadio('Er det dokumentert enighet?', 'Ja');
      cy.findByLabelText('Er dokumentasjonen vedlagt?').should('exist');
      selectRadio('Er dokumentasjonen vedlagt?', 'Nei');
      cy.contains('skal dette legges ved i innsendingen av skjemaet').should('exist');
      selectRadio('Er dokumentasjonen vedlagt?', 'Ja');
      cy.contains('skal dette legges ved i innsendingen av skjemaet').should('not.exist');

      selectRadio('Skyldes permitteringen forhold internt i virksomheten?', 'Ja');
      cy.findByRole('textbox', { name: 'Beskriv nærmere' }).should('exist');
      selectRadio('Skyldes permitteringen forhold internt i virksomheten?', 'Nei');
      cy.findByRole('textbox', { name: 'Beskriv nærmere' }).should('not.exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040804/arbeidsforholdet?sub=paper');
      cy.defaultWaits();
    });

    it('shows timelister when the 12-month table will be attached instead of filled', () => {
      setWorkHistory(/^Arbeidstaker har hatt varierende arbeidstid eller ikke hatt fast arbeidstid/, true);
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Arbeidstid siste 12 måneder' }).click();
      cy.findByRole('checkbox', { name: timelisterInsteadLabel }).click();

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Timelister/ }).should('exist');
    });

    it('hides timelister when no table attachment checkbox is checked', () => {
      setWorkHistory(/^Arbeidstaker ønsker at Nav vurderer den gjennomsnittlige arbeidstiden/, true);
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Timelister/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040804?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      cy.clickNextStep();

      fillEmployerPanel();
      cy.clickNextStep();

      fillEmployeeWithFnr();
      cy.clickNextStep();

      fillArbeidsforholdSummary();
      cy.clickNextStep();

      selectRadio('Tilbyr virksomheten kun arbeid deler av året?', 'Nei');
      cy.findByRole('textbox', { name: 'Virksomhetens etableringsdato (dd.mm.åååå)' }).type('01.01.2020');
      cy.findByRole('textbox', {
        name: 'Permitteringsvarsel ble gitt/sendt ut (dd.mm.åååå)',
      }).type('15.01.2025');
      cy.findByRole('textbox', { name: 'Permitteringsperiode fra og med (dd.mm.åååå)' }).type('01.02.2025');
      cy.findByRole('textbox', { name: 'Lønnspliktperiode fra (dd.mm.åååå)' }).type('01.02.2025');
      cy.findByRole('textbox', { name: 'Lønnspliktperiode til (dd.mm.åååå)' }).type('14.02.2025');
      selectRadio('Er arbeidstaker helt eller delvis permittert fra sin stilling?', 'Helt permittert');
      selectRadio('Har arbeidstaker fått tilbud om annet arbeid i virksomheten?', 'Nei');
      cy.clickNextStep();

      selectRadio('Er det dokumentert enighet?', 'Ja');
      selectRadio('Er dokumentasjonen vedlagt?', 'Ja');
      selectRadio(
        'Har arbeidsgiveren tapt lisens, bevilgning, bevilling, tillatelse eller lignende før permitteringen?',
        'Nei',
      );
      selectRadio(
        'Har den permitterte tapt lisens, bevilgning, bevilling, tillatelse eller lignende før permitteringen?',
        'Nei',
      );
      selectRadio('Skyldes permitteringen forhold internt i virksomheten?', 'Nei');
      selectRadio('Skyldes permitteringen endringer i bransjen/markedet som virksomheten opererer innenfor?', 'Ja');
      cy.findByRole('textbox', {
        name: 'Hva er virksomhetens beskrivelse av årsaken til mangel på arbeid/sysselsettingsmulighet?',
      }).type('Færre oppdrag i markedet.');
      cy.findByRole('textbox', {
        name: /Når ble virksomheten oppmerksom på de aktuelle forholdene\/endringene/,
      }).type('Høsten 2024.');
      cy.findByRole('textbox', { name: 'Har de aktuelle endringene pågått over tid?' }).type('Ja, siden høsten 2024.');
      cy.findByRole('textbox', { name: 'Hvilke tiltak er iverksatt for å unngå permitteringen?' }).type(
        'Kostnadskutt og omdisponering av arbeid.',
      );
      cy.findByRole('textbox', { name: 'Når ble tiltakene iverksatt? (dd.mm.åååå)' }).type('01.11.2024');
      cy.findByRole('textbox', { name: 'Når antar dere at permitteringssituasjonen vil opphøre? (dd.mm.åååå)' }).type(
        '01.06.2025',
      );
      cy.findByRole('textbox', {
        name: 'Hvorfor tror dere at permitteringen vil opphøre på dette tidspunktet?',
      }).type('Forventer nye oppdrag før sommeren.');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon/i }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Om arbeidsgiver', () => {
        cy.contains('dt', 'Arbeidsgiver').next('dd').should('contain.text', 'Test AS');
      });
      cy.withinSummaryGroup('Opplysninger om arbeidstaker', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Arbeidsforholdet', () => {
        cy.contains('dt', workArrangementLabel).next('dd').should('contain.text', 'Fast ukentlig arbeidstid');
      });
    });
  });
});
