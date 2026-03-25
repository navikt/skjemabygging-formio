/*
 * Production form tests for Søknad om ytelser til tidligere familiepleier
 * Form: nav171501
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Behandling av personopplysninger i søknaden (behandlingAvPersonopplysningerISoknaden): 1 same-panel conditional
 *       vilDuLeseMerOmHvordanNavBehandlerPersonopplysningerIForbindelseMedSoknadenDin → explanatory html sections
 *   - Dine opplysninger (dineOpplysninger): 3 customConditionals
 *       identitet.harDuFodselsnummer → adresse + adresseVarighet + folkeregister alert
 *   - Sivilstatus (sivilstatus1): 3 observable same-panel conditionals
 *       hvaErDinSivilstatus → samboer container / avdøde group
 *       avdodesStatsborgerskap → avdodesStatsborgerskap1
 *   - Utenlandsopphold (utenlandsopphold): 1 same-panel conditional
 *       harDuBoddOgEllerArbeidetUtenforNorgeEtterFylte16Ar → datagrid
 *   - Nåværende arbeid (naverendeArbeid): 3 same-panel conditionals
 *       harDuInntektsgivendeArbeid → work container
 *       jobberDuDeltid → prosent
 *       erDuEllerSkalDuIPermisjon → permit dates
 *   - Inntekt og formue (inntektOgFormue): 5 conditionals
 *       four income radios → matching amount fields
 *       harDuFormueSomBankinnskuddAksjerObligasjonerEllerAnnenOmsetteligFormueVerdiAvEgenBoligRegnesIkkeMed
 *       → vedlegg attachment Dokumentasjon av formue
 *   - Utdanning (utdanning): 1 same-panel conditional
 *       harDuSkoleUtoverGrunnskoleKursEllerYrkesutdanning → opplysningerOmUtdanning datagrid
 */

const selectRadio = (label: string | RegExp, option: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const visitWithFreshState = (path: string) => {
  cy.clearCookies();
  cy.visit(path, {
    onBeforeLoad: (win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    },
  });
  cy.defaultWaits();
};

const visitPanel = (panelKey: string) => {
  visitWithFreshState(`/fyllut/nav171501/${panelKey}?sub=paper`);
};

const fillDineOpplysninger = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
  cy.findByRole('checkbox', { name: /bankkontonummer/ }).click();
  cy.clickNextStep();
};

const fillPleieforholdet = () => {
  selectRadio(/Har du i minst fem år.*tilsyn og pleie med/, 'Annen nærstående');
  cy.findByRole('textbox', { name: 'Forpleides fornavn' }).type('Kari');
  cy.findByRole('textbox', { name: 'Forpleides etternavn' }).type('Pleid');
  cy.findByRole('textbox', { name: /forpleides fødselsnummer/i }).type('17912099997');
  cy.findByRole('textbox', { name: /Når begynte pleieforholdet/ }).type('01.01.2010');
  cy.findByRole('textbox', { name: /Når opphørte pleieforholdet/ }).type('01.01.2016');
  selectRadio(/helt forhindret fra å forsørge deg selv/, 'Ja');
  selectRadio(/delvis forhindret fra å forsørge deg selv/, 'Nei');
  cy.findByRole('textbox', {
    name: 'Gjør kort rede for hvorfor ditt tilsyn og pleie har vært nødvendig, og hvorfor det forhindret deg i å arbeide',
  }).type('Pleiebehovet krevde daglig oppfølging og gjorde ordinært arbeid umulig.');
  selectRadio('Mottok den som ble pleid av deg pensjon fra folketrygden?', 'Ja');
  selectRadio('Bodde vedkommende i Norge i pleieperioden?', 'Ja');
  cy.clickNextStep();
};

const fillVedlegg = () => {
  cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
    cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon/ }).click();
  });
};

const goToBehandlingPanel = () => {
  visitPanel('behandlingAvPersonopplysningerISoknaden');
  cy.findByLabelText(/Vil du lese mer om hvordan NAV behandler personopplysninger/i).should('exist');
};

const goToSivilstatusPanel = () => {
  visitPanel('sivilstatus1');
  cy.get('h2#page-title')
    .invoke('text')
    .then((title) => {
      if (title.trim() === 'Dine opplysninger') {
        fillDineOpplysninger();
      }
    });
  cy.findByRole('heading', { level: 2, name: 'Sivilstatus' }).should('exist');
};

describe('nav171501', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Behandling av personopplysninger i søknaden conditionals', () => {
    beforeEach(() => {
      goToBehandlingPanel();
    });

    it('shows the extra privacy information only when the applicant chooses Ja', () => {
      cy.contains('Vi henter informasjonen vi trenger').should('not.exist');
      cy.contains('Utlevering av opplysninger').should('not.exist');

      selectRadio('Vil du lese mer om hvordan NAV behandler personopplysninger i forbindelse med søknaden din?', 'Ja');

      cy.contains('Vi henter informasjonen vi trenger').should('exist');
      cy.contains('Utlevering av opplysninger').should('exist');

      selectRadio('Vil du lese mer om hvordan NAV behandler personopplysninger i forbindelse med søknaden din?', 'Nei');

      cy.contains('Vi henter informasjonen vi trenger').should('not.exist');
      cy.contains('Utlevering av opplysninger').should('not.exist');
    });
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      visitPanel('dineOpplysninger');
    });

    it('shows address fields and address validity when the applicant has no Norwegian identity number', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      selectRadio('Bor du i Norge?', 'Nei');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');
    });

    it('shows the folkeregister alert and hides address fields when the applicant has Norwegian identity number', () => {
      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');

      cy.contains('Nav sender svar på søknad og annen kommunikasjon').should('exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');
    });
  });

  describe('Sivilstatus conditionals', () => {
    beforeEach(() => {
      goToSivilstatusPanel();
    });

    it('switches between samboer and avdøde follow-up sections', () => {
      cy.findByLabelText(/Når ble dere samboere/).should('not.exist');
      cy.findByLabelText(/Avdødes fødselsnummer eller d-nummer/i).should('not.exist');

      selectRadio('Hva er din sivilstatus?', 'Samboer');
      cy.findByLabelText(/Når ble dere samboere/).should('exist');
      cy.findByLabelText(/Avdødes fødselsnummer eller d-nummer/i).should('not.exist');

      selectRadio('Hva er din sivilstatus?', 'Enke eller enkemann');
      cy.findByLabelText(/Når ble dere samboere/).should('not.exist');
      cy.findByLabelText(/Avdødes fødselsnummer eller d-nummer/i).should('exist');
    });

    it('shows foreign citizenship text field only for the Utenlandsk branch', () => {
      selectRadio('Hva er din sivilstatus?', 'Enke eller enkemann');
      cy.findAllByLabelText('Avdødes statsborgerskap').should('have.length', 1);

      selectRadio('Avdødes statsborgerskap', 'Utenlandsk');
      cy.findAllByLabelText('Avdødes statsborgerskap').should('have.length', 2);

      cy.findByRole('radio', { name: 'Norsk' }).click();
      cy.findAllByLabelText('Avdødes statsborgerskap').should('have.length', 1);
    });
  });

  describe('Utenlandsopphold conditionals', () => {
    beforeEach(() => {
      visitPanel('utenlandsopphold');
    });

    it('shows the foreign stay datagrid only when the applicant answers Ja', () => {
      cy.findByRole('textbox', { name: 'Dato fra' }).should('not.exist');

      selectRadio('Har du bodd og/eller arbeidet utenfor Norge etter fylte 16 år?', 'Ja');
      cy.findByRole('textbox', { name: 'Dato fra' }).should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');

      selectRadio('Har du bodd og/eller arbeidet utenfor Norge etter fylte 16 år?', 'Nei');
      cy.findByRole('textbox', { name: 'Dato fra' }).should('not.exist');
    });
  });

  describe('Nåværende arbeid conditionals', () => {
    beforeEach(() => {
      visitPanel('naverendeArbeid');
    });

    it('shows work details, part-time percentage and permit dates for the Ja branches', () => {
      cy.findByRole('textbox', { name: 'Yrke/stilling' }).should('not.exist');
      cy.findByLabelText('Deltidsprosent').should('not.exist');
      cy.findByLabelText('Permisjon fra dato (dd.mm.åååå)').should('not.exist');

      selectRadio(/Har du inntektsgivende arbeid\?/, 'Ja');
      cy.findByRole('textbox', { name: 'Yrke/stilling' }).should('exist');

      selectRadio('Jobber du deltid?', 'Ja');
      cy.findByLabelText('Deltidsprosent').should('exist');

      selectRadio('Er du eller skal du i permisjon?', 'Ja');
      cy.findByLabelText('Permisjon fra dato (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Permisjon til dato (dd.mm.åååå)').should('exist');

      selectRadio('Jobber du deltid?', 'Nei');
      cy.findByLabelText('Deltidsprosent').should('not.exist');

      selectRadio('Er du eller skal du i permisjon?', 'Nei');
      cy.findByLabelText('Permisjon fra dato (dd.mm.åååå)').should('not.exist');
    });
  });

  describe('Inntekt og formue conditionals', () => {
    beforeEach(() => {
      visitPanel('inntektOgFormue');
    });

    it('toggles the observable income amount fields from their yes-no questions', () => {
      const cases = [
        {
          question: 'Har du arbeidsinntekt?',
          amountLabel: 'Brutto arbeidsinntekt per år',
        },
        {
          question: /Har du næringsinntekt\?/,
          amountLabel: 'Brutto næringsinntekt per år',
        },
        {
          question: 'Har du inntekt fra kapital eller formue?',
          amountLabel: 'Brutto inntekt fra kapital eller formue per år',
        },
        {
          question: 'Har du pensjon eller andre trygdeytelser?',
          amountLabel: 'Fra hvilken ordning?',
        },
      ] as const;

      cases.forEach(({ question, amountLabel }) => {
        cy.findByLabelText(amountLabel).should('not.exist');

        selectRadio(question, 'Ja');
        cy.findByLabelText(amountLabel).should('exist');

        selectRadio(question, 'Nei');
        cy.findByLabelText(amountLabel).should('not.exist');
      });

      cy.findByLabelText('Bruttobeløp per år').should('not.exist');
      selectRadio('Har du pensjon eller andre trygdeytelser?', 'Ja');
      cy.findByLabelText('Bruttobeløp per år').should('exist');
      selectRadio('Har du pensjon eller andre trygdeytelser?', 'Nei');
      cy.findByLabelText('Bruttobeløp per år').should('not.exist');
    });

    it('shows the formue attachment on Vedlegg only when the applicant answers Ja', () => {
      selectRadio('Har du formue som bankinnskudd, aksjer, obligasjoner eller annen omsettelig formue?', 'Ja');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon av formue/ }).should('exist');

      cy.findByRole('link', { name: 'Inntekt og formue' }).click();
      selectRadio('Har du formue som bankinnskudd, aksjer, obligasjoner eller annen omsettelig formue?', 'Nei');
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon av formue/ }).should('not.exist');
    });
  });

  describe('Utdanning conditionals', () => {
    beforeEach(() => {
      visitPanel('utdanning');
    });

    it('shows the education datagrid only when the applicant answers Ja', () => {
      cy.findByRole('textbox', { name: 'Skole utover grunnskole, kurs eller yrkesutdanning' }).should('not.exist');

      selectRadio('Har du skole utover grunnskole, kurs eller yrkesutdanning?', 'Ja');
      cy.findByRole('textbox', { name: 'Skole utover grunnskole, kurs eller yrkesutdanning' }).should('exist');
      cy.findByLabelText('Eksamensår').should('exist');

      selectRadio('Har du skole utover grunnskole, kurs eller yrkesutdanning?', 'Nei');
      cy.findByRole('textbox', { name: 'Skole utover grunnskole, kurs eller yrkesutdanning' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      goToBehandlingPanel();
    });

    it('fills required fields and verifies summary', () => {
      // Behandling av personopplysninger i søknaden
      selectRadio('Vil du lese mer om hvordan NAV behandler personopplysninger i forbindelse med søknaden din?', 'Nei');
      cy.clickNextStep();

      // Dine opplysninger
      fillDineOpplysninger();

      // Sivilstatus
      selectRadio('Hva er din sivilstatus?', 'Ugift');
      cy.clickNextStep();

      // Utenlandsopphold
      selectRadio('Har du bodd og/eller arbeidet utenfor Norge etter fylte 16 år?', 'Nei');
      cy.clickNextStep();

      // Pleieforholdet
      fillPleieforholdet();

      // Nåværende arbeid
      selectRadio(/Har du inntektsgivende arbeid\?/, 'Nei');
      cy.clickNextStep();

      // Inntekt og formue
      selectRadio('Har du arbeidsinntekt?', 'Nei');
      selectRadio(/Har du næringsinntekt\?/, 'Nei');
      selectRadio('Har du inntekt fra kapital eller formue?', 'Nei');
      selectRadio('Har du pensjon eller andre trygdeytelser?', 'Nei');
      selectRadio('Har du formue som bankinnskudd, aksjer, obligasjoner eller annen omsettelig formue?', 'Nei');
      cy.clickNextStep();

      // Utdanning
      selectRadio('Har du skole utover grunnskole, kurs eller yrkesutdanning?', 'Nei');
      cy.clickNextStep();

      // Erklæring
      cy.findByRole('checkbox', { name: /Jeg er kjent med at NAV kan innhente/ }).click();

      // Vedlegg is an attachment panel; navigate via stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      fillVedlegg();
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Sivilstatus', () => {
        cy.contains('dt', 'Hva er din sivilstatus?').next('dd').should('contain.text', 'Ugift');
      });
      cy.withinSummaryGroup('Pleieforholdet', () => {
        cy.contains('dt', 'Forpleides fornavn').next('dd').should('contain.text', 'Kari');
      });
    });
  });
});
