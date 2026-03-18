const answerRadio = (question: RegExp, answer: RegExp) => {
  cy.findByRole('group', { name: question }).within(() => {
    cy.findByRole('radio', { name: answer }).check({ force: true });
  });
};

const answerCheckbox = (question: RegExp, answer: RegExp) => {
  cy.findByRole('group', { name: question }).within(() => {
    cy.findByRole('checkbox', { name: answer }).check({ force: true });
  });
};

const selectVisibleAttachmentChoices = () => {
  cy.get('body').then(($body) => {
    if (!$body.text().includes('Jeg legger det ved dette skjemaet')) {
      return;
    }

    cy.findAllByRole('radio', { name: /Jeg legger det ved dette skjemaet/i }).each(($radio) => {
      cy.wrap($radio).check({ force: true });
    });
  });
};

const completeIntroAndApplicant = () => {
  cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg har lest og forstått mine plikter/i }).check({ force: true });
  cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/i }).check({ force: true });
  cy.clickNextStep();

  cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Kari');
  cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Nord');
  answerRadio(/Har du norsk fødselsnummer eller d-nummer/i, /^Ja$/i);
  cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
  cy.clickNextStep();
};

const completeOtherParentStep = () => {
  answerRadio(/Kan du gi oss navnet på den andre forelderen/i, /^Ja$/i);
  cy.findByRole('textbox', { name: /^Fornavn$/i })
    .last()
    .type('Per');
  cy.findByRole('textbox', { name: /^Etternavn$/i })
    .last()
    .type('Medforelder');
  answerRadio(/Har den andre forelderen norsk fødselsnummer eller d-nummer/i, /^Ja$/i);
  cy.findByRole('textbox', { name: /Hva er den andre forelderens fødselsnummer eller d-nummer/i }).type('20905995783');
  answerRadio(/Er du alene om omsorgen av barnet/i, /^Nei$/i);
  answerRadio(/Har den andre forelderen rett til foreldrepenger/i, /^Ja$/i);
  answerRadio(/Har du orientert den andre forelderen om søknaden din/i, /^Ja$/i);
  cy.clickNextStep();
};

const completePlanWithSharedPeriod = () => {
  answerCheckbox(/Hvilken periode skal du ta ut/i, /Fellesperiode/i);
  cy.findByRole('textbox', { name: /Fellesperiode fra og med/i }).type('01.03.2025');
  cy.findByRole('textbox', { name: /Fellesperiode til og med/i }).type('15.03.2025');
  answerRadio(/Skal den andre forelderen ha foreldrepenger i samme periode/i, /^Nei$/i);
  answerRadio(/Hva skal mor gjøre i denne perioden/i, /^Arbeid$/i);
  answerRadio(/Skal du kombinere foreldrepengene med delvis arbeid/i, /^Nei$/i);
  cy.clickNextStep();
};

const completeRemainingSteps = () => {
  answerRadio(/Hvor skal du bo de neste 12 månedene/i, /Kun bo i Norge/i);
  answerRadio(/Hvor har du bodd de siste 12 månedene/i, /Kun bodd i Norge/i);
  cy.clickNextStep();

  answerRadio(/Har du arbeidsforhold i Norge/i, /^Nei$/i);
  answerRadio(/Har du jobbet og hatt inntekt som frilanser de siste 10 månedene/i, /^Nei$/i);
  answerRadio(/Har du jobbet og hatt inntekt som selvstendig næringsdrivende de siste 10 månedene/i, /^Nei$/i);
  answerRadio(/Har du hatt andre inntektskilder de siste 10 månedene/i, /^Nei$/i);
  cy.clickNextStep();

  selectVisibleAttachmentChoices();
  cy.clickNextStep();
};

describe('NAV 14-05.09 - production fixture parity', () => {
  beforeEach(() => {
    cy.visitFixtureForm('nav020805', { fixture: 'forms/nav140509.json' });
  });

  it('keeps birth-registration and shared-period attachments aligned with the summary', () => {
    completeIntroAndApplicant();

    answerRadio(/Hvem er du/i, /^Far$/i);
    answerRadio(/Hvor lang periode med foreldrepenger ønsker du/i, /100 prosent/i);
    cy.clickNextStep();

    answerRadio(/Er barnet født/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Hvor mange barn fikk du/i }).type('1');
    cy.findByRole('textbox', { name: /Når ble barnet født/i }).type('01.01.2025');
    cy.findByRole('textbox', { name: /Når var termindato/i }).type('15.12.2024');
    answerRadio(/Ble barnet født i Norge/i, /^Nei$/i);
    answerRadio(/Er barnet registrert i det norske folkeregisteret/i, /^Nei$/i);
    cy.clickNextStep();

    completeOtherParentStep();
    completePlanWithSharedPeriod();
    completeRemainingSteps();

    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');
    cy.contains(/Fellesperiode/i).should('exist');
    cy.contains(/^Arbeid$/i).should('exist');

    cy.withinSummaryGroup('Vedlegg', () => {
      cy.contains(/^Fødselsattest$/i).should('exist');
      cy.contains(/Bekreftelse fra arbeidsgiver om at mor er i arbeid/i).should('exist');
    });
  });
});
