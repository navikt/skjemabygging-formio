import nav020805Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav020805.json';

/*
 * Production form tests for Søknad om medlemskap i folketrygden under opphold utenfor EØS
 * Form: nav020805
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 4 customConditionals
 *       identitet.harDuFodselsnummer → adresse, adresseVarighet, folkeregister-alert
 *   - Opplysninger om søknaden (opplysningerOmSoknaden): 1 customConditional
 *       hvilkenTrygdedekningSokerDuOm → sokerDuITilleggOmRettTilSykepengerOgForeldrepenger
 *   - Lønnsmottaker (lonnsmottaker): 9 customConditionals
 *       work answers on opplysningerOmUtenlandsoppholdet → norsk/utenlandsk arbeidsgiver branches
 *       jegVetIkkeHvaVirksomhetsnummeretEr → orgnr / address containers
 *       hvemLonnesDuAvISoknadsperioden → annen norsk / utenlandsk virksomhet branches
 *   - Student (student): 3 customConditionals
 *       hvordanFinansiererDuStudiene → financing textarea, Norway follow-up, extra institution country
 *   - Au pair/praktikant eller arbeid ved siden av studier: 1 customConditional
 *       iHvilkenVirksomhetSkalArbeidetUtfores → virksomhetHvorArbeidetUtfores
 *   - Hvor utføres arbeidet (hvorUtforesArbeidet): 1 row customConditional
 *       arbeiderDuIEnRotasjonsordning → arbeidsmønster textarea
 *   - Skatteforhold og inntekt (skatteforholdOgInntekt): 6 customConditionals
 *       hvilkeNaturalytelserMottarDu → bolig/bil/andre-naturalytelser fields
 *   - Pensjon eller uføretrygd (pensjonEllerUforetrygd): 1 customConditional
 *       mottarDuPensjonFraNav / mottarDuITilleggPensjon... → pensjoner datagrid
 *   - Trygdeavgift til Nav (representantINorge): 3 customConditionals
 *       invoice representative answers → alertstripe + period date fields
 *   - Vedlegg (vedlegg): 3 cross-panel customConditionals
 *       hvorforSokerDuPaVegneAvEnAnnenPerson → fullmakt attachment
 *       invoice representative answers → faktura-fullmakt attachment
 *       barnetHarIkkeNorskFodselsnummerDNummer → fødselsattest attachment
 */

const submission = '?sub=paper';
const onBehalfLabel = /Fyller du ut\s+søknaden på\s+vegne av andre\s+enn deg selv\?/i;
const invoicePaymentQuestion = /Ønsker du at noen andre skal motta og betale faktura for trygdeavgift for deg\?/i;
const invoiceRecipientQuestion = /Hvem skal motta faktura for deg\?/i;
const personInvoicePeriodQuestion = /For hvilken periode skal denne personen motta og betale faktura for deg\?/i;
const companyInvoicePeriodQuestion = /For hvilken periode skal denne virksomheten motta og betale faktura for deg\?/i;

const visitPath = (path: string) => {
  cy.visit(path);
  cy.get('#page-title').should('exist');
};

const visitPathWithFreshState = (path: string) => {
  cy.clearCookies();
  cy.visit(path, {
    onBeforeLoad: (win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    },
  });
  cy.get('#page-title').should('exist');
};

const setupForm = () => {
  cy.defaultIntercepts();
  cy.intercept('GET', '/fyllut/api/forms/nav020805*', { body: nav020805Form });
  cy.intercept('GET', '/fyllut/api/translations/nav020805*', { body: {} });
  cy.intercept('GET', '/fyllut/api/global-translations/*', { body: {} });
};

const visitPanel = (panelKey: string) => {
  visitPath(`/fyllut/nav020805/${panelKey}${submission}`);
  cy.get('#page-title')
    .invoke('text')
    .then((title) => {
      if (title.includes('Introduksjon')) {
        cy.clickNextStep();
      }
    });
};

const selectRadio = (label: string | RegExp, option: string | RegExp) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const setSelectboxOption = (label: string | RegExp, option: string | RegExp, checked = true) => {
  cy.findByRole('group', { name: label }).within(() => {
    if (checked) {
      cy.findByRole('checkbox', { name: option }).check();
    } else {
      cy.findByRole('checkbox', { name: option }).uncheck();
    }
  });
};

const selectCountry = (label: string | RegExp, value: string) => {
  cy.findByRole('combobox', { name: label }).type(`${value}{downarrow}{enter}`);
};

const visitRootForm = () => {
  visitPathWithFreshState(`/fyllut/nav020805/veiledning${submission}`);
  cy.findByLabelText(onBehalfLabel).should('exist');
};

const goToConditionalPanelFromWorkAnswers = (panelTitle: string) => {
  visitPanel('opplysningerOmUtenlandsoppholdet');
  selectRadio(/Skal du\s+arbeide eller\s+drive næring\s+i utlandet\?/i, 'Ja');
  setSelectboxOption(/Hva er\s+arbeidssituasjonen din\?/i, 'Lønnsmottaker');
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: panelTitle }).click();
};

const goToRepresentantFromVeiledningAndWorkAnswers = () => {
  visitRootForm();
  selectRadio(onBehalfLabel, 'Ja');
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: 'Opplysninger om utenlandsoppholdet' }).click();
  selectRadio(/Skal du\s+arbeide eller\s+drive næring\s+i utlandet\?/i, 'Ja');
  setSelectboxOption(/Hva er\s+arbeidssituasjonen din\?/i, 'Lønnsmottaker');
  cy.findByRole('link', { name: 'Trygdeavgift til Nav' }).click();
  cy.findByRole('heading', { level: 2, name: 'Trygdeavgift til Nav' }).should('exist');
  cy.findByLabelText(invoicePaymentQuestion).should('exist');
};

describe('nav020805', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    setupForm();
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      visitPanel('dineOpplysninger');
    });

    it('toggles address section and folkeregister alert when the identity-number answer changes', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.contains('folkeregistrerte adresse').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');
      cy.contains('folkeregistrerte adresse').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.contains('folkeregistrerte adresse').should('exist');
    });

    it('shows address validity dates when living outside Norway', () => {
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      selectRadio('Bor du i Norge?', 'Nei');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');

      selectRadio('Bor du i Norge?', 'Ja');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');
    });
  });

  describe('Opplysninger om søknaden conditionals', () => {
    beforeEach(() => {
      visitPanel('opplysningerOmSoknaden');
    });

    it('shows the sykepenger and foreldrepenger follow-up only for health coverage choices', () => {
      cy.findByLabelText(/Søker du i tillegg\s+om rett til\s+sykepenger og\s+foreldrepenger\?/i).should('not.exist');

      selectRadio(/Hvilken\s+trygdedekning\s+søker du om\?/i, 'Helsedelen');
      cy.findByLabelText(/Søker du i tillegg\s+om rett til\s+sykepenger og\s+foreldrepenger\?/i).should('exist');

      selectRadio(/Hvilken\s+trygdedekning\s+søker du om\?/i, 'Pensjonsdelen');
      cy.findByLabelText(/Søker du i tillegg\s+om rett til\s+sykepenger og\s+foreldrepenger\?/i).should('not.exist');
    });
  });

  describe('Lønnsmottaker conditionals', () => {
    beforeEach(() => {
      goToConditionalPanelFromWorkAnswers('Lønnsmottaker');
    });

    it('toggles norsk arbeidsgiver orgnummer and address branches', () => {
      selectRadio(/Er du sendt ut av\s+en norsk\s+arbeidsgiver for\s+å jobbe i\s+utlandet\?/i, 'Ja');
      cy.findByRole('textbox', { name: 'Navn på arbeidsgiveren' }).should('exist');
      cy.findByRole('textbox', { name: 'Organisasjonsnummeret til underenheten der du er ansatt' }).should('exist');
      cy.findByRole('textbox', { name: 'Adresse' }).should('not.exist');

      cy.findByRole('checkbox', { name: /Jeg vet ikke hva organisasjonsnummeret er/ }).click();
      cy.findByRole('textbox', { name: 'Organisasjonsnummeret til underenheten der du er ansatt' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Adresse' }).should('exist');

      cy.findByRole('checkbox', { name: /Jeg vet ikke hva organisasjonsnummeret er/ }).click();
      cy.findByRole('textbox', { name: 'Organisasjonsnummeret til underenheten der du er ansatt' }).should('exist');
      cy.findByRole('textbox', { name: 'Adresse' }).should('not.exist');
    });

    it('shows other norwegian business fields only when another norwegian business is selected', () => {
      selectRadio(/Er du sendt ut av\s+en norsk\s+arbeidsgiver for\s+å jobbe i\s+utlandet\?/i, 'Ja');
      cy.findByRole('textbox', { name: 'Navn på virksomheten' }).should('not.exist');

      selectRadio(/Hvem lønnes du\s+av i\s+søknadsperioden\?/i, 'En annen norsk virksomhet');
      cy.findByRole('textbox', { name: 'Navn på virksomheten' }).should('exist');
      cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).should('exist');

      cy.findAllByRole('checkbox', { name: /Jeg vet ikke hva organisasjonsnummeret er/ })
        .last()
        .click();
      cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).should('not.exist');
      cy.findAllByRole('textbox', { name: 'Adresse' }).last().should('exist');
    });

    it('switches between direct foreign employer and paid-by-foreign-business branches', () => {
      selectRadio(/Er du sendt ut av\s+en norsk\s+arbeidsgiver for\s+å jobbe i\s+utlandet\?/i, 'Nei');
      cy.findByRole('textbox', { name: 'Navn på arbeidsgiver' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Navn på virksomheten' }).should('not.exist');

      selectRadio(/Skal du jobbe for\s+en norsk eller\s+utenlandsk\s+arbeidsgiver\?/i, 'Utenlandsk');
      cy.findByRole('textbox', { name: 'Navn på arbeidsgiver' }).should('exist');

      selectRadio(/Er du sendt ut av\s+en norsk\s+arbeidsgiver for\s+å jobbe i\s+utlandet\?/i, 'Ja');
      selectRadio(/Hvem lønnes du\s+av i\s+søknadsperioden\?/i, 'En utenlandsk virksomhet');
      cy.findByRole('textbox', { name: 'Navn på virksomheten' }).should('exist');
    });
  });

  describe('Student conditionals', () => {
    beforeEach(() => {
      visitPanel('opplysningerOmUtenlandsoppholdet');
      selectRadio(/Skal du\s+arbeide eller\s+drive næring\s+i utlandet\?/i, 'Nei');
      setSelectboxOption(/Hva er situasjonen din i perioden\?/i, 'Jeg studerer');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Student' }).click();
    });

    it('shows the financing follow-ups for private financing and foreign funding', () => {
      cy.findByRole('textbox', { name: 'Beskriv hvordan du finansierer studiene' }).should('not.exist');
      cy.findByLabelText('Finansieres studiene fra Norge?').should('not.exist');
      cy.findAllByRole('combobox', { name: 'Land' }).should('have.length', 1);

      setSelectboxOption(/Hvordan finansierer du studiene\?/i, /Privat finansiering/);
      cy.findByRole('textbox', { name: 'Beskriv hvordan du finansierer studiene' }).should('exist');
      cy.findByLabelText('Finansieres studiene fra Norge?').should('exist');

      selectRadio('Finansieres studiene fra Norge?', 'Nei');
      cy.findAllByRole('combobox', { name: 'Land' }).should('have.length', 2);

      setSelectboxOption(/Hvordan finansierer du studiene\?/i, /Privat finansiering/, false);
      setSelectboxOption(/Hvordan finansierer du studiene\?/i, /Lån\/stipend fra annen institusjon/);
      cy.findAllByRole('combobox', { name: 'Land' }).should('have.length.at.least', 2);
    });
  });

  describe('Au pair conditionals', () => {
    beforeEach(() => {
      visitPanel('opplysningerOmUtenlandsoppholdet');
      selectRadio(/Skal du\s+arbeide eller\s+drive næring\s+i utlandet\?/i, 'Ja');
      setSelectboxOption(/Hva er\s+arbeidssituasjonen din\?/i, 'Au pair/praktikant eller arbeid ved siden av studier');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Au pair/praktikant eller arbeid ved siden av studier' }).click();
    });

    it('shows the secondary workplace fields only for the alternate address branch', () => {
      cy.findByRole('textbox', { name: 'Navn på arbeidsgiver/arbeidssted' }).should('not.exist');

      selectRadio('Hvor skal arbeidet utføres?', 'På en annen adresse');
      cy.findByRole('textbox', { name: 'Navn på arbeidsgiver/arbeidssted' }).should('exist');

      selectRadio('Hvor skal arbeidet utføres?', 'På adressen oppgitt over');
      cy.findByRole('textbox', { name: 'Navn på arbeidsgiver/arbeidssted' }).should('not.exist');
    });
  });

  describe('Hvor utføres arbeidet conditionals', () => {
    beforeEach(() => {
      goToConditionalPanelFromWorkAnswers('Hvor utføres arbeidet');
    });

    it('shows work-pattern details when the first worksite uses rotation', () => {
      selectRadio(/Hvor skal du\s+utføre\s+arbeidet\?/i, 'På land');
      cy.findByRole('textbox', { name: 'Beskriv arbeidsmønsteret' }).should('not.exist');

      cy.withinComponent(/Arbeider du i en\s+rotasjonsordning\?/i, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv arbeidsmønsteret' }).should('exist');

      cy.withinComponent(/Arbeider du i en\s+rotasjonsordning\?/i, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv arbeidsmønsteret' }).should('not.exist');
    });
  });

  describe('Skatteforhold og inntekt conditionals', () => {
    beforeEach(() => {
      goToConditionalPanelFromWorkAnswers('Skatteforhold og inntekt');
    });

    it('shows Norwegian natural-benefit value fields for the selected benefits only', () => {
      setSelectboxOption('Hvilken virksomhet får du inntekten fra?', 'Norsk virksomhet');
      setSelectboxOption('Hva mottar du?', 'Lønn');
      selectRadio(/Mottar du\s+naturalytelser\?/i, 'Ja');

      cy.findByLabelText(/Oppgi verdi for bolig/).should('not.exist');
      cy.findByLabelText(/Oppgi verdi for bil/).should('not.exist');

      setSelectboxOption('Hvilke naturalytelser mottar du?', 'Bolig');
      cy.findByLabelText(/Oppgi verdi for bolig/).should('exist');

      setSelectboxOption('Hvilke naturalytelser mottar du?', 'Bil');
      cy.findByLabelText(/Oppgi verdi for bil/).should('exist');

      setSelectboxOption('Hvilke naturalytelser mottar du?', 'Andre naturalytelser');
      cy.findByRole('textbox', { name: 'Oppgi andre naturalytelser og samlet verdi' }).should('exist');
    });

    it('shows foreign natural-benefit fields on the foreign business branch', () => {
      setSelectboxOption('Hvilken virksomhet får du inntekten fra?', 'Utenlandsk virksomhet');
      cy.findAllByRole('group', { name: 'Hva mottar du?' })
        .last()
        .within(() => {
          cy.findByRole('checkbox', { name: 'Lønn' }).check();
        });
      cy.findAllByLabelText(/Mottar du\s+naturalytelser\?/i)
        .last()
        .closest('.form-group')
        .within(() => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        });

      cy.findByLabelText(/Oppgi verdi for bolig/).should('not.exist');
      cy.findByLabelText(/Oppgi verdi for bil/).should('not.exist');

      cy.findAllByRole('group', { name: 'Hvilke naturalytelser mottar du?' })
        .last()
        .within(() => {
          cy.findByRole('checkbox', { name: 'Bolig' }).check();
          cy.findByRole('checkbox', { name: 'Bil' }).check();
          cy.findByRole('checkbox', { name: 'Andre naturalytelser' }).check();
        });

      cy.findAllByLabelText(/Oppgi verdi for bolig/)
        .last()
        .should('exist');
      cy.findAllByLabelText(/Oppgi verdi for bil/)
        .last()
        .should('exist');
      cy.findAllByRole('textbox', { name: 'Oppgi andre naturalytelser og samlet verdi' }).last().should('exist');
    });
  });

  describe('Pensjon eller uføretrygd conditionals', () => {
    beforeEach(() => {
      visitPanel('opplysningerOmUtenlandsoppholdet');
      selectRadio(/Skal du\s+arbeide eller\s+drive næring\s+i utlandet\?/i, 'Nei');
      setSelectboxOption(/Hva er situasjonen din i perioden\?/i, 'Jeg mottar pensjon eller uføretrygd');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Pensjon eller uføretrygd' }).click();
    });

    it('shows the pension datagrid when the applicant does not receive Nav pension', () => {
      cy.findByRole('textbox', { name: /Navn på selskap\/pensjonsordning/ }).should('not.exist');

      selectRadio('Mottar du pensjon eller uføretrygd fra Nav?', 'Nei');
      cy.findByRole('textbox', { name: /Navn på selskap\/pensjonsordning/ }).should('exist');

      selectRadio('Mottar du pensjon eller uføretrygd fra Nav?', 'Ja');
      selectRadio(
        'Mottar du i tillegg pensjon eller uføretrygd fra andre ordninger (offentlige, private eller utenlandske)?',
        'Ja',
      );
      cy.findByRole('textbox', { name: /Navn på selskap\/pensjonsordning/ }).should('exist');
    });
  });

  describe('Trygdeavgift til Nav conditionals', () => {
    it('shows the faktura fullmakt alert when another person or company will pay', () => {
      goToRepresentantFromVeiledningAndWorkAnswers();
      cy.contains('fullmakt for faktura').should('not.exist');

      selectRadio(invoicePaymentQuestion, 'Ja');
      cy.contains('fullmakt for faktura').should('exist');
    });

    it('shows period date fields for both person and company representatives when another period is selected', () => {
      goToRepresentantFromVeiledningAndWorkAnswers();
      cy.findByLabelText('Fra og med dato (dd.mm.åååå)').should('not.exist');

      selectRadio(invoicePaymentQuestion, 'Ja');
      selectRadio(invoiceRecipientQuestion, 'En privatperson');
      selectRadio(personInvoicePeriodQuestion, 'For en annen periode');
      cy.findByLabelText('Fra og med dato (dd.mm.åååå)').should('exist');

      selectRadio(invoiceRecipientQuestion, 'En virksomhet eller arbeidsgiver');
      selectRadio(companyInvoicePeriodQuestion, 'For en annen periode');
      cy.findByLabelText('Til og med dato (dd.mm.åååå)').should('exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows the fullmakt attachment when the applicant applies with a power of attorney', () => {
      visitPanel('veiledning');
      selectRadio(/Fyller du ut\s+søknaden på\s+vegne av andre\s+enn deg selv\?/i, 'Ja');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Fullmakt' }).click();
      selectRadio(/Hvorfor søker\s+du på vegne av\s+en annen\s+person\?/i, 'Jeg har fullmakt');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon på at du har fullmakt/ }).should('exist');
    });

    it('shows the invoice-fullmakt attachment when someone else receives the invoice', () => {
      goToRepresentantFromVeiledningAndWorkAnswers();
      selectRadio(invoicePaymentQuestion, 'Ja');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Fullmakt for mottak og betaling av faktura/ }).should('exist');
    });

    it('shows the fødselsattest attachment when a child lacks a norwegian identity number', () => {
      visitPanel('familiemedlemmer');
      selectRadio(/Søker du for\s+barn under 18 år\s+som skal være\s+med til utlandet\?/i, 'Ja');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Barn');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Test');
      cy.findByRole('checkbox', { name: /Barnet har ikke norsk fødselsnummer\/d-nummer/ }).click();
      cy.findByLabelText('Fødselsdato (dd.mm.åååå)').type('01.01.2015');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Fødselsattest/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      visitRootForm();
    });

    it('fills the minimum required paper flow and verifies the summary', () => {
      // Veiledning
      selectRadio(/Fyller du ut\s+søknaden på\s+vegne av andre\s+enn deg selv\?/i, 'Nei');
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Opplysninger om søknaden
      selectCountry('Hvilket land skal du til?', 'Sver');
      cy.findByLabelText('Fra dato (dd.mm.åååå)').type('01.06.2026');
      cy.findByLabelText('Til dato (dd.mm.åååå)').type('01.12.2026');
      selectRadio(/Har du oppholdt\s+deg i utlandet de\s+siste fem årene\?/i, 'Nei');
      selectRadio(/Hvilken\s+trygdedekning\s+søker du om\?/i, 'Pensjonsdelen');
      cy.clickNextStep();

      // Opplysninger om utenlandsoppholdet
      selectRadio(/Skal du\s+arbeide eller\s+drive næring\s+i utlandet\?/i, 'Nei');
      setSelectboxOption(/Hva er situasjonen din i perioden\?/i, 'Annen');
      cy.clickNextStep();

      // Annen situasjon
      cy.findByRole('textbox', { name: 'Beskriv hva du skal gjøre' }).type('Skal bo midlertidig i utlandet.');
      cy.clickNextStep();

      // Familiemedlemmer
      selectRadio(/Søker du for\s+barn under 18 år\s+som skal være\s+med til utlandet\?/i, 'Nei');
      selectRadio(
        /Har du ektefelle\/ partner\/samboer\s+som også skal til\s+utlandet og sender\s+egen søknad\?/i,
        'Nei',
      );
      cy.clickNextStep();

      // Tilleggsopplysninger
      selectRadio(/Har du noen flere\s+opplysninger til\s+søknaden\?/i, 'Nei');
      cy.clickNextStep();

      // Vedlegg
      cy.get('#page-title').then(($title) => {
        if ($title.text().includes('Erklæring fra søker')) {
          cy.clickShowAllSteps();
          cy.findByRole('link', { name: 'Vedlegg' }).click();
        }
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();
      cy.get('#page-title').then(($title) => {
        if ($title.text().includes('Vedlegg')) {
          cy.findByRole('link', { name: 'Erklæring fra søker' }).click();
        }
      });

      // Erklæring fra søker
      cy.get('#page-title').then(($title) => {
        if ($title.text().includes('Oppsummering')) {
          return;
        }

        cy.findByRole('checkbox', {
          name: /Jeg bekrefter at opplysningene er korrekte/i,
        }).click();
        cy.clickNextStep();
      });
      cy.get('#page-title').then(($title) => {
        if (!$title.text().includes('Oppsummering')) {
          cy.clickNextStep();
        }
      });

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Annen situasjon', () => {
        cy.contains('dd', 'Skal bo midlertidig i utlandet.').should('exist');
      });
    });
  });
});
