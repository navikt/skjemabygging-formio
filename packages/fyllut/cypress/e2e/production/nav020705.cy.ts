import nav020705Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav020705.json';

/*
 * Production form tests for Søknad om frivillig medlemskap i folketrygden under opphold i Norge
 * Form: nav020705
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (personopplysninger): 3 observable customConditionals
 *       identitet.harDuFodselsnummer → adresse + adresseVarighet + folkeregister alert
 *   - Trygdeavgift til NAV (trygdeavgiftTilNav): 2 customConditionals
 *       fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv + onskerDuAtNoenAndreSkalMottaOgBetaleFakturaForTrygdeavgiftForDeg
 *       → faktura-fullmakt alert
 *       forHvilkenPeriode... → enAnnenPeriode date fields
 *   - Vedlegg (vedlegg): 2 cross-panel customConditional attachments
 *       hvorforSokerDuPaVegneAvEnAnnenPerson → dokumentasjonPaFullmakt
 *       fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv + onskerDuAtNoenAndreSkalMottaOgBetaleFakturaForTrygdeavgiftForDeg
 *       → fullmaktForMottakOgBetalingAvFaktura
 */

const formatDate = (date: Date) =>
  `${`${date.getDate()}`.padStart(2, '0')}.${`${date.getMonth() + 1}`.padStart(2, '0')}.${date.getFullYear()}`;

const futureDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

const labels = {
  applyOnBehalf: /Fyller du ut\s+søknaden på\s+vegne av andre\s+enn deg selv\?/,
  whyApplyOnBehalf: /Hvorfor søker\s+du på vegne av\s+en annen\s+person\?/,
  coverage: /Hvilken\s+trygdedekning\s+søker du om\?/,
  extraInfo: /Har du noen flere\s+opplysninger til\s+søknaden\?/,
};

const visitWithFreshState = (url: string) => {
  cy.clearCookies();
  cy.visit(url, {
    onBeforeLoad: (win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    },
  });
  cy.get('h2#page-title').should('exist');
};

const visitPanel = (panelKey: string) => {
  visitWithFreshState(`/fyllut/nav020705/${panelKey}?sub=paper`);
};

const visitForm = () => {
  visitWithFreshState('/fyllut/nav020705/veiledning?sub=paper');
};

const goToTrygdeavgiftPanel = () => {
  visitForm();
  selectRadio(labels.applyOnBehalf, 'Ja');
  cy.clickNextStep();
  selectRadio(labels.whyApplyOnBehalf, 'Jeg har fullmakt');
  cy.findAllByRole('textbox', { name: 'Fornavn' }).first().type('Kari');
  cy.findAllByRole('textbox', { name: 'Etternavn' }).first().type('Fullmektig');
  cy.clickNextStep();

  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
  cy.clickNextStep();

  selectRadio('Bor du i Norge eller et annet land til vanlig?', 'I Norge');
  selectRadio('Er du medlem i en utenlandsk trygdeordning?', 'Nei');
  cy.clickNextStep();

  cy.findAllByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).first().type(futureDate(30));
  cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).type(futureDate(180));
  selectRadio(labels.coverage, 'Full trygdedekning');
  selectRadio('Skal du arbeide i Norge?', 'Ja');
  cy.clickNextStep();

  cy.findByRole('textbox', { name: 'Navn på virksomhet' }).type('Testbedrift');
  cy.findByRole('textbox', { name: 'Gateadresse' }).type('Arbeidsveien 1');
  cy.findByLabelText('Postnummer').type('0150');
  cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
  cy.findByRole('combobox', { name: 'Land' }).type('Norg{downArrow}{enter}');
  selectRadio('Hvor skal arbeidet utføres?', 'På samme adresse som over');
  cy.findByRole('textbox', { name: 'Hvilken stilling har du?' }).type('Rådgiver');
  cy.clickNextStep();

  selectRadio('Betaler du skatt til Norge?', 'Ja');
  selectRadio('Lønnes du av en norsk virksomhet?', 'Ja');
  cy.findByLabelText('Oppgi forventet inntekt i søknadsperioden').type('1000');
  selectRadio('Har du andre inntekter?', 'Nei');
  cy.clickNextStep();

  cy.get('h2#page-title').should('contain.text', 'Trygdeavgift');
};

const selectRadio = (label: string | RegExp, option: string | RegExp) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

describe('nav020705', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
    cy.intercept('GET', '/fyllut/api/forms/nav020705*', { body: nav020705Form });
    cy.intercept('GET', '/fyllut/api/translations/nav020705*', { body: {} });
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: {} });
  });

  describe('Dine opplysninger conditionals', () => {
    it('toggles address fields, address validity and folkeregister alert from the identity answer', () => {
      visitPanel('personopplysninger');

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');
      cy.contains('Nav sender svar på søknad og annen kommunikasjon').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      selectRadio('Bor du i Norge?', 'Nei');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');
      cy.contains('Nav sender svar på søknad og annen kommunikasjon').should('exist');
    });
  });

  describe('Vedlegg fullmakt conditionals', () => {
    it('shows the general fullmakt attachment for the explicit fullmakt branch', () => {
      visitForm();
      selectRadio(labels.applyOnBehalf, 'Ja');
      cy.clickNextStep();

      selectRadio(labels.whyApplyOnBehalf, 'Jeg har fullmakt');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon på at du har fullmakt/ }).should('exist');
    });
  });

  describe('Trygdeavgift til NAV conditionals', () => {
    it('shows the faktura fullmakt alert and toggles the custom period container', () => {
      goToTrygdeavgiftPanel();

      cy.contains('Du må legge ved en fullmakt for faktura').should('not.exist');
      cy.findByLabelText('Fra og med dato (dd.mm.åååå)').should('not.exist');

      selectRadio('Ønsker du at noen andre skal motta og betale faktura for trygdeavgift for deg?', 'Ja');
      cy.contains('Du må legge ved en fullmakt for faktura').should('exist');

      selectRadio('Hvem skal motta faktura for deg?', 'En privatperson');
      selectRadio('For hvilken periode skal denne personen motta og betale faktura for deg?', 'For en annen periode');
      cy.findByLabelText('Fra og med dato (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Til og med dato (dd.mm.åååå)').should('exist');

      selectRadio(
        'For hvilken periode skal denne personen motta og betale faktura for deg?',
        'For perioden søknaden gjelder',
      );
      cy.findByLabelText('Fra og med dato (dd.mm.åååå)').should('not.exist');

      selectRadio('Ønsker du at noen andre skal motta og betale faktura for trygdeavgift for deg?', 'Nei');
      cy.contains('Du må legge ved en fullmakt for faktura').should('not.exist');
      cy.findByLabelText('Fra og med dato (dd.mm.åååå)').should('not.exist');
    });

    it('shows the faktura fullmakt attachment when both cross-panel answers are Ja', () => {
      goToTrygdeavgiftPanel();

      selectRadio('Ønsker du at noen andre skal motta og betale faktura for trygdeavgift for deg?', 'Ja');
      cy.clickShowAllSteps();
      cy.findByRole('button', { name: /Skjul alle steg/ }).should('exist');
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Fullmakt for mottak og betaling av faktura/ }).should('exist');
    });
  });

  describe('Summary', () => {
    it('fills the required fields for one paper flow and verifies the summary', () => {
      visitForm();

      // Veiledning
      selectRadio(labels.applyOnBehalf, 'Ja');
      cy.clickNextStep();

      // Fullmakt
      selectRadio(labels.whyApplyOnBehalf, 'Jeg har fullmakt');
      cy.findAllByRole('textbox', { name: 'Fornavn' }).first().type('Kari');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).first().type('Fullmektig');
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Om situasjonen din
      selectRadio('Bor du i Norge eller et annet land til vanlig?', 'I Norge');
      selectRadio('Er du medlem i en utenlandsk trygdeordning?', 'Nei');
      cy.clickNextStep();

      // Om søknaden
      cy.findAllByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).first().type(futureDate(30));
      cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).type(futureDate(180));
      selectRadio(labels.coverage, 'Full trygdedekning');
      selectRadio('Skal du arbeide i Norge?', 'Nei');
      cy.clickNextStep();

      // Om oppholdet i Norge
      selectRadio('Hvorfor skal du oppholde deg i Norge?', 'Annet');
      cy.findByRole('textbox', { name: 'Beskriv hva du skal gjøre i Norge' }).type(
        'Jeg skal oppholde meg med familie i Norge.',
      );
      cy.clickNextStep();

      // Skatteforhold og inntekt
      selectRadio('Mottar du pensjon eller uføretrygd fra et annet land enn Norge?', 'Nei');
      cy.clickNextStep();

      // Familiemedlemmer
      selectRadio('Søker du for barn under 18 år?', 'Nei');
      cy.clickNextStep();

      // Tilleggsopplysninger
      selectRadio(labels.extraInfo, 'Nei');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // Vedlegg
      cy.findByRole('group', { name: /Dokumentasjon på at du har fullmakt/ }).within(() => {
        cy.findByRole('radio', { name: /Jeg ettersender/ }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();
      cy.get('body').then(($body) => {
        if ($body.text().match(/Jeg bekrefter at opplysningene er korrekte/i)) {
          cy.findByRole('checkbox', { name: /Jeg bekrefter at opplysningene er korrekte/ }).click();
          cy.clickNextStep();
        }
      });

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Fullmakt', () => {
        cy.contains('dd', 'Jeg har fullmakt').should('exist');
        cy.contains('dd', 'Kari').should('exist');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dd', 'Ola').should('exist');
      });
    });
  });
});
