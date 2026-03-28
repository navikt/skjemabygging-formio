/*
 * Production form tests for Refusjonskrav - inkluderingstilskudd
 * Form: nav761389
 * Submission types: PAPER
 *
 * Panels:
 *   - Veiledning (veiledning): no form fields — skipped via clickNextStep()
 *   - Arbeidstaker/tiltaksdeltaker (arbeidstakerTiltaksdeltaker): 3 required fields, no conditionals
 *   - Arbeidsgiver (arbeidsgiver): 7 required fields, no conditionals
 *   - Refusjonskrav (refusjonskrav): 3 same-panel conditionals
 *       girVedlagtDokumentasjonTilstrekkeligInformasjonOmUtgiftene (nei)
 *         → beskrivHvaVedlagtDokumentasjonIkkeGirTilstrekkeligInformasjonOm
 *       starBetalingsdatoPaVedlagtDokumentasjon (nei) → oppgiBetalingsdatoDdMmAaaa
 *       erBelopForRefusjonskravetSkrevetTydeligPaVedlagtDokumentasjon (nei) → belopForRefusjonskravet
 *   - Erklæring (erklaering): 1 required checkbox, no conditionals
 *   - Vedlegg (vedlegg): isAttachmentPanel=true, 2 required attachments — navigated via stepper
 */

describe('nav761389', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Refusjonskrav conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761389/refusjonskrav?sub=paper');
      cy.defaultWaits();
    });

    it('shows beskriv-field when dokumentasjon ikke gir tilstrekkelig informasjon', () => {
      cy.findByRole('textbox', { name: /Beskriv hva vedlagt dokumentasjon ikke gir/ }).should('not.exist');

      cy.findByLabelText(/Gir.*vedlagt dokumentasjon tilstrekkelig informasjon om utgiftene/)
        .closest('.form-group')
        .within(() => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        });

      cy.findByRole('textbox', { name: /Beskriv hva vedlagt dokumentasjon ikke gir/ }).should('exist');

      cy.findByLabelText(/Gir.*vedlagt dokumentasjon tilstrekkelig informasjon om utgiftene/)
        .closest('.form-group')
        .within(() => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        });

      cy.findByRole('textbox', { name: /Beskriv hva vedlagt dokumentasjon ikke gir/ }).should('not.exist');
    });

    it('shows betalingsdato-field when betalingsdato ikke er skrevet på dokumentasjon', () => {
      cy.findByRole('textbox', { name: /Oppgi betalingsdato/ }).should('not.exist');

      cy.withinComponent('Står betalingsdato skrevet på vedlagt dokumentasjon?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Oppgi betalingsdato/ }).should('exist');

      cy.withinComponent('Står betalingsdato skrevet på vedlagt dokumentasjon?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Oppgi betalingsdato/ }).should('not.exist');
    });

    it('shows beløp-field when beløp ikke er skrevet tydelig på dokumentasjon', () => {
      cy.findByRole('textbox', { name: /Beløp for refusjonskravet/ }).should('not.exist');

      cy.withinComponent('Er beløp for refusjonskravet skrevet tydelig på vedlagt dokumentasjon?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: /Beløp for refusjonskravet/ }).should('exist');

      cy.withinComponent('Er beløp for refusjonskravet skrevet tydelig på vedlagt dokumentasjon?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Beløp for refusjonskravet/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761389?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // skip Veiledning
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning — no fields, navigate forward
      cy.clickNextStep();

      // Arbeidstaker/tiltaksdeltaker
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.clickNextStep();

      // Arbeidsgiver
      cy.findByRole('textbox', { name: 'Bedriftens navn' }).type('Test AS');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.findByRole('textbox', { name: 'Hovedenhetens organisasjonsnummer' }).type('123456789');
      cy.findByRole('textbox', { name: 'Underenhetens organisasjonsnummer' }).type('987654321');
      cy.findByRole('textbox', { name: 'Kontonummer' }).type('01234567892');
      cy.findByRole('textbox', { name: 'Kontaktperson hos arbeidsgiver' }).type('Kari Nordmann');
      cy.findByRole('textbox', { name: /[Ee]-post/ }).type('test@example.com');
      cy.clickNextStep();

      // Refusjonskrav — select 'Ja' for all three radiopanels (conditional fields stay hidden)
      cy.findByRole('textbox', { name: 'Tilsagnsnummer' }).type('12345');
      cy.findByRole('textbox', {
        name: 'Hvilke utgifter skal inkluderingstilskuddet dekke?',
      }).type('Arbeidsutstyr');
      cy.findByLabelText(/Gir.*vedlagt dokumentasjon tilstrekkelig informasjon om utgiftene/)
        .closest('.form-group')
        .within(() => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        });
      cy.withinComponent('Står betalingsdato skrevet på vedlagt dokumentasjon?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Er beløp for refusjonskravet skrevet tydelig på vedlagt dokumentasjon?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      // Erklæring — check required declaration; do NOT click Next (use stepper for Vedlegg)
      cy.findByRole('checkbox', { name: /Jeg bekrefter/ }).check();

      // Vedlegg — isAttachmentPanel=true (last panel); navigate via stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Kvittering eller faktura/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender/i }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/i }).click();
      });

      // One clickNextStep — Vedlegg is the last panel before Oppsummering
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');

      cy.withinSummaryGroup('Arbeidstaker/tiltaksdeltaker', () => {
        cy.get('dt').eq(1).should('contain.text', 'Fornavn');
        cy.get('dd').eq(1).should('contain.text', 'Ola');
      });

      cy.withinSummaryGroup('Arbeidsgiver', () => {
        cy.get('dt').eq(0).should('contain.text', 'Bedriftens navn');
        cy.get('dd').eq(0).should('contain.text', 'Test AS');
      });

      cy.withinSummaryGroup('Refusjonskrav', () => {
        cy.get('dt').eq(0).should('contain.text', 'Tilsagnsnummer');
        cy.get('dd').eq(0).should('contain.text', '12345');
      });
    });
  });
});
