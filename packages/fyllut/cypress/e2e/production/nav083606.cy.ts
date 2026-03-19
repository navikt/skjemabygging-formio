/*
 * Production form tests for Si opp forsikring - Sykepenger
 * Form: nav083606
 * Submission types: DIGITAL only
 *
 * Panels tested:
 *   - Oppsigelse (oppsigelse): 3 simple conditionals
 *       hvorforSierDuOppForsikringen=virksomhetenErAvsluttet → datoVirksomhetenBleAvsluttet
 *       hvorforSierDuOppForsikringen=virksomhetenHarEndretSelskapsform → datoForEndringAvVirksomheten
 *       hvorforSierDuOppForsikringen=annet → beskrivGrunnenTilAtDuSierOppForsikringen
 *
 * Note on dineOpplysninger (4 customConditionals):
 *   The identity component (key=identitet, prefillKey=sokerIdentifikasjonsnummer) and navAddress
 *   (key=adresse, prefillKey=sokerAdresser) are always readonly in digital mode because
 *   hasPrefill() = isSubmissionDigital() && !!prefillKey. Paper mode is blocked by the form
 *   ("Ugyldig innsendingsvalg"). These conditionals are therefore not testable via UI interaction:
 *     - identitet.harDuFodselsnummer=nei → adresse shown
 *     - adresse.borDuINorge=nei → adresseVarighet shown
 *     - identitet.harDuFodselsnummer=ja → alertstripe shown
 *     - identitet.identitetsnummer && !harDuFodselsnummer → alertstripePrefill shown
 */

describe('nav083606', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
  });

  describe('Oppsigelse – radiopanel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083606/oppsigelse?sub=digital');
      cy.defaultWaits();
    });

    it('shows datoVirksomhetenBleAvsluttet when virksomhetenErAvsluttet is selected', () => {
      cy.findByRole('textbox', { name: /Dato virksomheten ble avsluttet/ }).should('not.exist');

      cy.withinComponent('Hvorfor sier du opp forsikringen?', () => {
        cy.findByRole('radio', { name: 'Virksomheten er avsluttet' }).click();
      });
      cy.findByRole('textbox', { name: /Dato virksomheten ble avsluttet/ }).should('exist');

      cy.withinComponent('Hvorfor sier du opp forsikringen?', () => {
        cy.findByRole('radio', { name: 'Jeg ønsker ikke forsikringen lenger' }).click();
      });
      cy.findByRole('textbox', { name: /Dato virksomheten ble avsluttet/ }).should('not.exist');
    });

    it('shows datoForEndringAvVirksomheten when virksomhetenHarEndretSelskapsform is selected', () => {
      cy.findByRole('textbox', { name: /Dato for endring av virksomheten/ }).should('not.exist');

      cy.withinComponent('Hvorfor sier du opp forsikringen?', () => {
        cy.findByRole('radio', { name: 'Virksomheten har endret selskapsform' }).click();
      });
      cy.findByRole('textbox', { name: /Dato for endring av virksomheten/ }).should('exist');

      cy.withinComponent('Hvorfor sier du opp forsikringen?', () => {
        cy.findByRole('radio', { name: 'Jeg ønsker ikke forsikringen lenger' }).click();
      });
      cy.findByRole('textbox', { name: /Dato for endring av virksomheten/ }).should('not.exist');
    });

    it('shows beskrivGrunnen textarea when annet is selected', () => {
      cy.findByRole('textbox', { name: 'Beskriv grunnen til at du sier opp forsikringen' }).should('not.exist');

      cy.withinComponent('Hvorfor sier du opp forsikringen?', () => {
        cy.findByRole('radio', { name: 'Annet' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv grunnen til at du sier opp forsikringen' }).should('exist');

      cy.withinComponent('Hvorfor sier du opp forsikringen?', () => {
        cy.findByRole('radio', { name: 'Jeg ønsker ikke forsikringen lenger' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv grunnen til at du sier opp forsikringen' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083606?sub=digital');
      cy.defaultWaits();
      cy.clickSaveAndContinue(); // landing page → Veiledning
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – check required declaration checkbox
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).check();
      cy.clickSaveAndContinue();

      // Dine opplysninger – identity is prefilled with Norwegian FNR from mock server;
      // name fields (Fornavn, Etternavn) and FNR are pre-populated → just proceed
      cy.clickSaveAndContinue();

      // Oppsigelse
      cy.findByRole('textbox', { name: /Hvilken dato ønsker du at forsikringen skal opphøre/ }).type('01.01.2026');
      cy.withinComponent('Hvorfor sier du opp forsikringen?', () => {
        cy.findByRole('radio', { name: 'Virksomheten er avsluttet' }).click();
      });
      cy.findByRole('textbox', { name: /Dato virksomheten ble avsluttet/ }).type('01.01.2026');
      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil si opp forsikringen/ }).check();
      cy.clickSaveAndContinue();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Oppsigelse', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hvilken dato ønsker du at forsikringen skal opphøre?');
        cy.get('dd').eq(0).should('contain.text', '01.01.2026');
      });
    });
  });
});
