/*
 * Production form tests for Svar på brev om vurdering av hjelpestønad
 * Form: nav060702
 * Submission types: PAPER, DIGITAL, DIGITAL_NO_LOGIN
 *
 * Panels tested:
 *   - Fullmakt (fullmakt): same-panel and panel-level conditionals
 *       svarerDuForDegSelvEllerPaVegneAvEnAnnenPerson → sender fields, relasjon field, Utbetaling/Tilknytning variants
 *   - Personopplysninger (personopplysninger): branch-specific conditionals
 *       child/adult branch alerts and fields, borBarnetINorge → oppgiBarnetsBostedsland
 *   - Utbetaling (utbetaling): same-panel conditional
 *       mottarBarnetYtelseFraEtAnnetLand → country + benefit fields
 *   - Tilknytning til Norge (tilknytningTilNorge / tilknytningTilNorgePerson): same-panel conditionals
 *       bosatt in Norway → country/connection fields
 *       connection=Annet → free-text field
 *       receives benefit from another land → country/benefit fields
 *   - Vedlegg (vedlegg): cross-panel attachment conditional
 *       harNavBedtOmDokumentasjonIBrevet → dokumentasjonAvEkstrautgifter
 */

const selectCountry = (label: string, country = 'Sverige') => {
  cy.findByRole('combobox', { name: label }).type(`${country}{downArrow}{enter}`);
};

const selectFullmaktOption = (option: string) => {
  cy.withinComponent('Svarer du for deg selv eller på vegne av en annen person?', () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const goToPersonopplysninger = (option: string) => {
  selectFullmaktOption(option);
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: 'Personopplysninger' }).click();
};

describe('nav060702', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Fullmakt conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav060702/fullmakt?sub=paper');
      cy.defaultWaits();
    });

    it('toggles sender info, relation field and downstream child panels', () => {
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hva er din relasjon til personen du svarer for?' }).should('not.exist');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Utbetaling' }).should('not.exist');

      selectFullmaktOption('Jeg svarer på vegne av en annen person over 18 år.');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.get('input[type="tel"]').should('have.length', 1);
      cy.findByRole('textbox', { name: 'Hva er din relasjon til personen du svarer for?' }).should('exist');
      cy.findByRole('link', { name: 'Utbetaling' }).should('not.exist');

      selectFullmaktOption('Jeg svarer på vegne av eget barn under 18 år.');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Hva er din relasjon til personen du svarer for?' }).should('not.exist');
      cy.findByRole('link', { name: 'Utbetaling' }).should('exist');

      selectFullmaktOption('Jeg svarer på vegne av meg selv.');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
      cy.get('input[type="tel"]').should('not.exist');
      cy.findByRole('link', { name: 'Utbetaling' }).should('not.exist');
    });
  });

  describe('Personopplysninger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav060702/fullmakt?sub=paper');
      cy.defaultWaits();
    });

    it('shows child-specific fields and country when barnet bor utenfor Norge', () => {
      goToPersonopplysninger('Jeg svarer på vegne av eget barn under 18 år.');

      cy.contains('Her må du fylle inn fødselsnummeret og personopplysningene til barnet.').should('exist');
      cy.findByLabelText('Bor barnet i Norge?').should('exist');
      cy.findByLabelText('Hva er din sivilstand?').should('not.exist');
      cy.findByLabelText('Hva er personens sivilstand?').should('not.exist');
      cy.findByRole('combobox', { name: 'Oppgi barnets bostedsland' }).should('not.exist');

      cy.withinComponent('Bor barnet i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      selectCountry('Oppgi barnets bostedsland');
    });

    it('switches between self and adult-other sivilstand fields', () => {
      goToPersonopplysninger('Jeg svarer på vegne av meg selv.');

      cy.findByLabelText('Hva er din sivilstand?').should('exist');
      cy.findByLabelText('Hva er personens sivilstand?').should('not.exist');
      cy.findByLabelText('Bor barnet i Norge?').should('not.exist');

      cy.findByRole('link', { name: 'Fullmakt' }).click();
      selectFullmaktOption('Jeg svarer på vegne av en annen person over 18 år.');
      cy.findByRole('link', { name: 'Personopplysninger' }).click();

      cy.contains('Her må du fylle inn fødselsnummeret og personopplysningene til personen du svarer for.').should(
        'exist',
      );
      cy.findByLabelText('Hva er din sivilstand?').should('not.exist');
      cy.findByLabelText('Hva er personens sivilstand?').should('exist');
      cy.findByLabelText('Bor barnet i Norge?').should('not.exist');
    });
  });

  describe('Utbetaling conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav060702/fullmakt?sub=paper');
      cy.defaultWaits();
      selectFullmaktOption('Jeg svarer på vegne av fosterbarn / barn i beredskapshjem under 18 år.');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Utbetaling' }).click();
    });

    it('shows foreign benefit details only when barnet receives benefit from another country', () => {
      cy.contains('fosterhjem').should('exist');
      cy.findByRole('textbox', { name: 'Hvilket land mottar barnet ytelse fra?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hvilken ytelse mottar barnet?' }).should('not.exist');

      cy.withinComponent('Mottar barnet ytelse fra et annet land?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Hvilket land mottar barnet ytelse fra?' }).should('exist');
      cy.findByRole('textbox', { name: 'Hvilken ytelse mottar barnet?' }).should('exist');

      cy.withinComponent('Mottar barnet ytelse fra et annet land?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Hvilket land mottar barnet ytelse fra?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hvilken ytelse mottar barnet?' }).should('not.exist');
    });
  });

  describe('Tilknytning til Norge – self branch', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav060702/fullmakt?sub=paper');
      cy.defaultWaits();
      selectFullmaktOption('Jeg svarer på vegne av meg selv.');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Tilknytning til Norge' }).click();
    });

    it('toggles self-branch fields for residence, connection and foreign benefit', () => {
      cy.findByRole('combobox', { name: 'Velg bosettingsland' }).should('not.exist');
      cy.findByLabelText('Hvilken tilknytning har du til Norge?').should('not.exist');
      cy.findByRole('textbox', { name: 'Hva slags annen tilknytning har du til Norge?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hvilket land mottar du ytelse fra?' }).should('not.exist');

      cy.withinComponent('Er du fast bosatt i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.contains('medlemskap i folketrygden').should('exist');
      selectCountry('Velg bosettingsland');

      cy.withinComponent('Hvilken tilknytning har du til Norge?', () => {
        cy.findByRole('radio', { name: 'Annet' }).click();
      });
      cy.findByRole('textbox', { name: 'Hva slags annen tilknytning har du til Norge?' }).should('exist');

      cy.withinComponent('Mottar du ytelse fra et annet land enn Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvilket land mottar du ytelse fra?' }).should('exist');
      cy.findByRole('textbox', { name: 'Hvilken ytelse mottar du?' }).should('exist');
    });
  });

  describe('Tilknytning til Norge – adult-other branch', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav060702/fullmakt?sub=paper');
      cy.defaultWaits();
      selectFullmaktOption('Jeg svarer på vegne av en annen person over 18 år.');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Tilknytning til Norge' }).click();
    });

    it('toggles adult-other branch fields for residence, connection and foreign benefit', () => {
      cy.findByRole('combobox', { name: 'Oppgi personens bosettingsland' }).should('not.exist');
      cy.findByLabelText('Hvilken tilknytning har personen til Norge?').should('not.exist');
      cy.findByRole('textbox', { name: 'Hva slags annen tilknytning har personen til Norge?' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hvilket land mottar personen ytelse fra?' }).should('not.exist');

      cy.withinComponent('Er personen fast bosatt i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      selectCountry('Oppgi personens bosettingsland');

      cy.withinComponent('Hvilken tilknytning har personen til Norge?', () => {
        cy.findByRole('radio', { name: 'Annet' }).click();
      });
      cy.findByRole('textbox', { name: 'Hva slags annen tilknytning har personen til Norge?' }).should('exist');

      cy.withinComponent('Mottar personen ytelse fra et annet land enn Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvilket land mottar personen ytelse fra?' }).should('exist');
      cy.findByRole('textbox', { name: 'Hvilken ytelse mottar personen?' }).should('exist');
    });
  });

  describe('Vedlegg conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav060702/beskrivelseAvSituasjonenSlikDenErNa?sub=paper');
      cy.defaultWaits();
    });

    it('shows requested documentation attachment only when NAV asked for documentation', () => {
      cy.findByRole('group', { name: /Dokumentasjon som NAV har bedt om/ }).should('not.exist');

      cy.withinComponent('Har NAV bedt om dokumentasjon i brevet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon som NAV har bedt om/ }).should('exist');
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav060702?sub=paper');
      cy.defaultWaits();
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Fullmakt
      selectFullmaktOption('Jeg svarer på vegne av eget barn under 18 år.');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Personopplysninger
      cy.findAllByRole('textbox', { name: 'Fornavn' }).last().type('Ola');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).last().type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.withinComponent('Bor barnet i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      selectCountry('Oppgi barnets bostedsland');
      cy.clickNextStep();

      // Utbetaling
      cy.withinComponent('Mottar barnet ytelse fra et annet land?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Tilknytning til Norge (for the sender)
      cy.withinComponent('Er du fast bosatt i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Hvilken tilknytning har du til Norge?', () => {
        cy.findByRole('radio', { name: 'Jeg mottar ytelse fra folketrygden' }).click();
      });
      cy.withinComponent('Mottar du ytelse fra et annet land enn Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Helsesituasjon
      cy.clickNextStep();

      // Beskrivelse av situasjonen slik den er nå
      cy.findByRole('textbox', { name: 'Svar på spørsmålene i brevet fra NAV' }).type(
        'Barnet trenger ekstra hjelp i hverdagen, og vi svarer på spørsmålene fra NAV.',
      );
      cy.withinComponent('Har NAV bedt om dokumentasjon i brevet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      // Tilleggsopplysninger
      cy.clickNextStep();

      // Vedlegg
      cy.findByRole('group', { name: /Dokumentasjon som NAV har bedt om/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender/i }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Fullmakt', () => {
        cy.get('dt').eq(0).should('contain.text', 'Svarer du for deg selv eller på vegne av en annen person?');
        cy.get('dd').eq(0).should('contain.text', 'Jeg svarer på vegne av eget barn under 18 år.');
      });
      cy.withinSummaryGroup('Personopplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Beskrivelse av situasjonen slik den er nå', () => {
        cy.get('dt').eq(0).should('contain.text', 'Svar på spørsmålene i brevet fra NAV');
        cy.get('dd').eq(0).should('contain.text', 'Barnet trenger ekstra hjelp i hverdagen');
      });
    });
  });
});
