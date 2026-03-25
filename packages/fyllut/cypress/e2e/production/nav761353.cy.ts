/*
 * Production form tests for Refusjonskrav – AFT og VTA i skjermet virksomhet
 * Form: nav761353
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Veiledning (veiledning): 3 same-panel/panel-level conditionals
 *       gjelderRefusjonskravetForPerioden1JuliOgSenere → alertstripe1 (ja)
 *       gjelderRefusjonskravetForPerioden1JuliOgSenere → hvaGjelderKravet, tilsagnsnummer1 (nei)
 *       gjelderRefusjonskravetForPerioden1JuliOgSenere → panels omtiltaksarrangor, tilsagn, refusjon, erklaring, vedlegg
 *   - Tilsagn (tilsagn): 2 same-panel conditionals
 *       hvaGjelderKravet → AFT-specific fields
 *       hvaGjelderKravet → VTA-specific fields
 */

const selectPreJulyBranch = () => {
  cy.withinComponent('Gjelder refusjonskravet for perioden 1. juli og senere?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
};

const selectAft = () => {
  cy.withinComponent('Hva gjelder kravet?', () => {
    cy.findByRole('radio', { name: 'AFT' }).click();
  });
};

const selectVta = () => {
  cy.withinComponent('Hva gjelder kravet?', () => {
    cy.findByRole('radio', { name: 'VTA' }).click();
  });
};

describe('nav761353', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Veiledning conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761353/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('toggles alert, legacy fields and downstream panels based on period selection', () => {
      cy.findByText(/Når refusjonskravet gjelder for perioden 1\. juli og senere/).should('not.exist');
      cy.findByLabelText('Hva gjelder kravet?').should('not.exist');
      cy.findByRole('textbox', { name: 'Tilsagnsnummer' }).should('not.exist');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Om tiltaksarrangør' }).should('not.exist');
      cy.findByRole('link', { name: 'Refusjon' }).should('not.exist');

      cy.withinComponent('Gjelder refusjonskravet for perioden 1. juli og senere?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByText(/Når refusjonskravet gjelder for perioden 1\. juli og senere/).should('exist');
      cy.findByLabelText('Hva gjelder kravet?').should('not.exist');
      cy.findByRole('textbox', { name: 'Tilsagnsnummer' }).should('not.exist');
      cy.findByRole('link', { name: 'Om tiltaksarrangør' }).should('not.exist');
      cy.findByRole('link', { name: 'Refusjon' }).should('not.exist');

      selectPreJulyBranch();

      cy.findByText(/Når refusjonskravet gjelder for perioden 1\. juli og senere/).should('not.exist');
      cy.findByLabelText('Hva gjelder kravet?').should('exist');
      cy.findByRole('textbox', { name: 'Tilsagnsnummer' }).should('exist');
      cy.findByRole('link', { name: 'Om tiltaksarrangør' }).should('exist');
      cy.findByRole('link', { name: 'Refusjon' }).should('exist');
    });
  });

  describe('Tilsagn conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761353/veiledning?sub=paper');
      cy.defaultWaits();
      selectPreJulyBranch();
      selectAft();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Tilsagn' }).click();
    });

    it('switches between AFT and VTA-specific fields', () => {
      cy.findByRole('textbox', { name: 'Tilsagnsbeløp - AFT' }).should('exist');
      cy.findByRole('textbox', { name: 'Tilsagnsbeløp - VTA' }).should('not.exist');

      cy.findByRole('link', { name: 'Veiledning' }).click();
      selectVta();
      cy.findByRole('link', { name: 'Tilsagn' }).click();

      cy.findByRole('textbox', { name: 'Tilsagnsbeløp - AFT' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Tilsagnsbeløp - VTA' }).should('exist');

      cy.findByRole('link', { name: 'Veiledning' }).click();
      selectAft();
      cy.findByRole('link', { name: 'Tilsagn' }).click();

      cy.findByRole('textbox', { name: 'Tilsagnsbeløp - AFT' }).should('exist');
      cy.findByRole('textbox', { name: 'Tilsagnsbeløp - VTA' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761353?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning — choose the legacy paper flow that exposes the remaining panels
      selectPreJulyBranch();
      selectAft();
      cy.findByRole('textbox', { name: 'Tilsagnsnummer' }).type('T12345');
      cy.clickNextStep();

      // Om tiltaksarrangør
      cy.findByRole('textbox', { name: 'Tiltaksarrangør' }).type('Test Tiltaksarrangør AS');
      cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).type('889640782');
      cy.findByRole('textbox', { name: 'Bedriftsnummer' }).type('974760673');
      cy.findByRole('textbox', { name: 'Kontonummer' }).type('01234567892');
      cy.findByRole('textbox', { name: 'Postadresse' }).type('Testgata 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0001');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.get('input[type="tel"]').eq(0).type('12345678');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.get('input[type="tel"]').eq(1).type('87654321');
      cy.clickNextStep();

      // Tilsagn — AFT path
      cy.findByLabelText('Antall avtalte plasser').type('2');
      cy.findByRole('textbox', { name: 'Tilsagnsbeløp - AFT' }).type('10000');
      cy.findAllByRole('textbox', { name: /Fra og med dato \(dd\.mm\.åååå\)/ })
        .eq(0)
        .type('01.01.2025');
      cy.findAllByRole('textbox', { name: /Til og med dato \(dd\.mm\.åååå\)/ })
        .eq(0)
        .type('31.01.2025');
      cy.findAllByRole('textbox', { name: /Fra og med dato \(dd\.mm\.åååå\)/ })
        .eq(1)
        .type('01.02.2025');
      cy.findAllByRole('textbox', { name: /Til og med dato \(dd\.mm\.åååå\)/ })
        .eq(1)
        .type('28.02.2025');
      cy.clickNextStep();

      // Refusjon
      cy.findByLabelText('Oppgi antall månedsverk').type('2');
      cy.findByRole('textbox', { name: 'Oppgi månedlig refusjonssats' }).type('5000');
      cy.findByRole('textbox', { name: 'Totalt refusjonskrav' }).type('10000');
      cy.clickNextStep();

      // Erklæring — go to Vedlegg through the stepper because it is an attachment panel
      cy.findByRole('checkbox', {
        name: 'Det erklæres herved at alle opplysninger er gitt i henhold til de faktiske forhold.',
      }).click();

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Vedlegg til refusjonskrav - AFT og VTA/ }).within(() => {
        cy.findByRole('radio', { name: /tidligere/ }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Veiledning', () => {
        cy.contains('dt', 'Hva gjelder kravet?').next('dd').should('contain.text', 'AFT');
      });
      cy.withinSummaryGroup('Om tiltaksarrangør', () => {
        cy.contains('dt', 'Tiltaksarrangør').next('dd').should('contain.text', 'Test Tiltaksarrangør AS');
      });
      cy.withinSummaryGroup('Refusjon', () => {
        cy.contains('dt', 'Oppgi antall månedsverk').next('dd').should('contain.text', '2');
      });
    });
  });
});
