/*
 * Production form tests for Refusjonskrav - Funksjonsassistanse
 * Form: nav761381
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Tiltaksarrangør (tiltaksarrangor): 1 cross-panel trigger
 *       erRefusjonsmottakerDenSammeBedriftenSomErOppgittSomSoker → Refusjonsmottaker panel visibility
 *   - Utgifter (utgifter): 7 conditionals
 *       hvaKreverDereRefusjonFor → period, salary group, travel group, sum and comments
 *       erRefusjonsmottakerDenSammeBedriftenSomErOppgittSomSoker → same-bedrift vs annen refusjonsmottaker salary fields
 *       harAssistentVaertSykIPerioden → harDereHattEkstraUtgifterTilAssistentPaGrunnAvSykdom
 *       harDereHattEkstraUtgifterTilAssistentPaGrunnAvSykdom → ekstraUtgifterTilAssistentPaGrunnAvSykdom, begrunnelse
 *       harDeltakerTattUtFerieIPerioden → erFerienTattHoydeForIRefusjonsbelopet, begrunnelseForHvorvidtDetErTattHoydeForFerieIRefusjonsbelopet
 *       harDeltakerVaertSykIPerioden → erSykefravaeretTattHoydeForIRefusjonsbelopet, begrunnelseForHvorvidtDetErTattHoydeForSykefravaeretIRefusjonsbelopet
 *   - Inkluderingstilskudd (inkluderingstilskudd): 1 same-panel conditional
 *       setterDuFremKravOmInkluderingstilskudd → inkluderingstilskudd container
 *   - Vedlegg (vedlegg): 3 cross-panel conditionals
 *       hvaKreverDereRefusjonFor → dokumentasjonAvLonnskostnaderTilAssistent, dokumentasjonAvReiseutgifter
 *       setterDuFremKravOmInkluderingstilskudd → dokumentasjonPaKostnaderTilInkluderingstilskudd
 */

describe('nav761381', () => {
  const refusjonstypeLabels = {
    lonn: 'Lønn til funksjonsassistent',
    arbeidsreiser: /^Lønn til funksjonsassistent ved arbeidsreiser\s*$/,
    reiseutgifter: 'Reiseutgifter',
  } as const;

  const selectRefusjonstype = (option: keyof typeof refusjonstypeLabels, checked = true) => {
    cy.findByRole('group', { name: 'Hva krever du refusjon for?' }).within(() => {
      cy.findByRole('checkbox', { name: refusjonstypeLabels[option] })[checked ? 'check' : 'uncheck']();
    });
  };

  const goToTiltaksarrangor = () => {
    cy.visit('/fyllut/nav761381?sub=paper');
    cy.defaultWaits();
    cy.clickNextStep();
    cy.clickNextStep();
  };

  const fillTiltaksarrangor = (sameRefusjonsmottaker: 'ja' | 'nei') => {
    cy.findByRole('textbox', { name: 'Navn på tiltaksarrangør' }).type('Tiltaksarrangør AS');
    cy.findByRole('textbox', { name: 'Navn på kontaktperson' }).type('Kari Nordmann');
    cy.findByRole('textbox', { name: 'E-post' }).type('test@example.com');
    cy.findByLabelText('Telefonnummer').type('12345678');
    cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).type('889640782');
    cy.findByRole('textbox', { name: 'Underenhet' }).type('974760673');
    cy.findByRole('textbox', { name: 'Bankkontonummer' }).type('01234567892');
    cy.findByRole('textbox', { name: 'Referanse oppgitt i tilskuddsbrev fra Nav' }).type('REF-001');
    cy.withinComponent('Er refusjonsmottaker den samme bedriften som er oppgitt som tiltaksarrangør?', () => {
      cy.findByRole('radio', { name: sameRefusjonsmottaker === 'ja' ? 'Ja' : 'Nei' }).click();
    });
  };

  const fillRefusjonsmottaker = () => {
    cy.findByRole('textbox', { name: 'Navn på refusjonsmottaker (bedrift)' }).type('Refusjonsmottaker AS');
    cy.findByRole('textbox', { name: 'Navn på kontaktperson' }).type('Ola Refusjon');
    cy.findByRole('textbox', { name: 'E-post' }).type('refusjon@example.com');
    cy.findByLabelText('Telefonnummer').type('87654321');
    cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).type('974760673');
    cy.findByRole('textbox', { name: 'Bedriftsnummer' }).type('889640782');
    cy.findByRole('textbox', { name: 'Kontonummer' }).type('01234567892');
  };

  const fillDeltaker = () => {
    cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
    cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  };

  const goToUtgifter = (sameRefusjonsmottaker: 'ja' | 'nei') => {
    goToTiltaksarrangor();
    fillTiltaksarrangor(sameRefusjonsmottaker);
    cy.clickNextStep();

    if (sameRefusjonsmottaker === 'nei') {
      fillRefusjonsmottaker();
      cy.clickNextStep();
    }

    fillDeltaker();
    cy.clickNextStep();
  };

  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Tiltaksarrangør – panel visibility for refusjonsmottaker', () => {
    beforeEach(() => {
      goToTiltaksarrangor();
      fillTiltaksarrangor('nei');
      cy.clickShowAllSteps();
    });

    it('shows refusjonsmottaker panel only when another company receives the refund', () => {
      cy.findByRole('link', { name: 'Refusjonsmottaker' }).should('exist');

      cy.withinComponent('Er refusjonsmottaker den samme bedriften som er oppgitt som tiltaksarrangør?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('link', { name: 'Refusjonsmottaker' }).should('not.exist');

      cy.withinComponent('Er refusjonsmottaker den samme bedriften som er oppgitt som tiltaksarrangør?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('link', { name: 'Refusjonsmottaker' }).should('exist');
    });
  });

  describe('Utgifter – cross-panel salary branch', () => {
    it('shows same-bedrift salary fields when refusjonsmottaker is the same company', () => {
      goToUtgifter('ja');

      selectRefusjonstype('lonn');

      cy.findByLabelText('Lønn til funksjonsassistent i perioden').should('exist');
      cy.findByLabelText('Timepris').should('not.exist');
      cy.findByLabelText('Antall timer assistanse benyttet denne perioden').should('not.exist');
    });

    it('shows annen refusjonsmottaker salary fields when refund receiver is different', () => {
      goToUtgifter('nei');

      selectRefusjonstype('lonn');

      cy.findByLabelText('Timepris').should('exist');
      cy.findByLabelText('Antall timer assistanse benyttet denne perioden').should('exist');
      cy.findByLabelText('Lønn til funksjonsassistent i perioden').should('not.exist');
    });
  });

  describe('Utgifter – selectboxes and nested conditionals', () => {
    beforeEach(() => {
      goToUtgifter('ja');
    });

    it('toggles salary, travel and shared fields when refund type changes', () => {
      cy.findByRole('textbox', { name: /Fra dato/ }).should('not.exist');
      cy.findByLabelText('Lønn til funksjonsassistent i perioden').should('not.exist');
      cy.findByLabelText('Reiseutgifter som ikke er inkludert i timeprisen').should('not.exist');
      cy.findByLabelText('Sum refusjonsbeløp').should('not.exist');
      cy.findByRole('textbox', { name: /Kommentarer/ }).should('not.exist');

      selectRefusjonstype('lonn');

      cy.findByRole('textbox', { name: /Fra dato/ }).should('exist');
      cy.findByLabelText('Lønn til funksjonsassistent i perioden').should('exist');
      cy.findByLabelText('Reiseutgifter som ikke er inkludert i timeprisen').should('not.exist');
      cy.findByLabelText('Sum refusjonsbeløp').should('exist');
      cy.findByRole('textbox', { name: /Kommentarer/ }).should('exist');

      selectRefusjonstype('lonn', false);
      selectRefusjonstype('arbeidsreiser');

      cy.findByLabelText('Lønn til funksjonsassistent i perioden').should('exist');
      cy.findByLabelText('Reiseutgifter som ikke er inkludert i timeprisen').should('not.exist');

      selectRefusjonstype('arbeidsreiser', false);
      selectRefusjonstype('reiseutgifter');

      cy.findByRole('textbox', { name: /Fra dato/ }).should('exist');
      cy.findByLabelText('Reiseutgifter som ikke er inkludert i timeprisen').should('exist');
      cy.findByLabelText('Lønn til funksjonsassistent i perioden').should('not.exist');
      cy.findByLabelText('Sum refusjonsbeløp').should('exist');
      cy.findByRole('textbox', { name: /Kommentarer/ }).should('exist');

      selectRefusjonstype('reiseutgifter', false);

      cy.findByRole('textbox', { name: /Fra dato/ }).should('not.exist');
      cy.findByLabelText('Reiseutgifter som ikke er inkludert i timeprisen').should('not.exist');
      cy.findByLabelText('Sum refusjonsbeløp').should('not.exist');
      cy.findByRole('textbox', { name: /Kommentarer/ }).should('not.exist');
    });

    it('toggles sykdom, ferie and sykefravær follow-up questions', () => {
      selectRefusjonstype('lonn');

      cy.findByLabelText('Har dere hatt ekstra utgifter til assistent pga sykdom?').should('not.exist');
      cy.findByLabelText('Ekstra utgifter til assistanse grunnet sykdom').should('not.exist');
      cy.findByRole('textbox', { name: 'Begrunnelse' }).should('not.exist');
      cy.findByLabelText('Er ferien tatt høyde for i refusjonsbeløpet?').should('not.exist');
      cy.findByRole('textbox', {
        name: /Begrunnelse for hvorvidt det er tatt høyde for ferie i refusjonsbeløpet/,
      }).should('not.exist');
      cy.findByLabelText('Er sykefraværet tatt høyde for i refusjonsbeløpet?').should('not.exist');
      cy.findByRole('textbox', {
        name: /Begrunnelse for hvorvidt det er tatt høyde for sykefraværet i refusjonsbeløpet/,
      }).should('not.exist');

      cy.withinComponent('Har assistent vært syk i perioden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Har dere hatt ekstra utgifter til assistent pga sykdom?').should('exist');

      cy.withinComponent('Har dere hatt ekstra utgifter til assistent pga sykdom?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Ekstra utgifter til assistanse grunnet sykdom').should('exist');
      cy.findByRole('textbox', { name: 'Begrunnelse' }).should('exist');

      cy.withinComponent('Har dere hatt ekstra utgifter til assistent pga sykdom?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Ekstra utgifter til assistanse grunnet sykdom').should('not.exist');
      cy.findByRole('textbox', { name: 'Begrunnelse' }).should('not.exist');

      cy.withinComponent('Har assistent vært syk i perioden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Har dere hatt ekstra utgifter til assistent pga sykdom?').should('not.exist');

      cy.withinComponent('Har deltaker tatt ut ferie i perioden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Er ferien tatt høyde for i refusjonsbeløpet?').should('exist');
      cy.findByRole('textbox', {
        name: /Begrunnelse for hvorvidt det er tatt høyde for ferie i refusjonsbeløpet/,
      }).should('exist');

      cy.withinComponent('Har deltaker tatt ut ferie i perioden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Er ferien tatt høyde for i refusjonsbeløpet?').should('not.exist');
      cy.findByRole('textbox', {
        name: /Begrunnelse for hvorvidt det er tatt høyde for ferie i refusjonsbeløpet/,
      }).should('not.exist');

      cy.withinComponent('Har deltaker vært syk i perioden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Er sykefraværet tatt høyde for i refusjonsbeløpet?').should('exist');
      cy.findByRole('textbox', {
        name: /Begrunnelse for hvorvidt det er tatt høyde for sykefraværet i refusjonsbeløpet/,
      }).should('exist');

      cy.withinComponent('Har deltaker vært syk i perioden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Er sykefraværet tatt høyde for i refusjonsbeløpet?').should('not.exist');
      cy.findByRole('textbox', {
        name: /Begrunnelse for hvorvidt det er tatt høyde for sykefraværet i refusjonsbeløpet/,
      }).should('not.exist');
    });
  });

  describe('Inkluderingstilskudd – panel conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761381/inkluderingstilskudd?sub=paper');
      cy.defaultWaits();
    });

    it('shows and hides the refund details when inclusion support is toggled', () => {
      cy.findByRole('textbox', {
        name: 'Hvilke utgifter skal inkluderingstilskuddet dekke?',
      }).should('not.exist');

      cy.withinComponent('Setter du frem krav om inkluderingstilskudd?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', {
        name: 'Hvilke utgifter skal inkluderingstilskuddet dekke?',
      }).should('exist');
      cy.findByLabelText('Hvilket beløp krever dere refusjon for?').should('exist');

      cy.withinComponent('Setter du frem krav om inkluderingstilskudd?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', {
        name: 'Hvilke utgifter skal inkluderingstilskuddet dekke?',
      }).should('not.exist');
      cy.findByLabelText('Hvilket beløp krever dere refusjon for?').should('not.exist');
    });
  });

  describe('Vedlegg – cross-panel conditionals', () => {
    it('shows only salary documentation when salary refund is selected', () => {
      goToUtgifter('ja');
      selectRefusjonstype('lonn');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon av lønnskostnader til assistent/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon av reiseutgifter/ }).should('not.exist');
      cy.findByRole('group', { name: /Dokumentasjon på kostnader til inkluderingstilskudd/ }).should('not.exist');
    });

    it('shows travel and inclusion attachments when those claims are selected', () => {
      goToUtgifter('ja');
      selectRefusjonstype('reiseutgifter');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Inkluderingstilskudd' }).click();
      cy.withinComponent('Setter du frem krav om inkluderingstilskudd?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon av lønnskostnader til assistent/ }).should('not.exist');
      cy.findByRole('group', { name: /Dokumentasjon av reiseutgifter/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon på kostnader til inkluderingstilskudd/ }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761381?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      cy.clickNextStep();

      fillTiltaksarrangor('ja');
      cy.clickNextStep();

      fillDeltaker();
      cy.clickNextStep();

      selectRefusjonstype('reiseutgifter');
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).type('01.01.2025');
      cy.findByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).type('31.01.2025');
      cy.findByLabelText('Reiseutgifter som ikke er inkludert i timeprisen').type('2500');
      cy.clickNextStep();

      cy.withinComponent('Setter du frem krav om inkluderingstilskudd?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('checkbox', {
        name: /Jeg bekrefter å ha gitt NAV riktige og fullstendige opplysninger/,
      }).click();

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon av reiseutgifter/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender/i }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/i }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Tiltaksarrangør', () => {
        cy.contains('dt', 'Navn på tiltaksarrangør').next('dd').should('contain.text', 'Tiltaksarrangør AS');
      });
      cy.withinSummaryGroup('Deltakers opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Utgifter', () => {
        cy.contains('dt', 'Hva krever du refusjon for?').next('dd').should('contain.text', 'Reiseutgifter');
        cy.contains('dt', 'Sum refusjonsbeløp')
          .next('dd')
          .invoke('text')
          .should('match', /2.?500,00/);
      });
      cy.withinSummaryGroup('Inkluderingstilskudd', () => {
        cy.contains('dt', 'Setter du frem krav om inkluderingstilskudd?').next('dd').should('contain.text', 'Nei');
      });
    });
  });
});
