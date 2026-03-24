/*
 * Production form tests for Søknad om endring eller nytt uttak av foreldrepenger
 * Form: nav141605
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 2 customConditionals + folkeregister alert
 *       identitet.harDuFodselsnummer → adresse
 *       adresse.borDuINorge → adresseVarighet
 *   - Din situasjon (dinSituasjon): 5 same-panel conditionals
 *       hvemErDu / erDuAleneOmOmsorgenAvBarnet / harDenAndreForelderenRettTilForeldrepenger
 *       → follow-up radios and alertstripe
 *   - Søknaden (soknaden): 2 panel-level conditionals
 *       hvaSokerDuOm → Periode med foreldrepenger / Utsettelse links
 *   - Periode med foreldrepenger (periodeMedForeldrepenger): 4 same-panel conditionals
 *       hvilkenPeriodeSkalDuTaUtMor → modrekvote
 *       skalDenAndreForelderenHaForeldrepengerISammePeriode → prosent felt
 *       skalDuKombinereForeldrepengeneMedDelvisArbeid → work follow-ups
 *       hvorSkalDuJobbe → navnPaArbeidsgiver
 *   - Vedlegg (vedlegg): 1 cross-panel conditional from Utsettelse
 *       hvorforSkalDuUtsetteForeldrepenger=jegErForSykTilATaMegAvBarnet
 *       → legeerklaeringSomDokumentererAtDuErForSyk
 */

const formatDate = (date: Date) =>
  `${`${date.getDate()}`.padStart(2, '0')}.${`${date.getMonth() + 1}`.padStart(2, '0')}.${date.getFullYear()}`;

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
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

const visitPanel = (panelKey: string) => {
  cy.visit(`/fyllut/nav141605/${panelKey}?sub=paper`);
  cy.defaultWaits();
};

const visitRootForm = () => {
  cy.visit('/fyllut/nav141605?sub=paper');
  cy.defaultWaits();

  const advanceToVeiledning = (): void => {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Jeg bekrefter at jeg vil svare så riktig som jeg kan.')) {
        return;
      }

      cy.clickNextStep();
      advanceToVeiledning();
    });
  };

  advanceToVeiledning();
};

const fillDineOpplysninger = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).clear();
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).clear();
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).clear();
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
  cy.clickNextStep();
};

const fillDinSituasjonMorPath = () => {
  selectRadio('Hvem er du?', 'Mor');
  selectRadio(/Er du alene om omsorgen av barnet\?/i, 'Nei');
  selectRadio(/Har den andre forelderen rett til foreldrepenger\?/i, 'Ja');
  selectRadio(/Har du orientert den andre forelderen om søknaden din\?/i, 'Ja');
  cy.clickNextStep();
};

const goToSoknadenMorPath = () => {
  visitRootForm();
  cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/ }).click();
  cy.clickNextStep();
  fillDineOpplysninger();
  fillDinSituasjonMorPath();
};

const goToPeriodeMedForeldrepengerMorPath = () => {
  goToSoknadenMorPath();
  setSelectboxOption(/Hva søker du om\?/i, 'Periode med foreldrepenger');
  cy.findByRole('checkbox', {
    name: /Jeg bekrefter at jeg skal ha omsorgen for barnet i periodene jeg søker foreldrepenger/,
  }).click();
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: 'Periode med foreldrepenger' }).click();
};

describe('nav141605', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Dine opplysninger conditionals', () => {
    it('toggles the address section and folkeregister alert when the identity answer changes', () => {
      visitPanel('dineOpplysninger');

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.contains('folkeregistrerte adresse').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');
      cy.contains('folkeregistrerte adresse').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.contains('folkeregistrerte adresse').should('exist');
    });

    it('shows address validity only for the non-Norway address branch', () => {
      visitPanel('dineOpplysninger');

      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      selectRadio('Bor du i Norge?', 'Nei');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');

      selectRadio('Bor du i Norge?', 'Ja');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');
    });
  });

  describe('Din situasjon conditionals', () => {
    it('switches between alone-care, other-parent-rights and notification follow-ups', () => {
      visitPanel('dinSituasjon');

      cy.findByLabelText(/Er du alene om omsorgen av barnet\?/i).should('not.exist');
      cy.findByLabelText(/Ble du alene om omsorgen før eller etter oppstart av foreldrepengene\?/i).should('not.exist');
      cy.findByLabelText(/Har den andre forelderen rett til foreldrepenger\?/i).should('not.exist');

      selectRadio('Hvem er du?', 'Mor');
      cy.findByLabelText(/Er du alene om omsorgen av barnet\?/i).should('exist');

      selectRadio(/Er du alene om omsorgen av barnet\?/i, 'Ja');
      cy.findByLabelText(/Ble du alene om omsorgen før eller etter oppstart av foreldrepengene\?/i).should('exist');
      cy.findByLabelText(/Har den andre forelderen rett til foreldrepenger\?/i).should('not.exist');

      selectRadio(/Er du alene om omsorgen av barnet\?/i, 'Nei');
      cy.findByLabelText(/Ble du alene om omsorgen før eller etter oppstart av foreldrepengene\?/i).should('not.exist');
      cy.findByLabelText(/Har den andre forelderen rett til foreldrepenger\?/i).should('exist');

      selectRadio(/Har den andre forelderen rett til foreldrepenger\?/i, 'Ja');
      cy.findByLabelText(/Har du orientert den andre forelderen om søknaden din\?/i).should('exist');

      selectRadio(/Har du orientert den andre forelderen om søknaden din\?/i, 'Nei');
      cy.contains('Du må orientere den andre forelderen om søknaden').should('exist');
    });
  });

  describe('Søknaden panel visibility', () => {
    it('shows conditional panel links only after the matching application types are selected', () => {
      goToSoknadenMorPath();

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Periode med foreldrepenger' }).should('not.exist');
      cy.findByRole('link', { name: 'Utsettelse' }).should('not.exist');

      setSelectboxOption(/Hva søker du om\?/i, 'Periode med foreldrepenger');
      cy.findByRole('checkbox', {
        name: /Jeg bekrefter at jeg skal ha omsorgen for barnet i periodene jeg søker foreldrepenger/,
      }).click();
      cy.findByRole('link', { name: 'Periode med foreldrepenger' }).should('exist');

      setSelectboxOption(/Hva søker du om\?/i, 'Utsettelse første 6 ukene etter fødsel');
      cy.findByRole('link', { name: 'Utsettelse' }).should('exist');

      setSelectboxOption(/Hva søker du om\?/i, 'Utsettelse første 6 ukene etter fødsel', false);
      cy.findByRole('link', { name: 'Utsettelse' }).should('not.exist');
    });
  });

  describe('Periode med foreldrepenger conditionals', () => {
    it('shows the mødrekvote datagrid and work follow-ups for the selected branches', () => {
      goToPeriodeMedForeldrepengerMorPath();

      cy.findByLabelText('Mødrekvote fra og med dato (dd.mm.åååå)').should('not.exist');

      setSelectboxOption(/Hvilken periode skal du ta ut\?/i, 'Mødrekvote');
      cy.findByLabelText('Mødrekvote fra og med dato (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Oppgi hvor mange prosent foreldrepenger du skal ta ut').should('not.exist');

      selectRadio('Skal den andre forelderen ha foreldrepenger i samme periode?', 'Ja');
      cy.findByLabelText('Oppgi hvor mange prosent foreldrepenger du skal ta ut').should('exist');
      cy.findByLabelText('Oppgi stillingsprosenten du skal jobbe').should('not.exist');

      selectRadio(/Skal du kombinere foreldrepengene med delvis arbeid\?/i, 'Ja');
      cy.findByLabelText('Oppgi stillingsprosenten du skal jobbe').should('exist');
      cy.findByRole('group', { name: 'Hvor skal du jobbe?' }).should('exist');
      cy.findByRole('textbox', { name: 'Navn på arbeidsgiver' }).should('not.exist');

      setSelectboxOption(/Hvor skal du jobbe\?/i, 'Hos arbeidsgiver');
      cy.findByRole('textbox', { name: 'Navn på arbeidsgiver' }).should('exist');

      setSelectboxOption(/Hvor skal du jobbe\?/i, 'Hos arbeidsgiver', false);
      cy.findByRole('textbox', { name: 'Navn på arbeidsgiver' }).should('not.exist');
    });
  });

  describe('Vedlegg conditionals from Utsettelse', () => {
    it('shows the sickness attachment when the postponement reason is applicant illness', () => {
      goToSoknadenMorPath();
      setSelectboxOption(/Hva søker du om\?/i, 'Utsettelse første 6 ukene etter fødsel');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Utsettelse' }).click();

      cy.findByLabelText('Dato fra og med (dd.mm.åååå)').type(daysFromNow(14));
      cy.findByLabelText('Dato til og med (dd.mm.åååå)').type(daysFromNow(28));
      selectRadio('Hvorfor skal du utsette foreldrepenger?', 'Jeg er for syk til å ta meg av barnet');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Legeerklæring som dokumenterer at du er syk/ }).should('exist');
    });
  });

  describe('Summary', () => {
    it('fills the minimum happy path and verifies the summary', () => {
      goToSoknadenMorPath();

      setSelectboxOption(/Hva søker du om\?/i, 'Periode uten foreldrepenger');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Periode uten foreldrepenger' }).click();

      cy.findByLabelText('Dato fra og med (dd.mm.åååå)').type(daysFromNow(14));
      cy.findByLabelText('Dato til og med (dd.mm.åååå)').type(daysFromNow(28));

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Søknaden', () => {
        cy.contains('dd', 'Periode uten foreldrepenger').should('exist');
      });
    });
  });
});
