/*
 * Production form tests for Krav fra arbeidsgiveren om refusjon av sykepenger
 * Form: nav082012
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Opplysninger om arbeidstakeren (opplysningerOmArbeidstakeren): 2 same-panel conditionals
 *       harArbeidstagerNorskFodselsnummerEllerDNummer → fodselsnummerDNummerSoker (Ja)
 *       harArbeidstagerNorskFodselsnummerEllerDNummer → alertstripe2 (Nei)
 *   - Sykefraværet i arbeidsgiverperioden (sykefravaeretIArbeidsgiverperioden): 2 same-panel conditionals
 *       varArbeidstagerenHeltEllerDelvisSykmeldtIPerioden → navSkjemagruppe (Helt sykmeldt)
 *       varArbeidstagerenHeltEllerDelvisSykmeldtIPerioden → navSkjemagruppe1 (Delvis sykmeldt)
 *
 * Note: Vedlegg has isAttachmentPanel=true (last panel). Sequential clickNextStep() skips it.
 * Use cy.clickShowAllSteps() + stepper to navigate there, then one clickNextStep() to reach Oppsummering.
 */

describe('nav082012', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Opplysninger om arbeidstakeren – fnr conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav082012/opplysningerOmArbeidstakeren?sub=paper');
      cy.defaultWaits();
    });

    it('shows fnr field when arbeidstaker har fødselsnummer', () => {
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');

      cy.withinComponent('Har arbeidstakeren norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');

      cy.withinComponent('Har arbeidstakeren norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
    });

    it('shows warning alertstripe when arbeidstaker ikke har fødselsnummer', () => {
      cy.contains('Arbeidstaker må ha norsk fødselsnummer').should('not.exist');

      cy.withinComponent('Har arbeidstakeren norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.contains('Arbeidstaker må ha norsk fødselsnummer').should('exist');

      cy.withinComponent('Har arbeidstakeren norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.contains('Arbeidstaker må ha norsk fødselsnummer').should('not.exist');
    });
  });

  describe('Sykefraværet i arbeidsgiverperioden – sykmeldt-type conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav082012/sykefravaeretIArbeidsgiverperioden?sub=paper');
      cy.defaultWaits();
    });

    it('shows helt-sykmeldt date fields when helt sykmeldt is selected', () => {
      cy.findByRole('textbox', { name: 'F.o.m. dato (dd.mm.åååå)' }).should('not.exist');

      cy.withinComponent('Var arbeidstakeren helt eller delvis sykmeldt i perioden?', () => {
        cy.findByRole('radio', { name: 'Helt sykmeldt' }).click();
      });

      cy.findAllByRole('textbox', { name: 'F.o.m. dato (dd.mm.åååå)' }).should('have.length', 1);
      cy.findAllByRole('textbox', { name: 'T.o.m. dato (dd.mm.åååå)' }).should('have.length', 1);
      cy.findByRole('textbox', { name: 'Sykmeldingsgrad' }).should('not.exist');
    });

    it('shows delvis-sykmeldt date fields and sykmeldingsgrad when delvis sykmeldt is selected', () => {
      cy.withinComponent('Var arbeidstakeren helt eller delvis sykmeldt i perioden?', () => {
        cy.findByRole('radio', { name: 'Delvis sykmeldt' }).click();
      });

      cy.findAllByRole('textbox', { name: 'F.o.m. dato (dd.mm.åååå)' }).should('have.length', 1);
      cy.findAllByRole('textbox', { name: 'T.o.m. dato (dd.mm.åååå)' }).should('have.length', 1);
      cy.findByRole('textbox', { name: 'Sykmeldingsgrad' }).should('exist');

      cy.withinComponent('Var arbeidstakeren helt eller delvis sykmeldt i perioden?', () => {
        cy.findByRole('radio', { name: 'Helt sykmeldt' }).click();
      });
      cy.findByRole('textbox', { name: 'Sykmeldingsgrad' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav082012?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields
      cy.clickNextStep();

      // Sykdom
      cy.withinComponent('For hvilken sykdom gjelder søknaden?', () => {
        cy.findByRole('radio', { name: 'Langvarig eller kronisk sykdom' }).click();
      });
      cy.clickNextStep();

      // Opplysninger om arbeidstakeren – use fnr path
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har arbeidstakeren norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Sykefraværet i arbeidsgiverperioden – helt sykmeldt path
      cy.findByRole('textbox', { name: 'Når startet arbeidsforholdet? Dato (dd.mm.åååå)' }).type('01.01.2020');
      cy.withinComponent('Var arbeidstakeren helt eller delvis sykmeldt i perioden?', () => {
        cy.findByRole('radio', { name: 'Helt sykmeldt' }).click();
      });
      cy.findByRole('textbox', { name: 'F.o.m. dato (dd.mm.åååå)' }).type('01.01.2025');
      cy.findByRole('textbox', { name: 'T.o.m. dato (dd.mm.åååå)' }).type('16.01.2025');
      cy.findByRole('textbox', {
        name: 'Gjennomsnittlig månedlig arbeidsinntekt før arbeidstakeren ble arbeidsufør',
      }).type('50000');
      cy.findByRole('textbox', { name: 'Antall lønnsdager per år' }).type('260');
      cy.clickNextStep();

      // Refusjonskrav for arbeidsgiverperioden
      cy.findByRole('textbox', { name: /Utbetalte sykepenger i arbeidsgiverperioden/ }).type('20000');
      cy.findByRole('textbox', { name: 'Refusjonskrav' }).type('20000');
      cy.findByRole('textbox', { name: 'Antall dager du krever refusjon for' }).type('16');
      cy.clickNextStep();

      // Opplysninger om arbeidsgiveren – fill without clicking Next (Vedlegg is isAttachmentPanel)
      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).type('Test AS');
      cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).type('974760673');

      // Vedlegg – isAttachmentPanel=true skips this panel via sequential Next; use stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });

      // One clickNextStep from Vedlegg (last panel) → Oppsummering
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Sykdom', () => {
        cy.get('dt').eq(0).should('contain.text', 'For hvilken sykdom gjelder søknaden?');
        cy.get('dd').eq(0).should('contain.text', 'Langvarig eller kronisk sykdom');
      });
      cy.withinSummaryGroup('Opplysninger om arbeidstakeren', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
    });
  });
});
