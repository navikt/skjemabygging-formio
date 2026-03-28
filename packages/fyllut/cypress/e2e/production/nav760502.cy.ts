import nav760502Form from '../../../../../mocks/mocks/data/forms-api/production-forms/nav760502.json';

/*
 * Production form tests for Ungdomsprogram Tilleggsstønad - støtte til reise til samling
 * Form: nav760502
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 2 observable identity/address conditionals
 *       identitet.harDuFodselsnummer → adresse + adresseVarighet + folkeregister alert
 *   - Reiseavstand (reiseavstand): 2 same-panel country conditionals
 *       velgLandReiseTilSamling → postnr2 / postkode
 *   - Reisemåte (reiseTilSamling): 10 same-panel conditionals
 *       kanDuReiseKollektivtReiseTilSamling → collective / no-collective branches
 *       hvaErHovedarsakenTilAtDuIkkeKanReiseKollektivt → health / transport / child / other follow-ups
 *       kanDuBenytteEgenBil → own-car / no-car branches
 *       hvaErArsakenTilAtDuIkkeKanBenytteEgenBil → other-reason follow-ups
 *       kanDuBenytteDrosje → taxi amount / rejection reason
 *   - Vedlegg (vedlegg): 7 cross-panel attachment conditionals
 *       travel-mode branches → matching documentation attachments
 */

const formatDate = (date: Date) =>
  `${`${date.getDate()}`.padStart(2, '0')}.${`${date.getMonth() + 1}`.padStart(2, '0')}.${date.getFullYear()}`;

const dateOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

const selectRadio = (label: string | RegExp, option: string | RegExp) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const visitPath = (path: string) => {
  cy.visit(path);
  cy.defaultWaits();
};

const visitPanel = (panelKey: string) => {
  visitPath(`/fyllut/nav760502/${panelKey}?sub=paper`);
};

const chooseCountry = (value: string) => {
  cy.findByRole('combobox', { name: 'Velg land' }).click();
  cy.findByRole('combobox', { name: 'Velg land' }).type(`{selectAll}${value}{downArrow}{enter}`);
};

const goToVedleggFromReisemate = (setup: () => void) => {
  visitPanel('reiseTilSamling');
  setup();
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: 'Vedlegg' }).click();
};

const markAttachmentForLater = (name: RegExp) => {
  cy.findByRole('group', { name }).within(() => {
    cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
  });
};

const fillDineOpplysninger = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
  cy.clickNextStep();
};

const fillSoknadsperiode = () => {
  cy.findByRole('textbox', { name: 'Startdato (dd.mm.åååå)' }).type(dateOffset(3));
  cy.findByRole('textbox', { name: 'Sluttdato (dd.mm.åååå)' }).type(dateOffset(14));
  cy.clickNextStep();
};

const fillReiseavstand = () => {
  cy.findByLabelText('Hvor lang reisevei har du?').type('12');
  cy.findByRole('textbox', { name: 'Gateadresse' }).type('Samlingsveien 1');
  cy.findByRole('textbox', { name: 'Postnummer' }).type('0150');
  cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
  cy.clickNextStep();
};

const goToVeiledning = () => {
  cy.get('#page-title')
    .invoke('text')
    .then((title) => {
      if (title.includes('Introduksjon')) {
        cy.clickNextStep();
        cy.get('#page-title').should('contain.text', 'Veiledning');
        return;
      }

      expect(title).to.contain('Veiledning');
    });
};

describe('nav760502', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
    cy.intercept('GET', '/fyllut/api/forms/nav760502*', { body: nav760502Form }).as('getForm');
    cy.intercept('GET', '/fyllut/api/translations/nav760502*', { body: {} }).as('getTranslations');
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
    it('switches between Norwegian and foreign postal fields when the destination country changes', () => {
      visitPanel('reiseavstand');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
      cy.findByRole('textbox', { name: 'Postkode' }).should('not.exist');

      chooseCountry('Sverige');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postkode' }).should('exist');

      chooseCountry('Norge');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
      cy.findByRole('textbox', { name: 'Postkode' }).should('not.exist');
    });
  });

  describe('Reisemåte conditionals', () => {
    it('switches between the collective transport amount field and the no-collective branch', () => {
      visitPanel('reiseTilSamling');
      cy.findByLabelText('Hva er totalutgiftene til kollektivtransport til og fra samlingene?').should('not.exist');
      cy.findByLabelText('Hva er hovedårsaken til at du ikke kan reise kollektivt?').should('not.exist');

      selectRadio('Kan du reise kollektivt?', 'Ja');
      cy.findByLabelText('Hva er totalutgiftene til kollektivtransport til og fra samlingene?').should('exist');
      cy.findByLabelText('Hva er hovedårsaken til at du ikke kan reise kollektivt?').should('not.exist');

      selectRadio('Kan du reise kollektivt?', 'Nei');
      cy.findByLabelText('Hva er totalutgiftene til kollektivtransport til og fra samlingene?').should('not.exist');
      cy.findByLabelText('Hva er hovedårsaken til at du ikke kan reise kollektivt?').should('exist');
    });

    it('shows the matching follow-up fields for each main reason for not travelling collectively', () => {
      visitPanel('reiseTilSamling');
      selectRadio('Kan du reise kollektivt?', 'Nei');

      selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Helsemessige årsaker');
      cy.contains('Du må legge ved legeerklæring').should('exist');

      selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Dårlig transporttilbud');
      cy.findByRole('textbox', {
        name: 'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      }).should('exist');

      selectRadio(
        'Hva er hovedårsaken til at du ikke kan reise kollektivt?',
        'Henting eller levering av barn i barnehage eller skolefritidsordning (SFO)',
      );
      cy.findByRole('textbox', { name: 'Adressen hvor du henter eller leverer barn' }).should('exist');

      selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Annet');
      cy.findByRole('textbox', {
        name: 'Hvilke andre årsaker er det som gjør at du ikke kan reise kollektivt?',
      }).should('exist');
      cy.contains('Du må legge ved dokumentasjon av andre årsaker').should('exist');
    });

    it('switches between own-car and taxi follow-ups based on whether the applicant can use a car', () => {
      visitPanel('reiseTilSamling');
      selectRadio('Kan du reise kollektivt?', 'Nei');
      selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Dårlig transporttilbud');
      cy.findByRole('textbox', {
        name: 'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      }).type('Det går ingen buss til samlingsstedet.');

      selectRadio('Kan du benytte egen bil?', 'Ja');
      cy.findByLabelText(/Bompenger/).should('exist');
      cy.findByLabelText('Hva er årsaken til at du ikke kan benytte egen bil?').should('not.exist');
      cy.findByLabelText(/Bompenger/).type('25');
      cy.findByLabelText(/Piggdekkavgift/).should('exist');

      selectRadio('Kan du benytte egen bil?', 'Nei');
      cy.findByLabelText(/Bompenger/).should('not.exist');
      cy.findByLabelText('Hva er årsaken til at du ikke kan benytte egen bil?').should('exist');

      selectRadio('Hva er årsaken til at du ikke kan benytte egen bil?', 'Annet');
      cy.findByRole('textbox', { name: 'Hvilke andre årsaker gjør at du ikke kan benytte egen bil?' }).should('exist');
      cy.contains('Du må legge ved dokumentasjon av andre årsaker').should('exist');

      selectRadio('Kan du benytte drosje?', 'Ja');
      cy.findByLabelText(
        'Hva er den totale kostnaden du har til bruk av drosje i perioden du søker om stønad for?',
      ).should('exist');
      cy.contains('Du må legge ved dokumentasjon av utgifter til drosje').should('exist');

      selectRadio('Kan du benytte drosje?', 'Nei');
      cy.findByLabelText(
        'Hva er den totale kostnaden du har til bruk av drosje i perioden du søker om stønad for?',
      ).should('not.exist');
      cy.findByRole('textbox', { name: 'Hvorfor kan du ikke benytte drosje?' }).should('exist');
      cy.contains('Du vil derfor sannsynligvis få avslag på søknaden om stønad til reiser').should('exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows the matching collective-transport attachments for health, child pickup and other reasons', () => {
      goToVedleggFromReisemate(() => {
        selectRadio('Kan du reise kollektivt?', 'Nei');
        selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Helsemessige årsaker');
      });

      cy.findByRole('group', {
        name: /Legeerklæring på medisinske årsaker til at du ikke kan reise kollektivt/,
      }).should('exist');

      cy.findByRole('link', { name: 'Reisemåte' }).click();
      selectRadio(
        'Hva er hovedårsaken til at du ikke kan reise kollektivt?',
        'Henting eller levering av barn i barnehage eller skolefritidsordning (SFO)',
      );
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', {
        name: /Dokumentasjon av plass i barnehage eller skolefritidsordning/,
      }).should('exist');

      cy.findByRole('link', { name: 'Reisemåte' }).click();
      selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Annet');
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', {
        name: /Dokumentasjon av andre årsaker til at du ikke kan reise kollektivt/,
      }).should('exist');
    });

    it('shows own-car and taxi attachments for the matching no-collective branches', () => {
      goToVedleggFromReisemate(() => {
        selectRadio('Kan du reise kollektivt?', 'Nei');
        selectRadio('Hva er hovedårsaken til at du ikke kan reise kollektivt?', 'Dårlig transporttilbud');
        cy.findByRole('textbox', {
          name: 'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
        }).type('Det går ingen buss til samlingsstedet.');
        selectRadio('Kan du benytte egen bil?', 'Ja');
        cy.findByLabelText(/Bompenger/).type('25');
      });

      cy.findByRole('group', {
        name: /Dokumentasjon av utgifter knyttet til bruk av egen bil/,
      }).should('exist');

      cy.findByRole('link', { name: 'Reisemåte' }).click();
      selectRadio('Kan du benytte egen bil?', 'Nei');
      selectRadio('Hva er årsaken til at du ikke kan benytte egen bil?', 'Helsemessige årsaker');
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', {
        name: /Legeerklæring på helsemessige årsaker til at du ikke kan benytte egen bil/,
      }).should('exist');

      cy.findByRole('link', { name: 'Reisemåte' }).click();
      selectRadio('Hva er årsaken til at du ikke kan benytte egen bil?', 'Annet');
      selectRadio('Kan du benytte drosje?', 'Ja');
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', {
        name: /Dokumentasjon av andre årsaker til at du ikke kan benytte egen bil/,
      }).should('exist');
      cy.findByRole('group', {
        name: /Dokumentasjon av utgifter til drosje/,
      }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      visitPath('/fyllut/nav760502?sub=paper');
    });

    it('fills required fields and verifies summary', () => {
      goToVeiledning();
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).click();
      cy.clickNextStep();

      fillDineOpplysninger();
      fillSoknadsperiode();
      fillReiseavstand();

      selectRadio('Kan du reise kollektivt?', 'Ja');
      cy.findByLabelText('Hva er totalutgiftene til kollektivtransport til og fra samlingene?').type('79');
      cy.clickNextStep();

      cy.clickNextStep();

      markAttachmentForLater(/Bekreftelse for alle samlingene du skal delta på/);
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Søknadsperiode', () => {
        cy.contains('dt', 'Startdato').next('dd').should('contain.text', dateOffset(3));
      });
      cy.withinSummaryGroup('Reisemåte', () => {
        cy.contains('dt', 'Kan du reise kollektivt?').next('dd').should('contain.text', 'Ja');
      });
    });
  });
});
