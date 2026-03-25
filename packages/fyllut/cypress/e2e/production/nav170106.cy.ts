/*
 * Production form tests for Søknad om omstillingsstønad
 * Form: nav170106
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 4 same-panel conditionals
 *       harDuNorskFodselsnummerEllerDNummer → borDuINorge / vegadresseEllerPostboksadresse / address groups
 *   - Utbetaling av omstillingsstønad (utbetalingAvOmstillingsstonad): 4 same-panel conditionals
 *       onskerDuAMottaUtbetalingenPaNorskEllerUtenlandskBankkonto → norsk/utenlandsk konto
 *       bankensLand → IBAN / bankkodeUSA / BIC / bank address
 *   - Om deg og avdøde (omDegOgAvdode): 6 same-panel conditionals
 *       relation + fellesBarn → marriage / samboer / bidrag fields
 *   - Mer om situasjonen din (merOmSituasjonenDin): 6 same-panel datagrid conditionals
 *       selectboxes + ansettelsesforhold → timer / sluttdato / endringer fields
 *   - Barnepensjon (barnepensjon): 6 same-panel datagrid conditionals
 *       child / verge / payment answers → child identity / address / bank fields
 */

const advancePastStartPanels = (): Cypress.Chainable => {
  return cy
    .get('h2#page-title')
    .invoke('text')
    .then((pageTitle) => {
      const title = pageTitle.trim();

      if (!['Introduksjon', 'Veiledning'].includes(title)) {
        return cy.wrap(null);
      }

      if (title === 'Veiledning') {
        cy.findByRole('checkbox', {
          name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.',
        }).click();
      }

      cy.clickNextStep();
      return advancePastStartPanels();
    });
};

const selectLand = (label: string, search: string, option: string | RegExp) => {
  cy.findByRole('combobox', { name: label }).click();
  cy.findByRole('combobox', { name: label }).clear();
  cy.findByRole('combobox', { name: label }).type(search);
  cy.findByRoleWhenAttached('option', { name: option }).then(($option) => {
    ($option[0] as HTMLElement).click();
  });
};

const clickAttachmentOptionIfVisible = (groupName: RegExp, optionName: RegExp) => {
  cy.get('body').then(($body) => {
    if (!$body.text().match(groupName)) {
      return;
    }

    cy.findByRole('group', { name: groupName }).within(() => {
      cy.findByRole('radio', { name: optionName }).click();
    });
  });
};

const completeVisibleAttachments = () => {
  clickAttachmentOptionIfVisible(/Kopi av din legitimasjon/, /Jeg ettersender dokumentasjonen senere/);
  clickAttachmentOptionIfVisible(/Annen dokumentasjon/, /Nei/);
  clickAttachmentOptionIfVisible(
    /Informasjon om din arbeidsinntekt fra Norge eller utlandet/,
    /Jeg ettersender dokumentasjonen senere/,
  );
  clickAttachmentOptionIfVisible(
    /Informasjon om din næringsinntekt fra Norge eller utlandet/,
    /Jeg ettersender dokumentasjonen senere/,
  );
  clickAttachmentOptionIfVisible(/Dokumentasjon på tidligere utdanning/, /Jeg ettersender dokumentasjonen senere/);
  clickAttachmentOptionIfVisible(
    /Dokumentasjon på at du tar eller skal ta utdanning/,
    /Jeg ettersender dokumentasjonen senere/,
  );
  clickAttachmentOptionIfVisible(
    /Dokumentasjon på opphold i Norge eller i utlandet/,
    /Jeg ettersender dokumentasjonen senere/,
  );
  clickAttachmentOptionIfVisible(
    /Dokumentasjon på ny arbeidskontrakt ved ansatt i ny jobb/,
    /Jeg ettersender dokumentasjonen senere/,
  );
  clickAttachmentOptionIfVisible(
    /Dokumentasjon på omsorg for barn under 18 år/,
    /Jeg ettersender dokumentasjonen senere/,
  );
  clickAttachmentOptionIfVisible(
    /Dokumentasjon på etablering av egen bedrift/,
    /Jeg ettersender dokumentasjonen senere/,
  );
};

const finishToSummary = (): void => {
  cy.get('body').then(($body) => {
    const title = $body.find('#page-title').text().trim();

    if (title === 'Oppsummering') {
      return;
    }

    if (title === 'Vedlegg') {
      completeVisibleAttachments();
      cy.clickNextStep();
      finishToSummary();
      return;
    }

    if (title === 'Erklæring fra søker') {
      const declaration = $body.find('input[type="checkbox"]');
      if (declaration.length > 0) {
        cy.findAllByRole('checkbox').first().click();
      }
      cy.clickNextStep();
      finishToSummary();
      return;
    }

    cy.clickNextStep();
    finishToSummary();
  });
};

describe('nav170106', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – address conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav170106/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('toggles Norwegian and foreign address sections from the fnr answer', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Er kontaktadressen din en vegadresse eller postboksadresse?').should('exist');

      cy.withinComponent('Er kontaktadressen din en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Er kontaktadressen din en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Postboksadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, eller postboks/ }).should('exist');
      cy.findByRole('textbox', { name: /^Land$/ }).should('exist');
    });
  });

  describe('Utbetaling av omstillingsstønad – bank account conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav170106/utbetalingAvOmstillingsstonad?sub=paper');
      cy.defaultWaits();
    });

    it('toggles Norwegian and foreign bank fields, including USA-specific fields', () => {
      cy.findByLabelText('Norsk kontonummer for utbetaling').should('not.exist');
      cy.findByRole('textbox', { name: 'Bankens navn' }).should('not.exist');

      cy.withinComponent('Ønsker du å motta utbetalingen på norsk eller utenlandsk bankkonto?', () => {
        cy.findByRole('radio', { name: 'Norsk kontonummer' }).click();
      });
      cy.findByLabelText('Norsk kontonummer for utbetaling').should('exist');

      cy.withinComponent('Ønsker du å motta utbetalingen på norsk eller utenlandsk bankkonto?', () => {
        cy.findByRole('radio', { name: 'Utenlandsk kontonummer' }).click();
      });
      cy.findByLabelText('Norsk kontonummer for utbetaling').should('not.exist');
      cy.findByRole('checkbox', {
        name: /Jeg har sjekket at Nav allerede har registrert mitt utenlandske bankkontonummer/,
      }).should('exist');
      cy.findByRole('textbox', { name: 'Bankens navn' }).should('exist');

      selectLand('Bankens land', 'USA', /^USA$/);
      cy.findByRole('textbox', { name: /Bankkode FW(\s|\(|$)/ }).should('not.exist');
      cy.findByRole('textbox', { name: 'BIC / Swift-kode' }).should('exist');

      selectLand('Bankens land', 'Sverige', 'Sverige');
      cy.findByLabelText('IBAN').should('not.exist');
      cy.findByRole('textbox', { name: 'Postadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'BIC / Swift-kode' }).should('exist');

      cy.findByRole('checkbox', {
        name: /Jeg har sjekket at Nav allerede har registrert mitt utenlandske bankkontonummer/,
      }).click();
      cy.findByRole('textbox', { name: 'Bankens navn' }).should('not.exist');
    });
  });

  describe('Om deg og avdøde – relation conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav170106/omDegOgAvdode?sub=paper');
      cy.defaultWaits();
    });

    it('shows relation-specific date and support fields', () => {
      cy.findByRole('textbox', { name: /Når ble dere samboere/ }).should('not.exist');
      cy.findByLabelText('Ble du forsørget av bidrag fra avdøde?').should('not.exist');

      cy.withinComponent('Hva var relasjonen din til avdøde da dødsfallet skjedde?', () => {
        cy.findByRole('radio', { name: 'Samboer' }).click();
      });
      cy.findByRole('textbox', { name: /Når ble dere samboere/ }).should('exist');

      cy.withinComponent('Har eller har dere hatt felles barn?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Har du tidligere vært gift med avdøde?').should('exist');
      cy.findByLabelText('Ble du forsørget av bidrag fra avdøde?').should('not.exist');

      cy.withinComponent('Hva var relasjonen din til avdøde da dødsfallet skjedde?', () => {
        cy.findByRole('radio', { name: 'Skilt' }).click();
      });
      cy.findByRole('textbox', { name: /Når ble dere gift/ }).should('exist');
      cy.findByRole('textbox', { name: /Når ble dere skilt/ }).should('exist');

      cy.withinComponent('Har eller har dere hatt felles barn?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Var dere samboere og hadde dere felles barn før dere giftet dere?').should('exist');
      cy.findByLabelText('Ble du forsørget av bidrag fra avdøde?').should('exist');

      cy.withinComponent('Ble du forsørget av bidrag fra avdøde?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Bidragsummen du mottok siste måneden før dødsfallet').should('exist');
    });
  });

  describe('Mer om situasjonen din – employment datagrid conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav170106/merOmSituasjonenDin?sub=paper');
      cy.defaultWaits();
    });

    it('toggles temporary-employment row fields', () => {
      cy.findByRole('textbox', { name: 'Navn på arbeidssted' }).should('not.exist');

      cy.findByRole('checkbox', {
        name: 'Jeg er arbeidstaker og/eller lønnsmottaker som frilanser',
      }).check();

      cy.findByRole('textbox', { name: 'Navn på arbeidssted' }).should('exist');

      cy.withinComponent('Hva slags type ansettelsesforhold har du?', () => {
        cy.findByRole('radio', { name: 'Midlertidig ansatt' }).click();
      });

      cy.findByRole('checkbox', { name: /Jeg vil heller oppgi arbeidsmengden i antall timer/ }).should('exist');
      cy.findByLabelText('Har du en sluttdato?').should('exist');

      cy.findByRole('checkbox', { name: /Jeg vil heller oppgi arbeidsmengden i antall timer/ }).click();
      cy.findByLabelText('Hva er stillingsprosenten din?').should('not.exist');
      cy.findByLabelText('Vil du oppgi arbeidstimer per uke eller per måned?').should('exist');

      cy.withinComponent('Vil du oppgi arbeidstimer per uke eller per måned?', () => {
        cy.findByRole('radio', { name: 'Per måned' }).click();
      });
      cy.findByLabelText('Antall arbeidstimer per måned').should('exist');
      cy.findByLabelText('Antall arbeidstimer per uke').should('not.exist');

      cy.withinComponent('Har du en sluttdato?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Sluttdato/ }).should('exist');

      cy.withinComponent('Forventer du endringer i arbeidsforholdet fremover i tid?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Gi en kort beskrivelse av endringene' }).should('exist');
    });
  });

  describe('Barnepensjon – child and payment conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav170106/barnepensjon?sub=paper');
      cy.defaultWaits();
    });

    it('toggles child identity, guardian, and bank-account fields', () => {
      cy.findByRole('textbox', { name: 'Barnets fødselsdato (dd.mm.åååå)' }).should('not.exist');

      cy.withinComponent('Har du felles barn under 18 år sammen med avdøde?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.withinComponent('Har barnet norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Barnets fødselsdato (dd.mm.åååå)' }).should('exist');
      cy.findByRole('textbox', { name: /Barnets fødselsnummer eller d-nummer/i }).should('not.exist');

      cy.withinComponent('Bor barnet i et annet land enn Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, eller postboks/ }).should('exist');
      cy.findByRole('checkbox', { name: /Jeg søker om barnepensjon for dette barnet/ }).click();
      cy.findByLabelText(
        'Skal barnepensjonen utbetales til samme kontonummer du har oppgitt for utbetaling av omstillingsstønaden?',
      ).should('exist');

      cy.withinComponent(
        'Skal barnepensjonen utbetales til samme kontonummer du har oppgitt for utbetaling av omstillingsstønaden?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.findByLabelText('Ønsker du å motta utbetalingen på norsk eller utenlandsk bankkonto?').should('exist');

      cy.withinComponent('Ønsker du å motta utbetalingen på norsk eller utenlandsk bankkonto?', () => {
        cy.findByRole('radio', { name: 'Norsk' }).click();
      });
      cy.findByLabelText('Norsk kontonummer for utbetaling av barnepensjon').should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav170106?sub=paper');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary', () => {
      advancePastStartPanels();

      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: /Din fødselsdato/ }).type('01.01.1980');
      cy.findByRole('textbox', { name: 'Statsborgerskap' }).type('Norsk');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      cy.withinComponent('Ønsker du å motta utbetalingen på norsk eller utenlandsk bankkonto?', () => {
        cy.findByRole('radio', { name: 'Norsk kontonummer' }).click();
      });
      cy.findByLabelText('Norsk kontonummer for utbetaling').type('01234567892');
      cy.clickNextStep();

      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Statsborgerskap' }).type('Norsk');
      cy.findByRole('textbox', { name: /Når skjedde dødsfallet/ }).type('15.06.2025');
      cy.withinComponent('Skyldes dødsfallet yrkesskade eller yrkessykdom?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(
        'Har han eller hun bodd og/eller arbeidet i et annet land enn Norge etter fylte 16 år?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.clickNextStep();

      cy.withinComponent('Hva var relasjonen din til avdøde da dødsfallet skjedde?', () => {
        cy.findByRole('radio', { name: 'Gift eller partner' }).click();
      });
      cy.findByRole('textbox', { name: /Når ble dere gift/ }).type('01.01.2010');
      cy.withinComponent('Har eller har dere hatt felles barn?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.withinComponent('Hva er sivilstanden din i dag?', () => {
        cy.findByRole('radio', { name: 'Enslig' }).click();
      });
      cy.withinComponent('Hadde du minst 50 prosent omsorg for barn under 18 år på dødsfallstidspunktet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Venter du barn eller har du barn som ikke er registrert i Folkeregisteret?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Er du bosatt i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Har du bodd eller oppholdt deg i utlandet de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('checkbox', {
        name: 'Jeg er ikke i arbeid, utdanning eller arbeidssøker',
      }).check();
      cy.findByRole('checkbox', { name: 'Hjemmearbeidende' }).check();
      cy.findByRole('checkbox', { name: 'Videregående' }).check();
      cy.clickNextStep();

      cy.findByRole('checkbox', { name: 'Ingen inntekt eller annen utbetaling' }).check();
      cy.withinComponent('Har du inntekt eller noen andre utbetalinger?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du søkt om ytelser fra Nav som du ikke har fått svar på?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du søkt om ytelser fra andre enn Nav som du ikke har fått svar på?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.withinComponent('Har du felles barn under 18 år sammen med avdøde?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      finishToSummary();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Utbetaling av omstillingsstønad', () => {
        cy.contains('dt', 'Norsk kontonummer for utbetaling').next('dd').should('contain.text', '0123 45 67892');
      });
      cy.withinSummaryGroup('Om deg og avdøde', () => {
        cy.contains('dt', 'Hva var relasjonen din til avdøde da dødsfallet skjedde?')
          .next('dd')
          .should('contain.text', 'Gift eller partner');
      });
      cy.withinSummaryGroup('Inntekten din', () => {
        cy.contains('dt', 'Velg alle typer inntekter du har')
          .next('dd')
          .should('contain.text', 'Ingen inntekt eller annen utbetaling');
      });
    });
  });
});
