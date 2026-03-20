/*
 * Production form tests for Inntektsskjema for arbeidstakere - uføretrygd
 * Form: nav120606
 * Submission types: none
 *
 * Panels tested:
 *   - Inntekt og arbeid ved siste sykmelding (page4): 18 same-panel conditionals
 *       oppgiInntektIDenFasteStillingenForEnAvPeriodene → belop / belopPer14Dag / belopPerManed
 *       harArbeidstakerFasteTillegg → 7 supplement follow-up questions
 *       each supplement question → its monthly/full-position amount fields
 *       harDuAndreOpplysningerOmInntektOgArbeidVedSisteSykemelding → beskrivHva
 *   - Fremtidig inntekt og arbeid (page5): 18 same-panel conditionals
 *       oppgiInntektIDenFasteStillingenForEnAvPeriodene1 → belopPerUke / belopPer14Dag1 / belopPerManed1
 *       harArbeidstakerFasteTillegg1 → 7 supplement follow-up questions
 *       each supplement question → its monthly/full-position amount fields
 *       harDuAndreOpplysningerOmFremtidigInntektOgArbeid → beskrivHva2
 */

const incomePeriodQuestion = 'Oppgi inntekt i den faste stillingen for én av periodene';
const fixedSupplementsQuestion = 'Har arbeidstaker faste tillegg?';

const supplementConfigs = [
  {
    question: 'Har arbeidstaker fast kvelds-/helgetillegg?',
    monthlyAmount: /Kvelds-\/helgetillegg per måned/,
    fullPositionAmount: /Kvelds-\/helgetillegg i full stilling/,
  },
  {
    question: 'Har arbeidstaker fast helligdagstillegg?',
    monthlyAmount: /Helligdagstillegg per måned/,
    fullPositionAmount: /Helligdagstillegg i full stilling/,
  },
  {
    question: 'Har arbeidstaker fast tillegg for bilgodtgjørelse?',
    monthlyAmount: /Bilgodtgjørelse per måned/,
    fullPositionAmount: /Bilgodtgjørelse i full stilling/,
  },
  {
    question: 'Har arbeidstaker fast tillegg for telefongodtgjørelse?',
    monthlyAmount: /Telefongodtgjørelse per måned/,
    fullPositionAmount: /Telefongodtgjørelse i full stilling/,
  },
  {
    question: 'Har arbeidstaker fast tillegg for skattepliktig del av forsikring?',
    monthlyAmount: /Skattepliktig del av forsikring per måned/,
    fullPositionAmount: /Skattepliktig del av forsikring i full stilling/,
  },
  {
    question: 'Har arbeidstaker fast tillegg for bonus?',
    monthlyAmount: /Bonus per måned/,
    fullPositionAmount: /Bonus i full stilling/,
  },
  {
    question: 'Har arbeidstaker fast tillegg for annet?',
    monthlyAmount: /Annet per måned/,
    fullPositionAmount: /Annet i full stilling/,
  },
] as const;

const selectRadio = (label: string, option: string | RegExp) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const assertTextboxVisibility = (label: RegExp, visible: boolean) => {
  cy.findByRole('textbox', { name: label }).should(visible ? 'exist' : 'not.exist');
};

const assertSupplementQuestionsVisible = (visible: boolean) => {
  supplementConfigs.forEach(({ question }) => {
    cy.findByLabelText(question).should(visible ? 'exist' : 'not.exist');
  });
};

const assertSupplementAmountFieldsVisible = (monthlyAmount: RegExp, fullPositionAmount: RegExp, visible: boolean) => {
  assertTextboxVisibility(monthlyAmount, visible);
  assertTextboxVisibility(fullPositionAmount, visible);
};

const testSupplementFollowUpFields = () => {
  supplementConfigs.forEach(({ question, monthlyAmount, fullPositionAmount }) => {
    assertSupplementAmountFieldsVisible(monthlyAmount, fullPositionAmount, false);

    selectRadio(question, 'Ja');
    assertSupplementAmountFieldsVisible(monthlyAmount, fullPositionAmount, true);

    selectRadio(question, 'Nei');
    assertSupplementAmountFieldsVisible(monthlyAmount, fullPositionAmount, false);
  });
};

const fillPersonopplysninger = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
  cy.clickNextStep();
};

const fillArbeidsgiver = () => {
  cy.findByRole('textbox', { name: 'Arbeidsgiver' }).type('NAV Test');
  cy.findByLabelText('Telefonnummer').type('12345678');
  selectRadio('Har arbeidstaker vært sykemeldt hos nåværende arbeidsgiver?', 'Ja');
  cy.clickNextStep();
};

const fillSisteSykmeldingMinimum = (incomeOption: 'Per uke' | 'Per måned') => {
  cy.findByRole('textbox', { name: /Start for siste sykmeldingsperiode/ }).type('15.01.2025');
  cy.findByLabelText('Fast arbeidstid i timer per uke').type('37');
  cy.findByLabelText('Stillingsprosent').type('100');
  cy.findByRole('textbox', { name: 'Timelønn' }).type('250');
  cy.findByRole('textbox', { name: 'Yrke' }).type('Saksbehandler');
  selectRadio(incomePeriodQuestion, incomeOption);
  cy.findByRole('textbox', {
    name: incomeOption === 'Per uke' ? /Beløp per uke/ : /Beløp per måned/,
  }).type(incomeOption === 'Per uke' ? '5000' : '30000');
  selectRadio(fixedSupplementsQuestion, 'Nei');
  cy.findByRole('textbox', {
    name: /Brutto årsinntekt oppjustert i 100 % stilling inkludert tillegg/,
  }).type('400000');
  selectRadio('Har du andre opplysninger om inntekt og arbeid ved siste sykemelding?', 'Nei');
  cy.clickNextStep();
};

const advancePastInformationalPanels = () => {
  cy.get('h2#page-title').then(($heading) => {
    const title = $heading.text().trim();

    if (title === 'Veiledning' || title === 'Introduksjon') {
      cy.clickNextStep();
      advancePastInformationalPanels();
    }
  });
};

const goToPage4 = () => {
  cy.visit('/fyllut/nav120606');
  cy.defaultWaits();
  advancePastInformationalPanels();
  cy.findByRole('heading', { level: 2, name: 'Personopplysninger' }).should('exist');
  fillPersonopplysninger();
  cy.findByRole('heading', { level: 2, name: 'Arbeidsgiver' }).should('exist');
  fillArbeidsgiver();
  cy.findByRole('heading', { level: 2, name: 'Inntekt og arbeid ved siste sykmelding' }).should('exist');
};

const goToPage5 = () => {
  goToPage4();
  fillSisteSykmeldingMinimum('Per uke');
  cy.findByRole('heading', { level: 2, name: 'Fremtidig inntekt og arbeid' }).should('exist');
};

describe('nav120606', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Inntekt og arbeid ved siste sykmelding conditionals', () => {
    beforeEach(() => {
      goToPage4();
    });

    it('shows the matching income field for the selected income period', () => {
      assertTextboxVisibility(/Beløp per uke/, false);
      assertTextboxVisibility(/Beløp per 14\.\s*dag/, false);
      assertTextboxVisibility(/Beløp per måned/, false);

      selectRadio(incomePeriodQuestion, 'Per uke');
      assertTextboxVisibility(/Beløp per uke/, true);
      assertTextboxVisibility(/Beløp per 14\.\s*dag/, false);
      assertTextboxVisibility(/Beløp per måned/, false);

      selectRadio(incomePeriodQuestion, /Per 14\.\s*dag/);
      assertTextboxVisibility(/Beløp per uke/, false);
      assertTextboxVisibility(/Beløp per 14\.\s*dag/, true);
      assertTextboxVisibility(/Beløp per måned/, false);

      selectRadio(incomePeriodQuestion, 'Per måned');
      assertTextboxVisibility(/Beløp per uke/, false);
      assertTextboxVisibility(/Beløp per 14\.\s*dag/, false);
      assertTextboxVisibility(/Beløp per måned/, true);
    });

    it('shows supplement questions only when the worker has fixed supplements', () => {
      assertSupplementQuestionsVisible(false);

      selectRadio(fixedSupplementsQuestion, 'Ja');
      assertSupplementQuestionsVisible(true);

      selectRadio(fixedSupplementsQuestion, 'Nei');
      assertSupplementQuestionsVisible(false);
    });

    it('toggles the supplement amount fields for each fixed supplement branch', () => {
      selectRadio(fixedSupplementsQuestion, 'Ja');
      testSupplementFollowUpFields();
    });

    it('shows the additional information textarea only when user answers yes', () => {
      assertTextboxVisibility(/Beskriv hva/, false);

      selectRadio('Har du andre opplysninger om inntekt og arbeid ved siste sykemelding?', 'Ja');
      assertTextboxVisibility(/Beskriv hva/, true);

      selectRadio('Har du andre opplysninger om inntekt og arbeid ved siste sykemelding?', 'Nei');
      assertTextboxVisibility(/Beskriv hva/, false);
    });
  });

  describe('Fremtidig inntekt og arbeid conditionals', () => {
    beforeEach(() => {
      goToPage5();
    });

    it('shows the matching future-income field for the selected income period', () => {
      assertTextboxVisibility(/Beløp per uke/, false);
      assertTextboxVisibility(/Beløp per 14\.\s*dag/, false);
      assertTextboxVisibility(/Beløp per måned/, false);

      selectRadio(incomePeriodQuestion, 'Per uke');
      assertTextboxVisibility(/Beløp per uke/, true);
      assertTextboxVisibility(/Beløp per 14\.\s*dag/, false);
      assertTextboxVisibility(/Beløp per måned/, false);

      selectRadio(incomePeriodQuestion, /Per 14\.\s*dag/);
      assertTextboxVisibility(/Beløp per uke/, false);
      assertTextboxVisibility(/Beløp per 14\.\s*dag/, true);
      assertTextboxVisibility(/Beløp per måned/, false);

      selectRadio(incomePeriodQuestion, 'Per måned');
      assertTextboxVisibility(/Beløp per uke/, false);
      assertTextboxVisibility(/Beløp per 14\.\s*dag/, false);
      assertTextboxVisibility(/Beløp per måned/, true);
    });

    it('shows future supplement questions only when the worker has fixed supplements', () => {
      assertSupplementQuestionsVisible(false);

      selectRadio(fixedSupplementsQuestion, 'Ja');
      assertSupplementQuestionsVisible(true);

      selectRadio(fixedSupplementsQuestion, 'Nei');
      assertSupplementQuestionsVisible(false);
    });

    it('toggles the future supplement amount fields for each fixed supplement branch', () => {
      selectRadio(fixedSupplementsQuestion, 'Ja');
      testSupplementFollowUpFields();
    });

    it('shows the future additional information textarea only when user answers yes', () => {
      assertTextboxVisibility(/Beskriv hva/, false);

      selectRadio('Har du andre opplysninger om fremtidig inntekt og arbeid?', 'Ja');
      assertTextboxVisibility(/Beskriv hva/, true);

      selectRadio('Har du andre opplysninger om fremtidig inntekt og arbeid?', 'Nei');
      assertTextboxVisibility(/Beskriv hva/, false);
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav120606');
      cy.defaultWaits();
      advancePastInformationalPanels();
    });

    it('fills required fields and verifies summary', () => {
      cy.findByRole('heading', { level: 2, name: 'Personopplysninger' }).should('exist');

      // Personopplysninger
      fillPersonopplysninger();
      cy.findByRole('heading', { level: 2, name: 'Arbeidsgiver' }).should('exist');

      // Arbeidsgiver
      fillArbeidsgiver();
      cy.findByRole('heading', { level: 2, name: 'Inntekt og arbeid ved siste sykmelding' }).should('exist');

      // Inntekt og arbeid ved siste sykmelding
      fillSisteSykmeldingMinimum('Per uke');
      cy.findByRole('heading', { level: 2, name: 'Fremtidig inntekt og arbeid' }).should('exist');

      // Fremtidig inntekt og arbeid
      cy.findByRole('textbox', {
        name: /Forventet fremtidig pensjonsgivende årsinntekt uten faste\/variable tillegg/,
      }).type('450000');
      cy.findByLabelText('Fast arbeidstid i timer per uke').type('37');
      cy.findByLabelText('Stillingsprosent').type('100');
      cy.findByRole('textbox', { name: 'Timelønn' }).type('260');
      cy.findByRole('textbox', { name: 'Yrke' }).type('Rådgiver');
      selectRadio(incomePeriodQuestion, 'Per måned');
      cy.findByRole('textbox', { name: /Beløp per måned/ }).type('30000');
      selectRadio(fixedSupplementsQuestion, 'Nei');
      cy.findByRole('textbox', {
        name: /Brutto årsinntekt oppjustert i 100 % stilling inkludert tillegg/,
      }).type('450000');
      selectRadio('Har du andre opplysninger om fremtidig inntekt og arbeid?', 'Nei');
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Personopplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Arbeidsgiver', () => {
        cy.contains('dt', 'Arbeidsgiver').next('dd').should('contain.text', 'NAV Test');
      });
      cy.withinSummaryGroup('Fremtidig inntekt og arbeid', () => {
        cy.contains('dt', 'Yrke').next('dd').should('contain.text', 'Rådgiver');
      });
    });
  });
});
