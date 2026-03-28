/*
 * Production form tests for Inntektsskjema for gårdbrukere - uføretrygd
 * Form: nav120609
 * Submission types: (none — no ?sub= query param)
 *
 * Panels tested:
 *   - Driftsform (page4): 1 same-panel conditional
 *       hvaSlagsNaeringsvirksomhetDriverDu=annet → spesifiserAnnet
 *   - Deltakelse og inntekt (page5): 1 same-panel conditional
 *       deltarDuAktivtIDriften=ja → beskrivArbeidsoppgaverOgArbeidstid
 *   - Om driften (page6): 5 same-panel conditionals
 *       erDriftenNedlagtSolgtEllerOverdratt=ja → fraHvilketTidspunktDdMmAaaa1
 *       planleggerDuAAvvikleSelgeDriften=ja → fraHvilkenDatoDdMmAaaa
 *       harSykdommenPavirketInntektenDeSenereArene=ja → fraHvilketTidspunktDdMmAaaa2
 *       erDriftenEndretEtterAtDuBleSyk…=ja → spesifiserHva
 *       harDuRedusertEgenArbeidsinnsats=ja → hvemHarOvertattDineTidligereArbeidsoppgaver
 *   - Andre opplysninger (page7): 1 same-panel conditional
 *       harDuAndreOpplysningerOmDrift…=ja → beskrivHva
 */

describe('nav120609', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Driftsform – selectboxes conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav120609/page4');
      cy.defaultWaits();
    });

    it('shows spesifiser annet only when Annet is checked', () => {
      cy.findByRole('textbox', { name: 'Spesifiser annet' }).should('not.exist');

      cy.findByRole('checkbox', { name: 'Annet' }).click();
      cy.findByRole('textbox', { name: 'Spesifiser annet' }).should('exist');

      cy.findByRole('checkbox', { name: 'Annet' }).click();
      cy.findByRole('textbox', { name: 'Spesifiser annet' }).should('not.exist');
    });
  });

  describe('Deltakelse og inntekt – deltarDuAktivtIDriften conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav120609/page5');
      cy.defaultWaits();
    });

    it('shows beskriv arbeidsoppgaver only when deltarDuAktivtIDriften is Ja', () => {
      cy.findByRole('textbox', { name: 'Beskriv arbeidsoppgaver og arbeidstid' }).should('not.exist');

      cy.withinComponent('Deltar du aktivt i driften?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv arbeidsoppgaver og arbeidstid' }).should('exist');

      cy.withinComponent('Deltar du aktivt i driften?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv arbeidsoppgaver og arbeidstid' }).should('not.exist');
    });
  });

  describe('Om driften – conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav120609/page6');
      cy.defaultWaits();
    });

    it('shows date when driften er nedlagt, solgt eller overdratt', () => {
      cy.findByLabelText(/Fra hvilket tidspunkt \(dd\.mm\.åååå\)/).should('not.exist');

      cy.withinComponent('Er driften nedlagt, solgt eller overdratt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(/Fra hvilket tidspunkt \(dd\.mm\.åååå\)/).should('exist');

      cy.withinComponent('Er driften nedlagt, solgt eller overdratt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(/Fra hvilket tidspunkt \(dd\.mm\.åååå\)/).should('not.exist');
    });

    it('shows dato when planlegger å avvikle/selge driften', () => {
      cy.findByLabelText(/Fra hvilken dato \(dd\.mm\.åååå\)/).should('not.exist');

      cy.withinComponent('Planlegger du å avvikle/selge driften?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(/Fra hvilken dato \(dd\.mm\.åååå\)/).should('exist');

      cy.withinComponent('Planlegger du å avvikle/selge driften?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(/Fra hvilken dato \(dd\.mm\.åååå\)/).should('not.exist');
    });

    it('shows date when sykdommen har påvirket inntekten', () => {
      cy.withinComponent('Har sykdommen påvirket inntekten de senere årene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(/Fra hvilket tidspunkt \(dd\.mm\.åååå\)/).should('exist');

      cy.withinComponent('Har sykdommen påvirket inntekten de senere årene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(/Fra hvilket tidspunkt \(dd\.mm\.åååå\)/).should('not.exist');
    });

    it('shows spesifiser when driften er endret etter sykdom', () => {
      cy.findByRole('textbox', { name: 'Spesifiser hva' }).should('not.exist');

      cy.withinComponent(/Er driften endret etter at du ble syk/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Spesifiser hva' }).should('exist');

      cy.withinComponent(/Er driften endret etter at du ble syk/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Spesifiser hva' }).should('not.exist');
    });

    it('shows hvem overtok when redusert egen arbeidsinnsats', () => {
      cy.findByRole('textbox', { name: 'Hvem har overtatt dine tidligere arbeidsoppgaver?' }).should('not.exist');

      cy.withinComponent('Har du redusert egen arbeidsinnsats?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvem har overtatt dine tidligere arbeidsoppgaver?' }).should('exist');

      cy.withinComponent('Har du redusert egen arbeidsinnsats?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Hvem har overtatt dine tidligere arbeidsoppgaver?' }).should('not.exist');
    });
  });

  describe('Andre opplysninger – conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav120609/page7');
      cy.defaultWaits();
    });

    it('shows beskriv hva only when harDuAndreOpplysninger is Ja', () => {
      cy.findByRole('textbox', { name: 'Beskriv hva' }).should('not.exist');

      cy.withinComponent(/Har du andre opplysninger om drift/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv hva' }).should('exist');

      cy.withinComponent(/Har du andre opplysninger om drift/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: 'Beskriv hva' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav120609');
      cy.defaultWaits();
      cy.clickNextStep(); // start → Veiledning
    });

    it('fills required fields across all panels and verifies summary', () => {
      // Veiledning — no required fields, advance to Personopplysninger
      cy.clickNextStep();

      // Personopplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByLabelText('Fødselsnummer / D-nummer').type('17912099997');
      cy.clickNextStep();

      // Driftsform — pick Melkeproduksjon to avoid spesifiserAnnet requirement
      cy.findByRole('checkbox', { name: 'Melkeproduksjon' }).click();
      cy.clickNextStep();

      // Deltakelse og inntekt — Nei (hides beskrivArbeidsoppgaver)
      cy.withinComponent('Deltar du aktivt i driften?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Hvor stor pensjonsgivende inntekt har du hatt i inneværende år?').type('200000');
      cy.findByLabelText('Hvor stor pensjonsgivende inntekt forventer du å få per år fremover?').type('180000');
      cy.findByLabelText('Fra hvilket tidspunkt? (dd.mm.åååå)').type('01.01.2020');
      cy.clickNextStep();

      // Om driften — all Nei to skip conditional required fields
      cy.withinComponent('Er driften nedlagt, solgt eller overdratt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Planlegger du å avvikle/selge driften?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har sykdommen påvirket inntekten de senere årene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(/Er driften endret etter at du ble syk/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du redusert egen arbeidsinnsats?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Andre opplysninger — Nei to skip beskrivHva
      cy.withinComponent(/Har du andre opplysninger om drift/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Personopplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });
      cy.withinSummaryGroup('Driftsform', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hva slags næringsvirksomhet driver du?');
        cy.get('dd').eq(0).should('contain.text', 'Melkeproduksjon');
      });
    });
  });
});
