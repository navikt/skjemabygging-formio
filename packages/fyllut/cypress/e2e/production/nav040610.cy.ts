/*
 * Production form tests for Næringsfaglig vurdering av etableringsplaner
 * Form: nav040610
 * Submission types: [] — no ?sub= param, use cy.clickNextStep()
 *
 * Panels:
 *   - Veiledning (veiledning): no required fields, no conditionals
 *   - Om etablereren (ometablereren): 2 conditional triggers
 *       borDuINorge → vegadresseEllerPostboksadresse (ja) / navSkjemagruppeUtland (nei)
 *       vegadresseEllerPostboksadresse → navSkjemagruppeVegadresse (vegadresse) / navSkjemagruppePostboksadresse (postboksadresse)
 *   - Vurdering (vurdering): 1 conditional trigger
 *       mottarEtablererenDagpengerEllerArbeidsavklaringspenger → dagpenger number (dagpenger) / 2 AAP numbers (arbeidsavklaringspengerAap)
 *   - Vedlegg (vedlegg): isAttachmentPanel=true, 1 required attachment (Annen dokumentasjon)
 */

describe('nav040610', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Om etablereren conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040610/ometablereren');
      cy.defaultWaits();
    });

    it('shows address type selector when borDuINorge is Ja, shows foreign address when Nei', () => {
      // Initially nothing shown
      cy.findByLabelText('Er kontaktadressen en vegadresse eller postboksadresse?').should('not.exist');
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');

      // Select Ja → address type selector appears, foreign address hidden
      cy.withinComponent('Bor etablereren i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Er kontaktadressen en vegadresse eller postboksadresse?').should('exist');
      cy.findByRole('textbox', { name: 'Land' }).should('not.exist');

      // Select Nei → foreign address appears, address type selector hidden
      cy.withinComponent('Bor etablereren i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Er kontaktadressen en vegadresse eller postboksadresse?').should('not.exist');
      cy.findByRole('textbox', { name: 'Land' }).should('exist');
    });

    it('shows vegadresse fields or postboksadresse fields based on contact address type', () => {
      // Enable the address type selector by selecting Ja
      cy.withinComponent('Bor etablereren i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      // Initially neither address group shown
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      // Select Vegadresse → vegadresse fields appear, postboks fields hidden
      cy.withinComponent('Er kontaktadressen en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      // Select Postboksadresse → postboks fields appear, vegadresse fields hidden
      cy.withinComponent('Er kontaktadressen en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Postboksadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
    });
  });

  describe('Vurdering conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040610/vurdering');
      cy.defaultWaits();
    });

    it('shows dagpenger number field when Dagpenger is selected, AAP fields when AAP is selected', () => {
      // Initially no conditional number fields shown
      cy.findByLabelText(/anbefalt periode med dagpenger/).should('not.exist');
      cy.findByLabelText(/utviklingsfase/).should('not.exist');
      cy.findByLabelText(/oppstartingsfase/).should('not.exist');

      // Select Dagpenger → dagpenger field appears, AAP fields hidden
      cy.withinComponent('Mottar etablereren dagpenger eller arbeidsavklaringspenger?', () => {
        cy.findByRole('radio', { name: 'Dagpenger' }).click();
      });
      cy.findByLabelText(/anbefalt periode med dagpenger/).should('exist');
      cy.findByLabelText(/utviklingsfase/).should('not.exist');
      cy.findByLabelText(/oppstartingsfase/).should('not.exist');

      // Select AAP → AAP fields appear, dagpenger field hidden
      cy.withinComponent('Mottar etablereren dagpenger eller arbeidsavklaringspenger?', () => {
        cy.findByRole('radio', { name: 'Arbeidsavklaringspenger (AAP)' }).click();
      });
      cy.findByLabelText(/anbefalt periode med dagpenger/).should('not.exist');
      cy.findByLabelText(/utviklingsfase/).should('exist');
      cy.findByLabelText(/oppstartingsfase/).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav040610');
      cy.defaultWaits();
      cy.clickNextStep(); // start → Veiledning
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning has no required fields — advance to Om etablereren
      cy.clickNextStep();

      // Om etablereren
      cy.findByRole('textbox', { name: 'Etablererens fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etablererens etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.withinComponent('Bor etablereren i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Er kontaktadressen en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });
      cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testveien 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0101');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.clickNextStep();

      // Vurdering — fill all required textareas
      cy.findByRole('textbox', { name: 'Vurdering av teoretisk kompetanse' }).type('Test');
      cy.findByRole('textbox', { name: 'Vurdering av faglig/praktisk kompetanse' }).type('Test');
      cy.findByRole('textbox', {
        name: 'Vurdering av om etableringen er ny eller om det er overtagelse/kjøp av allerede etablert virksomhet',
      }).type('Test');
      cy.findByRole('textbox', { name: /Realisme i prosjektid/ }).type('Test');
      cy.findByRole('textbox', { name: 'Antatt investeringsbehov' }).type('Test');
      cy.findByRole('textbox', { name: /Antatt hjelpebehov/ }).type('Test');
      cy.findByRole('textbox', { name: /nøkkelproblemer/ }).type('Test');
      cy.findByRole('textbox', { name: /selvforsørgende/ }).type('Test');
      cy.withinComponent('Mottar etablereren dagpenger eller arbeidsavklaringspenger?', () => {
        cy.findByRole('radio', { name: 'Dagpenger' }).click();
      });
      cy.findByLabelText(/anbefalt periode med dagpenger/).type('12');

      // Vedlegg — isAttachmentPanel=true, use stepper (Case A: last panel before Oppsummering)
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });

      // One clickNextStep() — Vedlegg is the last panel, goes directly to Oppsummering
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Om etablereren', () => {
        cy.get('dt').eq(0).should('contain.text', 'Etablererens fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Vurdering', () => {
        cy.get('dt').contains('Mottar etablereren dagpenger eller arbeidsavklaringspenger?').should('exist');
      });
    });
  });
});
