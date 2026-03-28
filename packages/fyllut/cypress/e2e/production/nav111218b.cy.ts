/*
 * Production form tests for Tilleggsstønad - støtte til reise ved oppstart, avslutning eller hjemreise
 * Form: nav111218b
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (personopplysninger): 4 customConditionals
 *       identitet.harDuFodselsnummer → adresse visibility
 *       identitet.harDuFodselsnummer === "ja" → folkeregistrert-adresse alert
 *       adresse.borDuINorge / vegadresseEllerPostboksadresse → adresseVarighet visibility
 *   - Reisevei (reisevei): 2 same-panel conditionals
 *       velgLand3.value === "NO" → postnr3
 *       velgLand3.value !== "NO" → postkode
 *   - Barn (barn): 2 conditionals
 *       harDuBarnSomSkalFlytteMedDeg → barnSomSkalFlytteMedDeg datagrid
 *       harDuSaerligBehovForFlereHjemreiserEnnNevntOvenfor → alertstripe + Vedlegg attachment
 *   - Reisemåte (reiseVedOppstartAvslutningHjemreise): same-panel and cross-panel conditionals
 *       kanDuReiseKollektivtOppstartAvslutningHjemreise → kollektiv cost field / non-collective container
 *       hvaErHovedarsakenTilAtDuIkkeKanReiseKollektivt → health alert / bad-transport textarea / child-pickup container / annet textarea
 *       kanDuBenytteEgenBil + expenses / can use taxi → own-car alert + Vedlegg attachment / taxi follow-up fields
 */

const setupForm = () => {
  cy.defaultIntercepts();
  cy.defaultInterceptsExternal();
};

const selectHasNorwegianIdentityNumber = (answer: 'Ja' | 'Nei') => {
  cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const selectCanTravelCollectively = (answer: 'Ja' | 'Nei') => {
  cy.withinComponent('Kan du reise kollektivt?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const selectMainReasonNotCollective = (
  answer:
    | 'Helsemessige årsaker'
    | 'Dårlig transporttilbud'
    | 'Henting eller levering av barn i barnehage eller skolefritidsordning (SFO)'
    | 'Annet',
) => {
  cy.withinComponent('Hva er hovedårsaken til at du ikke kan reise kollektivt?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const selectCanUseOwnCar = (answer: 'Ja' | 'Nei') => {
  cy.withinComponent('Kan du benytte egen bil?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const selectCanUseTaxi = (answer: 'Ja' | 'Nei') => {
  cy.withinComponent('Kan du benytte drosje?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

describe('nav111218b', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    setupForm();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111218b/personopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('toggles address fields and folkeregister alert when identity number answer changes', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse.').should(
        'not.exist',
      );

      selectHasNorwegianIdentityNumber('Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      selectHasNorwegianIdentityNumber('Ja');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse.').should('exist');
    });

    it('shows address validity dates when living outside Norway', () => {
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      selectHasNorwegianIdentityNumber('Nei');
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');
    });
  });

  describe('Reisevei – country dependent address conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111218b/reisevei?sub=paper');
      cy.defaultWaits();
    });

    it('switches between Norwegian postnummer and foreign postkode', () => {
      cy.findByRole('textbox', { name: /Postkode/ }).should('not.exist');
      cy.findByLabelText('Postnummer').should('exist');

      cy.findByRole('combobox', { name: 'Velg land' }).type('Sver{downarrow}{enter}');
      cy.findByRole('textbox', { name: /Postkode/ }).should('exist');
      cy.findByLabelText('Postnummer').should('not.exist');

      cy.findByRole('combobox', { name: 'Velg land' }).type('{selectall}{backspace}Norg{downarrow}{enter}');
      cy.findByLabelText('Postnummer').should('exist');
      cy.findByRole('textbox', { name: /Postkode/ }).should('not.exist');
    });
  });

  describe('Barn conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111218b/barn?sub=paper');
      cy.defaultWaits();
    });

    it('shows child datagrid only when children are moving with the applicant', () => {
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');

      cy.withinComponent('Har du barn som skal flytte med deg?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');

      cy.withinComponent('Har du barn som skal flytte med deg?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
    });

    it('shows confirmation attachment on Vedlegg when extra trips home are needed', () => {
      cy.contains('særlige behov for flere hjemreiser').should('not.exist');

      cy.withinComponent('Har du særlig behov for flere hjemreiser enn nevnt ovenfor?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.contains('Du må legge ved bekreftelse på særlige behov for flere hjemreiser.').should('exist');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /særlige behov for flere hjemreiser/i }).should('exist');
    });
  });

  describe('Reisemåte conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111218b/reiseVedOppstartAvslutningHjemreise?sub=paper');
      cy.defaultWaits();
    });

    it('switches between collective travel costs and the non-collective branch', () => {
      cy.findByLabelText('Hvilke utgifter har du i forbindelse med reisen?').should('not.exist');
      cy.findByLabelText('Hva er hovedårsaken til at du ikke kan reise kollektivt?').should('not.exist');

      selectCanTravelCollectively('Ja');
      cy.findByLabelText('Hvilke utgifter har du i forbindelse med reisen?').should('exist');
      cy.findByLabelText('Hva er hovedårsaken til at du ikke kan reise kollektivt?').should('not.exist');

      selectCanTravelCollectively('Nei');
      cy.findByLabelText('Hvilke utgifter har du i forbindelse med reisen?').should('not.exist');
      cy.findByLabelText('Hva er hovedårsaken til at du ikke kan reise kollektivt?').should('exist');
    });

    it('shows branch-specific follow-up fields for the selected non-collective travel reason', () => {
      selectCanTravelCollectively('Nei');
      cy.findByRole('textbox', {
        name: 'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      }).should('not.exist');
      cy.findByRole('textbox', { name: 'Adressen hvor du henter eller leverer barn' }).should('not.exist');
      cy.findByRole('textbox', {
        name: 'Hvilke andre årsaker er det som gjør at du ikke kan reise kollektivt?',
      }).should('not.exist');

      selectMainReasonNotCollective('Helsemessige årsaker');
      cy.contains('Du må legge ved legeerklæring på medisinske årsaker.').should('exist');

      selectMainReasonNotCollective('Dårlig transporttilbud');
      cy.findByRole('textbox', {
        name: 'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      }).should('exist');
      cy.contains('Du må legge ved legeerklæring på medisinske årsaker.').should('not.exist');

      selectMainReasonNotCollective('Henting eller levering av barn i barnehage eller skolefritidsordning (SFO)');
      cy.findByRole('textbox', { name: 'Adressen hvor du henter eller leverer barn' }).should('exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');

      selectMainReasonNotCollective('Annet');
      cy.findByRole('textbox', {
        name: 'Hvilke andre årsaker er det som gjør at du ikke kan reise kollektivt?',
      }).should('exist');
      cy.contains('Du må legge ved dokumentasjon av andre årsaker som gjør at du ikke kan reise kollektivt.').should(
        'exist',
      );
    });

    it('shows own-car expense documentation and taxi follow-up fields for relevant answers', () => {
      selectCanTravelCollectively('Nei');
      selectMainReasonNotCollective('Dårlig transporttilbud');
      cy.findByRole('textbox', {
        name: 'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      }).type('Det går ingen buss på aktuelle tidspunkter.');

      selectCanUseOwnCar('Ja');
      cy.contains('Du må legge ved dokumentasjon på utgifter knyttet til bruk av egen bil.').should('not.exist');
      cy.findByLabelText(/Bompenger/).type('200');
      cy.contains('Du må legge ved dokumentasjon på utgifter knyttet til bruk av egen bil.').should('exist');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /utgifter knyttet til bruk av egen bil/i }).should('exist');

      cy.findByRole('link', { name: 'Reisemåte' }).click();
      selectCanUseOwnCar('Nei');
      cy.findByLabelText('Hva er årsaken til at du ikke kan benytte egen bil?').should('exist');

      cy.withinComponent('Hva er årsaken til at du ikke kan benytte egen bil?', () => {
        cy.findByRole('radio', { name: 'Annet' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvilke andre årsaker gjør at du ikke kan benytte egen bil?' }).should('exist');

      selectCanUseTaxi('Ja');
      cy.findByLabelText(
        'Hva er den totale kostnaden du har til bruk av drosje i perioden du søker om stønad for?',
      ).should('exist');

      selectCanUseTaxi('Nei');
      cy.findByLabelText(
        'Hva er den totale kostnaden du har til bruk av drosje i perioden du søker om stønad for?',
      ).should('not.exist');
      cy.findByRole('textbox', { name: 'Hvorfor kan du ikke benytte drosje?' }).should('exist');
      cy.contains('Du har oppgitt at du ikke kan reise kollektivt, benytte egen bil eller drosje.').should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111218b?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      cy.clickNextStep();

      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectHasNorwegianIdentityNumber('Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      cy.get('body').then(($body) => {
        if ($body.text().includes('Hvilken av de følgende situasjonene passer for deg?')) {
          cy.findByRole('checkbox', { name: /Ingen av situasjonene passer/ }).check();
        }
      });
      cy.clickNextStep();

      cy.findByLabelText('Startdato (dd.mm.åååå)').type('01.08.2025');
      cy.findByLabelText('Sluttdato (dd.mm.åååå)').type('31.08.2025');
      cy.clickNextStep();

      cy.findByLabelText('Hvor lang reisevei har du?').type('15');
      cy.findByLabelText('Hvor mange ganger skal du reise (én vei)?').type('4');
      cy.findByRole('textbox', { name: 'Gateadresse' }).type('Testveien 1');
      cy.findByLabelText('Postnummer').type('0150');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.clickNextStep();

      cy.withinComponent('Har du barn som skal flytte med deg?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du barn som bor hjemme, og som ikke er ferdig med fjerde skoleår?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du særlig behov for flere hjemreiser enn nevnt ovenfor?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      selectCanTravelCollectively('Ja');
      cy.findByLabelText('Hvilke utgifter har du i forbindelse med reisen?').type('1500');
      cy.clickNextStep();

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Reisemåte', () => {
        cy.get('dt').should('contain.text', 'Kan du reise kollektivt?');
        cy.contains('dd', 'Ja').should('exist');
        cy.contains('dd', /1\s*500,00\s*NOK/).should('exist');
      });
    });
  });
});
