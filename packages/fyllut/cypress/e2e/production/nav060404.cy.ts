import nav060404Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav060404.json';

/*
 * Production form tests for Søknad om hjelpestønad
 * Form: nav060404
 * Submission types: PAPER, DIGITAL, DIGITAL_NO_LOGIN
 *
 * Panels tested:
 *   - Søknaden gjelder (soknadenGjelder): 2 same-panel conditionals + panel-level visibility
 *       application type → applicant field / hvem søker du for
 *       applicant type → Fullmakt and Utbetaling panel visibility
 *   - Fullmakt (fullmakt): 2 same-panel conditional groups
 *       hvorforSokerPaVegneAvEnAnnenPerson → forklar/relasjon
 *       foster branch → bekreftelse / barnevernsadresse fields
 *   - Personopplysninger (personopplysninger): child + adult-other conditional branches
 *       borBarnetINorge → oppgiBarnetsBosettingsland
 *       harIkkeNorskFodselsnummerEllerDNummer / borSokerenINorge / vegadresse → address fields
 *   - Utbetaling (utbetaling): foster-specific same-panel conditionals
 *       utbetales til → kontonummer / innhent-checkbox
 *       mottarBarnetYtelseFraEtAnnetLand → country + benefit fields
 *   - Beskrivelse av hjelpebehovet (beskrivelseAvHjelpebehovetBarn): child same-panel conditionals
 *       narHarBarnetBehovForHjelp → morning fields
 *       public help / tap av arbeidsinntekt → detail textareas
 *   - Vedlegg (vedlegg): cross-panel conditional from Tilleggsopplysninger
 *       harDuNyereMedisinskeOpplysningerDuVilSendeInnTilOss → medisinskeOpplysninger
 */

const selectCountry = (label: string, country = 'Sverige') => {
  cy.findByRole('combobox', { name: label }).type(`${country}{downArrow}{enter}`);
};

const visitPanel = (path: string, title?: string) => {
  cy.visit(path);
  cy.get('h2#page-title', { timeout: 30000 }).should('exist');

  if (title) {
    cy.get('h2#page-title').should('contain.text', title);
  }
};

const selectApplicationType = (option: string) => {
  cy.withinComponent('Hva ønsker du å søke om?', () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const selectApplicantType = (option: string) => {
  cy.withinComponent('Søker du for deg selv eller på vegne av en annen person?', () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const selectWhoYouApplyFor = (option: string) => {
  cy.withinComponent('Hvem søker du for?', () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const openPanelFromStart = ({
  application = 'Jeg ønsker å søke om hjelpestønad',
  applicant,
  who,
  panelTitle,
}: {
  application?: string;
  applicant?: string;
  who?: string;
  panelTitle: string;
}) => {
  visitPanel('/fyllut/nav060404/soknadenGjelder?sub=paper', 'Søknaden gjelder');
  selectApplicationType(application);

  if (applicant) {
    selectApplicantType(applicant);
  }

  if (who) {
    selectWhoYouApplyFor(who);
  }

  cy.clickShowAllSteps();
  cy.findByRole('link', { name: panelTitle }).click();
};

describe('nav060404', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.intercept('GET', '/fyllut/api/forms/nav060404*', { body: nav060404Form });
    cy.intercept('GET', '/fyllut/api/translations/nav060404*', { body: { 'nb-NO': {} } });
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: { 'nb-NO': {} } });
  });

  describe('Søknaden gjelder conditionals', () => {
    beforeEach(() => {
      visitPanel('/fyllut/nav060404/soknadenGjelder?sub=paper', 'Søknaden gjelder');
    });

    it('switches between applicant branch and hvem søker du for branch', () => {
      cy.findByLabelText('Søker du for deg selv eller på vegne av en annen person?').should('not.exist');
      cy.findByLabelText('Hvem søker du for?').should('not.exist');

      selectApplicationType('Jeg ønsker å søke om hjelpestønad');
      cy.findByLabelText('Søker du for deg selv eller på vegne av en annen person?').should('exist');
      cy.findByLabelText('Hvem søker du for?').should('not.exist');

      selectApplicationType('Jeg ønsker å søke om økt hjelpestønad');
      cy.findByLabelText('Søker du for deg selv eller på vegne av en annen person?').should('not.exist');
      cy.findByLabelText('Hvem søker du for?').should('exist');
    });

    it('shows Fullmakt and Utbetaling only for representative child branches', () => {
      selectApplicationType('Jeg ønsker å søke om hjelpestønad');
      cy.clickShowAllSteps();

      selectApplicantType('Jeg søker på vegne av meg selv.');
      cy.findByRole('link', { name: 'Fullmakt' }).should('not.exist');
      cy.findByRole('link', { name: 'Utbetaling' }).should('not.exist');

      selectApplicantType('Jeg søker på vegne av eget barn under 18 år.');
      cy.findByRole('link', { name: 'Fullmakt' }).should('exist');
      cy.findByRole('link', { name: 'Utbetaling' }).should('exist');

      selectApplicantType('Jeg søker på vegne av en annen person over 18 år.');
      cy.findByRole('link', { name: 'Fullmakt' }).should('exist');
      cy.findByRole('link', { name: 'Utbetaling' }).should('not.exist');
    });
  });

  describe('Fullmakt conditionals', () => {
    it('shows explanation and relation fields only when søker cannot sign', () => {
      openPanelFromStart({
        applicant: 'Jeg søker på vegne av en annen person over 18 år.',
        panelTitle: 'Fullmakt',
      });

      cy.findByRole('textbox', {
        name: 'Forklar hvorfor søkeren ikke kan undertegne søknaden selv',
      }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hva er din relasjon til personen du søker for?' }).should('not.exist');

      cy.withinComponent('Hvorfor søker du på vegne av en annen person?', () => {
        cy.findByRole('radio', { name: 'Søkeren kan ikke undertegne søknaden selv' }).click();
      });

      cy.findByRole('textbox', {
        name: 'Forklar hvorfor søkeren ikke kan undertegne søknaden selv',
      }).should('exist');
      cy.findByRole('textbox', { name: 'Hva er din relasjon til personen du søker for?' }).should('exist');

      cy.withinComponent('Hvorfor søker du på vegne av en annen person?', () => {
        cy.findByRole('radio', { name: 'Jeg har fullmakt registrert hos NAV' }).click();
      });

      cy.findByRole('textbox', {
        name: 'Forklar hvorfor søkeren ikke kan undertegne søknaden selv',
      }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hva er din relasjon til personen du søker for?' }).should('not.exist');
    });

    it('shows barnevern address fields only when foster branch needs manual address', () => {
      openPanelFromStart({
        applicant: 'Jeg søker på vegne av fosterbarn/barn i beredskapshjem under 18 år.',
        panelTitle: 'Fullmakt',
      });

      cy.findByLabelText(/Vil du legge ved bekreftelse eller oppgi barnevernets adresse/).should('not.exist');
      cy.findByRole('textbox', { name: 'Navn' }).should('not.exist');

      cy.withinComponent(/Har du bekreftelse fra barnevernet registrert hos NAV/iu, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText(/Vil du legge ved bekreftelse eller oppgi barnevernets adresse/).should('exist');

      cy.withinComponent('Vil du legge ved bekreftelse eller oppgi barnevernets adresse?', () => {
        cy.findByRole('radio', { name: 'Jeg vil oppgi barnevernets adresse.' }).click();
      });

      cy.findByRole('textbox', { name: 'Navn' }).should('exist');
      cy.findByRole('textbox', { name: 'Postadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
      cy.findByRole('textbox', { name: 'Poststed' }).should('exist');
    });
  });

  describe('Personopplysninger conditionals', () => {
    it('shows child country field when barnet bor utenfor Norge', () => {
      openPanelFromStart({
        applicant: 'Jeg søker på vegne av eget barn under 18 år.',
        panelTitle: 'Personopplysninger',
      });

      cy.findByRole('combobox', { name: 'Oppgi barnets bosettingsland' }).should('not.exist');

      cy.withinComponent('Bor barnet i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      selectCountry('Oppgi barnets bosettingsland');
    });

    it('switches to date and address fields when adult-other branch has no norwegian fnr', () => {
      openPanelFromStart({
        applicant: 'Jeg søker på vegne av en annen person over 18 år.',
        panelTitle: 'Personopplysninger',
      });

      cy.findByRole('checkbox', { name: /Har ikke norsk fødselsnummer eller D-nummer/ }).should('exist');
      cy.findByRole('textbox', { name: 'Fødselsdato (dd.mm.åååå)' }).should('not.exist');
      cy.findByLabelText('Bor søkeren i Norge?').should('not.exist');
      cy.findByLabelText('Hva er søkers sivilstand?').should('exist');

      cy.findByRole('checkbox', { name: /Har ikke norsk fødselsnummer eller D-nummer/ }).click();
      cy.findByRole('textbox', { name: 'Fødselsnummer / D-nummer' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Fødselsdato (dd.mm.åååå)' }).should('exist');
      cy.findByLabelText('Bor søkeren i Norge?').should('exist');

      cy.withinComponent('Bor søkeren i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Er kontaktadressen vegadresse eller postboksadresse?').should('exist');

      cy.withinComponent('Er kontaktadressen vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });

      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
      cy.findByRole('textbox', { name: 'Poststed' }).should('exist');
    });
  });

  describe('Utbetaling conditionals', () => {
    beforeEach(() => {
      openPanelFromStart({
        applicant: 'Jeg søker på vegne av fosterbarn/barn i beredskapshjem under 18 år.',
        panelTitle: 'Utbetaling',
      });
    });

    it('switches between foster parent and barnevern payout fields', () => {
      cy.findByRole('textbox', { name: 'Fosterforelders kontonummer' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Barnevernets kontonummer' }).should('not.exist');

      cy.withinComponent('Skal hjelpestønaden utbetales til fosterforeldrene eller til barnevernet?', () => {
        cy.findByRole('radio', { name: 'Fosterforeldrene' }).click();
      });
      cy.findByRole('textbox', { name: 'Fosterforelders kontonummer' }).should('exist');

      cy.withinComponent('Skal hjelpestønaden utbetales til fosterforeldrene eller til barnevernet?', () => {
        cy.findByRole('radio', { name: 'Barnevernet' }).click();
      });
      cy.findByRole('textbox', { name: 'Fosterforelders kontonummer' }).should('not.exist');
      cy.findByRole('textbox', { name: /Barnevernets kontonummer/ }).should('exist');
      cy.findByRole('checkbox', { name: /Jeg vil at NAV skal innhente barnevernets kontonummer/ }).should('exist');
    });

    it('shows foreign benefit details only when barnet receives benefit abroad', () => {
      cy.findByRole('textbox', { name: 'Hvilket land mottar barnet ytelse fra?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hvilken ytelse mottar barnet?' }).should('not.exist');

      cy.withinComponent('Mottar barnet ytelse fra et annet land?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Hvilket land mottar barnet ytelse fra?' }).should('exist');
      cy.findByRole('textbox', { name: 'Hvilken ytelse mottar barnet?' }).should('exist');

      cy.withinComponent('Mottar barnet ytelse fra et annet land?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Hvilket land mottar barnet ytelse fra?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hvilken ytelse mottar barnet?' }).should('not.exist');
    });
  });

  describe('Beskrivelse av hjelpebehovet conditionals', () => {
    beforeEach(() => {
      openPanelFromStart({
        applicant: 'Jeg søker på vegne av eget barn under 18 år.',
        panelTitle: 'Beskrivelse av hjelpebehovet',
      });
    });

    it('shows morning details and extra text areas for child branch answers', () => {
      cy.findByRole('textbox', { name: 'Beskriv nærmere' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hva slags hjelp er barnet innvilget og hvor mye?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Beskriv nærmere' }).should('not.exist');

      cy.findByRole('group', { name: 'Når har barnet behov for hjelp?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Om morgenen' }).check();
      });

      cy.findAllByRole('textbox', { name: 'Beskriv nærmere' }).should('have.length.at.least', 1);
      cy.findByRole('textbox', { name: 'Hvem gjør det?' }).should('exist');
      cy.findByLabelText('Antall timer hver morgen').should('exist');

      cy.withinComponent('Får barnet hjelp fra det offentlige?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Hva slags hjelp er barnet innvilget og hvor mye?' }).should('exist');

      cy.withinComponent('Har omsorgspersonen tap av arbeidsinntekt på grunn av hjelpebehovet til barnet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findAllByRole('textbox', { name: 'Beskriv nærmere' }).should('have.length.at.least', 2);
    });
  });

  describe('Vedlegg conditionals', () => {
    beforeEach(() => {
      visitPanel('/fyllut/nav060404/tilleggsopplysninger?sub=paper', 'Tilleggsopplysninger');
    });

    it('shows medisinske opplysninger attachment only when the user wants to send newer medical info', () => {
      cy.withinComponent('Har du nyere medisinske opplysninger du vil sende inn til oss?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Medisinske opplysninger/ }).should('exist');
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).should('exist');

      cy.findByRole('link', { name: 'Tilleggsopplysninger' }).click();
      cy.withinComponent('Har du nyere medisinske opplysninger du vil sende inn til oss?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Medisinske opplysninger/ }).should('not.exist');
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      visitPanel('/fyllut/nav060404?sub=paper');
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();
    });

    it('fills required child-path fields and verifies summary', () => {
      // Søknaden gjelder
      selectApplicationType('Jeg ønsker å søke om hjelpestønad');
      selectApplicantType('Jeg søker på vegne av eget barn under 18 år.');
      cy.clickNextStep();

      // Fullmakt
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Personopplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.withinComponent('Bor barnet i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      // Utbetaling
      cy.findByRole('textbox', { name: 'Kontonummer' }).type('01234567892');
      cy.withinComponent('Mottar barnet ytelse fra et annet land?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Helsesituasjon
      cy.findByRole('textbox', { name: 'Oppgi diagnose(r)' }).type('Behov for tett oppfølging');
      cy.findByRole('textbox', { name: /Når ble den medisinske tilstanden oppdaget/ }).type('01.01.2024');
      cy.withinComponent('Oppgi lege vi kan få opplysninger fra', () => {
        cy.findByRole('radio', { name: 'Fastlege' }).click();
      });
      cy.clickNextStep();

      // Beskrivelse av hjelpebehovet
      cy.findByRole('group', { name: 'Når har barnet behov for hjelp?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Om morgenen' }).check();
      });
      cy.findAllByRole('textbox', { name: 'Beskriv nærmere' }).first().type('Barnet trenger hjelp til morgenrutiner.');
      cy.findByRole('textbox', { name: 'Hvem gjør det?' }).type('Mor');
      cy.findByLabelText('Antall timer hver morgen').type('2');
      cy.withinComponent('Får barnet hjelp fra det offentlige?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har omsorgspersonen tap av arbeidsinntekt på grunn av hjelpebehovet til barnet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Tilleggsopplysninger
      cy.withinComponent('Har du nyere medisinske opplysninger du vil sende inn til oss?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Erklæring
      cy.findByRole('checkbox', {
        name: 'Jeg er kjent med at NAV kan innhente de opplysningene som er nødvendige for å avgjøre søknaden.',
      }).click();
      cy.clickNextStep();

      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Søknaden gjelder', () => {
        cy.contains('dt', 'Hva ønsker du å søke om?')
          .next('dd')
          .should('contain.text', 'Jeg ønsker å søke om hjelpestønad');
      });
      cy.withinSummaryGroup('Personopplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Utbetaling', () => {
        cy.contains('dt', 'Kontonummer').next('dd').should('contain.text', '0123');
      });
    });
  });
});
