/*
 * Production form tests for Melding om inntektsendring når du har uføretrygd
 * Form: nav121401
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Egen inntekt (page4): 6 same-panel conditionals
 *       mottarDuBarnetilleggTilUforetrygden → lovparagrafBarnetillegg + barnetilleggInntekt container
 *       harDuEllerForventerDuAFaArbeidsinntekt → arbeidsinntekt
 *       mottarDuEnEllerFlerePensjonsgivendeYtelserFraNav → arbeidsinntektOgPensjonsgivendeYtelser
 *       harDuEllerForventerDuAFaNaeringsinntekt → naeringsinntekt
 *       harDuEllerForventerDuAFaInntektFraUtlandet → inntektFraUtlandet
 *       mottarDuPensjonFraAndreEnnNavOffentligEllerPrivat → bruttoArligPensjonFraAndreEnnNav
 *   - Ektefelle/partner/samboer (page7): 4 same-panel conditionals
 *       harDuEktefelleSamboerEllerPartner → erDinEktefelleSamboerPartnerForelderTilBarnetDuHarBarnetilleggFor
 *       erDinEktefelleSamboerPartnerForelderTilBarnetDuHarBarnetilleggFor → harDinEktefelleSamboerPartnerEndretInntektenSin
 *       harDinEktefelleSamboerPartnerEndretInntektenSin → navSkjemagruppe1
 *       harDuEllerForventerEktefelleAFaArbeidsinntekt2 → arbeidsinntekt1
 *   - Barnets inntekt (page6): 4 same-panel conditionals
 *       harBarnetEllerBarnaDineDineEgenInntekt → follow-up radios
 *       mottarDuBarnetilleggForDetEllerDeBarnaSomHarEgenInntekt → alertstripe + G-threshold radio
 *       harBarnetEllerBarnaDuHarBarnetilleggForEnArsinntektSomErHoyereEnnFolketrygdensGrunnbelopG → datagrid
 */

const answerRadio = (label: string | RegExp, option: string) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const goToPersonopplysninger = () => {
  cy.visit('/fyllut/nav121401?sub=paper');
  cy.defaultWaits();
  cy.clickNextStep();
  cy.clickNextStep();
};

const fillPersonopplysninger = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
  cy.clickNextStep();
};

const fillEgenInntektBarnetilleggPath = () => {
  cy.findByLabelText('Året inntekten gjelder for').type('2025');
  answerRadio('Mottar du barnetillegg til uføretrygden?', 'Ja');
  answerRadio('Har du eller forventer du å få arbeidsinntekt?', 'Nei');
  answerRadio('Mottar du en eller flere pensjonsgivende ytelser fra NAV?', 'Nei');
  answerRadio('Har du eller forventer du å få næringsinntekt?', 'Nei');
  answerRadio('Har du eller forventer du å få inntekt fra utlandet?', 'Nei');
  answerRadio('Mottar du pensjon fra andre enn NAV (offentlig eller privat)?', 'Nei');
  answerRadio(/Mottar du\s+familiepleieytelse og\/eller krigspensjon fra NAV\?/, 'Nei');
  answerRadio('Mottar du pensjon fra utlandet?', 'Nei');
  cy.clickNextStep();
};

describe('nav121401', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Egen inntekt conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav121401/page4?sub=paper');
      cy.defaultWaits();
    });

    it('toggles income fields and barnetillegg section based on answers', () => {
      cy.contains('All personinntekt etter skatteloven').should('not.exist');
      cy.findByLabelText(/Mottar du pensjon fra andre enn NAV/).should('not.exist');
      cy.findByLabelText(/Årlig brutto arbeidsinntekt/).should('not.exist');
      cy.findByLabelText(/Forventet brutto årlig pensjonsgivende ytelser/).should('not.exist');
      cy.findByLabelText(/Brutto årlig næringsinntekt/).should('not.exist');
      cy.findByLabelText(/Brutto årsinntekt fra utlandet/).should('not.exist');

      answerRadio('Mottar du barnetillegg til uføretrygden?', 'Ja');
      cy.contains('All personinntekt etter skatteloven').should('exist');
      cy.findByLabelText(/Mottar du pensjon fra andre enn NAV/).should('exist');

      answerRadio('Har du eller forventer du å få arbeidsinntekt?', 'Ja');
      cy.findByLabelText(/Årlig brutto arbeidsinntekt/).should('exist');
      answerRadio('Har du eller forventer du å få arbeidsinntekt?', 'Nei');
      cy.findByLabelText(/Årlig brutto arbeidsinntekt/).should('not.exist');

      answerRadio('Mottar du en eller flere pensjonsgivende ytelser fra NAV?', 'Ja');
      cy.findByLabelText(/Forventet brutto årlig pensjonsgivende ytelser/).should('exist');
      answerRadio('Mottar du en eller flere pensjonsgivende ytelser fra NAV?', 'Nei');
      cy.findByLabelText(/Forventet brutto årlig pensjonsgivende ytelser/).should('not.exist');

      answerRadio('Har du eller forventer du å få næringsinntekt?', 'Ja');
      cy.findByLabelText(/Brutto årlig næringsinntekt/).should('exist');
      answerRadio('Har du eller forventer du å få næringsinntekt?', 'Nei');
      cy.findByLabelText(/Brutto årlig næringsinntekt/).should('not.exist');

      answerRadio('Har du eller forventer du å få inntekt fra utlandet?', 'Ja');
      cy.findByLabelText(/Brutto årsinntekt fra utlandet/).should('exist');
      answerRadio('Har du eller forventer du å få inntekt fra utlandet?', 'Nei');
      cy.findByLabelText(/Brutto årsinntekt fra utlandet/).should('not.exist');

      answerRadio('Mottar du pensjon fra andre enn NAV (offentlig eller privat)?', 'Ja');
      cy.findByLabelText(/Brutto årlig pensjon fra andre enn NAV/).should('exist');
      answerRadio('Mottar du pensjon fra andre enn NAV (offentlig eller privat)?', 'Nei');
      cy.findByLabelText(/Brutto årlig pensjon fra andre enn NAV/).should('not.exist');

      answerRadio('Mottar du barnetillegg til uføretrygden?', 'Nei');
      cy.contains('All personinntekt etter skatteloven').should('not.exist');
      cy.findByLabelText(/Mottar du pensjon fra andre enn NAV/).should('not.exist');
    });
  });

  describe('Ektefelle/partner/samboer conditionals', () => {
    beforeEach(() => {
      goToPersonopplysninger();
      fillPersonopplysninger();
      fillEgenInntektBarnetilleggPath();
    });

    it('shows spouse follow-up questions only for the spouse-parent path', () => {
      cy.findByLabelText(/Er din ektefelle\/partner\/samboer forelder/).should('not.exist');
      cy.findByLabelText(/Har din ektefelle\/partner\/samboer endret inntekten sin/).should('not.exist');
      cy.findByLabelText(/Har din ektefelle\/partner\/samboer arbeidsinntekt\?/).should('not.exist');
      cy.findByLabelText(/Årlig brutto arbeidsinntekt/).should('not.exist');

      answerRadio('Har du ektefelle, partner eller samboer?', 'Ja');
      cy.findByLabelText(/Er din ektefelle\/partner\/samboer forelder/).should('exist');

      answerRadio('Er din ektefelle/partner/samboer forelder til barnet du har barnetillegg for?', 'Ja');
      cy.findByLabelText(/Har din ektefelle\/partner\/samboer endret inntekten sin/).should('exist');

      answerRadio('Har din ektefelle/partner/samboer endret inntekten sin?', 'Ja');
      cy.findByLabelText(/Har din ektefelle\/partner\/samboer arbeidsinntekt\?/).should('exist');

      answerRadio('Har din ektefelle/partner/samboer arbeidsinntekt?', 'Ja');
      cy.findByLabelText(/Årlig brutto arbeidsinntekt/).should('exist');

      answerRadio('Har din ektefelle/partner/samboer arbeidsinntekt?', 'Nei');
      cy.findByLabelText(/Årlig brutto arbeidsinntekt/).should('not.exist');

      answerRadio('Har din ektefelle/partner/samboer endret inntekten sin?', 'Nei');
      cy.findByLabelText(/Har din ektefelle\/partner\/samboer arbeidsinntekt\?/).should('not.exist');

      answerRadio('Er din ektefelle/partner/samboer forelder til barnet du har barnetillegg for?', 'Nei');
      cy.findByLabelText(/Har din ektefelle\/partner\/samboer endret inntekten sin/).should('not.exist');

      answerRadio('Har du ektefelle, partner eller samboer?', 'Nei');
      cy.findByLabelText(/Er din ektefelle\/partner\/samboer forelder/).should('not.exist');
    });
  });

  describe('Barnets inntekt conditionals', () => {
    beforeEach(() => {
      goToPersonopplysninger();
      fillPersonopplysninger();
      fillEgenInntektBarnetilleggPath();
      answerRadio('Har du ektefelle, partner eller samboer?', 'Nei');
      cy.clickNextStep();
    });

    it('shows warning and datagrid only for child-income over-G path', () => {
      cy.findByLabelText(/Mottar du barnetillegg for det eller de barna som har egen inntekt/).should('not.exist');
      cy.findByLabelText(/Har barnet eller barna du har barnetillegg for en årsinntekt/).should('not.exist');
      cy.contains('Du har ikke rett til barnetillegg').should('not.exist');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');

      answerRadio('Har barnet eller barna dine dine egen inntekt?', 'Ja');
      cy.findByLabelText(/Mottar du barnetillegg for det eller de barna som har egen inntekt/).should('exist');

      answerRadio('Mottar du barnetillegg for det eller de barna som har egen inntekt?', 'Ja');
      cy.contains('Du har ikke rett til barnetillegg').should('exist');
      cy.findByLabelText(/Har barnet eller barna du har barnetillegg for en årsinntekt/).should('exist');

      answerRadio(
        'Har barnet eller barna du har barnetillegg for en årsinntekt som er høyere enn folketrygdens grunnbeløp (G)?',
        'Ja',
      );
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Etternavn' }).should('exist');
      cy.findByLabelText('Årlig inntekt').should('exist');

      answerRadio(
        'Har barnet eller barna du har barnetillegg for en årsinntekt som er høyere enn folketrygdens grunnbeløp (G)?',
        'Nei',
      );
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');

      answerRadio('Mottar du barnetillegg for det eller de barna som har egen inntekt?', 'Nei');
      cy.contains('Du har ikke rett til barnetillegg').should('not.exist');
      cy.findByLabelText(/Har barnet eller barna du har barnetillegg for en årsinntekt/).should('not.exist');

      answerRadio('Har barnet eller barna dine dine egen inntekt?', 'Nei');
      cy.findByLabelText(/Mottar du barnetillegg for det eller de barna som har egen inntekt/).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      goToPersonopplysninger();
    });

    it('fills required fields and verifies summary', () => {
      // Dine opplysninger
      fillPersonopplysninger();

      // Egen inntekt — barnetillegg path is required to keep spouse/child-income panels in the wizard
      fillEgenInntektBarnetilleggPath();

      // Ektefelle/partner/samboer — no spouse path
      answerRadio('Har du ektefelle, partner eller samboer?', 'Nei');
      cy.clickNextStep();

      // Barnets inntekt — no child income path
      answerRadio('Har barnet eller barna dine dine egen inntekt?', 'Nei');

      // Vedlegg — isAttachmentPanel=true, navigate via stepper before summary
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Egen inntekt', () => {
        cy.contains('dt', 'Mottar du barnetillegg til uføretrygden?').next('dd').should('contain.text', 'Ja');
      });
      cy.withinSummaryGroup('Barnets inntekt', () => {
        cy.contains('dt', 'Har barnet eller barna dine dine egen inntekt?').next('dd').should('contain.text', 'Nei');
      });
    });
  });
});
