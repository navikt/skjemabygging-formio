import nav540004Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav540004.json';

/*
 * Production form tests for Svar i sak om barnebidrag
 * Form: nav540004
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 1 observable customConditional
 *       identitet.harDuFodselsnummer -> adresse visibility
 *   - Barn søknaden gjelder for (barnSoknadenGjelderFor): 2 same-panel conditionals
 *       borBarnetINorge -> hvilketLandBorBarnet
 *       blirBarnetHeltEllerDelvisForsorgetAvBarnevernetEllerEnInstitusjon
 *         -> harNavMottattBekreftelseFraBarnevernet...
 *   - Søknaden gjelder (soknadenGjelder): 2 same-panel conditionals
 *       hvaSokerDuOm -> sokerDuTilbakeITid
 *       sokerDuTilbakeITid -> harDenAndrePartenBidratt... -> beskrivHvaDenAndreParten...
 *   - Barns bosted og samvær (barnsBostedOgSamvaer): 2 same-panel conditionals
 *       samvaeretErAvtaltFastsattVed -> avtalenGjelderFraDato / harNavMottattSamvaersavtalen...
 *       harBarnetDeltFastBosted -> harNavMottattAvtalenOmDeltFastBosted... + antall netter
 *   - Vedlegg (vedlegg): 1 cross-panel conditional from barnsBostedOgSamvaer
 *       harNavMottattSamvaersavtalenTidligereIDenneSaken1 -> avtaleOmSamvaer
 */

const formPath = 'nav540004';

const visitPath = (path = '') => {
  cy.visit(`/fyllut/${formPath}${path}?sub=paper`);
  cy.defaultWaits();
};

const advancePastStartPages = () => {
  cy.get('h2#page-title').then(($title) => {
    const pageTitle = $title.text().trim();

    if (pageTitle === 'Introduksjon') {
      cy.findByRole('link', { name: 'Neste steg' }).click();
      cy.get('h2#page-title').should('not.contain.text', 'Introduksjon');
    }
  });
};

const selectRadio = (label: string, option: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const fillDineOpplysninger = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
  cy.clickNextStep();
};

const fillOmDenSomHarSokt = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Søker');
  cy.clickNextStep();
};

const fillSingleChildBase = () => {
  selectRadio('Er det søkt for ett eller flere barn?', 'Det er søkt for ett barn');
  cy.findByRole('textbox', { name: 'Barnets fornavn' }).type('Lise');
  cy.findByRole('textbox', { name: 'Barnets etternavn' }).type('Nordmann');
  cy.findByRole('textbox', { name: /Barnets fødselsdato/ }).type('01.01.2020');
};

const fillBarnSoknadenGjelderFor = () => {
  fillSingleChildBase();
  selectRadio('Bor barnet i Norge?', 'Ja');
  selectRadio('Blir barnet helt eller delvis forsørget av barnevernet eller en institusjon?', 'Nei');
  selectRadio('Har barnet en tilsynsordning?', 'Nei');
  cy.clickNextStep();
};

const fillSoknadenGjelder = () => {
  selectRadio('Hva har den andre parten søkt om?', 'Fastsettelse av barnebidrag');
  selectRadio('Har den andre parten søkt tilbake i tid?', 'Nei');
  cy.clickNextStep();
};

const fillBarnsBostedOgSamvaer = (samvaerDokumentasjon = 'Ja') => {
  selectRadio('Bor barnet fast hos deg?', 'Ja');
  selectRadio('Har barnet bodd fast hos deg siden fødselen?', 'Ja');
  selectRadio('Har barnet delt fast bosted?', 'Nei');
  selectRadio('Er det avtalt eller fastsatt at den bidragspliktige skal ha samvær med barnet?', 'Ja');
  selectRadio('Samværet er avtalt eller fastsatt ved', 'skriftlig avtale');
  selectRadio('Har Nav mottatt samværsavtalen tidligere i denne saken?', samvaerDokumentasjon);
  cy.findByLabelText('Oppgi antall overnattinger over en 14 dagers periode').type('2');
  cy.findByLabelText('Antall dager med samvær uten overnatting over en 14 dagers periode').type('1');
  selectRadio('Har barnet samvær i ferier?', 'Nei');
  selectRadio('Gjennomføres samværet slik det er avtalt?', 'Ja');
  cy.clickNextStep();
};

const goToBarnSoknadenGjelderFor = () => {
  visitPath();
  advancePastStartPages();
  cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).click();
  cy.clickNextStep();
  selectRadio('Hvilken part er du i saken?', 'Bidragsmottaker');
  cy.clickNextStep();
  fillDineOpplysninger();
  fillOmDenSomHarSokt();
};

const goToSoknadenGjelder = () => {
  goToBarnSoknadenGjelderFor();
  fillBarnSoknadenGjelderFor();
};

const goToBarnsBostedOgSamvaer = () => {
  goToSoknadenGjelder();
  fillSoknadenGjelder();
};

describe('nav540004', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
    cy.intercept('GET', `/fyllut/api/forms/${formPath}*`, { body: nav540004Form });
    cy.intercept('GET', `/fyllut/api/translations/${formPath}*`, { body: { 'nb-NO': {} } });
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: { 'nb-NO': {} } });
  });

  describe('Dine opplysninger – identity conditional', () => {
    it('shows the address section when the applicant has no Norwegian identity number', () => {
      visitPath('/dineOpplysninger');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('keeps the address section hidden when the applicant has a Norwegian identity number', () => {
      visitPath('/dineOpplysninger');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });
  });

  describe('Barn søknaden gjelder for conditionals', () => {
    beforeEach(() => {
      goToBarnSoknadenGjelderFor();
    });

    it('shows the country selector only when the child does not live in Norway', () => {
      fillSingleChildBase();
      cy.findByRole('combobox', { name: /Hvilket land bor barnet i|Velg land/ }).should('not.exist');

      selectRadio('Bor barnet i Norge?', 'Nei');
      cy.findByRole('combobox', { name: /Hvilket land bor barnet i|Velg land/ }).should('exist');

      selectRadio('Bor barnet i Norge?', 'Ja');
      cy.findByRole('combobox', { name: /Hvilket land bor barnet i|Velg land/ }).should('not.exist');
    });

    it('shows the barnevern follow-up question only when institution support is selected', () => {
      fillSingleChildBase();
      selectRadio('Bor barnet i Norge?', 'Ja');
      cy.findByLabelText(
        'Har Nav mottatt bekreftelse fra barnevernet eller institusjonen om forsørgelse i denne saken?',
      ).should('not.exist');

      selectRadio('Blir barnet helt eller delvis forsørget av barnevernet eller en institusjon?', 'Ja');
      cy.findByLabelText(
        'Har Nav mottatt bekreftelse fra barnevernet eller institusjonen om forsørgelse i denne saken?',
      ).should('exist');

      selectRadio('Blir barnet helt eller delvis forsørget av barnevernet eller en institusjon?', 'Nei');
      cy.findByLabelText(
        'Har Nav mottatt bekreftelse fra barnevernet eller institusjonen om forsørgelse i denne saken?',
      ).should('not.exist');
    });
  });

  describe('Søknaden gjelder conditionals', () => {
    beforeEach(() => {
      goToSoknadenGjelder();
    });

    it('shows back-in-time questions only for fastsettelse and reveals textarea for paid support', () => {
      cy.findByLabelText('Har den andre parten søkt tilbake i tid?').should('not.exist');

      selectRadio('Hva har den andre parten søkt om?', 'Fastsettelse av barnebidrag');
      cy.findByLabelText('Har den andre parten søkt tilbake i tid?').should('exist');

      selectRadio('Har den andre parten søkt tilbake i tid?', 'Ja');
      cy.findByLabelText(
        'Har den andre parten bidratt til å forsørge barnet økonomisk i perioden det er søkt tilbake i tid?',
      ).should('exist');

      selectRadio(
        'Har den andre parten bidratt til å forsørge barnet økonomisk i perioden det er søkt tilbake i tid?',
        'Ja',
      );
      cy.findByRole('textbox', {
        name: 'Beskriv hva den andre parten har betalt, og for hvilke perioder det gjelder',
      }).should('exist');

      selectRadio('Hva har den andre parten søkt om?', 'Endring av barnebidrag');
      cy.findByLabelText('Har den andre parten søkt tilbake i tid?').should('not.exist');
      cy.findByRole('textbox', {
        name: 'Beskriv hva den andre parten har betalt, og for hvilke perioder det gjelder',
      }).should('not.exist');
    });
  });

  describe('Barns bosted og samvær conditionals', () => {
    beforeEach(() => {
      goToBarnsBostedOgSamvaer();
    });

    it('switches between oral and written agreement follow-up fields', () => {
      selectRadio('Bor barnet fast hos deg?', 'Ja');
      selectRadio('Har barnet bodd fast hos deg siden fødselen?', 'Ja');
      selectRadio('Har barnet delt fast bosted?', 'Nei');
      selectRadio('Er det avtalt eller fastsatt at den bidragspliktige skal ha samvær med barnet?', 'Ja');

      cy.findByRole('textbox', { name: /Avtalen gjelder fra dato/ }).should('not.exist');
      cy.findByLabelText('Har Nav mottatt samværsavtalen tidligere i denne saken?').should('not.exist');

      selectRadio('Samværet er avtalt eller fastsatt ved', 'muntlig avtale');
      cy.findByRole('textbox', { name: /Avtalen gjelder fra dato/ }).should('exist');
      cy.findByLabelText('Har Nav mottatt samværsavtalen tidligere i denne saken?').should('not.exist');

      selectRadio('Samværet er avtalt eller fastsatt ved', 'skriftlig avtale');
      cy.findByRole('textbox', { name: /Avtalen gjelder fra dato/ }).should('not.exist');
      cy.findByLabelText('Har Nav mottatt samværsavtalen tidligere i denne saken?').should('exist');
    });

    it('shows delt fast bosted follow-up fields only when shared residence is selected', () => {
      selectRadio('Bor barnet fast hos deg?', 'Ja');
      selectRadio('Har barnet bodd fast hos deg siden fødselen?', 'Ja');
      cy.findByLabelText('Har Nav mottatt avtalen om delt fast bosted for dette barnet i denne saken?').should(
        'not.exist',
      );
      cy.findByLabelText('Hvor mange netter er barnet hos den andre forelderen per måned?').should('not.exist');

      selectRadio('Har barnet delt fast bosted?', 'Ja');
      cy.findByLabelText('Har Nav mottatt avtalen om delt fast bosted for dette barnet i denne saken?').should('exist');
      cy.findByLabelText('Hvor mange netter er barnet hos den andre forelderen per måned?').should('exist');

      selectRadio('Har barnet delt fast bosted?', 'Nei');
      cy.findByLabelText('Har Nav mottatt avtalen om delt fast bosted for dette barnet i denne saken?').should(
        'not.exist',
      );
      cy.findByLabelText('Hvor mange netter er barnet hos den andre forelderen per måned?').should('not.exist');
    });
  });

  describe('Vedlegg – cross-panel conditional', () => {
    it('shows samvær attachment when the written agreement has not been sent to Nav', () => {
      goToBarnsBostedOgSamvaer();
      fillBarnsBostedOgSamvaer('Nei');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Avtale om samvær/ }).should('exist');
    });

    it('hides samvær attachment when the written agreement is already sent', () => {
      goToBarnsBostedOgSamvaer();
      fillBarnsBostedOgSamvaer('Ja');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Avtale om samvær/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      visitPath();
    });

    it('fills required fields and verifies the summary page', () => {
      advancePastStartPages();
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).click();
      cy.clickNextStep();

      selectRadio('Hvilken part er du i saken?', 'Bidragsmottaker');
      cy.clickNextStep();

      fillDineOpplysninger();
      fillOmDenSomHarSokt();
      fillBarnSoknadenGjelderFor();
      fillSoknadenGjelder();
      fillBarnsBostedOgSamvaer('Ja');

      selectRadio('Du og den andre partens boforhold', 'Vi har ikke bodd sammen');
      cy.clickNextStep();

      selectRadio('Har du en avtale om barnebidrag for det barnet det er søkt for?', 'Nei');
      cy.clickNextStep();

      selectRadio('Er du i jobb?', 'Nei');
      cy.findByRole('textbox', { name: 'Beskriv hva som er grunnen til at du ikke er i jobb' }).type('Studerer');
      cy.clickNextStep();

      selectRadio('Har du skattepliktig inntekt i Norge?', 'Nei, jeg har ikke skattepliktig inntekt');
      cy.findByRole('textbox', {
        name: 'Beskriv hva som er grunnen til at du ikke har skattepliktig inntekt',
      }).type('Ingen inntekt');
      cy.clickNextStep();

      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Søknaden gjelder', () => {
        cy.contains('dt', 'Hva har den andre parten søkt om?')
          .next('dd')
          .should('contain.text', 'Fastsettelse av barnebidrag');
      });
      cy.withinSummaryGroup('Nåværende bidrag', () => {
        cy.contains('dt', 'Har du en avtale om barnebidrag for det barnet det er søkt for?')
          .next('dd')
          .should('contain.text', 'Nei');
      });
    });
  });
});
