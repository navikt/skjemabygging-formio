import nav100710Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav100710.json';

/*
 * Production form tests for Søknad om ortopedisk hjelpemiddel
 * Form: nav100710
 * Submission types: none
 *
 * Panels tested:
 *   - Veiledning (veiledning): role-driven panel visibility
 *       angiDinRolleISoknadsprosessen → Legeerklæring / Erklæring fra ortopediingeniøren
 *   - Opplysninger om Søker (opplysningerOmSoker): 10 same-panel and downstream conditionals
 *       harSokerNorskFodselsnummerEllerDNummer → fnr field, alertstripe, address flow, downstream panels
 *       borDuINorge → address type and foreign-address fields
 *       erSokersAdresseVagadresseEllerPostboksadresse → vegadresse / postboks
 *       harIkkeTelefon → hides Telefonnummer
 *   - Hjelpemiddel (hjelpemiddel): type, quantity and role-driven conditionals
 *       hvilketHjelpemiddelSokesDetOm → branch-specific selectors
 *       antallAvDetteHjelpemidlet + branch selection → justification textareas
 *       angiDinRolleISoknadsprosessen → previous-specialist question / verksted fields
 *   - Legeerklæring (legeerklaering): 1 cross-panel conditional from Hjelpemiddel
 *       hjelpemiddel=fotseng → innleggssåler question
 *   - Opplysninger om legen / Erklæring fra søker / Vedlegg: role and attachment branches
 *       angiDinRolleISoknadsprosessen → lege fields / fornyelse declaration container
 *       hjelpemiddel reuse question = nei → fastlege attachment
 */

const visitPath = (path: string) => {
  cy.visit(path);
  cy.defaultWaits();
};

const visitRoot = () => {
  visitPath('/fyllut/nav100710');
};

const goToVeiledning = () => {
  visitRoot();
  cy.get('#page-title').should('contain.text', 'Introduksjon');
  cy.clickNextStep();
  cy.get('#page-title').should('contain.text', 'Veiledning');
};

const visitPanel = (panelKey: string) => {
  visitPath(`/fyllut/nav100710/${panelKey}`);
};

const selectRole = (option: 'Jeg er lege' | 'Jeg er ortopediingeniør') => {
  cy.withinComponent('Angi din rolle i søknadsprosessen', () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const fillApplicantWithFnr = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  cy.withinComponent('Har søker norsk fødselsnummer eller D-nummer?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
  cy.withinComponent('Bor søker i Norge?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.withinComponent('Er søkers adresse en vegadresse eller postboksadresse?', () => {
    cy.findByRole('radio', { name: 'Vegadresse' }).click();
  });
  cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testveien 1');
  cy.findByRole('textbox', { name: 'Postnummer' }).type('1234');
  cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
  cy.findByRole('textbox', { name: 'Bokommune/bydel' }).type('Oslo');
  cy.findByLabelText('Telefonnummer').type('12345678');
};

const goToHjelpemiddel = (role: 'Jeg er lege' | 'Jeg er ortopediingeniør') => {
  goToVeiledning();
  selectRole(role);
  cy.clickNextStep();
  fillApplicantWithFnr();
  cy.clickNextStep();
  cy.findByRole('heading', { level: 2, name: 'Hjelpemiddel' }).should('exist');
};

const chooseHjelpemiddel = (
  option:
    | 'Protese'
    | 'Ortose'
    | 'Spesialfottøy (par)'
    | 'Aktivitetshjelpemidler for brukere over 26 år (spesialproteser mv.)'
    | 'Fotseng'
    | 'Ortopedisk sydd fottøy (par) (fotseng er inkludert)'
    | 'Endring av fottøy (par)'
    | 'Annet',
) => {
  cy.withinComponent('Hvilket hjelpemiddel søkes det om?', () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const chooseRadio = (label: string | RegExp, option: string | RegExp) => {
  cy.findByLabelText(label)
    .closest('.form-group')
    .within(() => {
      cy.findByRole('radio', { name: option }).click();
    });
};

const typeNumberField = (label: string | RegExp, value: string) => {
  cy.findByLabelText(label).clear();
  cy.findByLabelText(label).type(value);
};

describe('nav100710', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.intercept('GET', '/fyllut/api/forms/nav100710*', { body: nav100710Form }).as('getForm');
    cy.intercept('GET', '/fyllut/api/translations/nav100710*', { body: { 'nb-NO': {} } }).as('getTranslations');
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: { 'nb-NO': {} } });
  });

  describe('Veiledning conditionals', () => {
    beforeEach(() => {
      goToVeiledning();
    });

    it('toggles downstream role-specific panels in the stepper', () => {
      selectRole('Jeg er lege');
      cy.clickNextStep();
      fillApplicantWithFnr();

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Legeerklæring' }).should('exist');
      cy.findByRole('link', { name: 'Erklæring fra ortopediingeniøren' }).should('not.exist');

      cy.clickPreviousStep();
      selectRole('Jeg er ortopediingeniør');
      cy.clickNextStep();

      cy.findByRole('link', { name: 'Legeerklæring' }).should('not.exist');
      cy.findByRole('link', { name: 'Erklæring fra ortopediingeniøren' }).should('exist');
    });
  });

  describe('Opplysninger om Søker conditionals', () => {
    beforeEach(() => {
      visitPanel('opplysningerOmSoker');
    });

    it('toggles identity, address and phone branches and hides later panels without Norwegian ID', () => {
      cy.findByLabelText('Søkers fødselsnummer / D-nummer').should('not.exist');
      cy.findByLabelText('Bor søker i Norge?').should('not.exist');

      chooseRadio('Har søker norsk fødselsnummer eller D-nummer?', 'Ja');
      cy.findByLabelText('Søkers fødselsnummer / D-nummer').should('exist');
      cy.findByLabelText('Bor søker i Norge?').should('exist');
      cy.contains('Søker må ha norsk fødselsnummer').should('not.exist');

      chooseRadio('Bor søker i Norge?', 'Ja');
      cy.findByLabelText('Er søkers adresse en vegadresse eller postboksadresse?').should('exist');
      chooseRadio('Er søkers adresse en vegadresse eller postboksadresse?', 'Vegadresse');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Bokommune/bydel' }).should('exist');

      chooseRadio('Er søkers adresse en vegadresse eller postboksadresse?', 'Postboksadresse');
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');

      chooseRadio('Bor søker i Norge?', 'Nei');
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: 'Bokommune/bydel' }).should('not.exist');
      cy.findByLabelText('Er søkers adresse en vegadresse eller postboksadresse?').should('not.exist');

      chooseRadio('Bor søker i Norge?', 'Ja');
      cy.findByLabelText('Telefonnummer').should('exist');
      cy.findByRole('checkbox', { name: /Har ikke telefon/ }).click();
      cy.findByLabelText('Telefonnummer').should('not.exist');
      cy.findByRole('checkbox', { name: /Har ikke telefon/ }).click();
      cy.findByLabelText('Telefonnummer').should('exist');

      chooseRadio('Har søker norsk fødselsnummer eller D-nummer?', 'Nei');
      cy.contains('Søker må ha norsk fødselsnummer').should('exist');
      cy.findByLabelText('Søkers fødselsnummer / D-nummer').should('not.exist');
      cy.findByLabelText('Bor søker i Norge?').should('not.exist');
    });
  });

  describe('Hjelpemiddel type conditionals', () => {
    beforeEach(() => {
      goToHjelpemiddel('Jeg er lege');
    });

    it('toggles branch-specific selectors for the selected hjelpemiddel type', () => {
      cy.findByRole('textbox', { name: 'Angi annet hjelpemiddel' }).should('not.exist');
      cy.findByLabelText('Hvilken protese søkes det om?').should('not.exist');
      cy.findByLabelText('Hvilken ortose søkes det om?').should('not.exist');
      cy.findByLabelText('Hvilken fotseng søkes det om?').should('not.exist');
      cy.findByLabelText('Spesifikasjon av endring av fottøy').should('not.exist');

      chooseHjelpemiddel('Annet');
      cy.findByRole('textbox', { name: 'Angi annet hjelpemiddel' }).should('exist');

      chooseHjelpemiddel('Protese');
      cy.findByRole('textbox', { name: 'Angi annet hjelpemiddel' }).should('not.exist');
      cy.findByLabelText('Hvilken protese søkes det om?').should('exist');

      chooseHjelpemiddel('Ortose');
      cy.findByLabelText('Hvilken protese søkes det om?').should('not.exist');
      cy.findByLabelText('Hvilken ortose søkes det om?').should('exist');

      chooseHjelpemiddel('Fotseng');
      cy.findByLabelText('Hvilken ortose søkes det om?').should('not.exist');
      cy.findByLabelText('Hvilken fotseng søkes det om?').should('exist');

      chooseHjelpemiddel('Endring av fottøy (par)');
      cy.findByLabelText('Hvilken fotseng søkes det om?').should('not.exist');
      cy.findByLabelText('Spesifikasjon av endring av fottøy').should('exist');
    });
  });

  describe('Hjelpemiddel quantity conditionals', () => {
    beforeEach(() => {
      goToHjelpemiddel('Jeg er lege');
    });

    it('toggles quantity-based explanation fields inside the datagrid row', () => {
      chooseHjelpemiddel('Protese');
      chooseRadio('Hvilken protese søkes det om?', 'Fot');
      typeNumberField('Angi ønsket antall av dette hjelpemidlet', '2');
      cy.findByRole('textbox', { name: 'Begrunn hvorfor det søkes om mer enn 1 protese' }).should('exist');
      typeNumberField('Angi ønsket antall av dette hjelpemidlet', '1');
      cy.findByRole('textbox', { name: 'Begrunn hvorfor det søkes om mer enn 1 protese' }).should('not.exist');

      chooseHjelpemiddel('Fotseng');
      chooseRadio('Hvilken fotseng søkes det om?', 'Par');
      typeNumberField('Angi ønsket antall av dette hjelpemidlet', '2');
      cy.findByRole('textbox', { name: 'Begrunn hvorfor brukeren trenger mer enn ett par fotsenger' }).should('exist');

      chooseRadio('Hvilken fotseng søkes det om?', 'Til én fot');
      cy.findByRole('textbox', { name: 'Begrunn hvorfor brukeren trenger mer enn én fotseng' }).should('exist');
      cy.findByRole('textbox', { name: 'Begrunn hvorfor brukeren trenger mer enn ett par fotsenger' }).should(
        'not.exist',
      );

      chooseHjelpemiddel('Endring av fottøy (par)');
      chooseRadio('Spesifikasjon av endring av fottøy', 'Oppbygging av fottøy (par)');
      typeNumberField('Angi ønsket antall av dette hjelpemidlet', '3');
      cy.findByRole('textbox', { name: 'Begrunn hvorfor det søkes om oppbygging av mer enn 2 par fottøy' }).should(
        'exist',
      );

      chooseRadio('Spesifikasjon av endring av fottøy', 'Ombygging av fottøy (par)');
      cy.findByRole('textbox', { name: 'Begrunn hvorfor det søkes om ombygging av mer enn 2 par fottøy' }).should(
        'exist',
      );
      cy.findByRole('textbox', { name: 'Begrunn hvorfor det søkes om oppbygging av mer enn 2 par fottøy' }).should(
        'not.exist',
      );
    });
  });

  describe('Hjelpemiddel role conditionals', () => {
    it('shows verksted controls for lege', () => {
      goToHjelpemiddel('Jeg er lege');
      cy.findByLabelText(
        /Er denne søknaden sendt innenfor det tidsrommet \(5 eller 10 år\) en legespesialist har angitt at det kan søkes uten ny legeerklæring\?/,
      ).should('not.exist');
      cy.findByRole('checkbox', { name: /Legen overlater til søker å velge ortopedisk verksted/ }).should('exist');
      cy.findByRole('textbox', {
        name: 'Navn og avdeling på ortopedisk verksted som skal levere hjelpemidlet/hjelpemidlene',
      }).should('exist');
      cy.findByRole('checkbox', { name: /Legen overlater til søker å velge ortopedisk verksted/ }).click();
      cy.findByRole('textbox', {
        name: 'Navn og avdeling på ortopedisk verksted som skal levere hjelpemidlet/hjelpemidlene',
      }).should('not.exist');
    });

    it('shows previous-specialist controls for ortopediingeniør', () => {
      goToHjelpemiddel('Jeg er ortopediingeniør');
      cy.findByRole('checkbox', { name: /Legen overlater til søker å velge ortopedisk verksted/ }).should('not.exist');
      chooseHjelpemiddel('Protese');
      cy.findByLabelText(
        /Er denne søknaden sendt innenfor det tidsrommet \(5 eller 10 år\) en legespesialist har angitt at det kan søkes uten ny legeerklæring\?/,
      ).should('exist');
      chooseRadio(
        'Er denne søknaden sendt innenfor det tidsrommet (5 eller 10 år) en legespesialist har angitt at det kan søkes uten ny legeerklæring?',
        'Nei',
      );
      cy.contains('Ved søknad om fornyelse etter at spesialistlegeerklæringen har utløpt').should('exist');
    });
  });

  describe('Legeerklæring conditionals', () => {
    it('shows the innleggssåler question only for fotseng applications', () => {
      goToHjelpemiddel('Jeg er lege');
      chooseHjelpemiddel('Protese');
      chooseRadio('Hvilken protese søkes det om?', 'Fot');
      cy.findByRole('textbox', { name: 'Nærmere beskrivelse av hjelpemidlet' }).type('Test');
      typeNumberField('Angi ønsket antall av dette hjelpemidlet', '1');
      cy.findByRole('textbox', {
        name: 'Navn og avdeling på ortopedisk verksted som skal levere hjelpemidlet/hjelpemidlene',
      }).type('Verksted Oslo');
      cy.clickNextStep();
      cy.findByLabelText(/Individuelt tilpassede innleggssåler kjøpt fra andre enn ortopediske verksteder/).should(
        'not.exist',
      );

      cy.clickPreviousStep();
      chooseHjelpemiddel('Fotseng');
      chooseRadio('Hvilken fotseng søkes det om?', 'Par');
      typeNumberField('Angi ønsket antall av dette hjelpemidlet', '1');
      cy.clickNextStep();
      cy.findByLabelText(/Individuelt tilpassede innleggssåler kjøpt fra andre enn ortopediske verksteder/).should(
        'exist',
      );
    });
  });

  describe('Role-based later panels and attachments', () => {
    it('switches lege fields and declaration container by role and shows the conditional fastlege attachment', () => {
      goToHjelpemiddel('Jeg er ortopediingeniør');
      chooseHjelpemiddel('Protese');
      chooseRadio('Hvilken protese søkes det om?', 'Fot');
      cy.findByRole('textbox', { name: 'Nærmere beskrivelse av hjelpemidlet' }).type('Test');
      typeNumberField('Angi ønsket antall av dette hjelpemidlet', '1');
      chooseRadio(
        'Er denne søknaden sendt innenfor det tidsrommet (5 eller 10 år) en legespesialist har angitt at det kan søkes uten ny legeerklæring?',
        'Ja',
      );

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Opplysninger om legen' }).click();
      cy.findByLabelText('Undertegnede lege er').should('not.exist');
      cy.findByRole('textbox', { name: /Legens ID-nummer/ }).should('exist');
      cy.findByRole('textbox', { name: 'Legens navn' }).should('exist');

      cy.findByRole('link', { name: 'Erklæring fra søker' }).click();
      cy.findByLabelText('Søker samtykker i at NAV sender kopi av vedtaket til det ortopediske verkstedet').should(
        'exist',
      );
      cy.findByRole('checkbox', {
        name: /Søker bekrefter at hjelpemidlet er ønsket, og at søker er motivert for å ta det i bruk/,
      }).should('not.exist');

      cy.findByRole('link', { name: 'Hjelpemiddel' }).click();
      chooseRadio(
        'Er denne søknaden sendt innenfor det tidsrommet (5 eller 10 år) en legespesialist har angitt at det kan søkes uten ny legeerklæring?',
        'Nei',
      );

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Erklæring fra fastlege/ }).should('exist');
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      goToVeiledning();
    });

    it('fills required fields and verifies summary', () => {
      selectRole('Jeg er lege');
      cy.clickNextStep();

      fillApplicantWithFnr();
      cy.clickNextStep();

      chooseHjelpemiddel('Protese');
      chooseRadio('Hvilken protese søkes det om?', 'Fot');
      cy.findByRole('textbox', { name: 'Nærmere beskrivelse av hjelpemidlet' }).type('Daglig behov');
      typeNumberField('Angi ønsket antall av dette hjelpemidlet', '1');
      cy.findByRole('textbox', {
        name: 'Navn og avdeling på ortopedisk verksted som skal levere hjelpemidlet/hjelpemidlene',
      }).type('Verksted Oslo');
      cy.clickNextStep();

      cy.findByRole('textbox', { name: 'Diagnose' }).type('Diagnose test');
      cy.findByRole('textbox', { name: 'ICD-10' }).type('M21');
      cy.findByRole('textbox', { name: 'Årsak til behov' }).type('Behov test');
      cy.findByRole('textbox', {
        name: 'Hvordan påvirker funksjonsnedsettelsen evnen til å utføre daglige aktiviteter?',
      }).type('Påvirker gange');
      cy.findByRole('textbox', { name: /Begrunn hvorfor hjelpemidlet\/hjelpemidlene er nødvendig/ }).type(
        'Nødvendig hjelpemiddel',
      );
      chooseRadio(/Vil søkeren\s+ha behov for hjelpemidlet\/hjelpemidlene i minst to-tre år\?/, 'Ja');
      chooseRadio(
        'Fornyelse av stønad til hjelpemidlet/hjelpemidlene',
        /Det er åpenbart at behovet for dette eller lignende hjelpemiddel vil være uendret i 5 år\./,
      );
      cy.clickNextStep();

      cy.findByLabelText('Undertegnede lege er')
        .closest('.form-group')
        .within(() => {
          cy.findByRole('radio', { name: /Sykehuslege m\/ fullmakt/ }).click();
        });
      cy.findByRole('textbox', { name: /Legens ID-nummer/ }).type('ABC123');
      cy.findByRole('textbox', { name: 'Legens navn' }).type('Dr Test');
      cy.clickNextStep();

      chooseRadio(
        'Søker samtykker i at legen sender søknaden til ortopedisk verksted som har rammeavtale med NAV.',
        'Ja',
      );
      chooseRadio('Søker samtykker i at NAV sender kopi av vedtak til det ortopediske verkstedet.', 'Ja');
      cy.findByRole('checkbox', {
        name: /Søker bekrefter at hjelpemidlet er ønsket, og at søker er motivert for å ta det i bruk/,
      }).click();
      cy.clickNextStep();

      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Opplysninger om Søker', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Hjelpemiddel', () => {
        cy.contains('dd', 'Protese').should('exist');
      });
      cy.withinSummaryGroup('Opplysninger om legen', () => {
        cy.contains('dd', 'Dr Test').should('exist');
      });
    });
  });
});
