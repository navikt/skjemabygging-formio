/*
 * Production form tests for Inntektsskjema for beregning av trygdeavgift
 * Form: nav230301
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Hvem som fyller ut skjemaet (hvemSomFyllerUtSkjemaet): 3 same-panel conditionals
 *       fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv → alertstripe, alertstripe1, hvorforSokerDuPaVegneAvEnAnnenPerson
 *   - Dine opplysninger (dineOpplysninger): 2 customConditionals
 *       identitet.harDuFodselsnummer → adresse visibility and folkeregister alert
 *   - Arbeidsinntekt (arbeidsinntekt): 13 same-panel/custom conditionals
 *       harDuMottattLonnsinntektFraUtlandet → valuta, beløp, trygdeavgift
 *       harDuMottattNaturalytelserFraUtenlandskArbeidsgiver → naturalytelser group
 *       bolig / eierEllerLeierDuBoligINorge / bil / andreNaturalytelser → nested fields + alert
 *       harDuHattAnnenInntektFraUtenlandskArbeidsgiver → type + valuta
 *   - Næringsinntekt (naeringsinntekt): 2 same-panel conditionals
 *       harDuHattNaeringsinntektINorge / harDuHattNaeringsinntektIUtlandet → datagrids
 *   - Pensjon (pensjon): 2 same-panel conditionals
 *       harDuMottattPensjonFraUtlandet → valuta + beløp
 *   - Tilleggsopplysninger (tilleggsopplysninger): 1 same-panel conditional
 *       harDuAndreOpplysninger → beskrivAndreEndringer
 *   - Om deg som fyller ut skjemaet (omDegSomFyllerUtSkjemaet): 3 cross-panel conditionals
 *       hvorforSokerDuPaVegneAvEnAnnenPerson → person, virksomhet or verge fields
 *   - Vedlegg (vedlegg): 1 cross-panel attachment conditional
 *       hvorforSokerDuPaVegneAvEnAnnenPerson → fullmakt attachment
 */

const visitPanel = (panelKey: string) => {
  cy.visit(`/fyllut/nav230301/${panelKey}?sub=paper`);
  cy.defaultWaits();
};

const selectRadio = (label: string | RegExp, option: string | RegExp) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const setCheckbox = (label: string | RegExp, checked: boolean) => {
  cy.findByRole('checkbox', { name: label }).then(($checkbox) => {
    if ($checkbox.is(':checked') !== checked) {
      cy.findByRole('checkbox', { name: label }).click();
    }
  });
};

describe('nav230301', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Hvem som fyller ut skjemaet conditionals', () => {
    beforeEach(() => {
      visitPanel('hvemSomFyllerUtSkjemaet');
    });

    it('shows role and guidance only when applying on behalf of someone else', () => {
      cy.findByLabelText('Hva er din rolle?').should('not.exist');
      cy.contains('Du må sende søknaden i posten').should('not.exist');
      cy.contains('Spørsmålene videre i skjemaet handler om personen som du søker for').should('not.exist');

      selectRadio('Fyller du ut søknaden på vegne av andre enn deg selv?', 'Ja');

      cy.findByLabelText('Hva er din rolle?').should('exist');
      cy.contains('Du må sende søknaden i posten').should('exist');
      cy.contains('Spørsmålene videre i skjemaet handler om personen som du søker for').should('exist');

      selectRadio('Fyller du ut søknaden på vegne av andre enn deg selv?', 'Nei');

      cy.findByLabelText('Hva er din rolle?').should('not.exist');
      cy.contains('Du må sende søknaden i posten').should('not.exist');
      cy.contains('Spørsmålene videre i skjemaet handler om personen som du søker for').should('not.exist');
    });
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      visitPanel('dineOpplysninger');
    });

    it('shows address fields when applicant has no Norwegian identity number', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');

      cy.findByLabelText('Bor du i Norge?').should('exist');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('exist');
    });

    it('shows folkeregister alert and hides address fields when applicant has Norwegian identity number', () => {
      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');

      cy.contains('Nav sender svar på søknad og annen kommunikasjon').should('exist');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });
  });

  describe('Arbeidsinntekt conditionals', () => {
    beforeEach(() => {
      visitPanel('arbeidsinntekt');
    });

    it('toggles salary-from-abroad fields from the first radiopanel', () => {
      cy.findByRole('combobox', { name: 'Velg valuta for lønnsinntekten' }).should('not.exist');
      cy.findByLabelText('Samlet beløp for perioden').should('not.exist');
      cy.findByLabelText('Betaler arbeidsgiver trygdeavgiften for deg?').should('not.exist');

      selectRadio('Har du mottatt lønnsinntekt fra utlandet?', 'Ja');

      cy.findByRole('combobox', { name: 'Velg valuta for lønnsinntekten' }).should('exist');
      cy.findByLabelText('Samlet beløp for perioden').should('exist');
      cy.findByLabelText('Betaler arbeidsgiver trygdeavgiften for deg?').should('exist');

      selectRadio('Har du mottatt lønnsinntekt fra utlandet?', 'Nei');

      cy.findByRole('combobox', { name: 'Velg valuta for lønnsinntekten' }).should('not.exist');
      cy.findByLabelText('Samlet beløp for perioden').should('not.exist');
      cy.findByLabelText('Betaler arbeidsgiver trygdeavgiften for deg?').should('not.exist');
    });

    it('toggles nested naturalytelser fields and alert based on selected benefits', () => {
      cy.findByRole('combobox', { name: 'Velg valutaen du oppgir naturalytelsene i' }).should('not.exist');

      selectRadio('Har du mottatt naturalytelser fra utenlandsk arbeidsgiver?', 'Ja');

      cy.findByRole('combobox', { name: 'Velg valutaen du oppgir naturalytelsene i' }).should('exist');
      cy.contains('velge minst én naturalytelse').should('exist');
      cy.findByLabelText('Leieverdien på bolig i utlandet i perioden').should('not.exist');

      setCheckbox(/Bolig/, true);
      cy.findByLabelText('Leieverdien på bolig i utlandet i perioden').should('exist');
      cy.findByLabelText('Antall rom i boligen i utlandet').should('exist');
      cy.findByLabelText('Eier eller leier du bolig i Norge?').should('exist');
      cy.contains('velge minst én naturalytelse').should('not.exist');

      selectRadio('Eier eller leier du bolig i Norge?', 'Ja');
      cy.findByLabelText('Leier du boligen ut til noen andre i perioden?').should('exist');
      selectRadio('Eier eller leier du bolig i Norge?', 'Nei');
      cy.findByLabelText('Leier du boligen ut til noen andre i perioden?').should('not.exist');

      setCheckbox(/Bil/, true);
      cy.findByLabelText('Verdi av godtgjørelse for bil for perioden').should('exist');

      setCheckbox(/Andre naturalytelser/, true);
      cy.findByLabelText('Verdi av andre naturalytelser i perioden').should('exist');
      cy.findByRole('textbox', { name: 'Beskriv hvilke andre naturalytelser du har mottatt' }).should('exist');

      setCheckbox(/Bolig/, false);
      cy.findByLabelText('Leieverdien på bolig i utlandet i perioden').should('not.exist');

      setCheckbox(/Bil/, false);
      cy.findByLabelText('Verdi av godtgjørelse for bil for perioden').should('not.exist');

      setCheckbox(/Andre naturalytelser/, false);
      cy.findByLabelText('Verdi av andre naturalytelser i perioden').should('not.exist');
      cy.findByRole('textbox', { name: 'Beskriv hvilke andre naturalytelser du har mottatt' }).should('not.exist');
      cy.contains('velge minst én naturalytelse').should('exist');
    });

    it('shows other-income fields only when other foreign income is selected', () => {
      cy.findByRole('textbox', { name: 'Hvilken type inntekt?' }).should('not.exist');
      cy.findByRole('combobox', { name: 'Velg valuta for samlet verdi av annet inntekt' }).should('not.exist');
      cy.findByLabelText('Samlet verdi annen inntekt det forespurte året').should('exist');

      selectRadio('Har du hatt annen inntekt fra utenlandsk arbeidsgiver?', 'Ja');

      cy.findByRole('textbox', { name: 'Hvilken type inntekt?' }).should('exist');
      cy.findByRole('combobox', { name: 'Velg valuta for samlet verdi av annet inntekt' }).should('exist');

      selectRadio('Har du hatt annen inntekt fra utenlandsk arbeidsgiver?', 'Nei');

      cy.findByRole('textbox', { name: 'Hvilken type inntekt?' }).should('not.exist');
      cy.findByRole('combobox', { name: 'Velg valuta for samlet verdi av annet inntekt' }).should('not.exist');
    });
  });

  describe('Næringsinntekt conditionals', () => {
    beforeEach(() => {
      visitPanel('naeringsinntekt');
    });

    it('toggles Norway and abroad datagrids from their radiopanels', () => {
      cy.findByRole('textbox', { name: /Overskudd på regnskapet/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Skjermingsgrunnlag/ }).should('not.exist');
      cy.findByRole('combobox', { name: 'Velg valuta for din næringsinntekt i utlandet' }).should('not.exist');

      selectRadio('Har du hatt næringsinntekt i Norge?', 'Ja');
      cy.findAllByRole('textbox', { name: /Overskudd på regnskapet/ }).should('have.length.at.least', 1);
      cy.findAllByRole('textbox', { name: /Skjermingsgrunnlag/ }).should('have.length.at.least', 1);

      selectRadio('Har du hatt næringsinntekt i utlandet?', 'Ja');
      cy.findByRole('combobox', { name: 'Velg valuta for din næringsinntekt i utlandet' }).should('exist');

      selectRadio('Har du hatt næringsinntekt i Norge?', 'Nei');
      cy.findAllByRole('textbox', { name: /Overskudd på regnskapet/ }).should('have.length', 1);

      selectRadio('Har du hatt næringsinntekt i utlandet?', 'Nei');
      cy.findByRole('combobox', { name: 'Velg valuta for din næringsinntekt i utlandet' }).should('not.exist');
    });
  });

  describe('Pensjon and tilleggsopplysninger conditionals', () => {
    it('toggles pension fields from foreign pension answer', () => {
      visitPanel('pensjon');

      cy.findByRole('combobox', { name: 'Velg valutaen du oppgir pensjonen i' }).should('not.exist');
      cy.findByLabelText('Hvor mye pensjon har du hatt i perioden?').should('not.exist');

      selectRadio('Har du mottatt pensjon fra utlandet?', 'Ja');

      cy.findByRole('combobox', { name: 'Velg valutaen du oppgir pensjonen i' }).should('exist');
      cy.findByLabelText('Hvor mye pensjon har du hatt i perioden?').should('exist');

      selectRadio('Har du mottatt pensjon fra utlandet?', 'Nei');

      cy.findByRole('combobox', { name: 'Velg valutaen du oppgir pensjonen i' }).should('not.exist');
      cy.findByLabelText('Hvor mye pensjon har du hatt i perioden?').should('not.exist');
    });

    it('shows additional details only when other information exists', () => {
      cy.visit('/fyllut/nav230301/tilleggsopplysninger?sub=paper');
      cy.findByRole('heading', { level: 2, name: 'Tilleggsopplysninger' }).should('exist');
      cy.findByRole('textbox', { name: 'Beskriv andre endringer' }).should('not.exist');

      selectRadio('Har du andre opplysninger?', 'Ja');
      cy.findByRole('textbox', { name: 'Beskriv andre endringer' }).should('exist');

      selectRadio('Har du andre opplysninger?', 'Nei');
      cy.findByRole('textbox', { name: 'Beskriv andre endringer' }).should('not.exist');
    });
  });

  describe('Cross-panel representative conditionals', () => {
    beforeEach(() => {
      visitPanel('hvemSomFyllerUtSkjemaet');
      selectRadio('Fyller du ut søknaden på vegne av andre enn deg selv?', 'Ja');
      cy.clickShowAllSteps();
    });

    it('shows the matching representative fields on Om deg som fyller ut skjemaet', () => {
      selectRadio('Hva er din rolle?', 'Jeg har fullmakt');
      cy.findByRole('link', { name: 'Om deg som fyller ut skjemaet' }).click();
      cy.findAllByRole('textbox', { name: 'Fornavn' }).should('have.length.at.least', 1);
      cy.findAllByRole('textbox', { name: 'Etternavn' }).should('have.length.at.least', 1);
      cy.findByRole('textbox', { name: 'Virksomhetens navn' }).should('not.exist');

      cy.findByRole('link', { name: 'Hvem som fyller ut skjemaet' }).click();
      selectRadio('Hva er din rolle?', 'Jeg representerer en virksomhet med fullmakt');
      cy.findByRole('link', { name: 'Om deg som fyller ut skjemaet' }).click();
      cy.findByRole('textbox', { name: 'Virksomhetens navn' }).should('exist');
      cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).should('exist');

      cy.findByRole('link', { name: 'Hvem som fyller ut skjemaet' }).click();
      selectRadio('Hva er din rolle?', 'Jeg er foresatt eller verge');
      cy.findByRole('link', { name: 'Om deg som fyller ut skjemaet' }).click();
      cy.findByRole('textbox', { name: 'Virksomhetens navn' }).should('not.exist');
      cy.findAllByRole('textbox', { name: 'Fornavn' }).should('have.length.at.least', 1);
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav230301?sub=paper');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary', () => {
      cy.clickNextStep();

      // Hvem som fyller ut skjemaet
      selectRadio('Fyller du ut søknaden på vegne av andre enn deg selv?', 'Ja');
      selectRadio('Hva er din rolle?', 'Jeg har fullmakt');
      cy.clickNextStep();

      // Veiledning
      cy.findByRole('checkbox', {
        name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.',
      }).click();
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Periode
      cy.findByRole('textbox', { name: 'Hvilket år skal du sende inntektsopplysninger for?' }).type('2025');
      cy.findByRole('textbox', { name: /Fra og med dato/ }).type('01.01.2025');
      cy.findByRole('textbox', { name: /Til og med dato/ }).type('31.01.2025');
      cy.clickNextStep();

      // Arbeidsinntekt
      selectRadio('Har du mottatt lønnsinntekt fra utlandet?', 'Nei');
      selectRadio('Har du mottatt naturalytelser fra utenlandsk arbeidsgiver?', 'Nei');
      selectRadio('Har du hatt annen inntekt fra utenlandsk arbeidsgiver?', 'Nei');
      cy.findByLabelText('Samlet verdi annen inntekt det forespurte året').type('0');
      cy.clickNextStep();

      // Næringsinntekt
      selectRadio('Har du hatt næringsinntekt i Norge?', 'Nei');
      selectRadio('Har du hatt næringsinntekt i utlandet?', 'Nei');
      cy.clickNextStep();

      // Pensjon
      selectRadio('Har du mottatt pensjon fra utlandet?', 'Nei');
      cy.clickNextStep();

      // Tilleggsopplysninger
      selectRadio('Har du andre opplysninger?', 'Nei');
      cy.clickNextStep();

      // Om deg som fyller ut skjemaet
      cy.findAllByRole('textbox', { name: 'Fornavn' }).last().type('Kari');
      cy.findAllByRole('textbox', { name: 'Etternavn' }).last().type('Fullmektig');
      cy.clickNextStep();

      // Vedlegg
      cy.findByRole('group', { name: /Dokumentasjon på at du har fullmakt/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved' }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Hvem som fyller ut skjemaet', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fyller du ut søknaden på vegne av andre enn deg selv?');
        cy.get('dd').eq(0).should('contain.text', 'Ja');
        cy.get('dt').eq(1).should('contain.text', 'Hva er din rolle?');
        cy.get('dd').eq(1).should('contain.text', 'Jeg har fullmakt');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dd', 'Ola').should('exist');
      });
      cy.withinSummaryGroup('Om deg som fyller ut skjemaet', () => {
        cy.contains('dd', 'Kari').should('exist');
      });
    });
  });
});
