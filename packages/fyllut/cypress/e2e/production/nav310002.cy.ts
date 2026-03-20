/*
 * Production form tests for Krigspensjoneringen - Krav om invalidepensjon
 * Form: nav310002
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Dine opplysninger (personopplysninger): observable identity/address conditionals
 *       identitet.harDuFodselsnummer → adresse + adresseVarighet + folkeregister alert
 *       erDuNorskStatsborger → nasjonalitet
 *   - Krigsinnsats og fangenskap (page5): 4 same-panel conditionals + 1 attachment conditional
 *       wartime answers → datagrids, eventueltDekknavn, and Vedlegg attachment
 *   - Lege- og sykehusbehandling (page8): 1 same-panel conditional
 *       erDetAndreLegerSykehusSomHarBehandletDeg → extra doctor rows
 *   - Nåværende beskjeftigelse (page9): 3 customConditionals
 *       erDuIArbeidNa → income fields and work-reduction textarea
 *   - Tidligere og nye krav (page10): 2 same-panel conditionals
 *       prior claims radios → follow-up fields
 *   - Pensjonsforhold (page11): 1 same-panel conditional
 *       mottarDuUforepensjon... → pensjonsart + pensjonsordning
 *   - Ektefelle (page12): 2 same-panel conditionals + 1 attachment conditional
 *       harDuEktefelle → ektefelle container + vigselsattest in Vedlegg
 *       mottarEktefellenUforepensjon... → spouse pension fields
 *   - Forsørgede barn under 21 år (page13): 1 same-panel conditional + 2 attachment conditionals
 *       forsorgerDuBarnUnder21Ar → datagrid + aldersattest in Vedlegg
 *       barnUnder21ArSomDuForsorger[].erBarnetOver18Ar → school confirmation in Vedlegg
 *   - Tilleggsopplysinger (page14): 1 same-panel conditional
 *       harDuTilleggsopplysninger... → textarea
 *   - Bevitnelse (page16): 1 same-panel conditional
 *       harDuSelvFyltUtSoknadenOgKanSignerePaDen → witness fields
 */

const visitPanel = (panelKey: string) => {
  cy.visit(`/fyllut/nav310002/${panelKey}?sub=paper`);
  cy.defaultWaits();
};

const selectRadio = (label: string | RegExp, option: string | RegExp) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const goToVedlegg = () => {
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: 'Vedlegg' }).click();
};

const fillChildRow = (over18: 'Ja' | 'Nei') => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Sara');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Barn');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
  selectRadio('Er barnet over 18 år?', over18);
};

describe('nav310002', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      visitPanel('personopplysninger');
    });

    it('shows address fields and address validity when the applicant has no Norwegian identity number', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      selectRadio('Bor du i Norge?', 'Nei');
      cy.findByRole('combobox', { name: 'Land' }).should('exist');
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');
    });

    it('shows the folkeregister alert for Norwegian identity numbers and toggles nasjonalitet for non-Norwegian citizens', () => {
      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');

      cy.contains('Nav sender svar på søknad og annen kommunikasjon').should('exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.findByLabelText('Nasjonalitet').should('not.exist');
      selectRadio('Er du norsk statsborger?', 'Nei');
      cy.findByLabelText('Nasjonalitet').should('exist');

      selectRadio('Er du norsk statsborger?', 'Ja');
      cy.findByLabelText('Nasjonalitet').should('not.exist');
    });
  });

  describe('Krigsinnsats og fangenskap conditionals', () => {
    beforeEach(() => {
      visitPanel('page5');
    });

    it('shows the wartime datagrids when the applicant answers Ja', () => {
      cy.findByRole('textbox', { name: 'Hva var tjenestens art?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hva slags fart?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Tjenestested' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Arrestasjonsgrunn' }).should('not.exist');

      selectRadio('Deltok du i motstandsbevegelsen under krigen?', 'Ja');
      cy.findByRole('textbox', { name: 'Hva var tjenestens art?' }).should('exist');
      cy.findByRole('textbox', { name: /Eventuelt dekknavn/ }).should('exist');

      selectRadio('Tjenestegjorde du til sjøs under krigen?', 'Ja');
      cy.findByRole('textbox', { name: 'Hva slags fart?' }).should('exist');

      selectRadio('Tjenestegjorde du i de militære styrker under krigen?', 'Ja');
      cy.findByRole('textbox', { name: 'Tjenestested' }).should('exist');

      selectRadio('Satt du i fiendtlig fangenskap under krigen?', 'Ja');
      cy.findByRole('textbox', { name: 'Arrestasjonsgrunn' }).should('exist');
    });

    it('toggles the wartime attachment on Vedlegg from the motstandsbevegelsen answer', () => {
      selectRadio('Deltok du i motstandsbevegelsen under krigen?', 'Ja');
      goToVedlegg();
      cy.findByRole('group', { name: /Attestasjon på deltagelse|Dokumentasjon av militær-/ }).should('exist');

      cy.findByRole('link', { name: 'Krigsinnsats og fangenskap' }).click();
      selectRadio('Deltok du i motstandsbevegelsen under krigen?', 'Nei');
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Attestasjon på deltagelse|Dokumentasjon av militær-/ }).should('not.exist');
    });
  });

  describe('Lege- og sykehusbehandling conditionals', () => {
    beforeEach(() => {
      visitPanel('page8');
    });

    it('shows extra doctor rows only when the applicant has been treated elsewhere', () => {
      cy.findAllByRole('textbox', { name: 'Fornavn' }).should('have.length', 1);
      cy.findAllByRole('textbox', { name: 'Etternavn' }).should('have.length', 1);

      selectRadio('Er det andre leger/sykehus som har behandlet deg?', 'Ja');
      cy.findAllByRole('textbox', { name: 'Fornavn' }).should('have.length.at.least', 2);
      cy.findAllByRole('textbox', { name: 'Etternavn' }).should('have.length.at.least', 2);

      selectRadio('Er det andre leger/sykehus som har behandlet deg?', 'Nei');
      cy.findAllByRole('textbox', { name: 'Fornavn' }).should('have.length', 1);
      cy.findAllByRole('textbox', { name: 'Etternavn' }).should('have.length', 1);
    });
  });

  describe('Nåværende beskjeftigelse conditionals', () => {
    beforeEach(() => {
      visitPanel('page9');
    });

    it('switches the employment follow-up fields across all three work-status branches', () => {
      cy.findByLabelText('Arbeidsinntekt i dag').should('not.exist');
      cy.findByLabelText('Arbeidsinntekt i dag er per:').should('not.exist');
      cy.findByRole('textbox', { name: 'Når måtte du innskrenke eller innstille arbeidet?' }).should('not.exist');

      selectRadio('Er du i arbeid nå?', 'I fullt arbeid');
      cy.findByLabelText('Arbeidsinntekt i dag').should('exist');
      cy.findByLabelText('Arbeidsinntekt i dag er per:').should('exist');
      cy.findByRole('textbox', { name: 'Når måtte du innskrenke eller innstille arbeidet?' }).should('not.exist');

      selectRadio('Er du i arbeid nå?', 'I delvis arbeid');
      cy.findByLabelText('Arbeidsinntekt i dag').should('exist');
      cy.findByLabelText('Arbeidsinntekt i dag er per:').should('exist');
      cy.findByRole('textbox', { name: 'Når måtte du innskrenke eller innstille arbeidet?' }).should('exist');

      selectRadio('Er du i arbeid nå?', 'Ikke i arbeid');
      cy.findByLabelText('Arbeidsinntekt i dag').should('not.exist');
      cy.findByLabelText('Arbeidsinntekt i dag er per:').should('not.exist');
      cy.findByRole('textbox', { name: 'Når måtte du innskrenke eller innstille arbeidet?' }).should('exist');
    });
  });

  describe('Tidligere og nye krav conditionals', () => {
    beforeEach(() => {
      visitPanel('page10');
    });

    it('shows the relevant follow-up fields for prior claims', () => {
      cy.findByLabelText('Fra hvilken ordning').should('not.exist');
      cy.findByRole('textbox', {
        name: 'Når ble saken eventuelt meldt og, hvis mulig, registreringsnummer',
      }).should('not.exist');
      cy.findByLabelText('Ønsker du å melde slike krav?').should('not.exist');

      selectRadio('Har du tidligere meldt krav om ytelser for uførhet?', 'Ja');
      cy.findByLabelText('Fra hvilken ordning').should('exist');
      cy.findByRole('textbox', {
        name: 'Når ble saken eventuelt meldt og, hvis mulig, registreringsnummer',
      }).should('exist');

      selectRadio('Har du tidligere meldt krav om ytelser for uførhet?', 'Nei');
      cy.findByLabelText('Fra hvilken ordning').should('not.exist');
      cy.findByRole('textbox', {
        name: 'Når ble saken eventuelt meldt og, hvis mulig, registreringsnummer',
      }).should('not.exist');

      selectRadio('Har du tidligere meldt krav om ytelser for uførhet fra folketrygden?', 'Nei');
      cy.findByLabelText('Ønsker du å melde slike krav?').should('exist');

      selectRadio('Har du tidligere meldt krav om ytelser for uførhet fra folketrygden?', 'Ja');
      cy.findByLabelText('Ønsker du å melde slike krav?').should('not.exist');
    });
  });

  describe('Pensjonsforhold conditionals', () => {
    beforeEach(() => {
      visitPanel('page11');
    });

    it('shows pension details only when the applicant already receives pension', () => {
      cy.findByLabelText('Pensjonsart').should('not.exist');
      cy.findByLabelText('Navnet på pensjonsordning/ytelse').should('not.exist');

      selectRadio(/Mottar du uførepensjon eller alderspensjon/, 'Ja');
      cy.findByLabelText('Pensjonsart').should('exist');
      cy.findByLabelText('Navnet på pensjonsordning/ytelse').should('exist');

      selectRadio(/Mottar du uførepensjon eller alderspensjon/, 'Nei');
      cy.findByLabelText('Pensjonsart').should('not.exist');
      cy.findByLabelText('Navnet på pensjonsordning/ytelse').should('not.exist');
    });
  });

  describe('Ektefelle conditionals', () => {
    beforeEach(() => {
      visitPanel('page12');
    });

    it('shows spouse fields and pension follow-ups only on the Ja branches', () => {
      cy.findByRole('textbox', { name: 'Ektefelles fornavn' }).should('not.exist');

      selectRadio('Har du ektefelle?', 'Ja');
      cy.findByRole('textbox', { name: 'Ektefelles fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Ektefelles etternavn' }).should('exist');
      cy.findByRole('textbox', { name: /Ektefelles fødselsnummer/i }).should('exist');
      cy.findByLabelText('Navnet på ektefelles pensjonsart').should('not.exist');
      cy.findByLabelText('Navnet på ektefelles pensjonsordning/ytelse').should('not.exist');

      selectRadio(/Mottar ektefellen uførepensjon eller alderspensjon/, 'Ja');
      cy.findByLabelText('Navnet på ektefelles pensjonsart').should('exist');
      cy.findByLabelText('Navnet på ektefelles pensjonsordning/ytelse').should('exist');

      selectRadio(/Mottar ektefellen uførepensjon eller alderspensjon/, 'Nei');
      cy.findByLabelText('Navnet på ektefelles pensjonsart').should('not.exist');
      cy.findByLabelText('Navnet på ektefelles pensjonsordning/ytelse').should('not.exist');

      selectRadio('Har du ektefelle?', 'Nei');
      cy.findByRole('textbox', { name: 'Ektefelles fornavn' }).should('not.exist');
    });

    it('toggles the spouse attachment on Vedlegg from the ektefelle answer', () => {
      selectRadio('Har du ektefelle?', 'Ja');
      goToVedlegg();
      cy.findByRole('group', { name: /Vigselsattest|ekteskapsinngåelse/ }).should('exist');

      cy.findByRole('link', { name: 'Ektefelle' }).click();
      selectRadio('Har du ektefelle?', 'Nei');
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Vigselsattest|ekteskapsinngåelse/ }).should('not.exist');
    });
  });

  describe('Forsørgede barn under 21 år conditionals', () => {
    beforeEach(() => {
      visitPanel('page13');
    });

    it('shows the child datagrid only when the applicant supports children under 21', () => {
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');

      selectRadio('Forsørger du barn under 21 år?', 'Ja');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('exist');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');

      selectRadio('Forsørger du barn under 21 år?', 'Nei');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
    });

    it('toggles the child attachments on Vedlegg from the child answers', () => {
      selectRadio('Forsørger du barn under 21 år?', 'Ja');
      fillChildRow('Ja');

      goToVedlegg();
      cy.findByRole('group', { name: /Aldersattest|Fødselsattest/ }).should('exist');
      cy.findByRole('group', { name: /Bekreftelse fra studiested|Bekreftelse fra studiested\/skole/ }).should('exist');

      cy.findByRole('link', { name: 'Forsørgede barn under 21 år' }).click();
      selectRadio('Er barnet over 18 år?', 'Nei');
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Aldersattest|Fødselsattest/ }).should('exist');
      cy.findByRole('group', { name: /Bekreftelse fra studiested|Bekreftelse fra studiested\/skole/ }).should(
        'not.exist',
      );

      cy.findByRole('link', { name: 'Forsørgede barn under 21 år' }).click();
      selectRadio('Forsørger du barn under 21 år?', 'Nei');
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Aldersattest|Fødselsattest/ }).should('not.exist');
      cy.findByRole('group', { name: /Bekreftelse fra studiested|Bekreftelse fra studiested\/skole/ }).should(
        'not.exist',
      );
    });
  });

  describe('Tilleggsopplysinger conditionals', () => {
    beforeEach(() => {
      visitPanel('page14');
    });

    it('shows the free-text field only when the applicant has extra information', () => {
      cy.findByRole('textbox', { name: 'Relevante tilleggsopplysninger' }).should('not.exist');

      selectRadio('Har du tilleggsopplysninger som kan være relevante for saken?', 'Ja');
      cy.findByRole('textbox', { name: 'Relevante tilleggsopplysninger' }).should('exist');

      selectRadio('Har du tilleggsopplysninger som kan være relevante for saken?', 'Nei');
      cy.findByRole('textbox', { name: 'Relevante tilleggsopplysninger' }).should('not.exist');
    });
  });

  describe('Bevitnelse conditionals', () => {
    beforeEach(() => {
      visitPanel('page16');
    });

    it('shows witness fields only when the applicant cannot sign independently', () => {
      cy.findByRole('textbox', { name: 'Bevitners fornavn' }).should('not.exist');

      selectRadio(/Har du selv fylt ut søknaden og kan signere på den\?/, 'Nei');
      cy.findByRole('textbox', { name: 'Bevitners fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Bevitners etternavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Bevitners adresse' }).should('exist');
      cy.findByLabelText('Bevitnelsemåte').should('exist');

      selectRadio(/Har du selv fylt ut søknaden og kan signere på den\?/, 'Ja');
      cy.findByRole('textbox', { name: 'Bevitners fornavn' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav310002?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills the minimum required fields and verifies the summary', () => {
      // Veiledning
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      selectRadio('Er du flyktning?', 'Nei');
      selectRadio('Er du norsk statsborger?', 'Ja');
      cy.clickNextStep();

      // Utdannelse og tidligere beskjeftigelse
      cy.findByRole('textbox', { name: 'Gjør kort rede for din utdannelse' }).type('Videregående skole.');
      cy.findByRole('textbox', {
        name: 'Gjør kort rede for om du hadde avsluttet din utdannelse før skaden, arrestasjonen eller krigstjenesten',
      }).type('Ja, utdannelsen var avsluttet.');
      cy.findByRole('textbox', {
        name: 'Hvor du var ansatt og hva slags arbeid du hadde senest før skaden, arrestasjonen eller krigstjenesten',
      }).type('Jobbet som kontormedarbeider.');
      cy.findByLabelText('Årlige arbeidsinntekt senest før skaden, arrestasjonen eller krigstjenesten').type('350000');
      cy.findByLabelText('Arbeidsinntekt for året 1946').type('200000');
      cy.clickNextStep();

      // Krigsinnsats og fangenskap
      selectRadio('Deltok du i motstandsbevegelsen under krigen?', 'Nei');
      selectRadio('Tjenestegjorde du til sjøs under krigen?', 'Nei');
      selectRadio('Tjenestegjorde du i de militære styrker under krigen?', 'Nei');
      selectRadio('Satt du i fiendtlig fangenskap under krigen?', 'Nei');
      cy.clickNextStep();

      // Krigsulykke eller krigspåkjenninger
      cy.findByRole('textbox', { name: 'Opplysninger om krigsulykke eller krigspåkjenninger' }).type(
        'Ble skadet under krigen.',
      );
      cy.clickNextStep();

      // Nåværende sykdom eller skade
      cy.findByRole('textbox', { name: 'Opplysninger om skade eller sykdom' }).type('Vedvarende smerter.');
      cy.clickNextStep();

      // Lege- og sykehusbehandling
      cy.findByRole('textbox', {
        name: 'Når søkte du første gang lege for nåværende skade / sykdom? (dd.mm.åååå)',
      }).type('01.01.2020');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Lege');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Hjelper');
      cy.findByRole('textbox', { name: 'Vegadresse' }).type('Legegata 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0151');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      selectRadio('Er det andre leger/sykehus som har behandlet deg?', 'Nei');
      cy.clickNextStep();

      // Nåværende beskjeftigelse
      selectRadio('Er du i arbeid nå?', 'Ikke i arbeid');
      cy.findByRole('textbox', { name: 'Siste arbeidsgiver' }).type('Tidligere arbeidsgiver');
      cy.findByRole('textbox', { name: 'Når måtte du innskrenke eller innstille arbeidet?' }).type(
        'Arbeidet ble innstilt i 2020.',
      );
      cy.clickNextStep();

      // Tidligere og nye krav
      selectRadio('Har du tidligere meldt krav om ytelser for uførhet?', 'Nei');
      selectRadio('Har du tidligere meldt krav om ytelser for uførhet fra folketrygden?', 'Ja');
      cy.clickNextStep();

      // Pensjonsforhold
      selectRadio(/Mottar du uførepensjon eller alderspensjon/, 'Nei');
      cy.clickNextStep();

      // Ektefelle
      selectRadio('Har du ektefelle?', 'Nei');
      cy.clickNextStep();

      // Forsørgede barn under 21 år
      selectRadio('Forsørger du barn under 21 år?', 'Nei');
      cy.clickNextStep();

      // Tilleggsopplysinger
      selectRadio('Har du tilleggsopplysninger som kan være relevante for saken?', 'Nei');
      cy.clickNextStep();

      // Erklæring
      cy.findByRole('checkbox', { name: /Spørsmålene er besvart så nøyaktig som mulig/ }).click();
      cy.clickNextStep();

      // Bevitnelse
      selectRadio(/Har du selv fylt ut søknaden og kan signere på den\?/, 'Ja');

      // Vedlegg
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon|Annet/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Oppsummering
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
        cy.contains('dt', 'Etternavn').next('dd').should('contain.text', 'Nordmann');
      });
      cy.withinSummaryGroup('Nåværende beskjeftigelse', () => {
        cy.contains('dt', 'Er du i arbeid nå?').next('dd').should('contain.text', 'Ikke i arbeid');
      });
    });
  });
});
