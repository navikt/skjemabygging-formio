/*
 * Production form tests for Søknad om barnepensjon
 * Form: nav180105
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Veiledning (veiledning): panel-level conditionals
 *       hvemSokerDuBarnepensjonFor + hvemHarDuMistet
 *       → Opplysninger om avdøde / Gjenlevende forelder
 *       → Den første forelderen / Den andre forelderen
 *   - Dine opplysninger (dineOpplysninger): 4 same-panel conditionals
 *       erDuBosattINorge → hvilketLandErDuBosattI
 *       erDuBosattINorge → harDuBoddEllerOppholdtDegIUtlandetDeSiste12Manedene
 *       harDuBoddEllerOppholdtDegIUtlandetDeSiste12Manedene → utenlandsopphold
 *       farDuUforetrygdEllerArbeidsavklaringspengerFraNav → utbetalingerFraNav1
 *   - Utbetaling (utbetaling): 1 same-panel conditional
 *       onskerDuAMottaUtbetalingenPaNorskEllerUtenlandskBankkonto
 *       → norskBankkontonummerForUtbetaling / utenlandskKontonummer
 *   - Vedlegg (vedlegg): 1 cross-panel conditional
 *       hvemSokerDuBarnepensjonFor=guardian → kopiAvVergeattest
 */

const visitVeiledning = () => {
  cy.visit('/fyllut/nav180105/veiledning?sub=paper');
  cy.defaultWaits();
};

const chooseAdultSelf = (lost = 'En forelder') => {
  cy.withinComponent('Hvem søker du barnepensjon for?', () => {
    cy.findByRole('radio', { name: 'Jeg har fylt 18 år og søker på vegne av meg selv' }).click();
  });
  cy.withinComponent('Hvem har du mistet?', () => {
    cy.findByRole('radio', { name: lost }).click();
  });
};

const chooseGuardian = (lost = 'En forelder') => {
  cy.withinComponent('Hvem søker du barnepensjon for?', () => {
    cy.findByRole('radio', { name: 'Jeg søker for ett eller flere barn jeg er verge for' }).click();
  });
  cy.withinComponent('Hvem har barnet eller barna mistet?', () => {
    cy.findByRole('radio', { name: lost }).click();
  });
};

describe('nav180105', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Veiledning – panel branching', () => {
    beforeEach(() => {
      visitVeiledning();
    });

    it('switches between single-parent and two-parent panel sets for adult applicants', () => {
      cy.findByLabelText('Hvem har du mistet?').should('not.exist');

      cy.withinComponent('Hvem søker du barnepensjon for?', () => {
        cy.findByRole('radio', { name: 'Jeg har fylt 18 år og søker på vegne av meg selv' }).click();
      });

      cy.findByLabelText('Hvem har du mistet?').should('exist');
      cy.findByLabelText('Hvem har barnet eller barna mistet?').should('not.exist');
      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/ }).should('exist');

      cy.withinComponent('Hvem har du mistet?', () => {
        cy.findByRole('radio', { name: 'En forelder' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Opplysninger om avdøde' }).should('exist');
      cy.findByRole('link', { name: 'Gjenlevende forelder' }).should('exist');
      cy.findByRole('link', { name: 'Den første forelderen' }).should('not.exist');
      cy.findByRole('link', { name: 'Den andre forelderen' }).should('not.exist');

      cy.withinComponent('Hvem har du mistet?', () => {
        cy.findByRole('radio', { name: 'Begge foreldrene' }).click();
      });

      cy.findByRole('link', { name: 'Opplysninger om avdøde' }).should('not.exist');
      cy.findByRole('link', { name: 'Gjenlevende forelder' }).should('not.exist');
      cy.findByRole('link', { name: 'Den første forelderen' }).should('exist');
      cy.findByRole('link', { name: 'Den andre forelderen' }).should('exist');
    });
  });

  describe('Dine opplysninger – adult-self conditionals', () => {
    beforeEach(() => {
      visitVeiledning();
      chooseAdultSelf();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Dine opplysninger' }).click();
    });

    it('shows residency and Nav payment follow-ups only for the selected branches', () => {
      cy.findByLabelText('Er du bosatt i Norge?').should('exist');
      cy.findByLabelText('Hvilket land er du bosatt i?').should('not.exist');
      cy.findByLabelText('Har du bodd eller oppholdt deg i utlandet de siste 12 månedene?').should('not.exist');
      cy.findByRole('group', { name: 'Utbetalinger du får fra Nav' }).should('not.exist');

      cy.withinComponent('Er du bosatt i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Hvilket land er du bosatt i?').should('exist');
      cy.findByLabelText('Har du bodd eller oppholdt deg i utlandet de siste 12 månedene?').should('not.exist');

      cy.withinComponent('Er du bosatt i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Hvilket land er du bosatt i?').should('not.exist');
      cy.findByLabelText('Har du bodd eller oppholdt deg i utlandet de siste 12 månedene?').should('exist');

      cy.withinComponent('Har du bodd eller oppholdt deg i utlandet de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Hvilket land har du oppholdet deg i?').should('exist');

      cy.withinComponent('Får du uføretrygd eller arbeidsavklaringspenger (AAP) fra Nav?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('group', { name: 'Utbetalinger du får fra Nav' }).should('exist');

      cy.withinComponent('Får du uføretrygd eller arbeidsavklaringspenger (AAP) fra Nav?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('group', { name: 'Utbetalinger du får fra Nav' }).should('not.exist');
    });
  });

  describe('Utbetaling – bank account conditionals', () => {
    beforeEach(() => {
      visitVeiledning();
      chooseAdultSelf();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Utbetaling' }).click();
    });

    it('switches between Norwegian and foreign bank account fields', () => {
      cy.findByLabelText('Norsk bankkontonummer for utbetaling').should('not.exist');
      cy.findByLabelText('Bankens land').should('not.exist');

      cy.withinComponent('Ønsker du å motta utbetalingen på norsk eller utenlandsk bankkonto?', () => {
        cy.findByRole('radio', { name: 'Norsk kontonummer' }).click();
      });
      cy.findByLabelText('Norsk bankkontonummer for utbetaling').should('exist');
      cy.findByLabelText('Bankens land').should('not.exist');

      cy.withinComponent('Ønsker du å motta utbetalingen på norsk eller utenlandsk bankkonto?', () => {
        cy.findByRole('radio', { name: 'Utenlandsk kontonummer' }).click();
      });
      cy.findByLabelText('Norsk bankkontonummer for utbetaling').should('not.exist');
      cy.findByLabelText('Bankens land').should('exist');
    });
  });

  describe('Vedlegg – guardian attachment conditionals', () => {
    it('hides vergeattest for adult self applications', () => {
      visitVeiledning();
      chooseAdultSelf();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Kopi av verge- eller hjelpevergeattest/ }).should('not.exist');
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).should('exist');
    });

    it('shows vergeattest for guardian applications', () => {
      visitVeiledning();
      chooseGuardian();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Kopi av vergeattest/ }).should('exist');
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav180105?sub=paper');
      cy.defaultWaits();
    });

    it('fills an adult-self happy path and verifies the summary', () => {
      cy.get('#page-title').then(($title) => {
        if ($title.text().trim() === 'Introduksjon') {
          cy.clickNextStep();
        }
      });

      // Veiledning
      chooseAdultSelf();
      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/ }).click();
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('01017010170');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.withinComponent('Er du bosatt i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Har du bodd eller oppholdt deg i utlandet de siste 12 månedene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Får du uføretrygd eller arbeidsavklaringspenger (AAP) fra Nav?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Opplysninger om avdøde
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Per');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Avdød');
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Statsborgerskap' }).type('Norsk');
      cy.findByRole('textbox', { name: /Når skjedde dødsfallet/ }).type('01.01.2024');
      cy.withinComponent('Skyldes dødsfallet en yrkesskade eller yrkessykdom?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(
        'Har han eller hun bodd og/eller arbeidet i et annet land enn Norge etter fylte 16 år?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.clickNextStep();

      // Gjenlevende forelder – informational only on this path
      cy.clickNextStep();

      // Utbetaling
      cy.withinComponent('Ønsker du å motta utbetalingen på norsk eller utenlandsk bankkonto?', () => {
        cy.findByRole('radio', { name: 'Norsk kontonummer' }).click();
      });
      cy.findByLabelText('Norsk bankkontonummer for utbetaling').type('01234567892');
      cy.clickNextStep();

      // Vedlegg
      cy.findByRole('group', { name: /Dokumentasjon på foreldreansvar/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });

      cy.get('body').then(($body) => {
        if ($body.find('h2#page-title').text().trim() === 'Vedlegg') {
          cy.clickNextStep();
        }
      });

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Kari');
      });
      cy.withinSummaryGroup('Opplysninger om avdøde', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Per');
      });
      cy.withinSummaryGroup('Utbetaling', () => {
        cy.contains('dt', 'Ønsker du å motta utbetalingen på norsk eller utenlandsk bankkonto?')
          .next('dd')
          .should('contain.text', 'Norsk kontonummer');
      });
    });
  });
});
