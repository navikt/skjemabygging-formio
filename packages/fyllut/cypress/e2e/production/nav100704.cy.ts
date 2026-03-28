/*
 * Production form tests for Fullmakt i forbindelse med søknad om tekniske hjelpemidler
 * Form: nav100704
 * Submission types: PAPER, DIGITAL_NO_LOGIN
 *
 * Panels tested:
 *   - Veiledning (veiledning): no required fields, no conditionals
 *   - Dine opplysninger (dineOpplysninger): 2 customConditionals
 *       identitet.harDuFodselsnummer → adresse (show when "nei")
 *       adresse.borDuINorge → adresseVarighet (show when "nei")
 *   - Hjelpemidler (hjelpemidler): 1 required textarea, no conditionals
 *   - Fullmakt (fullmakt): 1 required checkbox + required fornavn/etternavn, no conditionals
 *   - Erklæring (erklaering): 4 required checkboxes, no conditionals
 *
 * No isAttachmentPanel panels — sequential clickNextStep() reaches Oppsummering.
 */

describe('nav100704', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – identity and address conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100704/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows adresse section when harDuFodselsnummer is nei', () => {
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
      // First make adresse visible by selecting Nei for fnr
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

      // Select Ja for borDuINorge → adresseVarighet hidden again (no address type chosen)
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100704?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // start page → Veiledning
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields
      cy.clickNextStep();

      // Dine opplysninger – use fnr path (adresse/adresseVarighet stay hidden)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Hjelpemidler – fill required textarea
      cy.findByRole('textbox', { name: 'Beskrivelse av hjelpemidler eller behov' }).type('Rullestol');
      cy.clickNextStep();

      // Fullmakt – check required checkbox and fill fullmektig's name
      cy.findByRole('checkbox', {
        name: 'Jeg gir denne personen fullmakt til å fylle ut, skrive under på og sende søknad til NAV for de hjelpemidlene jeg har oppgitt i dette fullmaktsskjemaet:',
      }).check();
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Hansen');
      cy.clickNextStep();

      // Erklæring – check all 4 required checkboxes
      cy.findByRole('checkbox', {
        name: 'Jeg er klar over at utlånte hjelpemidler er Arbeids- og velferdsetatens eiendom og at de skal tas godt vare på.',
      }).check();
      cy.findByRole('checkbox', {
        name: 'Jeg kan ikke kreve at hjelpemidlene er ubrukte eller av et bestemt merke.',
      }).check();
      cy.findByRole('checkbox', {
        name: 'Når jeg ikke lenger har bruk for et hjelpemiddel skal det leveres tilbake til NAV Hjelpemiddelsentral via kommunehelsetjenesten.',
      }).check();
      cy.findByRole('checkbox', {
        name: 'Jeg er informert om behandling av personopplysninger på hjelpemiddelområdet.',
      }).check();
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Hjelpemidler', () => {
        // navSkjemagruppe legend occupies dt[0]; the textarea label is at dt[1]
        cy.get('dt').eq(1).should('contain.text', 'Beskrivelse av hjelpemidler eller behov');
        cy.get('dd').eq(1).should('contain.text', 'Rullestol');
      });
    });
  });
});
