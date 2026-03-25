/*
 * Production form tests for Tilleggsskjema fra ergo- eller fysioterapeut i forbindelse med søknad om motorkjøretøy og spesialutstyr / tilpasning
 * Form: nav100743
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Veiledning (veiledning): no conditionals, no required fields
 *   - Opplysninger om ergo- / fysioterapeut (page9): no conditionals, 4 required fields
 *   - Opplysninger om søker (panel): no conditionals, 3 required fields
 *   - Funksjonsbeskrivelse (page4): no conditionals, 3 required textareas
 *   - Kognisjon og sansetap (page5): no conditionals, 1 required textarea
 *   - Rullestol (page6): 2 same-panel conditionals
 *       benytterSokerRullestol → container narSokerBenytterRullestol (show when eq=ja)
 *       skalBrukerEntreBilenSittendeIRullestol → container hvisBrukerSkalEntreBilSittendeIRullestol (show when eq=ja)
 *   - Andre hjelpemidler (page7): no conditionals, 1 required textarea
 */

describe('nav100743', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Rullestol conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100743/page6?sub=paper');
      cy.defaultWaits();
    });

    it('shows wheelchair details when rullestol usage is "Ja"', () => {
      cy.findByRole('textbox', { name: 'Produktnavn på rullestol som skal benyttes i bilen' }).should('not.exist');

      cy.withinComponent('Benytter søker rullestol?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Produktnavn på rullestol som skal benyttes i bilen' }).should('exist');

      cy.withinComponent('Benytter søker rullestol?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Produktnavn på rullestol som skal benyttes i bilen' }).should('not.exist');
    });

    it('shows height/weight fields when søker enters seated in wheelchair', () => {
      cy.withinComponent('Benytter søker rullestol?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Avstand i cm fra gulv til topp hode sittende i rullestol' }).should(
        'not.exist',
      );

      cy.withinComponent('Skal søker sitte i rullestol ved inn- og utstigning?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Avstand i cm fra gulv til topp hode sittende i rullestol' }).should('exist');
      cy.findByRole('textbox', { name: 'Søkers høyde i cm' }).should('exist');
      cy.findByRole('textbox', { name: 'Søkers vekt i kg' }).should('exist');

      cy.withinComponent('Skal søker sitte i rullestol ved inn- og utstigning?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Avstand i cm fra gulv til topp hode sittende i rullestol' }).should(
        'not.exist',
      );
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100743?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // Veiledning → page9
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning — no required fields
      cy.clickNextStep();

      // page9 — Opplysninger om ergo- / fysioterapeut
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Terapeut');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: 'E-post' }).type('test@example.com');
      cy.clickNextStep();

      // panel — Opplysninger om søker
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.clickNextStep();

      // page4 — Funksjonsbeskrivelse
      cy.findByRole('textbox', { name: 'Observer og beskriv hvordan søker kommer inn og ut av bil' }).type(
        'Bevegelighet begrenset',
      );
      cy.findByRole('textbox', { name: 'Observer og beskriv søkers gangfunksjon innen- og utendørs' }).type(
        'Gangfunksjon svekket',
      );
      cy.findByRole('textbox', { name: 'Observer og beskriv søkers arm- og benfunksjon' }).type(
        'Arm- og benfunksjon normal',
      );
      cy.clickNextStep();

      // page5 — Kognisjon og sansetap
      cy.findByRole('textbox', {
        name: 'Beskriv eventuelle utfordringer i forbindelse med kognisjon og sansetap',
      }).type('Ingen kjente utfordringer');
      cy.clickNextStep();

      // page6 — Rullestol (use "Nei" to avoid required nested fields)
      cy.withinComponent('Benytter søker rullestol?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // page7 — Andre hjelpemidler
      cy.findByRole('textbox', { name: 'Oppgi andre hjelpemidler som ønskes fraktet i bilen' }).type('Krykker');
      cy.clickNextStep();

      // Oppsummering
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');

      cy.withinSummaryGroup('Opplysninger om ergo- / fysioterapeut', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });

      cy.withinSummaryGroup('Opplysninger om søker', () => {
        cy.get('dt').eq(1).should('contain.text', 'Fornavn');
        cy.get('dd').eq(1).should('contain.text', 'Ola');
      });

      cy.withinSummaryGroup('Rullestol', () => {
        cy.get('dt').eq(0).should('contain.text', 'Benytter søker rullestol?');
        cy.get('dd').eq(0).should('contain.text', 'Nei');
      });
    });
  });
});
