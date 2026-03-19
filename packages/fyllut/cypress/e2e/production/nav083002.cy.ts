/*
 * Production form tests for Trekkopplysninger for arbeidstaker som skal ha sykepenger,
 * foreldrepenger, svangerskapspenger, pleie-/opplæringspenger og omsorgspenger
 * Form: nav083002
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Opplysninger om arbeidstakeren (opplysningerOmArbeidstageren): 2 customConditionals
 *       identitet.harDuFodselsnummer → adresse (show when "nei")
 *       adresse.borDuINorge → adresseVarighet (show when "nei")
 *   - Trekk (trekk): 3 simple conditionals
 *       erDetTrekkTilMaritimPensjonskasse → navSkjemagruppe Pensjonstrygden for sjømenn (show when "ja")
 *       ordning → typeGammelOrdning (show when "gammelOrdning")
 *       erDetFagforeningstrekk → navSkjemagruppe1 Fagforeningstrekk (show when "ja")
 *
 * Note: Vedlegg has isAttachmentPanel=true (last panel). Sequential clickNextStep() skips it.
 * Use cy.clickShowAllSteps() + stepper to navigate there, then ONE clickNextStep() to reach Oppsummering.
 */

describe('nav083002', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Opplysninger om arbeidstakeren – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083002/opplysningerOmArbeidstageren?sub=paper');
      cy.defaultWaits();
    });

    it('shows adresse section when user has no fnr', () => {
      cy.findByLabelText('Bor arbeidstakeren i Norge?').should('not.exist');

      cy.withinComponent('Har arbeidstakeren norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor arbeidstakeren i Norge?').should('exist');

      cy.withinComponent('Har arbeidstakeren norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Bor arbeidstakeren i Norge?').should('not.exist');
    });

    it('shows adresseVarighet date fields when borDuINorge is nei', () => {
      // First make adresse visible by selecting Nei for fnr
      cy.withinComponent('Har arbeidstakeren norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bor arbeidstakeren i Norge?').should('exist');

      // adresseVarighet (Gyldig fra) not yet visible
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');

      // Select Nei for borDuINorge → adresseVarighet appears
      cy.withinComponent('Bor arbeidstakeren i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');

      // Select Ja for borDuINorge → adresseVarighet hidden again (no address type chosen)
      cy.withinComponent('Bor arbeidstakeren i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');
    });
  });

  describe('Trekk – pensjonstrygd and fagforening conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083002/trekk?sub=paper');
      cy.defaultWaits();
    });

    it('shows Pensjonstrygden for sjømenn group when maritim pensjonskasse is ja', () => {
      cy.findByLabelText('Ordning').should('not.exist');

      cy.withinComponent('Er det trekk til Maritim pensjonskasse?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Ordning').should('exist');

      cy.withinComponent('Er det trekk til Maritim pensjonskasse?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Ordning').should('not.exist');
    });

    it('shows typeGammelOrdning when gammelOrdning is selected', () => {
      // First show the pensjonstrygd group
      cy.withinComponent('Er det trekk til Maritim pensjonskasse?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Ang type gammel ordning').should('not.exist');

      cy.withinComponent('Ordning', () => {
        cy.findByRole('radio', { name: /Gammel ordning/ }).click();
      });
      cy.findByLabelText('Ang type gammel ordning').should('exist');

      cy.withinComponent('Ordning', () => {
        cy.findByRole('radio', { name: 'Ny inntektsbasert ordning' }).click();
      });
      cy.findByLabelText('Ang type gammel ordning').should('not.exist');
    });

    it('shows Fagforeningstrekk group when fagforeningstrekk is ja', () => {
      cy.findByRole('textbox', { name: 'Oppgi Fagforening/særforbund' }).should('not.exist');

      cy.withinComponent('Er det fagforeningstrekk?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Oppgi Fagforening/særforbund' }).should('exist');

      cy.withinComponent('Er det fagforeningstrekk?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Oppgi Fagforening/særforbund' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083002?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // landing page → Veiledning
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields
      cy.clickNextStep();

      // Opplysninger om arbeidstakeren – use fnr path (adresse/adresseVarighet hidden)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har arbeidstakeren norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Spesielle skatteopplysninger – no required fields
      cy.clickNextStep();

      // Trekk – select Nei for both to avoid conditional required fields
      cy.withinComponent('Er det trekk til Maritim pensjonskasse?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Er det fagforeningstrekk?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Erklæring – fill all required fields; do NOT click Next (Vedlegg is isAttachmentPanel)
      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).type('Test AS');
      cy.findByRole('textbox', { name: 'Adresse' }).type('Testveien 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0150');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).type('974760673');

      // Vedlegg – isAttachmentPanel=true; sequential Next skips it — use stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });

      // ONE clickNextStep from Vedlegg (last panel) → Oppsummering
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Opplysninger om arbeidstakeren', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Erklæring', () => {
        cy.get('dt').eq(0).should('contain.text', 'Arbeidsgiver');
        cy.get('dd').eq(0).should('contain.text', 'Test AS');
      });
    });
  });
});
