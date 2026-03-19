/*
 * Production form tests for Tilleggsskjema for stønad til kassebil ved utagerende atferd
 * Form: nav100744
 * Submission types: PAPER
 *
 * Key: the main radiopanel in Veiledning controls whether panels 2, 3 and 4 are shown at all.
 *   'neiDetErBehovForStorreBil' → panels 2/3/4 visible
 *   'jaDetKanVaereMulig'       → only Veiledning visible
 *
 * Panels tested:
 *   - Veiledning (veiledning): 5 conditionals
 *       erDetMuligALoseSituasjonenVedHjelpAvSpesialutstyrEllerTilpasningerIEksisterendeBil
 *       → jegBekrefterAtJegVilSvareSaRiktigSomJegKan checkbox (neiDetErBehovForStorreBil)
 *       → alertstripe (jaDetKanVaereMulig)
 *       → panel opplysningerOmDenSomFyllerUtSkjemaet (neiDetErBehovForStorreBil)
 *       → panel opplysningerOmSoker (neiDetErBehovForStorreBil)
 *       → panel trafikksikkerhetOgTransportbehov (neiDetErBehovForStorreBil)
 *   - Opplysninger om den som fyller ut skjemaet: 1 same-panel conditional
 *       rolleStilling → oppgiHvilkenRolleEllersStillingDuHar (annet)
 *   - Trafikksikkerhet og transportbehov: 2 same-panel conditionals
 *       blirTransportbehovetDekketIDag → beskrivHvordanTransportbehovetBlirDekketIDag1 (ja)
 *       blirTransportbehovetDekketIDag → blirIkkeDekket1 container (nei)
 */

const selectNei = () => {
  cy.withinComponent(
    'Er det mulig å løse situasjonen ved hjelp av spesialutstyr eller tilpasninger i eksisterende bil?',
    () => {
      cy.findByRole('radio', { name: 'Nei, det er behov for større bil' }).click();
    },
  );
};

describe('nav100744', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Veiledning conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100744/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('toggles checkbox, alertstripe and downstream panels based on radiopanel selection', () => {
      // Initial state: nothing selected — checkbox hidden
      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare/ }).should('not.exist');

      // Expand stepper — panels 2/3/4 should not yet be listed
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Opplysninger om den som fyller ut skjemaet' }).should('not.exist');
      cy.findByRole('link', { name: 'Trafikksikkerhet og transportbehov' }).should('not.exist');

      // Select 'Nei' → checkbox appears, panels 2/3/4 appear in stepper
      selectNei();

      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare/ }).should('exist');
      cy.findByRole('link', { name: 'Opplysninger om den som fyller ut skjemaet' }).should('exist');
      cy.findByRole('link', { name: 'Trafikksikkerhet og transportbehov' }).should('exist');

      // Toggle to 'Ja' → checkbox hidden, alertstripe shown, panels 2/3/4 hidden
      cy.withinComponent(
        'Er det mulig å løse situasjonen ved hjelp av spesialutstyr eller tilpasninger i eksisterende bil?',
        () => {
          cy.findByRole('radio', { name: 'Ja, det kan være mulig' }).click();
        },
      );

      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare/ }).should('not.exist');
      cy.findByRole('link', { name: 'Trafikksikkerhet og transportbehov' }).should('not.exist');
    });
  });

  describe('Opplysninger om den som fyller ut skjemaet conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100744/veiledning?sub=paper');
      cy.defaultWaits();
      selectNei();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Opplysninger om den som fyller ut skjemaet' }).click();
    });

    it('shows rolle/stilling text field only when Annet is selected', () => {
      cy.findByRole('textbox', { name: 'Oppgi hvilken rolle eller stilling du har' }).should('not.exist');

      cy.withinComponent('Rolle eller stilling', () => {
        cy.findByRole('radio', { name: 'Annet' }).click();
      });

      cy.findByRole('textbox', { name: 'Oppgi hvilken rolle eller stilling du har' }).should('exist');

      cy.withinComponent('Rolle eller stilling', () => {
        cy.findByRole('radio', { name: 'Forelder' }).click();
      });

      cy.findByRole('textbox', { name: 'Oppgi hvilken rolle eller stilling du har' }).should('not.exist');
    });
  });

  describe('Trafikksikkerhet og transportbehov conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100744/veiledning?sub=paper');
      cy.defaultWaits();
      selectNei();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Trafikksikkerhet og transportbehov' }).click();
    });

    it('toggles transport coverage fields based on radiopanel selection', () => {
      cy.findByRole('textbox', { name: 'Beskriv hvordan transportbehovet blir dekket i dag' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hva er grunnen til at transportbehovet ikke blir dekket?' }).should(
        'not.exist',
      );

      cy.withinComponent('Blir transportbehovet dekket i dag?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Beskriv hvordan transportbehovet blir dekket i dag' }).should('exist');
      cy.findByRole('textbox', { name: 'Hva er grunnen til at transportbehovet ikke blir dekket?' }).should(
        'not.exist',
      );

      cy.withinComponent('Blir transportbehovet dekket i dag?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Beskriv hvordan transportbehovet blir dekket i dag' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hva er grunnen til at transportbehovet ikke blir dekket?' }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100744?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Panel 1 — Veiledning: select 'Nei' branch (shows panels 2/3/4 + checkbox)
      selectNei();
      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare/ }).check();
      cy.clickNextStep();

      // Panel 2 — Opplysninger om den som fyller ut skjemaet
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.withinComponent('Rolle eller stilling', () => {
        cy.findByRole('radio', { name: 'Forelder' }).click();
      });
      cy.clickNextStep();

      // Panel 3 — Opplysninger om søker
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Søker');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Panel 4 — Trafikksikkerhet og transportbehov
      cy.findByRole('textbox', { name: 'Beskriv hvorfor det er behov for større bil' }).type(
        'Barnet har utagerende atferd',
      );
      cy.findByRole('textbox', { name: 'Beskriv hvordan adferd påvirker trafikksikkerheten under transport' }).type(
        'Kan forstyrre sjåfør',
      );
      cy.findByRole('textbox', { name: /Beskriv trafikkfarlige situasjoner/ }).type('Har forsøkt å åpne dør');
      cy.findByRole('textbox', { name: 'Hvilke medpassasjerer har søker ved transport?' }).type('Forelder');
      cy.withinComponent('Blir transportbehovet dekket i dag?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv hvordan transportbehovet blir dekket i dag' }).type('Med privat bil');
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Opplysninger om den som fyller ut skjemaet', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });
      cy.withinSummaryGroup('Opplysninger om søker', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
    });
  });
});
