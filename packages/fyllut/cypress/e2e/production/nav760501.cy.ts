import nav760501Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav760501.json';

/*
 * Production form tests for Ungdomsprogram Tilleggsstønad - støtte til daglig reise
 * Form: nav760501
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 3 observable identity/address conditionals
 *       identitet.harDuFodselsnummer → adresse + adresseVarighet + folkeregister alert
 *   - Reiseavstand (reiseavstand): 4 same-panel conditionals
 *       harDuEnReiseveiPaSeksKilometerEllerMer → medical follow-up
 *       harDuAvMedisinskeArsakerBehovForTransportUavhengigAvReisensLengde → alertstripe
 *       velgLand1 → postnr1 / postkode
 *   - Transportbehov (page12): 17 same-panel conditionals
 *       kanDuReiseKollektivtDagligReise → collective/public transport branches
 *       hvaErHovedarsakenTilAtDuIkkeKanReiseKollektivt → health / transport / child / other follow-ups
 *       kanDuBenytteEgenBil → own-car/taxi branches and attachment alerts
 *   - Vedlegg (vedlegg): 8 cross-panel conditionals
 *       travel-distance / transport branches → matching attachments
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

const visitWithFreshState = (url: string) => {
  cy.clearCookies();
  cy.visit(url, {
    onBeforeLoad: (win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    },
  });
  cy.defaultWaits();
};

const visitPanel = (panelKey: string) => {
  visitWithFreshState(`/fyllut/nav760501/${panelKey}?sub=paper`);
};

const chooseCountry = (label: string, value: string) => {
  cy.findByRole('combobox', { name: label }).click();
  cy.findByRole('combobox', { name: label }).type(`{selectAll}${value}{downArrow}{enter}`);
};

const fillDineOpplysninger = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
  cy.clickNextStep();
};

const fillReiseperiode = () => {
  cy.findByRole('textbox', { name: 'Startdato (dd.mm.åååå)' }).type(dateOffset(3));
  cy.findByRole('textbox', { name: 'Sluttdato (dd.mm.åååå)' }).type(dateOffset(14));
  cy.findByLabelText('Hvor mange reisedager har du per uke?').type('5');
  cy.clickNextStep();
};

const fillReiseavstand = () => {
  selectRadio('Har du en reisevei på seks kilometer eller mer?', 'Ja');
  cy.findByLabelText('Hvor lang reisevei har du?').type('12');
  cy.findByRole('textbox', { name: 'Gateadresse' }).type('Aktivitetsveien 1');
  cy.findByRole('textbox', { name: 'Postnummer' }).type('0150');
  cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
  cy.clickNextStep();
};

const goToVedleggFromReiseavstand = (setup: () => void) => {
  visitPanel('reiseavstand');
  setup();
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: 'Vedlegg' }).click();
};

const goToVedleggFromTransportbehov = (setup: () => void) => {
  visitPanel('page12');
  setup();
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: 'Vedlegg' }).click();
};

describe('nav760501', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
    cy.intercept('GET', '/fyllut/api/forms/nav760501*', { body: nav760501Form }).as('getForm');
    cy.intercept('GET', '/fyllut/api/translations/nav760501*', { body: {} }).as('getTranslations');
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

  describe('Reiseavstand conditionals', () => {
    it('shows the medical follow-up only when the travel distance is under six kilometres', () => {
      visitPanel('reiseavstand');
      cy.findByLabelText('Har du av medisinske årsaker behov for transport uavhengig av reisens lengde?').should(
        'not.exist',
      );

      selectRadio('Har du en reisevei på seks kilometer eller mer?', 'Nei');
      cy.findByLabelText('Har du av medisinske årsaker behov for transport uavhengig av reisens lengde?').should(
        'exist',
      );

      selectRadio('Har du av medisinske årsaker behov for transport uavhengig av reisens lengde?', 'Ja');
      cy.contains('Du må legge ved dokumentasjon av medisinske årsaker').should('exist');

      selectRadio('Har du en reisevei på seks kilometer eller mer?', 'Ja');
      cy.findByLabelText('Har du av medisinske årsaker behov for transport uavhengig av reisens lengde?').should(
        'not.exist',
      );
    });

    it('switches between Norwegian and foreign postal fields when the destination country changes', () => {
      visitPanel('reiseavstand');
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

  describe('Transportbehov conditionals', () => {
    it('switches between the collective transport amount field and the no-collective branch', () => {
      visitPanel('page12');
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
      visitPanel('page12');
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
      cy.findByRole('textbox', { name: 'Gateadressen hvor du henter eller leverer barn' }).should('exist');

      selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Annet');
      cy.findByRole('textbox', {
        name: 'Hvilke andre årsaker er det som gjør at du ikke kan reise kollektivt?',
      }).should('exist');
      cy.contains('Du må legge ved dokumentasjon av andre årsaker').should('exist');
    });

    it('shows own-car follow-ups and the own-car attachment alert when the applicant can drive', () => {
      visitPanel('page12');
      selectRadio('Kan du reise kollektivt?', 'Nei');
      selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Dårlig transporttilbud');
      cy.findByRole('textbox', {
        name: 'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      }).type('Det går ingen buss på aktuelle tidspunkter.');
      selectRadio('Kan du benytte egen bil?', 'Ja');

      cy.findByLabelText(/Bompenger/).should('exist');
      cy.findByLabelText('Hvor ofte ønsker du å sende inn kjøreliste?').should('exist');
      cy.findByLabelText('Oppgi forventet beløp til parkering på aktivitetsstedet per dag').should('not.exist');

      selectRadio('Kommer du til å ha utgifter til parkering på aktivitetsstedet?', 'Ja');
      cy.findByLabelText('Oppgi forventet beløp til parkering på aktivitetsstedet per dag').should('exist');

      cy.findByLabelText(/Bompenger/).type('25');
      cy.contains('Du må legge ved dokumentasjon på utgifter knyttet til bruk av egen bil').should('exist');
    });

    it('switches between taxi follow-ups when the applicant cannot use their own car', () => {
      visitPanel('page12');
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
    it('shows the medical travel-distance attachment only when the applicant needs transport for medical reasons', () => {
      goToVedleggFromReiseavstand(() => {
        selectRadio('Har du en reisevei på seks kilometer eller mer?', 'Nei');
        selectRadio('Har du av medisinske årsaker behov for transport uavhengig av reisens lengde?', 'Ja');
      });

      cy.findByRole('group', {
        name: /Dokumentasjon av medisinske årsaker til at du har behov for transport uavhengig av reisens lengde|Medisinsk dokumentasjon/,
      }).should('exist');
    });

    it('shows the matching collective-transport attachments for health, child pickup and other reasons', () => {
      goToVedleggFromTransportbehov(() => {
        selectRadio('Kan du reise kollektivt?', 'Nei');
        selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Helsemessige årsaker');
      });

      cy.findByRole('group', {
        name: /Legeerklæring på medisinske årsaker til at du ikke kan reise kollektivt|Medisinsk dokumentasjon/,
      }).should('exist');
    });

    it('shows the child-pickup attachment for the child-pickup branch', () => {
      goToVedleggFromTransportbehov(() => {
        selectRadio('Kan du reise kollektivt?', 'Nei');
        selectRadio(
          'Hva er hovedårsaken til at du ikke kan reise kollektivt?',
          'Henting eller levering av barn i barnehage eller skolefritidsordning (SFO)',
        );
      });

      cy.findByRole('group', {
        name: /Dokumentasjon av plass i barnehage eller skolefritidsordning|Bekreftelse på barns plass i barnehage/,
      }).should('exist');
    });

    it('shows the other-reason attachment for the other collective-transport branch', () => {
      goToVedleggFromTransportbehov(() => {
        selectRadio('Kan du reise kollektivt?', 'Nei');
        selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Annet');
      });

      cy.findByRole('group', {
        name: /Dokumentasjon av andre årsaker til at du ikke kan reise kollektivt|Dokumentasjon av reiseutgifter/,
      }).should('exist');
    });

    it('shows the own-car attachment when the applicant can use their own car', () => {
      goToVedleggFromTransportbehov(() => {
        selectRadio('Kan du reise kollektivt?', 'Nei');
        selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Dårlig transporttilbud');
        cy.findByRole('textbox', {
          name: 'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
        }).type('Det går ingen buss på aktuelle tidspunkter.');
        selectRadio('Kan du benytte egen bil?', 'Ja');
        cy.findByLabelText(/Bompenger/).type('25');
      });

      cy.findByRole('group', {
        name: /Dokumentasjon av utgifter knyttet til bruk av egen bil|Dokumentasjon på utgifter knyttet til bruk av egen bil/,
      }).should('exist');
    });

    it('shows the health-based own-car attachment when the applicant cannot use their own car for health reasons', () => {
      goToVedleggFromTransportbehov(() => {
        selectRadio('Kan du reise kollektivt?', 'Nei');
        selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Dårlig transporttilbud');
        cy.findByRole('textbox', {
          name: 'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
        }).type('Det går ingen buss på aktuelle tidspunkter.');
        selectRadio('Kan du benytte egen bil?', 'Nei');
        selectRadio('Hva er årsaken til at du ikke kan benytte egen bil?', 'Helsemessige årsaker');
      });

      cy.findByRole('group', {
        name: /Legeerklæring på helsemessige årsaker til at du ikke kan benytte egen bil|Medisinsk dokumentasjon/,
      }).should('exist');
    });

    it('shows the other-reason own-car and taxi attachments for the matching branch', () => {
      goToVedleggFromTransportbehov(() => {
        selectRadio('Kan du reise kollektivt?', 'Nei');
        selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Dårlig transporttilbud');
        cy.findByRole('textbox', {
          name: 'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
        }).type('Det går ingen buss på aktuelle tidspunkter.');
        selectRadio('Kan du benytte egen bil?', 'Nei');
        selectRadio('Hva er årsaken til at du ikke kan benytte egen bil?', 'Annet');
        selectRadio('Kan du benytte drosje?', 'Ja');
      });

      cy.findByRole('group', {
        name: /Dokumentasjon av andre årsaker til at du ikke kan benytte egen bil|Dokumentasjon av reiseutgifter/,
      }).should('exist');
      cy.findByRole('group', {
        name: /Dokumentasjon av utgifter til drosje|Dokumentasjon av reiseutgifter/,
      }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav760501?sub=paper');
    });

    it('fills required fields and verifies summary', () => {
      cy.get('#page-title').should('contain.text', 'Introduksjon');
      cy.clickNextStep();
      cy.get('#page-title').should('contain.text', 'Veiledning');
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).click();
      cy.clickNextStep();

      fillDineOpplysninger();
      fillReiseperiode();
      fillReiseavstand();

      selectRadio('Kan du reise kollektivt?', 'Ja');
      cy.findByLabelText('Hvilke utgifter har du i forbindelse med reisen?').type('79');
      cy.clickNextStep();

      cy.clickNextStep();

      cy.findByRole('group', { name: /Annen dokumentasjon|Annet/ }).within(() => {
        cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Reiseperiode', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hvilken periode vil du søke for?');
        cy.get('dd').eq(0).should('contain.text', dateOffset(3));
      });
      cy.withinSummaryGroup('Transportbehov', () => {
        cy.contains('dd', 'Ja').should('exist');
      });
    });
  });
});
