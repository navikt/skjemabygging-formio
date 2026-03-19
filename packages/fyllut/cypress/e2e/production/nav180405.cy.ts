/*
 * Production form tests for Søknad om barnepensjon etter fylte 18 år
 * Form: nav180405
 * Submission types: PAPER, DIGITAL, DIGITAL_NO_LOGIN
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 2 customConditionals
 *       identitet.harDuFodselsnummer → adresse (navAddress) visibility
 *       adresse.borDuINorge → adresseVarighet (Gyldig fra date) visibility
 *   - Barnepensjon (page4): 2 same-panel simple conditionals via selectboxes
 *       hvorforSokerDuOmBarnepensjonEtterFylte18Ar=jegTarUtdanning → hvorMangeProsentUtgjorUtdanningen, harDuLonnsinntekt
 *       + 4 cross-panel triggers to Vedlegg (isAttachmentPanel=true)
 *   - Vedlegg (panel): 4 conditional attachments driven by Barnepensjon choices
 *       bekreftelsePaSkoleplass: jegTarUtdanning
 *       laerlingkontrakt: jegErLaerling
 *       kopiAvAvtaleOmPraksisplassPraktikantavtale: jegHarPraksisplassEllerErPraktikant
 *       dokumentasjonPaInntekt: jegErLaerling || jegHarPraksisplassEllerErPraktikant || harDuLonnsinntekt=ja
 */

describe('nav180405', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav180405/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows adresse when no fnr', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('hides adresse when fnr is provided', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });

    it('shows adresseVarighet date field when not living in Norway', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');
    });
  });

  describe('Barnepensjon – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav180405/page4?sub=paper');
      cy.defaultWaits();
    });

    it('shows utdanning fields when jegTarUtdanning is checked', () => {
      cy.findByLabelText('Hvor mye tid bruker du på utdanningen?').should('not.exist');
      cy.findByLabelText('Har du lønnsinntekt?').should('not.exist');

      cy.findByRole('group', { name: 'Hvorfor søker du om barnepensjon etter fylte 18 år?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Jeg tar utdanning' }).check();
      });

      cy.findByLabelText('Hvor mye tid bruker du på utdanningen?').should('exist');
      cy.findByLabelText('Har du lønnsinntekt?').should('exist');
    });

    it('does not show utdanning fields for jegErLaerling only', () => {
      cy.findByRole('group', { name: 'Hvorfor søker du om barnepensjon etter fylte 18 år?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Jeg er lærling' }).check();
      });

      cy.findByLabelText('Hvor mye tid bruker du på utdanningen?').should('not.exist');
      cy.findByLabelText('Har du lønnsinntekt?').should('not.exist');
    });
  });

  describe('Vedlegg – cross-panel conditionals from Barnepensjon', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav180405/page4?sub=paper');
      cy.defaultWaits();
    });

    it('shows bekreftelsePaSkoleplass attachment for jegTarUtdanning', () => {
      cy.findByRole('group', { name: 'Hvorfor søker du om barnepensjon etter fylte 18 år?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Jeg tar utdanning' }).check();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByLabelText(/Bekreftelse på skoleplass/).should('exist');
      cy.findByLabelText(/Kopi av lærlingkontrakt/).should('not.exist');
      cy.findByLabelText(/Kopi av avtale om praksisplass/).should('not.exist');
    });

    it('shows laerlingkontrakt and dokumentasjonPaInntekt for jegErLaerling', () => {
      cy.findByRole('group', { name: 'Hvorfor søker du om barnepensjon etter fylte 18 år?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Jeg er lærling' }).check();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByLabelText(/Kopi av lærlingkontrakt/).should('exist');
      cy.findByLabelText(/Dokumentasjon på inntekt/).should('exist');
      cy.findByLabelText(/Bekreftelse på skoleplass/).should('not.exist');
    });

    it('shows praksisplass attachment and dokumentasjonPaInntekt for jegHarPraksisplassEllerErPraktikant', () => {
      cy.findByRole('group', { name: 'Hvorfor søker du om barnepensjon etter fylte 18 år?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Jeg har praksisplass eller er praktikant' }).check();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByLabelText(/Kopi av avtale om praksisplass/).should('exist');
      cy.findByLabelText(/Dokumentasjon på inntekt/).should('exist');
      cy.findByLabelText(/Bekreftelse på skoleplass/).should('not.exist');
    });

    it('shows dokumentasjonPaInntekt when harDuLonnsinntekt is ja', () => {
      cy.findByRole('group', { name: 'Hvorfor søker du om barnepensjon etter fylte 18 år?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Jeg tar utdanning' }).check();
      });

      cy.withinComponent('Har du lønnsinntekt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByLabelText(/Dokumentasjon på inntekt/).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav180405?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // root screen → Veiledning
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – HTML only, proceed
      cy.clickNextStep();

      // Dine opplysninger – use fnr path (hides adresse/adresseVarighet)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Kontonummer for utbetaling' }).type('01234567892');
      cy.clickNextStep();

      // Barnepensjon – select jegTarUtdanning, fill conditional fields
      cy.findByRole('group', { name: 'Hva er din situasjon?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Jeg er foreldreløs' }).check();
      });
      cy.findByRole('group', { name: 'Hvorfor søker du om barnepensjon etter fylte 18 år?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Jeg tar utdanning' }).check();
      });
      cy.withinComponent('Hvor mye tid bruker du på utdanningen?', () => {
        cy.findByRole('radio', { name: '50% eller mer' }).click();
      });
      cy.withinComponent('Har du lønnsinntekt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep(); // page4 (Barnepensjon) → page5 (Erklæring) — Vedlegg skipped by clickNextStep

      // Erklæring – fill required navCheckbox fields before navigating to Vedlegg
      cy.findByRole('checkbox', { name: /Jeg er kjent med at NAV kan innhente/ }).click();
      cy.findByRole('checkbox', { name: /Jeg bekrefter at opplysningene er gitt/ }).click();

      // Navigate to Vedlegg via stepper (isAttachmentPanel=true, only reachable via stepper)
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // Fill Vedlegg – only bekreftelsePaSkoleplass and annenDokumentasjon are shown
      cy.findByRole('group', { name: /Bekreftelse på skoleplass/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep(); // Vedlegg → Oppsummering

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });
    });
  });
});
