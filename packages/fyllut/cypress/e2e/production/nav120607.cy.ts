/*
 * Production form tests for Inntektsskjema for næringsdrivende og ansatt i eget aksjeselskap - uføretrygd
 * Form: nav120607
 * Submission types: (none — no ?sub= query param)
 *
 * Panels tested:
 *   - Næringsvirksomhet (page4): 3 same-panel conditionals
 *       hvaSlagsNaeringsvirksomhetDriverDu=annenVirksomhet → hvilkenAnnenVirksomhet
 *       hvaSlagsNaeringsvirksomhetDriverDu=aksjeselskap → harDuAksjerISelskapet, farDuUtbetaltAksjeutbytte
 *   - Deltakelse og inntekt (page5): 1 same-panel conditional
 *       deltarDuAktivtIDriften=ja → beskrivArbeidsoppgaverOgArbeidstid
 *   - Om driften av virksomheten (page6): 5 same-panel conditionals
 *       erVirksomhetenNedlagtAvvikletOverdrattEllerSolgt=ja → fraHvilketTidspunktDdMmAaaa1
 *       erVirksomhetenNedlagtAvvikletOverdrattEllerSolgt=nei → hvorforErIkkeVirksomheten, planleggerDuAAvvikleSelgeDriften
 *       planleggerDuAAvvikleSelgeDriften=ja → fraHvilketTidspunktDdMmAaaa2
 *       harSykdommenPavirketInntektenDeSenereArene=ja → fraHvilketTidspunktDdMmAaaa3
 *       erDriftenEndret...=ja → fraHvilketTidspunktDdMmAaaa4
 *       harDuRedusertEgenArbeidsinnsats=ja → hvemHarOvertattDineTidligereArbeidsoppgaver
 *   - Andre opplysninger (page7): 1 same-panel conditional
 *       harDuAndreOpplysninger=ja → beskrivHva
 */

describe('nav120607', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Næringsvirksomhet – selectboxes conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav120607/page4');
      cy.defaultWaits();
    });

    it('shows "Hvilken annen virksomhet?" only when "Annen virksomhet" is checked', () => {
      cy.findByRole('textbox', { name: 'Hvilken annen virksomhet?' }).should('not.exist');

      cy.findByRole('checkbox', { name: 'Annen virksomhet' }).click();
      cy.findByRole('textbox', { name: 'Hvilken annen virksomhet?' }).should('exist');

      cy.findByRole('checkbox', { name: 'Annen virksomhet' }).click();
      cy.findByRole('textbox', { name: 'Hvilken annen virksomhet?' }).should('not.exist');
    });

    it('shows aksjeselskap fields only when "Aksjeselskap" is checked', () => {
      cy.findByLabelText('Har du aksjer i selskapet?').should('not.exist');
      cy.findByLabelText('Får du utbetalt aksjeutbytte?').should('not.exist');

      cy.findByRole('checkbox', { name: 'Aksjeselskap' }).click();
      cy.findByLabelText('Har du aksjer i selskapet?').should('exist');
      cy.findByLabelText('Får du utbetalt aksjeutbytte?').should('exist');

      cy.findByRole('checkbox', { name: 'Aksjeselskap' }).click();
      cy.findByLabelText('Har du aksjer i selskapet?').should('not.exist');
      cy.findByLabelText('Får du utbetalt aksjeutbytte?').should('not.exist');
    });
  });

  describe('Deltakelse og inntekt – deltarDuAktivtIDriften conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav120607/page5');
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

  describe('Om driften av virksomheten – conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav120607/page6');
      cy.defaultWaits();
    });

    it('shows date when virksomheten er nedlagt, hides Hvorfor/planlegger', () => {
      cy.findByLabelText(/Fra hvilket tidspunkt \(dd\.mm\.åååå\)/).should('not.exist');
      cy.findByLabelText(/Hvorfor er ikke virksomheten\s+nedlagt/).should('not.exist');
      cy.findByLabelText('Planlegger du å avvikle/selge driften?').should('not.exist');

      cy.withinComponent(/Er virksomheten nedlagt, avviklet,\s+overdratt eller solgt\?/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(/Fra hvilket tidspunkt \(dd\.mm\.åååå\)/).should('exist');
      cy.findByLabelText(/Hvorfor er ikke virksomheten\s+nedlagt/).should('not.exist');
      cy.findByLabelText('Planlegger du å avvikle/selge driften?').should('not.exist');
    });

    it('shows Hvorfor and planlegger when virksomheten ikke nedlagt', () => {
      cy.withinComponent(/Er virksomheten nedlagt, avviklet,\s+overdratt eller solgt\?/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(/Hvorfor er ikke virksomheten\s+nedlagt/).should('exist');
      cy.findByLabelText('Planlegger du å avvikle/selge driften?').should('exist');
      cy.findByLabelText(/Fra hvilket tidspunkt \(dd\.mm\.åååå\)/).should('not.exist');
    });

    it('shows date when planlegger å avvikle/selge driften', () => {
      cy.withinComponent(/Er virksomheten nedlagt, avviklet,\s+overdratt eller solgt\?/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(/Fra hvilket tidspunkt \(dd\.mm\.åååå\)/).should('not.exist');

      cy.withinComponent('Planlegger du å avvikle/selge driften?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(/Fra hvilket tidspunkt \(dd\.mm\.åååå\)/).should('exist');

      cy.withinComponent('Planlegger du å avvikle/selge driften?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(/Fra hvilket tidspunkt \(dd\.mm\.åååå\)/).should('not.exist');
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

    it('shows date when driften er endret etter sykdom', () => {
      cy.withinComponent(/Er driften endret etter at du ble syk/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(/Fra hvilket tidspunkt \(dd\.mm\.åååå\)/).should('exist');

      cy.withinComponent(/Er driften endret etter at du ble syk/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(/Fra hvilket tidspunkt \(dd\.mm\.åååå\)/).should('not.exist');
    });

    it('shows hvem overtatt arbeidsoppgaver when arbeidsinnsats er redusert', () => {
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
      cy.visit('/fyllut/nav120607/page7');
      cy.defaultWaits();
    });

    it('shows "Beskriv hva" only when harDuAndreOpplysninger is Ja', () => {
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
      cy.visit('/fyllut/nav120607');
      cy.defaultWaits();
      cy.clickNextStep(); // Veiledning → Personopplysninger
    });

    it('fills required fields across all panels and verifies summary', () => {
      // Veiledning — no required fields, advance to Personopplysninger
      cy.clickNextStep();

      // Personopplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByLabelText('Fødselsnummer / D-nummer').type('17912099997');
      cy.clickNextStep();

      // Næringsvirksomhet — Enkeltpersonforetak (no extra conditional required fields)
      cy.findByRole('checkbox', { name: 'Enkeltpersonforetak' }).click();
      cy.clickNextStep();

      // Deltakelse og inntekt — Nei (hides beskrivArbeidsoppgaver textarea)
      cy.withinComponent('Deltar du aktivt i driften?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Hvor stor pensjonsgivende inntekt har du hatt i inneværende år?').type('500000');
      cy.findByLabelText('Hvor stor pensjonsgivende inntekt forventer du å få per år fremover?').type('500000');
      cy.findByLabelText('Fra hvilket tidspunkt? (dd.mm.åååå)').type('01.01.2025');
      cy.clickNextStep();

      // Om driften av virksomheten — Ja (shows only fraHvilketTidspunktDdMmAaaa1)
      cy.withinComponent(/Er virksomheten nedlagt, avviklet,\s+overdratt eller solgt\?/, () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(/Fra hvilket tidspunkt \(dd\.mm\.åååå\)/).type('01.06.2024');
      cy.withinComponent('Er det overskudd i næringsinntekten som føres tilbake i virksomheten?', () => {
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

      // Andre opplysninger — Nei (hides beskrivHva)
      cy.withinComponent(/Har du andre opplysninger om drift/, () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Personopplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Næringsvirksomhet', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hva slags næringsvirksomhet driver du?');
        cy.get('dd').eq(0).should('contain.text', 'Enkeltpersonforetak');
      });
    });
  });
});
