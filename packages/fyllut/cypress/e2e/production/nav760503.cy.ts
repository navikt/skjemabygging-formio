import nav760503Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav760503.json';

/*
 * Production form tests for Ungdomsprogram Tilleggsstønad - støtte til reise ved oppstart, avslutning eller hjemreise
 * Form: nav760503
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 2 observable identity/address conditionals
 *       identitet.harDuFodselsnummer → adresse + adresseVarighet + folkeregister alert
 *   - Reisevei (reisevei): 2 same-panel country conditionals
 *       velgLand3 → postnr3 / postkode
 *   - Barn (barn): 2 same-panel conditionals
 *       harDuBarnSomSkalFlytteMedDeg → barnSomSkalFlytteMedDeg
 *       harDuSaerligBehovForFlereHjemreiserEnnNevntOvenfor → alertstripe
 *   - Reisemåte (reiseVedOppstartAvslutningHjemreise): 17 same-panel conditionals
 *       kanDuReiseKollektivtOppstartAvslutningHjemreise → kollektiv / ikke-kollektiv branches
 *       hvaErHovedarsakenTilAtDuIkkeKanReiseKollektivt → health / transport / child / other follow-ups
 *       kanDuBenytteEgenBil + kanDuBenytteDrosje → own-car / taxi follow-ups and alerts
 *   - Vedlegg (vedlegg): 8 cross-panel conditionals
 *       barn / reisemåte answers → matching attachments
 */

const formatDate = (date: Date) =>
  `${`${date.getDate()}`.padStart(2, '0')}.${`${date.getMonth() + 1}`.padStart(2, '0')}.${date.getFullYear()}`;

const dateOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

const selectRadio = (label: string | RegExp, option: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const visitPanel = (panelKey: string) => {
  cy.visit(`/fyllut/nav760503/${panelKey}?sub=paper`);
  cy.defaultWaits();
};

const chooseCountry = (label: string, value: string) => {
  cy.findByRole('combobox', { name: label }).click();
  cy.findByRole('combobox', { name: label }).type(`{selectAll}${value}{downArrow}{enter}`);
};

const goToVedleggFromPanel = (panelKey: string, setup: () => void) => {
  visitPanel(panelKey);
  setup();
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: 'Vedlegg' }).click();
};

const fillDineOpplysninger = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
  cy.clickNextStep();
};

const fillSoknadsperiode = (startDate: string, endDate: string) => {
  cy.findByRole('textbox', { name: 'Startdato (dd.mm.åååå)' }).type(startDate);
  cy.findByRole('textbox', { name: 'Sluttdato (dd.mm.åååå)' }).type(endDate);
  cy.clickNextStep();
};

const fillReisevei = () => {
  cy.findByLabelText('Hvor lang reisevei har du?').type('150');
  cy.findByLabelText('Hvor mange ganger skal du reise (én vei)?').type('4');
  cy.findByRole('textbox', { name: 'Gateadresse' }).type('Aktivitetsveien 1');
  cy.findByRole('textbox', { name: 'Postnummer' }).type('0150');
  cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
  cy.clickNextStep();
};

const fillBarn = () => {
  selectRadio('Har du barn som skal flytte med deg?', 'Nei');
  selectRadio('Har du barn som bor hjemme, og som ikke er ferdig med fjerde skoleår?', 'Nei');
  selectRadio('Har du særlig behov for flere hjemreiser enn nevnt ovenfor?', 'Nei');
  cy.clickNextStep();
};

const fillReisemate = () => {
  selectRadio('Kan du reise kollektivt?', 'Ja');
  cy.findByLabelText('Hvilke utgifter har du i forbindelse med reisen?').type('450');
  cy.clickNextStep();
};

const fillVedlegg = () => {
  cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
    cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon/i }).click();
  });
  cy.clickNextStep();
};

describe('nav760503', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
    cy.intercept('GET', '/fyllut/api/forms/nav760503*', { body: nav760503Form });
    cy.intercept('GET', '/fyllut/api/translations/nav760503*', { body: {} });
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: {} });
  });

  describe('Dine opplysninger conditionals', () => {
    it('shows address fields and address validity when the applicant has no Norwegian identity number', () => {
      visitPanel('dineOpplysninger');

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      selectRadio('Bor du i Norge?', 'Nei');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');
    });

    it('shows the folkeregister alert and keeps address fields hidden when the applicant has Norwegian identity number', () => {
      visitPanel('dineOpplysninger');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');

      cy.contains('Nav sender svar på søknad og annen kommunikasjon').should('exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');
    });
  });

  describe('Reisevei conditionals', () => {
    it('switches between Norwegian and foreign postal fields when the destination country changes', () => {
      visitPanel('reisevei');

      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
      cy.findByRole('textbox', { name: 'Postkode' }).should('not.exist');

      chooseCountry('Velg land', 'Sverige');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postkode' }).should('exist');

      chooseCountry('Velg land', 'Norge');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
      cy.findByRole('textbox', { name: 'Postkode' }).should('not.exist');
    });
  });

  describe('Barn conditionals', () => {
    it('shows the child datagrid only when children are moving with the applicant', () => {
      visitPanel('barn');

      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');

      selectRadio('Har du barn som skal flytte med deg?', 'Ja');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Fødselsdato (dd.mm.åååå)' }).should('exist');

      selectRadio('Har du barn som skal flytte med deg?', 'Nei');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
    });

    it('shows the special-home-travel alert only when extra home travel is needed', () => {
      visitPanel('barn');

      cy.contains('Du må legge ved bekreftelse på særlige behov for flere hjemreiser').should('not.exist');

      selectRadio('Har du særlig behov for flere hjemreiser enn nevnt ovenfor?', 'Ja');
      cy.contains('Du må legge ved bekreftelse på særlige behov for flere hjemreiser').should('exist');

      selectRadio('Har du særlig behov for flere hjemreiser enn nevnt ovenfor?', 'Nei');
      cy.contains('Du må legge ved bekreftelse på særlige behov for flere hjemreiser').should('not.exist');
    });
  });

  describe('Reisemåte conditionals', () => {
    it('switches between the collective transport amount field and the no-collective branch', () => {
      visitPanel('reiseVedOppstartAvslutningHjemreise');

      cy.findByLabelText('Hvilke utgifter har du i forbindelse med reisen?').should('not.exist');
      cy.findByLabelText('Hva er hovedårsaken til at du ikke kan reise kollektivt?').should('not.exist');

      selectRadio('Kan du reise kollektivt?', 'Ja');
      cy.findByLabelText('Hvilke utgifter har du i forbindelse med reisen?').should('exist');
      cy.findByLabelText('Hva er hovedårsaken til at du ikke kan reise kollektivt?').should('not.exist');

      selectRadio('Kan du reise kollektivt?', 'Nei');
      cy.findByLabelText('Hvilke utgifter har du i forbindelse med reisen?').should('not.exist');
      cy.findByLabelText('Hva er hovedårsaken til at du ikke kan reise kollektivt?').should('exist');
    });

    it('shows the matching follow-up fields for each main reason for not travelling collectively', () => {
      visitPanel('reiseVedOppstartAvslutningHjemreise');

      selectRadio('Kan du reise kollektivt?', 'Nei');

      selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Helsemessige årsaker');
      cy.contains('Du må legge ved legeerklæring på medisinske årsaker').should('exist');

      selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Dårlig transporttilbud');
      cy.findByRole('textbox', {
        name: 'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      }).should('exist');

      selectRadio(
        'Hva er hovedårsaken til at du ikke kan reise kollektivt?',
        'Henting eller levering av barn i barnehage eller skolefritidsordning (SFO)',
      );
      cy.findByRole('textbox', { name: /henter eller leverer barn/i }).should('exist');

      selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Annet');
      cy.findByRole('textbox', {
        name: 'Hvilke andre årsaker er det som gjør at du ikke kan reise kollektivt?',
      }).should('exist');
      cy.contains('Du må legge ved dokumentasjon av andre årsaker').should('exist');
    });

    it('shows own-car follow-ups and the own-car attachment alert when the applicant can drive', () => {
      visitPanel('reiseVedOppstartAvslutningHjemreise');

      selectRadio('Kan du reise kollektivt?', 'Nei');
      selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Dårlig transporttilbud');
      cy.findByRole('textbox', {
        name: 'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      }).type('Det går ingen buss på aktuelle tidspunkter.');
      selectRadio('Kan du benytte egen bil?', 'Ja');

      cy.findByLabelText(/Bompenger/).should('exist');
      cy.findByLabelText(/Bompenger/).type('50');
      cy.contains('Du må legge ved dokumentasjon på utgifter knyttet til bruk av egen bil').should('exist');
    });

    it('switches between taxi follow-ups when the applicant cannot use their own car', () => {
      cy.visit('/fyllut/nav760503/reiseVedOppstartAvslutningHjemreise?sub=paper');
      cy.findByRole('heading', { level: 2, name: 'Reisemåte' }).should('exist');

      selectRadio('Kan du reise kollektivt?', 'Nei');
      selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Dårlig transporttilbud');
      selectRadio('Kan du benytte egen bil?', 'Nei');

      selectRadio('Hva er årsaken til at du ikke kan benytte egen bil?', 'Annet');
      cy.findByRole('textbox', { name: 'Hvilke andre årsaker gjør at du ikke kan benytte egen bil?' }).should('exist');
      cy.contains('Du må legge ved dokumentasjon av andre årsaker').should('exist');

      selectRadio('Kan du benytte drosje?', 'Ja');
      cy.findByLabelText(
        'Hva er den totale kostnaden du har til bruk av drosje i perioden du søker om stønad for?',
      ).should('exist');
      cy.contains('Du må legge ved dokumentasjon av utgifter til drosje').should('exist');

      selectRadio('Kan du benytte drosje?', 'Nei');
      cy.findByRole('textbox', { name: 'Hvorfor kan du ikke benytte drosje?' }).should('exist');
      cy.contains('Du vil derfor sannsynligvis få avslag på søknaden om stønad til reiser').should('exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows the special-home-travel attachment only when extra home travel is documented', () => {
      goToVedleggFromPanel('barn', () => {
        selectRadio('Har du barn som skal flytte med deg?', 'Nei');
        selectRadio('Har du barn som bor hjemme, og som ikke er ferdig med fjerde skoleår?', 'Nei');
        selectRadio('Har du særlig behov for flere hjemreiser enn nevnt ovenfor?', 'Ja');
      });

      cy.findByRole('group', {
        name: /Bekreftelse på særlige behov for flere hjemreiser|Bekreftelse på særskilte behov for flere hjemreiser/,
      }).should('exist');
    });

    it('shows the matching collective-transport attachments for health, child pickup and other reasons', () => {
      goToVedleggFromPanel('reiseVedOppstartAvslutningHjemreise', () => {
        selectRadio('Kan du reise kollektivt?', 'Nei');
        selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Helsemessige årsaker');
      });

      cy.findByRole('group', {
        name: /Legeerklæring på medisinske årsaker til at du ikke kan reise kollektivt|Medisinsk dokumentasjon/,
      }).should('exist');

      cy.findByRole('link', { name: 'Reisemåte' }).click();
      selectRadio(
        'Hva er hovedårsaken til at du ikke kan reise kollektivt?',
        'Henting eller levering av barn i barnehage eller skolefritidsordning (SFO)',
      );
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', {
        name: /Dokumentasjon av plass i barnehage eller skolefritidsordning|barnehage eller SFO/,
      }).should('exist');

      cy.findByRole('link', { name: 'Reisemåte' }).click();
      selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Annet');
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', {
        name: /Dokumentasjon av andre årsaker til at du ikke kan reise kollektivt|Dokumentasjon av reiseutgifter/,
      }).should('exist');
    });

    it('shows own-car and taxi attachments for the matching no-collective branches', () => {
      goToVedleggFromPanel('reiseVedOppstartAvslutningHjemreise', () => {
        selectRadio('Kan du reise kollektivt?', 'Nei');
        selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Dårlig transporttilbud');
        cy.findByRole('textbox', {
          name: 'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
        }).type('Det går ingen buss på aktuelle tidspunkter.');
        selectRadio('Kan du benytte egen bil?', 'Ja');
        cy.findByLabelText(/Bompenger/).type('50');
      });

      cy.findByRole('group', {
        name: /Dokumentasjon av utgifter knyttet til bruk av egen bil|Dokumentasjon på utgifter knyttet til bruk av egen bil/,
      }).should('exist');

      cy.findByRole('link', { name: 'Reisemåte' }).click();
      selectRadio('Kan du benytte egen bil?', 'Nei');
      selectRadio('Hva er årsaken til at du ikke kan benytte egen bil?', 'Helsemessige årsaker');
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', {
        name: /Legeerklæring på helsemessige årsaker til at du ikke kan benytte egen bil|Medisinsk dokumentasjon/,
      }).should('exist');

      cy.findByRole('link', { name: 'Reisemåte' }).click();
      selectRadio('Hva er årsaken til at du ikke kan benytte egen bil?', 'Annet');
      selectRadio('Kan du benytte drosje?', 'Ja');
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', {
        name: /Dokumentasjon av andre årsaker til at du ikke kan benytte egen bil|Dokumentasjon av reiseutgifter/,
      }).should('exist');
      cy.findByRole('group', {
        name: /Dokumentasjon av utgifter til drosje|Dokumentasjon av reiseutgifter/,
      }).should('exist');
    });
  });

  describe('Summary', () => {
    it('fills required fields and verifies summary', () => {
      const startDate = dateOffset(3);
      const endDate = dateOffset(17);

      cy.visit('/fyllut/nav760503?sub=paper');
      cy.defaultWaits();
      cy.get('#page-title').should('contain.text', 'Introduksjon');
      cy.clickNextStep();
      cy.get('#page-title').should('contain.text', 'Veiledning');
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).click();
      cy.clickNextStep();

      fillDineOpplysninger();
      fillSoknadsperiode(startDate, endDate);
      fillReisevei();
      fillBarn();
      fillReisemate();
      cy.clickNextStep();
      fillVedlegg();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Søknadsperiode', () => {
        cy.contains('dd', startDate).should('exist');
      });
      cy.withinSummaryGroup('Reisemåte', () => {
        cy.get('dt').eq(0).should('contain.text', 'Kan du reise kollektivt?');
        cy.get('dd').eq(0).should('contain.text', 'Ja');
      });
    });
  });
});
