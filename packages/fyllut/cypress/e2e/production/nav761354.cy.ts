/*
 * Production form tests for Refusjonskrav – Varig tilrettelagt arbeid (VTA) i ordinær virksomhet
 * Form: nav761354
 * Submission types: PAPER
 *
 * Panels:
 *   - Veiledning (veiledning): HTML only, no required fields
 *   - Arbeidsgiver (arbeidsgiver): 9 required fields (textfield, email, phoneNumber, bankAccount), no conditionals
 *   - Deltaker (deltaker): 3 required fields (textfield, fnrfield), no conditionals
 *   - Tiltaket (tiltaket): 6 required fields (textfield, navDatepicker x3, currency x2), no conditionals
 *   - Erklæring (erklaering): 1 required checkbox, no conditionals
 *   - Vedlegg (vedlegg): isAttachmentPanel=true, 1 required attachment
 *
 * 0 conditionals — single summary flow test.
 * Note: Vedlegg has isAttachmentPanel=true and is the last panel.
 * Use cy.clickShowAllSteps() + stepper to navigate to Vedlegg, then one cy.clickNextStep() to reach Oppsummering (Case A).
 */

describe('nav761354', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761354?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // start page → Veiledning (first panel)
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning — HTML only, no required fields
      cy.clickNextStep(); // Veiledning → Arbeidsgiver

      // Arbeidsgiver
      cy.findByRole('textbox', { name: /Navn på arbeidsgiver/ }).type('Test Arbeidsgiver AS');
      cy.findByRole('textbox', { name: 'Postadresse' }).type('Testgata 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0001');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.findByRole('textbox', { name: 'E-post' }).type('test@example.com');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).type('123456789');
      cy.findByRole('textbox', { name: 'Bedriftsnummer' }).type('123456789');
      cy.findByRole('textbox', { name: 'Kontonummer' }).type('01234567892');
      cy.clickNextStep(); // Arbeidsgiver → Deltaker

      // Deltaker
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep(); // Deltaker → Tiltaket

      // Tiltaket
      cy.findByRole('textbox', { name: 'Tilsagnsnummer' }).type('12345');
      cy.findByRole('textbox', { name: /Startdato på arbeidsforholdet/ }).type('01.01.2025');
      cy.findByRole('textbox', { name: /Fra og med dato/ }).type('01.01.2025');
      cy.findByRole('textbox', { name: /Til og med dato/ }).type('31.01.2025');
      cy.findByRole('textbox', { name: 'Tilsagnsbeløp' }).type('10000');
      cy.findByRole('textbox', { name: 'Refusjonsbeløp' }).type('5000');
      cy.clickNextStep(); // Tiltaket → Erklæring

      // Erklæring — check required declaration but do NOT call clickNextStep (isAttachmentPanel follows)
      cy.findByRole('checkbox', { name: /bekrefter/ }).check();

      // Vedlegg — isAttachmentPanel=true, last panel (Case A): use stepper, then one clickNextStep
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });
      cy.clickNextStep(); // Vedlegg → Oppsummering

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Arbeidsgiver', () => {
        cy.get('dt').eq(0).should('contain.text', 'Navn på arbeidsgiver');
        cy.get('dd').eq(0).should('contain.text', 'Test Arbeidsgiver AS');
      });
      cy.withinSummaryGroup('Deltaker', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
    });
  });
});
