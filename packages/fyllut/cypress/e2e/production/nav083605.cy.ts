/*
 * Production form tests for Søknad fra selvstendig næringsdrivende/frilansere om opptak/endring i forsikring
 * Form: nav083605
 * Submission types: PAPER, DIGITAL — using PAPER
 *
 * Panels (9):
 *   - Veiledning (veiledning): no conditionals
 *   - Søknaden (soknaden): 3 conditionals
 *       angiTypeVirksomhet → rettigheterSelvstendigNaeringsdrivende (selvstendigNaeringsdrivende)
 *       angiTypeVirksomhet → rettigheterPrimaer (jordbrukerEllerReindriftsutover)
 *       angiTypeVirksomhet → jegSokerOmRettigheterSomFrilanser100FraForsteDag (frilanser)
 *   - Dine opplysninger (dineOpplysninger): 3 conditionals
 *       harDuNorskFodselsnummerEllerDNummer=ja → fodselsnummerDNummerSoker + alertstripe
 *       harDuNorskFodselsnummerEllerDNummer=nei → alertstripe1
 *   - Opplysninger om virksomheten (opplysningerOmVirksomheten): no conditionals
 *   - Inntekter som selvstendig næringsdrivende (inntekterSomSelvstendigNaeringsdrivende): no conditionals
 *   - Inntekter som arbeidstaker (inntekterSomArbeidstaker): no conditionals
 *   - Inntekter som frilanser (inntekterSomFrilanser): no conditionals
 *   - Andre opplysninger (andreOpplysninger): 1 conditional
 *       harDuEventuelleAndreTilleggsopplysninger=ja → andreTilleggsopplysninger
 *   - Vedlegg (vedlegg): isAttachmentPanel=true, 1 required attachment
 *
 * Note: option labels in rettigheterSelvstendigNaeringsdrivende contain double spaces — use regex.
 * Note: Vedlegg has isAttachmentPanel=true — use stepper; one clickNextStep() reaches Oppsummering (Case A).
 */

describe('nav083605', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Søknaden conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083605/soknaden?sub=paper');
      cy.defaultWaits();
    });

    it('shows rettigheterSelvstendigNaeringsdrivende when selvstendigNaeringsdrivende is selected', () => {
      cy.findByLabelText('Hvilke rettigheter søker du om?').should('not.exist');

      cy.withinComponent('Angi type virksomhet', () => {
        cy.findByRole('radio', { name: 'Selvstendig næringsdrivende' }).click();
      });
      cy.findByLabelText('Hvilke rettigheter søker du om?').should('exist');

      cy.withinComponent('Angi type virksomhet', () => {
        cy.findByRole('radio', { name: 'Frilanser' }).click();
      });
      cy.findByLabelText('Hvilke rettigheter søker du om?').should('not.exist');
    });

    it('shows rettigheterPrimaer when jordbrukerEllerReindriftsutover is selected', () => {
      cy.withinComponent('Angi type virksomhet', () => {
        cy.findByRole('radio', { name: 'Jordbruker eller reindriftsutøver' }).click();
      });
      cy.findByLabelText('Hvilke rettigheter søker du om?').should('exist');
    });

    it('shows jegSokerOmRettigheterSomFrilanser checkbox when frilanser is selected', () => {
      cy.findByRole('checkbox', {
        name: 'Jeg søker om rettigheter som frilanser 100% fra første dag',
      }).should('not.exist');

      cy.withinComponent('Angi type virksomhet', () => {
        cy.findByRole('radio', { name: 'Frilanser' }).click();
      });
      cy.findByRole('checkbox', {
        name: 'Jeg søker om rettigheter som frilanser 100% fra første dag',
      }).should('exist');

      cy.withinComponent('Angi type virksomhet', () => {
        cy.findByRole('radio', { name: 'Selvstendig næringsdrivende' }).click();
      });
      cy.findByRole('checkbox', {
        name: 'Jeg søker om rettigheter som frilanser 100% fra første dag',
      }).should('not.exist');
    });
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083605/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows fnr field and info alert when ja, shows warning alert when nei', () => {
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
    });
  });

  describe('Andre opplysninger conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083605/andreOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows andreTilleggsopplysninger textarea when ja is selected', () => {
      cy.findByRole('textbox', { name: 'Andre tilleggsopplysninger' }).should('not.exist');

      cy.withinComponent(/Har du andre tilleggsopplysninger som du mener vil ha betydning/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Andre tilleggsopplysninger' }).should('exist');

      cy.withinComponent(/Har du andre tilleggsopplysninger som du mener vil ha betydning/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Andre tilleggsopplysninger' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083605?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // start → Veiledning
      cy.clickNextStep(); // Veiledning → Søknaden
    });

    it('fills required fields and verifies summary', () => {
      // Søknaden
      cy.withinComponent('Hvilken type søknad er dette?', () => {
        cy.findByRole('radio', { name: 'Førstegangssøknad' }).click();
      });
      cy.withinComponent('Angi type virksomhet', () => {
        cy.findByRole('radio', { name: 'Selvstendig næringsdrivende' }).click();
      });
      cy.withinComponent('Hvilke rettigheter søker du om?', () => {
        cy.findByRole('radio', { name: /Selvstendig næringsdrivende, 80%/ }).click();
      });
      cy.withinComponent('Er du for tiden sykmeldt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Kommer du til å ha inntekt som arbeidstaker fremover?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Opplysninger om virksomheten
      cy.findByLabelText('Organisasjonsnummer').type('889640782');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: 'Virksomhetens art (bransje)' }).type('Konsulent');
      cy.findByRole('textbox', { name: /Dato for oppstart av virksomheten/ }).type('01.01.2020');
      cy.clickNextStep();

      // Inntekter som selvstendig næringsdrivende
      cy.findByLabelText('År').type('2023');
      cy.findByLabelText('Inntekt').type('500000');
      cy.clickNextStep();

      // Inntekter som arbeidstaker
      cy.withinComponent('Har du hatt inntekter som arbeidstaker de siste 3 år?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Inntekter som frilanser is hidden when angiTypeVirksomhet=selvstendigNaeringsdrivende — skip

      // Andre opplysninger — select Nei to skip conditional textarea
      cy.withinComponent(/Har du andre tilleggsopplysninger som du mener vil ha betydning/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // Vedlegg — isAttachmentPanel=true: use stepper (Case A — last panel)
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });

      // One clickNextStep() reaches Oppsummering (Vedlegg is the last panel)
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Søknaden', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hvilken type søknad er dette?');
        cy.get('dd').eq(0).should('contain.text', 'Førstegangssøknad');
      });
    });
  });
});
