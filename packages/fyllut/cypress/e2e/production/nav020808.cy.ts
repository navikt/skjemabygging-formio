/*
 * Production form tests for Skjema for arbeidsgiver – bekreftelse på utsending i EØS eller Sveits
 * Form: nav020808
 * Submission types: [] (none — no ?sub= needed)
 *
 * Panels tested:
 *   - Arbeidstakeren (arbeidstakeren): 2 same-panel conditionals
 *       harDuNorskFodselsnummerEllerDNummer → fodselsnummerDNummerSoker (ja)
 *       harDuNorskFodselsnummerEllerDNummer → fodselsdatoDdMmAaaaSoker (nei)
 *   - Arbeidsgiverens virksomhet i Norge (arbeidsgiverensVirksomhetINorge): 1 same-panel conditional
 *       erArbeidsgiverenEnOffentligVirksomhet → ikkeOffentlig container (nei)
 *   - Utenlandsoppdraget (utenlandsoppdraget): 4 same-panel conditionals
 *       harDuSomArbeidsgiver... → hvorforSkalArbeidstakeren... (nei)
 *       bleArbeidstakerenAnsatt... → vilArbeidstakerenArbeide... (ja)
 *       vilArbeidstakerenFortsatt... → beskrivArbeidstakerens... (nei)
 *       erstatterArbeidstakeren... → navSkjemagruppe2 dates (ja)
 *   - Arbeidstakerens lønn (arbeidstakerensLonn): 3 same-panel conditionals
 *       utbetalerDuSomArbeidsgiver... → hvemUtbetalerLonnen... (nei)
 *       hvemUtbetalerLonnen... → norskVirksomhet datagrid (norskVirksomhet checked)
 *       hvemUtbetalerLonnen... → utenlandskVirksomhet1 datagrid (utenlandskVirksomhet checked)
 *   - Du som fyller ut skjemaet (duSomFyllerUtSkjemaet): 1 same-panel conditional
 *       hvorErDuAnsatt → hvaErNavnetPaFirmaetSomHarFullmakt (hosEtFirmaSomRepresentererArbeidsgiveren)
 */

describe('nav020808', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Arbeidstakeren conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav020808/arbeidstakeren');
      cy.defaultWaits();
    });

    it('shows fødselsnummer when Ja and fødselsdato when Nei', () => {
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
      cy.findByRole('textbox', { name: /fødselsdato/i }).should('exist');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
    });
  });

  describe('Arbeidsgiverens virksomhet i Norge conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav020808/arbeidsgiverensVirksomhetINorge');
      cy.defaultWaits();
    });

    it('shows additional questions when employer is not public', () => {
      cy.findByLabelText(/bemannings- eller vikarbyrå/i).should('not.exist');

      cy.withinComponent('Er arbeidsgiveren en offentlig virksomhet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(/bemannings- eller vikarbyrå/i).should('exist');
      cy.findByLabelText(/vanlig drift i Norge/i).should('exist');

      cy.withinComponent('Er arbeidsgiveren en offentlig virksomhet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(/bemannings- eller vikarbyrå/i).should('not.exist');
    });
  });

  describe('Utenlandsoppdraget conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav020808/utenlandsoppdraget');
      cy.defaultWaits();
    });

    it('shows reason field when employer has no assignment abroad', () => {
      cy.findByRole('textbox', { name: /Hvorfor skal arbeidstakeren arbeide i utlandet/ }).should('not.exist');

      cy.withinComponent(/Har du som arbeidsgiver oppdrag i landet/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Hvorfor skal arbeidstakeren arbeide i utlandet/ }).should('exist');

      cy.withinComponent(/Har du som arbeidsgiver oppdrag i landet/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Hvorfor skal arbeidstakeren arbeide i utlandet/ }).should('not.exist');
    });

    it('shows post-assignment question when hired for the assignment', () => {
      cy.findByLabelText(/Vil arbeidstakeren arbeide for virksomheten i Norge etter/).should('not.exist');

      cy.withinComponent('Ble arbeidstakeren ansatt på grunn av dette utenlandsoppdraget?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(/Vil arbeidstakeren arbeide for virksomheten i Norge etter/).should('exist');

      cy.withinComponent('Ble arbeidstakeren ansatt på grunn av dette utenlandsoppdraget?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(/Vil arbeidstakeren arbeide for virksomheten i Norge etter/).should('not.exist');
    });

    it('shows employment description when not employed for full period', () => {
      cy.findByRole('textbox', { name: /Beskriv arbeidstakerens ansettelsesforhold/ }).should('not.exist');

      cy.withinComponent(/Vil arbeidstakeren fortsatt være ansatt hos dere i hele utsendingsperioden/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Beskriv arbeidstakerens ansettelsesforhold/ }).should('exist');

      cy.withinComponent(/Vil arbeidstakeren fortsatt være ansatt hos dere i hele utsendingsperioden/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Beskriv arbeidstakerens ansettelsesforhold/ }).should('not.exist');
    });

    it('shows replacement period dates when replacing another worker', () => {
      cy.findAllByRole('textbox', { name: /Fra dato.*\(dd\.mm\.åååå\)/ }).should('have.length', 1);

      cy.withinComponent(/Erstatter arbeidstakeren en annen person/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findAllByRole('textbox', { name: /Fra dato.*\(dd\.mm\.åååå\)/ }).should('have.length', 2);

      cy.withinComponent(/Erstatter arbeidstakeren en annen person/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findAllByRole('textbox', { name: /Fra dato.*\(dd\.mm\.åååå\)/ }).should('have.length', 1);
    });
  });

  describe('Arbeidstakerens lønn conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav020808/arbeidstakerensLonn');
      cy.defaultWaits();
    });

    it('shows selectboxes and datagrids based on salary payment', () => {
      cy.findByRole('group', { name: /Hvem utbetaler lønnen/ }).should('not.exist');

      cy.withinComponent(/Utbetaler du som arbeidsgiver all lønn/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('group', { name: /Hvem utbetaler lønnen/ }).should('exist');

      // Check Norsk virksomhet → datagrid appears
      cy.findByRole('group', { name: /Hvem utbetaler lønnen/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Norsk virksomhet' }).check();
      });
      cy.findAllByRole('textbox', { name: 'Navn på virksomhet' }).first().should('exist');

      // Check Utenlandsk virksomhet → datagrid appears
      cy.findByRole('group', { name: /Hvem utbetaler lønnen/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Utenlandsk virksomhet' }).check();
      });
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).should('exist');

      // Uncheck both → datagrids disappear
      cy.findByRole('group', { name: /Hvem utbetaler lønnen/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Norsk virksomhet' }).uncheck();
        cy.findByRole('checkbox', { name: 'Utenlandsk virksomhet' }).uncheck();
      });
      cy.findByRole('textbox', { name: 'Vegnavn og husnummer, evt. postboks' }).should('not.exist');

      // Toggle salary back to Ja → selectboxes disappear
      cy.withinComponent(/Utbetaler du som arbeidsgiver all lønn/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('group', { name: /Hvem utbetaler lønnen/ }).should('not.exist');
    });
  });

  describe('Du som fyller ut skjemaet conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav020808/duSomFyllerUtSkjemaet');
      cy.defaultWaits();
    });

    it('shows firm name when employed at representative firm', () => {
      cy.findByRole('textbox', { name: /Hva er navnet på firmaet/ }).should('not.exist');

      cy.withinComponent('Hvor er du ansatt?', () => {
        cy.findByRole('radio', { name: 'Hos et firma som representerer arbeidsgiveren' }).click();
      });
      cy.findByRole('textbox', { name: /Hva er navnet på firmaet/ }).should('exist');

      cy.withinComponent('Hvor er du ansatt?', () => {
        cy.findByRole('radio', { name: 'Hos arbeidsgiveren' }).click();
      });
      cy.findByRole('textbox', { name: /Hva er navnet på firmaet/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav020808');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning — check required checkbox
      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/ }).check();
      cy.clickNextStep();

      // Arbeidstakeren
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har arbeidstakeren norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Arbeidsgiveren
      cy.findByRole('textbox', { name: /Navn på arbeidsgiveren/ }).type('Test AS');
      cy.findByLabelText('Organisasjonsnummer').type('889640782');
      cy.clickNextStep();

      // Arbeidsgiverens virksomhet i Norge
      cy.withinComponent('Er arbeidsgiveren en offentlig virksomhet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      // Utenlandsoppdraget
      cy.findByRole('combobox', { name: /Hvilket land/ }).click();
      cy.findByRole('combobox', { name: /Hvilket land/ }).type('Sve{downArrow}{enter}');
      cy.findAllByRole('textbox', { name: /Fra dato.*\(dd\.mm\.åååå\)/ })
        .first()
        .type('01.01.2025');
      cy.findAllByRole('textbox', { name: /Til dato.*\(dd\.mm\.åååå\)/ })
        .first()
        .type('01.06.2025');
      cy.withinComponent(/Har du som arbeidsgiver oppdrag i landet/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Ble arbeidstakeren ansatt på grunn av dette utenlandsoppdraget?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(/Vil arbeidstakeren fortsatt være ansatt hos dere i hele utsendingsperioden/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent(/Erstatter arbeidstakeren en annen person/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Arbeidstakerens lønn
      cy.withinComponent(/Utbetaler du som arbeidsgiver all lønn/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      // Du som fyller ut skjemaet
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Hansen');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.withinComponent('Hvor er du ansatt?', () => {
        cy.findByRole('radio', { name: 'Hos arbeidsgiveren' }).click();
      });
      cy.findByLabelText(/Organisasjonsnummeret til underenheten/).type('974760673');
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Arbeidstakeren', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
        cy.get('dt').eq(1).should('contain.text', 'Etternavn');
        cy.get('dd').eq(1).should('contain.text', 'Nordmann');
      });
      cy.withinSummaryGroup('Arbeidsgiveren', () => {
        cy.get('dt').eq(0).should('contain.text', 'Navn på arbeidsgiveren');
        cy.get('dd').eq(0).should('contain.text', 'Test AS');
      });
      cy.withinSummaryGroup('Utenlandsoppdraget', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hvilket land');
        cy.get('dd').eq(0).should('contain.text', 'Sverige');
      });
      cy.withinSummaryGroup('Du som fyller ut skjemaet', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });
    });
  });
});
