/*
 * Production form tests for Søknad om reisestønad (AAP)
 * Form: nav111205
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 3 conditionals
 *       identitet.harDuFodselsnummer → adresse, adresseVarighet visibility
 *       harIkkeTelefon → telefonnummer visibility (hidden when checked)
 *   - Andre opplysninger (andreOpplysninger): 1 conditional
 *       harDuSupplerendeOpplysningerTilDinSoknad → supplerendeOpplysninger textarea
 *
 * Note: Vedlegg has isAttachmentPanel=true; sequential clickNextStep() skips it.
 * Use cy.clickShowAllSteps() + stepper to navigate there in the summary flow.
 */

describe('nav111205', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111205/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows adresse section when user has no fnr', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('hides adresse section when user has fnr', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });

    it('hides telefonnummer when harIkkeTelefon is checked', () => {
      cy.findByLabelText('Telefonnummer').should('exist');

      cy.findByRole('checkbox', { name: /Har ikke telefon/ }).click();

      cy.findByLabelText('Telefonnummer').should('not.exist');
    });
  });

  describe('Andre opplysninger – supplerende opplysninger conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111205/andreOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows supplerende opplysninger textarea when Ja is selected', () => {
      cy.findByRole('textbox', { name: 'Supplerende opplysninger' }).should('not.exist');

      cy.withinComponent('Har du supplerende opplysninger til din søknad?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Supplerende opplysninger' }).should('exist');
    });

    it('hides supplerende opplysninger textarea when Nei is selected', () => {
      cy.withinComponent('Har du supplerende opplysninger til din søknad?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Supplerende opplysninger' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111205?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields
      cy.clickNextStep();

      // Søknaden – fill required address, period, distance and costs
      cy.findByRole('textbox', { name: 'Adresse til arbeids- eller utdanningssted' }).type('Testveien 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).type('0010');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.findByRole('textbox', { name: /Fra dato.*\(dd\.mm\.åååå\)/i }).type('01.01.2025');
      cy.findByRole('textbox', { name: /Til dato.*\(dd\.mm\.åååå\)/i }).type('31.01.2025');
      cy.findByLabelText('Avstand fra bosted til arbeidssted').type('10');
      cy.findByRole('textbox', { name: 'Ordinære utgifter per måned' }).type('1000');
      cy.findByRole('textbox', { name: 'Nåværende utgifter per måned' }).type('500');
      cy.clickNextStep();

      // Dine opplysninger – fnr path (adresse, adresseVarighet and bokommuneBydel remain hidden)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Andre opplysninger – select Nei to skip the textarea
      cy.withinComponent('Har du supplerende opplysninger til din søknad?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Erklæring – check both required declarations
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at opplysningene er korrekte.' }).check();
      cy.findByRole('checkbox', { name: /Jeg er innforstått med at uriktige/ }).check();

      // Vedlegg – isAttachmentPanel=true; sequential clickNextStep() skips it; use stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Legeerklæring/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender/i }).click();
      });
      cy.findByRole('group', { name: /Dokumentasjon på merutgifter/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender/i }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/i }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Søknaden', () => {
        cy.get('dt').eq(0).should('contain.text', 'Adresse til arbeids- eller utdanningssted');
        cy.get('dd').eq(0).should('contain.text', 'Testveien 1');
      });
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
    });
  });
});
