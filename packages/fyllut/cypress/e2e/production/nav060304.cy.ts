import nav060304Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav060304.json';

/*
 * Production form tests for Søknad om grunnstønad
 * Form: nav060304
 * Submission types: PAPER, DIGITAL, DIGITAL_NO_LOGIN
 * introPage.enabled === true — cy.clickIntroPageConfirmation() is required on the root URL.
 *
 * Panels tested:
 *   - Søknaden gjelder (soknadenGjelder): panel-level conditionals
 *       sokerDuForDegSelvEllerPaVegneAvEnAnnenPerson → jegBekrefterAtJegErOver18Ar,
 *       Fullmakt, Utbetaling
 *   - Fullmakt (fullmakt): same-panel conditionals
 *       hvorforSokerPaVegneAvEnAnnenPerson → forklarHvorforSokerenIkkeKanSkriveUnderSoknadenSelv,
 *       hvaErDinRelasjonTilPersonenDuSokerFor3
 *   - Personopplysninger (personopplysninger): same-panel conditionals
 *       harIkkeNorskFodselsnummerEllerDNummer → fødselsdato/fødselsnummer
 *       harIkkeTelefonnummer → telefonnummer visibility
 *   - Ekstrautgifter (ekstrautgifter): cross-panel conditional
 *       harDuPaGrunnAvSykdomSkadeEllerLyteEkstrautgifterTil → Tekniske hjelpemidler panel
 *   - Tekniske hjelpemidler (tekniskeHjelpemidler) → Vedlegg cross-panel conditional
 *       harDuDokumentasjonAvEkstrautgifterTilDriftAvTekniskeHjelpemidlerDuSkalSendeInnTilOss
 *       → dokumentasjonAvEkstrautgifterTilDriftAvTekniskeHjelpemidler attachment
 */

const formPath = 'nav060304';

const formatDate = (date: Date) => {
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

const selectRadio = (label: string | RegExp, option: string | RegExp) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const selectExtraExpense = (option: string, checked: boolean) => {
  cy.findByRole('group', { name: /Har du på grunn av en medisinsk tilstand ekstrautgifter til/ }).within(() => {
    if (checked) {
      cy.findByRole('checkbox', { name: option }).check();
    } else {
      cy.findByRole('checkbox', { name: option }).uncheck();
    }
  });
};

const chooseAttachmentAnswer = (groupName: RegExp, answer: string | RegExp) => {
  cy.findByRole('group', { name: groupName }).within(() => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const startApplication = () => {
  cy.visit(`/fyllut/${formPath}?sub=paper`);
  cy.defaultWaits();
  cy.clickIntroPageConfirmation();
  cy.clickNextStep();
  cy.get('#page-title').should('contain.text', 'Søknaden gjelder');
};

const chooseSelfApplicant = () => {
  selectRadio('Hva ønsker du å søke om?', 'Jeg ønsker å søke om grunnstønad');
  selectRadio('Søker du for deg selv eller på vegne av en annen person?', 'Jeg søker på vegne av meg selv.');
  cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg er over 18 år.' }).click();
};

const fillPersonopplysningerSelf = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
  cy.findByLabelText('Telefonnummer').type('12345678');
  selectRadio('Hva er din sivilstand?', 'Ugift');
};

const fillTilknytningSelf = () => {
  selectRadio('Er du fast bosatt i Norge?', 'Ja');
  selectRadio('Mottar du ytelse fra et annet land enn Norge?', 'Nei');
};

const fillHelsesituasjon = () => {
  cy.findByRole('textbox', { name: 'Oppgi diagnose(r)' }).type('Migrene');
  selectRadio('Oppgi lege vi kan få opplysninger fra', 'Fastlege');
};

const goToPersonopplysningerSelf = () => {
  startApplication();
  chooseSelfApplicant();
  cy.clickNextStep();
  cy.get('#page-title').should('contain.text', 'Personopplysninger');
};

const goToPersonopplysningerAdultApplicant = () => {
  startApplication();
  selectRadio('Hva ønsker du å søke om?', 'Jeg ønsker å søke om grunnstønad');
  selectRadio(
    'Søker du for deg selv eller på vegne av en annen person?',
    'Jeg søker på vegne av en annen person over 18 år.',
  );
  cy.clickNextStep();
  cy.get('#page-title').should('contain.text', 'Fullmakt');
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Verge');
  cy.findByLabelText('Telefonnummer').type('12345678');
  selectRadio('Hvorfor søker du på vegne av en annen person?', 'Jeg er verge');
  cy.clickNextStep();
  cy.get('#page-title').should('contain.text', 'Personopplysninger');
};

const goToFullmaktForAdultApplicant = () => {
  startApplication();
  selectRadio('Hva ønsker du å søke om?', 'Jeg ønsker å søke om grunnstønad');
  selectRadio(
    'Søker du for deg selv eller på vegne av en annen person?',
    'Jeg søker på vegne av en annen person over 18 år.',
  );
  cy.clickNextStep();
  cy.get('#page-title').should('contain.text', 'Fullmakt');
};

const goToEkstrautgifterSelf = () => {
  goToPersonopplysningerSelf();
  fillPersonopplysningerSelf();
  cy.clickNextStep();
  cy.get('#page-title').should('contain.text', 'Tilknytning til Norge');
  fillTilknytningSelf();
  cy.clickNextStep();
  cy.get('#page-title').should('contain.text', 'Helsesituasjon');
  fillHelsesituasjon();
  cy.clickNextStep();
  cy.get('#page-title').should('contain.text', 'Ekstrautgifter');
};

const goToTekniskeHjelpemidlerSelf = () => {
  goToEkstrautgifterSelf();
  selectExtraExpense('Drift av tekniske hjelpemidler', true);
  cy.clickNextStep();
  cy.get('#page-title').should('contain.text', 'Tekniske hjelpemidler');
};

describe('nav060304', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.intercept('GET', `/fyllut/api/forms/${formPath}*`, { body: nav060304Form }).as('getForm');
    cy.intercept('GET', `/fyllut/api/translations/${formPath}*`, { body: { 'nb-NO': {} } }).as('getTranslations');
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: { 'nb-NO': {} } });
  });

  describe('Søknaden gjelder conditionals', () => {
    beforeEach(() => {
      cy.visit(`/fyllut/${formPath}/soknadenGjelder?sub=paper`);
      cy.defaultWaits();
      cy.get('#page-title').should('contain.text', 'Søknaden gjelder');
    });

    it('toggles self-applicant confirmation and downstream panels by applicant type', () => {
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg er over 18 år.' }).should('not.exist');

      selectRadio('Søker du for deg selv eller på vegne av en annen person?', 'Jeg søker på vegne av meg selv.');
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg er over 18 år.' }).should('exist');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Fullmakt' }).should('not.exist');
      cy.findByRole('link', { name: 'Utbetaling' }).should('not.exist');

      selectRadio(
        'Søker du for deg selv eller på vegne av en annen person?',
        'Jeg søker på vegne av eget barn under 18 år.',
      );
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg er over 18 år.' }).should('not.exist');
      cy.findByRole('link', { name: 'Fullmakt' }).should('exist');
      cy.findByRole('link', { name: 'Utbetaling' }).should('exist');
    });
  });

  describe('Fullmakt conditionals', () => {
    beforeEach(() => {
      goToFullmaktForAdultApplicant();
    });

    it('shows explanation and relation fields only when the applicant cannot sign', () => {
      cy.findByRole('textbox', { name: 'Forklar hvorfor søkeren ikke kan undertegne søknaden selv' }).should(
        'not.exist',
      );
      cy.findByRole('textbox', { name: 'Hva er din relasjon til personen du søker for?' }).should('not.exist');

      selectRadio('Hvorfor søker du på vegne av en annen person?', 'Søkeren kan ikke undertegne søknaden selv');
      cy.findByRole('textbox', { name: 'Forklar hvorfor søkeren ikke kan undertegne søknaden selv' }).should('exist');
      cy.findByRole('textbox', { name: 'Hva er din relasjon til personen du søker for?' }).should('exist');

      selectRadio('Hvorfor søker du på vegne av en annen person?', 'Jeg er verge');
      cy.findByRole('textbox', { name: 'Forklar hvorfor søkeren ikke kan undertegne søknaden selv' }).should(
        'not.exist',
      );
      cy.findByRole('textbox', { name: 'Hva er din relasjon til personen du søker for?' }).should('not.exist');
    });
  });

  describe('Personopplysninger conditionals', () => {
    beforeEach(() => {
      goToPersonopplysningerAdultApplicant();
    });

    it('switches between fødselsnummer, fødselsdato and phone branches', () => {
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
      cy.findByRole('textbox', { name: 'Fødselsdato (dd.mm.åååå)' }).should('not.exist');
      cy.findByLabelText('Telefonnummer').should('exist');

      cy.findByRole('checkbox', { name: /Har ikke norsk fødselsnummer eller D-nummer/ }).click();
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: 'Fødselsdato (dd.mm.åååå)' }).should('exist');

      cy.findByRole('checkbox', { name: /Har ikke norsk fødselsnummer eller D-nummer/ }).click();
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
      cy.findByRole('textbox', { name: 'Fødselsdato (dd.mm.åååå)' }).should('not.exist');

      cy.findByRole('checkbox', { name: /Har ikke telefonnummer/ }).click();
      cy.findByLabelText('Telefonnummer').should('not.exist');

      cy.findByRole('checkbox', { name: /Har ikke telefonnummer/ }).click();
      cy.findByLabelText('Telefonnummer').should('exist');
    });
  });

  describe('Ekstrautgifter conditionals', () => {
    beforeEach(() => {
      goToEkstrautgifterSelf();
      cy.clickShowAllSteps();
    });

    it('shows the technical-aids panel only when the checkbox is selected', () => {
      cy.findByRole('link', { name: 'Tekniske hjelpemidler' }).should('not.exist');

      selectExtraExpense('Drift av tekniske hjelpemidler', true);
      cy.findByRole('link', { name: 'Tekniske hjelpemidler' }).should('exist');

      selectExtraExpense('Drift av tekniske hjelpemidler', false);
      cy.findByRole('link', { name: 'Tekniske hjelpemidler' }).should('not.exist');
    });
  });

  describe('Tekniske hjelpemidler to Vedlegg conditionals', () => {
    beforeEach(() => {
      goToTekniskeHjelpemidlerSelf();
      cy.findByRole('textbox', { name: 'Fra hvilket tidspunkt har du hatt ekstrautgiftene? (dd.mm.åååå)' }).type(
        formatDate(new Date()),
      );
      cy.findByRole('textbox', { name: 'Hvilket teknisk hjelpemiddel har du ekstrautgifter til?' }).type('CPAP-maskin');
      cy.findByLabelText('Ekstrautgifter per måned').type('1500');
      selectRadio('Hvor kommer hjelpemiddelet fra?', 'NAV');
      cy.clickShowAllSteps();
    });

    it('shows the technical-aids attachment when documentation is available', () => {
      selectRadio(
        'Har du dokumentasjon av ekstrautgifter til drift av tekniske hjelpemidler du skal sende inn til oss?',
        'Ja',
      );
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon av ekstrautgifter til drift av tekniske hjelpemidler/ }).should(
        'exist',
      );
    });

    it('hides the technical-aids attachment when documentation is not available', () => {
      selectRadio(
        'Har du dokumentasjon av ekstrautgifter til drift av tekniske hjelpemidler du skal sende inn til oss?',
        'Nei',
      );
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon av ekstrautgifter til drift av tekniske hjelpemidler/ }).should(
        'not.exist',
      );
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      goToEkstrautgifterSelf();
    });

    it('fills the self-applicant technical-aids path and verifies summary', () => {
      selectExtraExpense('Drift av tekniske hjelpemidler', true);
      cy.clickNextStep();

      cy.findByRole('textbox', { name: 'Fra hvilket tidspunkt har du hatt ekstrautgiftene? (dd.mm.åååå)' }).type(
        formatDate(new Date()),
      );
      cy.findByRole('textbox', { name: 'Hvilket teknisk hjelpemiddel har du ekstrautgifter til?' }).type('CPAP-maskin');
      cy.findByLabelText('Ekstrautgifter per måned').type('1500');
      selectRadio('Hvor kommer hjelpemiddelet fra?', 'NAV');
      selectRadio(
        'Har du dokumentasjon av ekstrautgifter til drift av tekniske hjelpemidler du skal sende inn til oss?',
        'Ja',
      );
      cy.clickNextStep();

      cy.findByRole('textbox', {
        name: /Hvis du har flere opplysninger du mener er viktig for søknaden/,
      }).type('Ingen flere opplysninger.');
      selectRadio('Har du nyere medisinske opplysninger du vil sende inn til oss?', 'Nei');
      cy.clickNextStep();

      chooseAttachmentAnswer(/Dokumentasjon av ekstrautgifter til drift av tekniske hjelpemidler/, /ettersender/i);
      chooseAttachmentAnswer(/Annen dokumentasjon/, /ingen ekstra dokumentasjon|Nei/i);
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Søknaden gjelder', () => {
        cy.contains('dt', 'Søker du for deg selv eller på vegne av en annen person?')
          .next('dd')
          .should('contain.text', 'Jeg søker på vegne av meg selv.');
      });
      cy.withinSummaryGroup('Personopplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Tekniske hjelpemidler', () => {
        cy.contains('dt', 'Hvilket teknisk hjelpemiddel har du ekstrautgifter til?')
          .next('dd')
          .should('contain.text', 'CPAP-maskin');
      });
    });
  });
});
