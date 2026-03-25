/*
 * Production form tests for Skjema for arbeidsgiver – bekreftelse på utsending utenfor EØS
 * Form: nav020806
 * Submission types: none (no ?sub= param)
 *
 * Panels tested:
 *   - Opplysninger om arbeidstakeren som sendes til utlandet (opplysningerOmArbeidstakerenSomSendesTilUtlandet):
 *       harArbeidstakerenNorskFodselsnummerEllerDNummerUt → oppgiArbeidstakersFodselsnummerDNummer (eq: ja)
 *       harArbeidstakerenNorskFodselsnummerEllerDNummerUt → oppgiArbeidstakersFodselsdatoDdMmAaaa (eq: nei)
 *   - Oppdraget (oppdraget):
 *       harArbeidsgiverenTattOppdragIUtlandetSomDenAnsatteErSendtUtTil → beskrivFormaletMedUtenlandsoppholdet (eq: nei)
 *   - Opplysninger om deg som fyller ut skjemaet (opplysningerOmDenSomFyllerUtSkjemaet):
 *       hvorErDuAnsatt → firmanavn (eq: hosEtFirmaMedFullmaktFraArbeidsgiver)
 */

describe('nav020806', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Opplysninger om arbeidstakeren conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav020806/opplysningerOmArbeidstakerenSomSendesTilUtlandet');
      cy.defaultWaits();
    });

    it('shows fnr field when ja and fødselsdato when nei', () => {
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /fødselsdato/i }).should('not.exist');

      cy.withinComponent('Har arbeidstakeren norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
      cy.findByRole('textbox', { name: /fødselsdato/i }).should('not.exist');

      cy.withinComponent('Har arbeidstakeren norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
      cy.findByRole('textbox', { name: /fødselsdato/i }).should('exist');
    });
  });

  describe('Oppdraget conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav020806/oppdraget');
      cy.defaultWaits();
    });

    it('shows beskrivFormålet when nei is selected for oppdrag', () => {
      cy.findByRole('textbox', { name: /formålet/i }).should('not.exist');

      cy.withinComponent('Har du som arbeidsgiver oppdrag i landet den ansatte skal sendes ut til?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /formålet/i }).should('exist');

      cy.withinComponent('Har du som arbeidsgiver oppdrag i landet den ansatte skal sendes ut til?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /formålet/i }).should('not.exist');
    });
  });

  describe('Opplysninger om deg som fyller ut conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav020806/opplysningerOmDenSomFyllerUtSkjemaet');
      cy.defaultWaits();
    });

    it('shows firmanavn when ansatt hos firma med fullmakt', () => {
      cy.findByRole('textbox', { name: 'Oppgi firmanavn' }).should('not.exist');

      cy.findByLabelText(/Hvor er du.*ansatt/i)
        .closest('.form-group')
        .within(() => {
          cy.findByRole('radio', { name: 'Hos et firma som representerer arbeidsgiveren' }).click();
        });
      cy.findByRole('textbox', { name: 'Oppgi firmanavn' }).should('exist');

      cy.findByLabelText(/Hvor er du.*ansatt/i)
        .closest('.form-group')
        .within(() => {
          cy.findByRole('radio', { name: 'Hos arbeidsgiveren' }).click();
        });
      cy.findByRole('textbox', { name: 'Oppgi firmanavn' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav020806');
      cy.defaultWaits();
      cy.clickNextStep(); // past veiledning (no fields)
    });

    it('fills required fields across all panels and verifies summary', () => {
      // Veiledning — no fields, skip
      cy.clickNextStep();

      // Panel: Opplysninger om arbeidstakeren som sendes til utlandet
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har arbeidstakeren norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsdato.*\(dd\.mm\.åååå\)/i }).type('01.01.1990');
      cy.clickNextStep();

      // Panel: Arbeidsgiver
      cy.findByRole('textbox', { name: /Navn på arbeidsgiveren/ }).type('Test AS');
      cy.findByLabelText('Organisasjonsnummer').type('889640782');
      cy.clickNextStep();

      // Panel: Oppdraget
      cy.findByRole('combobox', { name: 'Hvilket land sendes arbeidstakeren til?' }).type('Norg{downArrow}{enter}');
      cy.findByRole('textbox', { name: /Fra dato.*\(dd\.mm\.åååå\)/i }).type('01.01.2025');
      cy.findByRole('textbox', { name: /Til dato.*\(dd\.mm\.åååå\)/i }).type('01.06.2025');
      cy.withinComponent('Har du som arbeidsgiver oppdrag i landet den ansatte skal sendes ut til?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent(
        'Plikter du som arbeidsgiver å betale arbeidsgiveravgift til Norge av lønnen den ansatte tjener under utenlandsoppholdet?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.clickNextStep();

      // Panel: Opplysninger om deg som fyller ut skjemaet
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Lars');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Hansen');
      cy.findByLabelText(/Hvor er du.*ansatt/i)
        .closest('.form-group')
        .within(() => {
          cy.findByRole('radio', { name: 'Hos arbeidsgiveren' }).click();
        });
      cy.findByLabelText(/Organisasjonsnummeret til underenheten/).type('974760673');
      cy.clickNextStep();

      // Panel: Bekreftelse
      cy.findByRole('checkbox', { name: /Jeg bekrefter at opplysningene er korrekte/ }).check();
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');

      cy.withinSummaryGroup('Opplysninger om arbeidstakeren som sendes til utlandet', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });

      cy.withinSummaryGroup('Arbeidsgiver', () => {
        cy.get('dt').eq(0).should('contain.text', 'Navn på arbeidsgiveren');
        cy.get('dd').eq(0).should('contain.text', 'Test AS');
      });
    });
  });
});
