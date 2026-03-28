import nav570008Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav570008.json';

/*
 * Production form tests for Skjema for oppfostringsbidrag etter lov om barneverntjenester - for bidragspliktig
 * Form: nav570008
 * Submission types: PAPER, DIGITAL, DIGITAL_NO_LOGIN
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 4 observable customConditionals
 *       identitet.harDuFodselsnummer → adresse, adresseVarighet, folkeregister alert
 *   - Barna (barna): 1 same-panel conditional
 *       sokerDuOmEndring → datoDuSokerEndringFraDdMmAaaa
 *   - Inntekt (inntekt): 6 same-panel conditionals + 1 customConditional
 *       harDuSkattepliktigeLeieinntekter → skattepliktigeArsinntekter
 *       harDuForsikringerSomUtbetalesAvAndreEnnNav → forsikringerAndreEnnNav
 *       harDuKapitalinntekter → avvikerKapitalinntektenVesentligFraForrigeArsLigning
 *       avvikerKapitalinntektenVesentligFraForrigeArsLigning → oppgiForventetNettoKapitalinntektForInnevaerendeAar
 *       harDuNaeringsinntekt → avvikerNaeringsinntektenVesentligFraForrigeArsInntekt
 *       avvikerNaeringsinntektenVesentligFraForrigeArsInntekt → oppgiForventetNaeringsinntektForInnevaerendeAr
 *       avvikerKapitalinntektenVesentligFraForrigeArsLigning / avvikerNaeringsinntektenVesentligFraForrigeArsInntekt
 *         → begrunnHvorforKapitalEllerNaeringsinntektErVesentligEndretFraForrigeArsLigning
 *   - Utgifter (utgifter): 4 same-panel conditionals
 *       harDuBoliglan → boliglan
 *       harDuAndreBoutgifter → andreArligeBoutgifter
 *       betalerDuBidragSomIkkeBetalesGjennomNav → oppgiArligBidragsbelop
 *       harDuAvbetalingskontrakterEllerAnnenGjeldEnnBoliggjeld → avbetalingskontrakterOgAnnenGjeldEnnBoliggjeld
 *   - Boforhold (boforhold): 1 same-panel conditional
 *       velgBoforholdetSomPasserDinSituasjon → informasjonOmBarnSomBorSammenMedDeg
 *   - Tilleggsopplysninger (tilleggsopplysninger): 1 cross-panel conditional
 *       hvorforFyllerDuUtDetteSkjemaet → hvorforSokerDuOmEndring
 *   - Vedlegg (vedlegg): 7 cross-panel attachment conditionals from Inntekt and Utgifter
 */

const submission = '?sub=paper';

const visitPanel = (panelKey: string) => {
  cy.visit(`/fyllut/nav570008/${panelKey}${submission}`);
  cy.defaultWaits();
};

const selectRadio = (label: string | RegExp, option: string | RegExp) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const setVeiledningOption = (option: RegExp, checked: boolean) => {
  cy.findByRole('group', { name: /Hvorfor fyller du ut dette skjemaet/ }).within(() => {
    if (checked) {
      cy.findByRole('checkbox', { name: option }).check();
    } else {
      cy.findByRole('checkbox', { name: option }).uncheck();
    }
  });
};

const goToPanel = (panelTitle: string) => {
  cy.findByRole('link', { name: panelTitle }).click();
};

describe('nav570008', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
    cy.intercept('GET', '/fyllut/api/forms/nav570008*', { body: nav570008Form }).as('getForm');
    cy.intercept('GET', '/fyllut/api/translations/nav570008*', { body: {} }).as('getTranslations');
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: {} });
  });

  describe('Dine opplysninger conditionals', () => {
    it('shows address fields and address validity when the applicant has no Norwegian identity number and lives abroad', () => {
      visitPanel('dineOpplysninger');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');

      cy.findByLabelText('Bor du i Norge?').should('exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');

      selectRadio('Bor du i Norge?', 'Nei');

      cy.findByRole('combobox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');
    });

    it('shows the folkeregister alert and hides address fields when the applicant has a Norwegian identity number', () => {
      visitPanel('dineOpplysninger');
      cy.contains('Nav sender svar på søknad').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');

      cy.contains('Nav sender svar på søknad').should('exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');
    });
  });

  describe('Barna conditional', () => {
    it('shows the endringsdato only when change is requested for the child row', () => {
      visitPanel('barna');
      cy.findByRole('textbox', { name: 'Dato du søker endring fra (dd.mm.åååå)' }).should('not.exist');

      selectRadio('Søker du om endring?', 'Ja');
      cy.findByRole('textbox', { name: 'Dato du søker endring fra (dd.mm.åååå)' }).should('exist');

      selectRadio('Søker du om endring?', 'Nei');
      cy.findByRole('textbox', { name: 'Dato du søker endring fra (dd.mm.åååå)' }).should('not.exist');
    });
  });

  describe('Inntekt conditionals', () => {
    it('toggles the leieinntekter and forsikringer follow-up fields', () => {
      visitPanel('inntekt');
      cy.findByLabelText('Skattepliktige årsinntekter').should('not.exist');
      cy.findByRole('textbox', { name: 'Hva slags forsikringer?' }).should('not.exist');
      cy.findByLabelText('Beløp for andre forsikringer per år').should('not.exist');

      selectRadio('Har du skattepliktige leieinntekter?', 'Ja');
      cy.findByLabelText('Skattepliktige årsinntekter').should('exist');

      selectRadio('Har du forsikringer som utbetales av andre enn NAV?', 'Ja');
      cy.findByRole('textbox', { name: 'Hva slags forsikringer?' }).should('exist');
      cy.findByLabelText('Beløp for andre forsikringer per år').should('exist');

      selectRadio('Har du skattepliktige leieinntekter?', 'Nei');
      cy.findByLabelText('Skattepliktige årsinntekter').should('not.exist');

      selectRadio('Har du forsikringer som utbetales av andre enn NAV?', 'Nei');
      cy.findByRole('textbox', { name: 'Hva slags forsikringer?' }).should('not.exist');
      cy.findByLabelText('Beløp for andre forsikringer per år').should('not.exist');
    });

    it('toggles capital and business income follow-up fields including the shared explanation textarea', () => {
      visitPanel('inntekt');
      cy.findByLabelText('Avviker kapitalinntekten vesentlig fra forrige års ligning?').should('not.exist');
      cy.findByLabelText('Forventet netto kapitalinntekt for inneværende år').should('not.exist');
      cy.findByLabelText('Avviker næringsinntekten vesentlig fra forrige års inntekt?').should('not.exist');
      cy.findByLabelText('Forventet næringsinntekt for inneværende år').should('not.exist');
      cy.findByRole('textbox', {
        name: 'Begrunn hvorfor kapital- eller næringsinntekt er vesentlig endret fra forrige års ligning.',
      }).should('not.exist');

      selectRadio('Har du kapitalinntekter?', 'Ja');
      cy.findByLabelText('Avviker kapitalinntekten vesentlig fra forrige års ligning?').should('exist');

      selectRadio('Avviker kapitalinntekten vesentlig fra forrige års ligning?', 'Ja');
      cy.findByLabelText('Forventet netto kapitalinntekt for inneværende år').should('exist');
      cy.findByRole('textbox', {
        name: 'Begrunn hvorfor kapital- eller næringsinntekt er vesentlig endret fra forrige års ligning.',
      }).should('exist');

      selectRadio('Har du næringsinntekt?', 'Ja');
      cy.findByLabelText('Avviker næringsinntekten vesentlig fra forrige års inntekt?').should('exist');

      selectRadio('Avviker næringsinntekten vesentlig fra forrige års inntekt?', 'Ja');
      cy.findByLabelText('Forventet næringsinntekt for inneværende år').should('exist');

      selectRadio('Avviker kapitalinntekten vesentlig fra forrige års ligning?', 'Nei');
      cy.findByLabelText('Forventet netto kapitalinntekt for inneværende år').should('not.exist');
      cy.findByRole('textbox', {
        name: 'Begrunn hvorfor kapital- eller næringsinntekt er vesentlig endret fra forrige års ligning.',
      }).should('exist');

      selectRadio('Avviker næringsinntekten vesentlig fra forrige års inntekt?', 'Nei');
      cy.findByLabelText('Forventet næringsinntekt for inneværende år').should('not.exist');
      cy.findByRole('textbox', {
        name: 'Begrunn hvorfor kapital- eller næringsinntekt er vesentlig endret fra forrige års ligning.',
      }).should('not.exist');

      selectRadio('Har du kapitalinntekter?', 'Nei');
      cy.findByLabelText('Avviker kapitalinntekten vesentlig fra forrige års ligning?').should('not.exist');

      selectRadio('Har du næringsinntekt?', 'Nei');
      cy.findByLabelText('Avviker næringsinntekten vesentlig fra forrige års inntekt?').should('not.exist');
    });
  });

  describe('Utgifter conditional fields', () => {
    it('toggles the housing, expense, bidrag, and debt follow-up fields', () => {
      visitPanel('utgifter');
      cy.findByLabelText('Årlige renteutgifter på boliglån').should('not.exist');
      cy.findByLabelText('Årlig totalbeløp for andre boutgifter').should('not.exist');
      cy.findByLabelText('Årlig bidragsbeløp').should('not.exist');
      cy.findByRole('textbox', { name: 'Hvem har du gjeld til? (kreditor)' }).should('not.exist');

      selectRadio('Har du boliglån?', 'Ja');
      cy.findByLabelText('Årlige renteutgifter på boliglån').should('exist');
      cy.findByLabelText('Årlige avdrag på boliglån').should('exist');

      selectRadio('Har du andre boutgifter?', 'Ja');
      cy.findByLabelText('Årlig totalbeløp for andre boutgifter').should('exist');

      selectRadio('Betaler du bidrag som ikke betales gjennom NAV?', 'Ja');
      cy.findByLabelText('Årlig bidragsbeløp').should('exist');

      selectRadio('Har du avbetalingskontrakter eller annen gjeld enn boliggjeld?', 'Ja');
      cy.findByRole('textbox', { name: 'Hvem har du gjeld til? (kreditor)' }).should('exist');
      cy.findByRole('textbox', { name: 'Hva slags gjeld?' }).should('exist');
      cy.findByLabelText('Hva er terminbeløpet?').should('exist');
      cy.findByLabelText('Antall terminer per år').should('exist');
      cy.findByLabelText('Renter per år').should('exist');

      selectRadio('Har du boliglån?', 'Nei');
      cy.findByLabelText('Årlige renteutgifter på boliglån').should('not.exist');

      selectRadio('Har du andre boutgifter?', 'Nei');
      cy.findByLabelText('Årlig totalbeløp for andre boutgifter').should('not.exist');

      selectRadio('Betaler du bidrag som ikke betales gjennom NAV?', 'Nei');
      cy.findByLabelText('Årlig bidragsbeløp').should('not.exist');

      selectRadio('Har du avbetalingskontrakter eller annen gjeld enn boliggjeld?', 'Nei');
      cy.findByRole('textbox', { name: 'Hvem har du gjeld til? (kreditor)' }).should('not.exist');
    });
  });

  describe('Boforhold conditional', () => {
    it('shows the child datagrid only when the applicant supports children living at home', () => {
      visitPanel('boforhold');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');

      selectRadio('Velg boforholdet som passer din situasjon', 'Jeg forsørger eget/egne barn som bor sammen med meg.');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('exist');

      selectRadio('Velg boforholdet som passer din situasjon', 'Jeg bor alene');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
    });
  });

  describe('Cross-panel conditionals', () => {
    it('shows the endring textarea on Tilleggsopplysninger only for the endrings option on Veiledning', () => {
      visitPanel('veiledning');

      setVeiledningOption(/søker om endringer/i, true);
      cy.clickShowAllSteps();
      goToPanel('Tilleggsopplysninger');

      cy.findByRole('textbox', { name: 'Hvorfor søker du om endring?' }).should('exist');

      goToPanel('Veiledning');
      setVeiledningOption(/søker om endringer/i, false);
      setVeiledningOption(/fått krav om å betale/i, true);
      goToPanel('Tilleggsopplysninger');

      cy.findByRole('textbox', { name: 'Hvorfor søker du om endring?' }).should('not.exist');
    });

    it('shows the income-related attachments on Vedlegg only for the matching answers', () => {
      visitPanel('inntekt');

      selectRadio('Har du skattepliktige leieinntekter?', 'Ja');
      selectRadio('Har du forsikringer som utbetales av andre enn NAV?', 'Ja');
      selectRadio('Har du kapitalinntekter?', 'Ja');
      selectRadio('Avviker kapitalinntekten vesentlig fra forrige års ligning?', 'Ja');
      selectRadio('Har du næringsinntekt?', 'Ja');
      selectRadio('Avviker næringsinntekten vesentlig fra forrige års inntekt?', 'Ja');

      cy.clickShowAllSteps();
      goToPanel('Vedlegg');

      cy.findByRole('group', { name: /Dokumentasjon på skattepliktige leieinntekter/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon på forsikringer som utbetales av andre enn NAV/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon på endring av kapitalinntekter/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon på endrede næringsinntekter/ }).should('exist');

      goToPanel('Inntekt');
      selectRadio('Har du skattepliktige leieinntekter?', 'Nei');
      selectRadio('Har du forsikringer som utbetales av andre enn NAV?', 'Nei');
      selectRadio('Avviker kapitalinntekten vesentlig fra forrige års ligning?', 'Nei');
      selectRadio('Har du kapitalinntekter?', 'Nei');
      selectRadio('Avviker næringsinntekten vesentlig fra forrige års inntekt?', 'Nei');
      selectRadio('Har du næringsinntekt?', 'Nei');
      goToPanel('Vedlegg');

      cy.findByRole('group', { name: /Dokumentasjon på skattepliktige leieinntekter/ }).should('not.exist');
      cy.findByRole('group', { name: /Dokumentasjon på forsikringer som utbetales av andre enn NAV/ }).should(
        'not.exist',
      );
      cy.findByRole('group', { name: /Dokumentasjon på endring av kapitalinntekter/ }).should('not.exist');
      cy.findByRole('group', { name: /Dokumentasjon på endrede næringsinntekter/ }).should('not.exist');
    });

    it('shows the expense-related attachments on Vedlegg only for the matching answers', () => {
      visitPanel('utgifter');

      selectRadio('Har du boliglån?', 'Ja');
      selectRadio('Har du andre boutgifter?', 'Ja');
      selectRadio('Betaler du bidrag som ikke betales gjennom NAV?', 'Ja');
      selectRadio('Har du avbetalingskontrakter eller annen gjeld enn boliggjeld?', 'Ja');

      cy.clickShowAllSteps();
      goToPanel('Vedlegg');

      cy.findByRole('group', { name: /Dokumentasjon på utgifter til boliglån/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon på andre boutgifter/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon av betalt barnebidrag/ }).should('exist');
      cy.findByRole('group', {
        name: /Dokumentasjon på avbetalingskontrakter eller annen gjeld enn boliggjeld/,
      }).should('exist');

      goToPanel('Utgifter');
      selectRadio('Har du boliglån?', 'Nei');
      selectRadio('Har du andre boutgifter?', 'Nei');
      selectRadio('Betaler du bidrag som ikke betales gjennom NAV?', 'Nei');
      selectRadio('Har du avbetalingskontrakter eller annen gjeld enn boliggjeld?', 'Nei');
      goToPanel('Vedlegg');

      cy.findByRole('group', { name: /Dokumentasjon på utgifter til boliglån/ }).should('not.exist');
      cy.findByRole('group', { name: /Dokumentasjon på andre boutgifter/ }).should('not.exist');
      cy.findByRole('group', { name: /Dokumentasjon av betalt barnebidrag/ }).should('not.exist');
      cy.findByRole('group', {
        name: /Dokumentasjon på avbetalingskontrakter eller annen gjeld enn boliggjeld/,
      }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit(`/fyllut/nav570008${submission}`);
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies the summary', () => {
      // Veiledning
      setVeiledningOption(/fått krav om å betale/i, true);
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Barna
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('01018000055');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Sara');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Barn');
      selectRadio('Søker du om endring?', 'Nei');
      cy.clickNextStep();

      // Inntekt
      selectRadio('Har du skattepliktige leieinntekter?', 'Nei');
      selectRadio('Har du forsikringer som utbetales av andre enn NAV?', 'Nei');
      selectRadio('Har du kapitalinntekter?', 'Nei');
      selectRadio('Har du næringsinntekt?', 'Nei');
      cy.clickNextStep();

      // Utgifter
      selectRadio('Har du boliglån?', 'Nei');
      selectRadio('Har du andre boutgifter?', 'Nei');
      selectRadio('Betaler du bidrag som ikke betales gjennom NAV?', 'Nei');
      selectRadio('Har du avbetalingskontrakter eller annen gjeld enn boliggjeld?', 'Nei');
      cy.clickNextStep();

      // Boforhold
      selectRadio('Velg boforholdet som passer din situasjon', 'Jeg bor alene');
      cy.clickNextStep();

      // Tilleggsopplysninger
      selectRadio('Har du andre tilleggsopplysninger som er relevant for søknaden?', 'Nei');
      cy.clickNextStep();

      // Vedlegg
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei|ingen ekstra dokumentasjon/i }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Veiledning', () => {
        cy.contains('dd', /fått krav om å betale/i).should('exist');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dd', 'Ola').should('exist');
      });
      cy.withinSummaryGroup('Barna', () => {
        cy.contains('dd', 'Sara').should('exist');
      });
      cy.withinSummaryGroup('Boforhold', () => {
        cy.contains('dd', 'Jeg bor alene').should('exist');
      });
    });
  });
});
