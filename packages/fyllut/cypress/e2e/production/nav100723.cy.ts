/*
 * Production form tests for Behov for hjelpemidler knyttet til individuell plan
 * Form: nav100723
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Dine opplysninger (personopplysninger): 3 customConditionals
 *       identitet.harDuFodselsnummer "nei" → adresse (navAddress) shows ("Bor du i Norge?")
 *       identitet.harDuFodselsnummer "ja"  → alertstripe shows ("Nav sender svar på søknad...")
 *       adresse.borDuINorge "nei"          → adresseVarighet shows ("Gyldig fra")
 *   - Fastlege (page4): 1 same-panel conditional
 *       framkommerOpplysningerOmFastlegeIDenIndividuellePlanen "nei" → navSkjemagruppe1
 *           (Fornavn, Etternavn, Arbeidssted, Telefonnummer)
 *
 * Note: Vedlegg has isAttachmentPanel=true and is the last panel.
 *       Use cy.clickShowAllSteps() + stepper link, then ONE cy.clickNextStep() to reach Oppsummering.
 */

describe('nav100723', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100723/personopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows address section when user has no Norwegian fnr', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('hides address section and shows alertstripe when user has Norwegian fnr', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByText(/Nav sender svar/).should('exist');
    });

    it('shows adresseVarighet date fields when living abroad', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('exist');
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');
    });
  });

  describe('Fastlege – conditional fields', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100723/page4?sub=paper');
      cy.defaultWaits();
    });

    it('shows fastlege details when information is not in individual plan', () => {
      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');

      cy.withinComponent('Framkommer opplysninger om fastlege i den individuelle planen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Arbeidssted' }).should('exist');
      cy.findByLabelText('Telefonnummer').should('exist');
    });

    it('hides fastlege details when information is in individual plan', () => {
      cy.withinComponent('Framkommer opplysninger om fastlege i den individuelle planen?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');

      cy.withinComponent('Framkommer opplysninger om fastlege i den individuelle planen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Fornavn' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100723?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // start page → Veiledning
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields
      cy.clickNextStep(); // → Dine opplysninger

      // Dine opplysninger – Norwegian fnr path (navAddress + adresseVarighet stay hidden)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep(); // → Fastlege

      // Fastlege – information is already in the individual plan
      cy.withinComponent('Framkommer opplysninger om fastlege i den individuelle planen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep(); // → Faglig kontaktperson

      // Faglig kontaktperson – fill all required fields
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Kontakt');
      cy.findByRole('textbox', { name: 'Arbeidssted' }).type('Test AS');
      cy.findByRole('textbox', { name: 'Stilling' }).type('Koordinator');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0150');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: /E-post/ }).type('test@example.com');
      cy.clickNextStep(); // → Erklæring

      // Erklæring – check required consent
      cy.findByRole('checkbox', { name: /Jeg samtykker i at NAV Hjelpemiddelsentral/ }).check();

      // Vedlegg – isAttachmentPanel=true (last panel); sequential clickNextStep skips it → use stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Individuell plan/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender/ }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });

      // ONE clickNextStep – Vedlegg is the last panel → goes directly to Oppsummering
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Fastlege', () => {
        cy.get('dt').eq(0).should('contain.text', 'Framkommer opplysninger om fastlege');
        cy.get('dd').eq(0).should('contain.text', 'Ja');
      });
      cy.withinSummaryGroup('Faglig kontaktperson', () => {
        // dt.eq(0) is the navSkjemagruppe legend "Opplysninger om faglig kontaktperson"
        cy.get('dt').eq(1).should('contain.text', 'Fornavn');
        cy.get('dd').eq(1).should('contain.text', 'Kari');
      });
    });
  });
});
