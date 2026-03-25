/*
 * Production form tests for Inntektsmelding for sykmeldt arbeidstaker
 * Form: nav083001
 * Submission types: PAPER
 *
 * Panel-level conditionals (4 panels only visible when ambassadeQuestion = "ja"):
 *   opplysningerOmArbeidstaker, omArbeidsgiver, omArbeidsforholdet, opplysningerOmLonn
 *
 * Panels tested:
 *   - Veiledning (veiledning): 2 simple conditionals + 4 panel-level conditionals
 *       arbeiderDuEllerDen... → alertstripe (show when "nei"), hvorArbeiderDu (show when "ja")
 *       ambassadeQuestion → all 4 subsequent panels shown/hidden in stepper
 *   - Om arbeidsgiver (omArbeidsgiver): 1 cross-panel conditional
 *       hvorArbeiderDu → orgNr (show when "arbeidstakerenJobberVedEnAmbassade")
 *   - Opplysninger om lønn (opplysningerOmLonn): 14 simple conditionals
 *       utbetalesSykepengerIArbeidsgiverperioden → bruttoUtbetalt (ja), velgBegrunnelse + giEnForklaring (nei)
 *       utbetalerArbeidsgiverFullLonnI... → oppgiRefusjonsbeløp + erDetEndringer + hvorLenge (ja), alertstripe2 (nei)
 *       erDetEndringerIRefusjonskravetIFravaersperioden → endringerIRefusjonskrav datagrid (ja)
 *       hvorLengeForskuttererArbeidsgiverLonn → arbeidsgiverForskuttererDate (ja)
 *       harArbeidstakerenNaturalytelserSomFallerBortUnderFravaeret → naturalytelser datagrid + farArbeidstakeren (ja)
 *       betalesVederlagForNaturalytelsenUnderFravaeret → betalesVederlagHeleFravaeret radiopanel (ja)
 *       betalesVederlagForNaturalytelsenUnderHeleFravaeretEllerTilEnGittDato → datoDdMmAaaa (tilOgMedEnGittDato)
 *       farArbeidstakerenTilbakeNaturalytelsenIgjen → arbeidstakerenMottarIgjen datagrid (ja)
 */

describe('nav083001', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Veiledning – ambassade conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083001/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows alertstripe when not at embassy and hides it when ja', () => {
      cy.contains('Du må sende digital inntektsmelding').should('not.exist');

      cy.withinComponent(
        'Arbeider arbeidstaker ved en ambassade eller i virksomhet til ikke-næringsdrivende person?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );

      cy.contains('Du må sende digital inntektsmelding').should('exist');

      cy.withinComponent(
        'Arbeider arbeidstaker ved en ambassade eller i virksomhet til ikke-næringsdrivende person?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );

      cy.contains('Du må sende digital inntektsmelding').should('not.exist');
    });

    it('shows hvorArbeiderDu when ja and hides when nei', () => {
      cy.findByLabelText('Hvor jobber arbeidstakeren?').should('not.exist');

      cy.withinComponent(
        'Arbeider arbeidstaker ved en ambassade eller i virksomhet til ikke-næringsdrivende person?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );

      cy.findByLabelText('Hvor jobber arbeidstakeren?').should('exist');

      cy.withinComponent(
        'Arbeider arbeidstaker ved en ambassade eller i virksomhet til ikke-næringsdrivende person?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );

      cy.findByLabelText('Hvor jobber arbeidstakeren?').should('not.exist');
    });

    it('hides all form panels when not at embassy and shows them when ja', () => {
      cy.withinComponent(
        'Arbeider arbeidstaker ved en ambassade eller i virksomhet til ikke-næringsdrivende person?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Opplysninger om arbeidstaker' }).should('not.exist');
      cy.findByRole('link', { name: 'Opplysninger om lønn' }).should('not.exist');

      cy.withinComponent(
        'Arbeider arbeidstaker ved en ambassade eller i virksomhet til ikke-næringsdrivende person?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.withinComponent('Hvor jobber arbeidstakeren?', () => {
        cy.findByRole('radio', { name: 'Arbeidstakeren jobber ved en ambassade' }).click();
      });
      cy.findByRole('link', { name: 'Opplysninger om arbeidstaker' }).should('exist');
      cy.findByRole('link', { name: 'Opplysninger om lønn' }).should('exist');
    });
  });

  describe('Om arbeidsgiver – cross-panel orgNr conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083001/veiledning?sub=paper');
      cy.defaultWaits();
    });

    it('shows orgNr on Om arbeidsgiver when arbeidstaker jobber ved ambassade', () => {
      cy.withinComponent(
        'Arbeider arbeidstaker ved en ambassade eller i virksomhet til ikke-næringsdrivende person?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.withinComponent('Hvor jobber arbeidstakeren?', () => {
        cy.findByRole('radio', { name: 'Arbeidstakeren jobber ved en ambassade' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Om arbeidsgiver' }).click();

      cy.findByLabelText(/Organisasjonsnummer for underenheten/).should('exist');
    });

    it('hides orgNr on Om arbeidsgiver when arbeidstaker jobber i virksomhet', () => {
      cy.withinComponent(
        'Arbeider arbeidstaker ved en ambassade eller i virksomhet til ikke-næringsdrivende person?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.withinComponent('Hvor jobber arbeidstakeren?', () => {
        cy.findByRole('radio', {
          name: 'Arbeidstakeren jobber i virksomheten til en ikke-næringsdrivende person',
        }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Om arbeidsgiver' }).click();

      cy.findByLabelText(/Organisasjonsnummer for underenheten/).should('not.exist');
    });
  });

  describe('Opplysninger om lønn – full lønn i arbeidsgiverperioden', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083001/veiledning?sub=paper');
      cy.defaultWaits();
      cy.withinComponent(
        'Arbeider arbeidstaker ved en ambassade eller i virksomhet til ikke-næringsdrivende person?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.withinComponent('Hvor jobber arbeidstakeren?', () => {
        cy.findByRole('radio', { name: 'Arbeidstakeren jobber ved en ambassade' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Opplysninger om lønn' }).click();
    });

    it('shows bruttoUtbetalt when full lønn er utbetalt', () => {
      cy.findByRole('textbox', { name: 'Brutto utbetalt i arbeidsgiverperioden' }).should('not.exist');

      cy.withinComponent('Er det utbetalt full lønn i arbeidsgiverperioden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Brutto utbetalt i arbeidsgiverperioden' }).should('exist');
    });

    it('shows begrunnelse and forklaring when full lønn ikke er utbetalt', () => {
      cy.findByLabelText('Velg begrunnelse for ingen eller redusert utbetaling').should('not.exist');
      cy.findByRole('textbox', {
        name: 'Gi en forklaring for hvorfor det ikke er utbetalt full lønn i arbeidsgiverperioden',
      }).should('not.exist');

      cy.withinComponent('Er det utbetalt full lønn i arbeidsgiverperioden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Velg begrunnelse for ingen eller redusert utbetaling').should('exist');
      cy.findByRole('textbox', {
        name: 'Gi en forklaring for hvorfor det ikke er utbetalt full lønn i arbeidsgiverperioden',
      }).should('exist');
    });
  });

  describe('Opplysninger om lønn – refusjonskrav conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083001/veiledning?sub=paper');
      cy.defaultWaits();
      cy.withinComponent(
        'Arbeider arbeidstaker ved en ambassade eller i virksomhet til ikke-næringsdrivende person?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.withinComponent('Hvor jobber arbeidstakeren?', () => {
        cy.findByRole('radio', { name: 'Arbeidstakeren jobber ved en ambassade' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Opplysninger om lønn' }).click();
    });

    it('hides refusjon fields and shows alertstripe when utbetalerAG = nei', () => {
      cy.findByRole('textbox', { name: 'Oppgi refusjonsbeløpet per måned' }).should('not.exist');

      cy.withinComponent(
        'Utbetaler arbeidsgiver lønn under hele eller deler av fraværet og kreves det refusjon?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );

      cy.findByRole('textbox', { name: 'Oppgi refusjonsbeløpet per måned' }).should('not.exist');
      cy.contains('Nav får overført skattekortopplysinger').should('exist');
    });

    it('shows refusjon fields when utbetalerAG = ja', () => {
      cy.withinComponent(
        'Utbetaler arbeidsgiver lønn under hele eller deler av fraværet og kreves det refusjon?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );

      cy.findByRole('textbox', { name: 'Oppgi refusjonsbeløpet per måned' }).should('exist');
      cy.findByLabelText('Er det endringer i refusjonskravet i fraværsperioden?').should('exist');
      cy.findByLabelText('Opphører refusjonskravet i perioden?').should('exist');
    });

    it('shows endringerIRefusjonskrav datagrid when erDetEndringer = ja', () => {
      cy.withinComponent(
        'Utbetaler arbeidsgiver lønn under hele eller deler av fraværet og kreves det refusjon?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.findByRole('textbox', { name: 'Nytt refusjonsbeløp' }).should('not.exist');

      cy.withinComponent('Er det endringer i refusjonskravet i fraværsperioden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Nytt refusjonsbeløp' }).should('exist');
    });

    it('shows refusjon stopp date when opphører refusjonskrav = ja', () => {
      cy.withinComponent(
        'Utbetaler arbeidsgiver lønn under hele eller deler av fraværet og kreves det refusjon?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.findByRole('textbox', { name: /Oppgi den siste dagen det kreves refusjon for/ }).should('not.exist');

      cy.withinComponent('Opphører refusjonskravet i perioden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Oppgi den siste dagen det kreves refusjon for/ }).should('exist');
    });
  });

  describe('Opplysninger om lønn – naturalytelser conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083001/veiledning?sub=paper');
      cy.defaultWaits();
      cy.withinComponent(
        'Arbeider arbeidstaker ved en ambassade eller i virksomhet til ikke-næringsdrivende person?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.withinComponent('Hvor jobber arbeidstakeren?', () => {
        cy.findByRole('radio', { name: 'Arbeidstakeren jobber ved en ambassade' }).click();
      });
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Opplysninger om lønn' }).click();
    });

    it('shows naturalytelser datagrid and farArbeidstakeren when harNaturalytelser = ja', () => {
      cy.findByLabelText('Velg naturalytelse').should('not.exist');
      cy.findByLabelText('Får arbeidstakeren tilbake naturalytelsen igjen?').should('not.exist');

      cy.withinComponent('Har arbeidstakeren naturalytelser som faller bort under fraværet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Velg naturalytelse').should('exist');
      cy.findByLabelText('Får arbeidstakeren tilbake naturalytelsen igjen?').should('exist');
    });

    it('shows vederlag type radiopanel when betalesVederlag = ja', () => {
      cy.withinComponent('Har arbeidstakeren naturalytelser som faller bort under fraværet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Betales vederlag for naturalytelsen under hele fraværet eller til en gitt dato?').should(
        'not.exist',
      );

      cy.withinComponent('Betales vederlag for naturalytelsen under fraværet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Betales vederlag for naturalytelsen under hele fraværet eller til en gitt dato?').should(
        'exist',
      );
    });

    it('shows vederlag dato when tilOgMedEnGittDato selected', () => {
      cy.withinComponent('Har arbeidstakeren naturalytelser som faller bort under fraværet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Betales vederlag for naturalytelsen under fraværet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', {
        name: /Vederlag for naturalytelsen utbetales til og med dato/,
      }).should('not.exist');

      cy.withinComponent('Betales vederlag for naturalytelsen under hele fraværet eller til en gitt dato?', () => {
        cy.findByRole('radio', { name: 'Til og med en gitt dato' }).click();
      });

      cy.findByRole('textbox', {
        name: /Vederlag for naturalytelsen utbetales til og med dato/,
      }).should('exist');
    });

    it('shows arbeidstakerenMottarIgjen datagrid when farArbeidstakeren = ja', () => {
      cy.withinComponent('Har arbeidstakeren naturalytelser som faller bort under fraværet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Fra hvilken dato mottas naturalytelsen igjen/ }).should('not.exist');

      cy.withinComponent('Får arbeidstakeren tilbake naturalytelsen igjen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: /Fra hvilken dato mottas naturalytelsen igjen/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav083001?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // start page → Veiledning
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – select Ja + virksomhet (no orgNr required)
      cy.withinComponent(
        'Arbeider arbeidstaker ved en ambassade eller i virksomhet til ikke-næringsdrivende person?',
        () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        },
      );
      cy.withinComponent('Hvor jobber arbeidstakeren?', () => {
        cy.findByRole('radio', {
          name: 'Arbeidstakeren jobber i virksomheten til en ikke-næringsdrivende person',
        }).click();
      });
      cy.clickNextStep();

      // Opplysninger om arbeidstaker
      cy.withinComponent(
        'Er det en nær relasjon mellom deg og arbeidstakeren, eller sender du inn på vegne av deg selv?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Om arbeidsgiver – orgNr hidden (virksomhet selected on Veiledning)
      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).type('Test AS');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Om arbeidsforholdet
      cy.withinComponent(
        'Har dere registrert arbeidstakeren i Aa-registeret med flere arbeidsforhold i denne virksomheten?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.findByRole('textbox', { name: 'Bestemmende fraværsdag (dd.mm.åååå)' }).type('01.01.2025');
      cy.clickNextStep();

      // Opplysninger om lønn
      cy.withinComponent('Er det utbetalt full lønn i arbeidsgiverperioden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: 'Brutto utbetalt i arbeidsgiverperioden' }).type('50000');
      // Arbeidsgiverperiode datagrid – first row is pre-rendered
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).type('01.01.2025');
      cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).type('16.01.2025');
      cy.findByRole('textbox', { name: 'Månedslønn oppgitt i brutto' }).type('40000');
      cy.withinComponent(
        'Utbetaler arbeidsgiver lønn under hele eller deler av fraværet og kreves det refusjon?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.withinComponent('Har arbeidstakeren naturalytelser som faller bort under fraværet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Opplysninger om arbeidstaker', () => {
        cy.get('dt').eq(1).should('contain.text', 'Fornavn');
        cy.get('dd').eq(1).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Om arbeidsgiver', () => {
        cy.get('dt').eq(0).should('contain.text', 'Arbeidsgiver');
        cy.get('dd').eq(0).should('contain.text', 'Test AS');
      });
    });
  });
});
