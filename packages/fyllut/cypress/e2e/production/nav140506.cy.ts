/*
 * Production form tests for Søknad om foreldrepenger ved adopsjon
 * Form: nav140506
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): identity-driven customConditionals
 *       identitet.harDuFodselsnummer → adresse, adresseVarighet, folkeregister alerts
 *   - Barnet (barnet): cross-panel + same-panel conditionals
 *       hvemErDu → stebarn fields vs foreldreansvar fields
 *       gjelderSoknadenDinStebarnsadopsjon → stebarnsdato / omsorgsdato
 *   - Den andre forelderen (denAndreForelderen): same-panel conditionals
 *       kanDuGiOssNavnetPaDenAndreForelderen → name group
 *       harDenAndreForelderenNorskFodselsnummerEllerDNummer → fnr vs foreign id/country
 *       erDuAleneOmOmsorgenAvBarnet → rights question
 *   - Opphold i utland (oppholdIUtland): 2 same-panel datagrid conditionals
 *       hvorSkalDuBoDeNeste12Manedene / hvorHarDuBoddDeSiste12Manedene → datagrids
 *   - Arbeidsforhold og inntekt (arbeidsforholdOgInntekt): same-panel branch conditionals
 *       frilanser, næringsdrift, registration, tenure and yrkesaktiv/endring follow-ups
 */

const formatDate = (date: Date) =>
  `${`${date.getDate()}`.padStart(2, '0')}.${`${date.getMonth() + 1}`.padStart(2, '0')}.${date.getFullYear()}`;

const dateOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

const openPanelFromDinSituasjon = (
  hvemErDu: 'Mor' | 'Far' | 'Medmor' | 'Jeg har overtatt foreldreansvaret',
  panelTitle: string,
) => {
  cy.visit('/fyllut/nav140506/dinSituasjon?sub=paper');
  cy.defaultWaits();

  cy.withinComponent('Hvem er du?', () => {
    cy.findByRole('radio', { name: hvemErDu }).click();
  });
  cy.withinComponent('Hvor lang periode med foreldrepenger ønsker du?', () => {
    cy.findByRole('radio', { name: '100 prosent foreldrepenger' }).click();
  });

  cy.clickShowAllSteps();
  cy.findByRole('link', { name: panelTitle }).click();
};

describe('nav140506', () => {
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
      cy.visit('/fyllut/nav140506/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('toggles address fields, address validity and folkeregister alert based on identity answer', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');
      cy.contains('folkeregistrerte adresse').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
      cy.contains('folkeregistrerte adresse').should('exist');
    });
  });

  describe('Barnet conditionals', () => {
    it('shows stebarn follow-up dates only for mor/far/medmor and toggles between ja/nei branches', () => {
      openPanelFromDinSituasjon('Mor', 'Barnet');

      cy.findByLabelText('Gjelder søknaden din stebarnsadopsjon?').should('exist');
      cy.findByLabelText('Dato for omsorgsovertakelse (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Gjelder søknaden din stebarnsadopsjon?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Oppgi datoen for stebarnsadopsjon (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Når overtar du omsorgen? (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Gjelder søknaden din stebarnsadopsjon?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Oppgi datoen for stebarnsadopsjon (dd.mm.åååå)').should('not.exist');
      cy.findByLabelText('Når overtar du omsorgen? (dd.mm.åååå)').should('exist');
    });

    it('shows overtatt foreldreansvar fields instead of stebarn branch', () => {
      openPanelFromDinSituasjon('Jeg har overtatt foreldreansvaret', 'Barnet');

      cy.findByLabelText('Gjelder søknaden din stebarnsadopsjon?').should('not.exist');
      cy.findByLabelText('Dato for omsorgsovertakelse (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Hvor mange barn overtar du omsorgen for?').should('exist');
      cy.findByLabelText('Hvor mange barn overtar du omsorgen for?').type('1');
      cy.findByLabelText('Når ble barnet født? (dd.mm.åååå)').should('exist');
    });
  });

  describe('Den andre forelderen conditionals', () => {
    it('toggles name, foreign identity and rights questions from the parent answers', () => {
      openPanelFromDinSituasjon('Mor', 'Den andre forelderen');

      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');

      cy.withinComponent('Kan du gi oss navnet på den andre forelderen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', {
        name: 'Hva er den andre forelderens fødselsnummer eller d-nummer?',
      }).should('not.exist');

      cy.withinComponent('Har den andre forelderen norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', {
        name: /Hva er den andre forelderens utenlandske fødselsnummer/,
      }).should('exist');
      cy.findByRole('combobox', { name: 'Hvor bor den andre forelderen?' }).should('exist');

      cy.withinComponent(/Er du alene om omsorgen av barnet/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(/Har den andre forelderen rett til foreldrepenger/).should('not.exist');

      cy.withinComponent(/Er du alene om omsorgen av barnet/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(/Har den andre forelderen rett til foreldrepenger/).should('exist');
    });
  });

  describe('Opphold i utland conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140506/oppholdIUtland?sub=paper');
      cy.defaultWaits();
    });

    it('shows future and past foreign-stay datagrids only for abroad answers', () => {
      cy.findByRole('combobox', { name: 'Hvilket land skal du bo i?' }).should('not.exist');
      cy.findByRole('combobox', { name: 'Hvilket land bodde du i?' }).should('not.exist');

      cy.withinComponent('Hvor skal du bo de neste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Bo i utlandet helt eller delvis' }).click();
      });
      cy.findByRole('combobox', { name: 'Hvilket land skal du bo i?' }).should('exist');

      cy.withinComponent('Hvor har du bodd de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Bodd i utlandet helt eller delvis' }).click();
      });
      cy.findByRole('combobox', { name: 'Hvilket land bodde du i?' }).should('exist');

      cy.withinComponent('Hvor skal du bo de neste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Kun bo i Norge' }).click();
      });
      cy.withinComponent('Hvor har du bodd de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Kun bodd i Norge' }).click();
      });
      cy.findByRole('combobox', { name: 'Hvilket land skal du bo i?' }).should('not.exist');
      cy.findByRole('combobox', { name: 'Hvilket land bodde du i?' }).should('not.exist');
    });
  });

  describe('Arbeidsforhold og inntekt conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140506/arbeidsforholdOgInntekt?sub=paper');
      cy.defaultWaits();
    });

    it('shows freelancer and self-employed follow-up branches only for the matching answers', () => {
      cy.findByLabelText('Når startet du som frilanser? (dd.mm.åååå)').should('not.exist');
      cy.findByRole('textbox', { name: 'Hva heter virksomheten din?' }).should('not.exist');

      cy.withinComponent('Har du jobbet og hatt inntekt som frilanser de siste 10 månedene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Når startet du som frilanser? (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Sluttdato som frilanser (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Jobber du fortsatt som frilanser?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Sluttdato som frilanser (dd.mm.åååå)').should('exist');

      cy.withinComponent('Har du jobbet og hatt inntekt som selvstendig næringsdrivende de siste 10 månedene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Hva heter virksomheten din?' }).should('exist');
      cy.findByLabelText('Virksomhetens organisasjonsnummer').should('not.exist');
      cy.findByRole('combobox', { name: 'Hvilket land er virksomheten registrert i?' }).should('not.exist');

      cy.withinComponent('Er virksomheten din registrert i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Virksomhetens organisasjonsnummer').should('exist');

      cy.withinComponent('Er virksomheten din registrert i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Virksomhetens organisasjonsnummer').should('not.exist');
      cy.findByRole('combobox', { name: 'Hvilket land er virksomheten registrert i?' }).should('exist');
    });

    it('switches between the tenure branches for selvstendig næringsdrivende', () => {
      cy.withinComponent('Har du jobbet og hatt inntekt som selvstendig næringsdrivende de siste 10 månedene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Hva har du hatt i næringsresultat før skatt de siste 12 månedene?').should('not.exist');
      cy.findByLabelText(/Har du hatt en varig endring i arbeidsforholdet ditt/).should('not.exist');

      cy.withinComponent('Hvor lenge har du vært selvstendig næringsdrivende?', () => {
        cy.findByRole('radio', { name: 'Mellom 1 og 4 år' }).click();
      });
      cy.findByLabelText('Hva har du hatt i næringsresultat før skatt de siste 12 månedene?').should('exist');
      cy.findByLabelText('Har du blitt yrkesaktiv i løpet av de 3 siste ferdiglignede årene?').should('exist');

      cy.withinComponent('Har du blitt yrkesaktiv i løpet av de 3 siste ferdiglignede årene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Når ble du yrkesaktiv? (dd.mm.åååå)').should('exist');

      cy.withinComponent('Hvor lenge har du vært selvstendig næringsdrivende?', () => {
        cy.findByRole('radio', { name: 'Mer enn 4 år' }).click();
      });
      cy.findByLabelText('Hva har du hatt i næringsresultat før skatt de siste 12 månedene?').should('not.exist');
      cy.findByLabelText(/Har du hatt en varig endring i arbeidsforholdet ditt/).should('exist');

      cy.withinComponent(/Har du hatt en varig endring i arbeidsforholdet ditt/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Dato for endringen (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Næringsinntekten din etter endringen').should('exist');
      cy.findByRole('textbox', {
        name: /Skriv kort hva som har endret seg i arbeidsforholdet ditt/,
      }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav140506?sub=paper');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary for the overtatt foreldreansvar path', () => {
      // Introduksjon -> Veiledning
      cy.get('#page-title').should('be.visible');
      cy.get('#page-title').then(($heading) => {
        if ($heading.text().trim() === 'Introduksjon') {
          cy.clickNextStep();
        }
      });

      // Veiledning
      cy.findByRole('checkbox', {
        name: /Jeg bekrefter at jeg har lest og forstått mine plikter/,
      }).click();
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Din situasjon
      cy.withinComponent('Hvem er du?', () => {
        cy.findByRole('radio', { name: 'Jeg har overtatt foreldreansvaret' }).click();
      });
      cy.withinComponent('Hvor lang periode med foreldrepenger ønsker du?', () => {
        cy.findByRole('radio', { name: '100 prosent foreldrepenger' }).click();
      });
      cy.clickNextStep();

      // Barnet
      cy.findByLabelText('Dato for omsorgsovertakelse (dd.mm.åååå)').type(dateOffset(-30));
      cy.findByLabelText('Hvor mange barn overtar du omsorgen for?').type('1');
      cy.findByLabelText('Når ble barnet født? (dd.mm.åååå)').type(dateOffset(-400));
      cy.clickNextStep();

      // Din plan med foreldrepenger
      cy.findByLabelText('Dato fra og med (dd.mm.åååå)').type(dateOffset(14));
      cy.findByLabelText('Dato til og med (dd.mm.åååå)').type(dateOffset(60));
      cy.withinComponent(/Skal du kombinere foreldrepengene med delvis arbeid/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Opphold i utland
      cy.withinComponent('Hvor skal du bo de neste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Kun bo i Norge' }).click();
      });
      cy.withinComponent('Hvor har du bodd de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Kun bodd i Norge' }).click();
      });
      cy.clickNextStep();

      // Arbeidsforhold og inntekt
      cy.withinComponent('Har du arbeidsforhold i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du jobbet og hatt inntekt som frilanser de siste 10 månedene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du jobbet og hatt inntekt som selvstendig næringsdrivende de siste 10 månedene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du hatt andre inntektskilder de siste 10 månedene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // Vedlegg
      cy.findByRole('group', { name: /Bekreftelse på foreldreansvar/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annet|Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Oppsummering
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Din situasjon', () => {
        cy.contains('dd', 'Jeg har overtatt foreldreansvaret').should('exist');
      });
    });
  });
});
