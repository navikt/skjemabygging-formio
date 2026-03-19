/*
 * Production form tests for Søknad om pensjonsopptjening for omsorgsarbeid
 * Form: nav031605
 * Submission types: PAPER, DIGITAL_NO_LOGIN, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 2 same-panel conditionals
 *       identitet.harDuFodselsnummer → adresse (navAddress, show when "nei")
 *       adresse.borDuINorge → adresseVarighet (show when "nei", secondary conditional)
 *   - Omsorgsforholdet (omsorgsforholdet): 1 simple conditional
 *       erOmsorgsforholdetAvsluttet → datoForEventueltOpphor (show when "ja")
 *
 * Note: Vedlegg panel has isAttachmentPanel=true (last panel).
 * Sequential clickNextStep() skips it. Use stepper + ONE clickNextStep() to reach Oppsummering.
 */

describe('nav031605', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav031605/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows address fields when no Norwegian identity number', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });

    it('shows adresseVarighet date fields when borDuINorge is nei', () => {
      // First make adresse visible by selecting Nei for fnr question
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('exist');

      // adresseVarighet (Gyldig fra) not yet visible
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');

      // Select Nei for borDuINorge → adresseVarighet appears
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');

      // Select Ja for borDuINorge → adresseVarighet hidden again
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');
    });
  });

  describe('Omsorgsforholdet – avsluttet conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav031605/omsorgsforholdet?sub=paper');
      cy.defaultWaits();
    });

    it('shows end date when omsorgsforhold is ended', () => {
      cy.findByRole('textbox', { name: /Dato for eventuelt opphør/ }).should('not.exist');

      cy.withinComponent('Er omsorgsforholdet avsluttet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Dato for eventuelt opphør/ }).should('exist');

      cy.withinComponent('Er omsorgsforholdet avsluttet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Dato for eventuelt opphør/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav031605?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – check required confirmation checkbox
      cy.findByRole('checkbox', {
        name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.',
      }).check();
      cy.clickNextStep();

      // Dine opplysninger – use "Ja" (has Norwegian fnr) path
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Personen jeg søker omsorgsopptjening for
      cy.findByRole('textbox', { name: /[Ff]ødselsnummer/ }).type('17912099997');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Barn');
      cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testveien 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0150');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.findByLabelText('Telefonnummer').type('87654321');
      cy.clickNextStep();

      // Omsorgsforholdet – fill required fields (skip calculateValue/disabled sum field)
      cy.findByRole('textbox', { name: 'Kalenderåret søknaden gjelder' }).type('2023');
      cy.findByRole('textbox', { name: /Fra dato.*dd\.mm\.åååå/ }).type('01.01.2023');
      cy.withinComponent('Er omsorgsforholdet avsluttet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Antall timer omsorgsarbeid per uke').type('20');
      cy.findByLabelText('Antall timer reisetid per uke').type('5');
      cy.findByRole('textbox', { name: 'Beskriv omsorgsforholdet' }).type('Testbeskrivelse av omsorgsforhold');

      // Vedlegg – isAttachmentPanel=true (last panel); use stepper to navigate there
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });

      // ONE clickNextStep() needed – Vedlegg is the last panel, Next goes to Oppsummering
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Omsorgsforholdet', () => {
        cy.get('dt').eq(0).should('contain.text', 'Kalenderåret søknaden gjelder');
        cy.get('dd').eq(0).should('contain.text', '2023');
      });
    });
  });
});
