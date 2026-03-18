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
  cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/i }).check({ force: true });
  cy.clickNextStep();

  cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Kari');
  cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Nord');
  answerRadio(/Har du norsk fødselsnummer eller d-nummer/i, /^Ja$/i);
  cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
  cy.clickNextStep();
};

describe('NAV 14-16.05 - production fixture parity', () => {
  beforeEach(() => {
    cy.visitFixtureForm('nav020805', { fixture: 'forms/nav141605.json' });
  });

  it('keeps utsettelse-specific attachments aligned with the summary', () => {
    completeIntroAndApplicant();

    answerRadio(/Hvem er du/i, /^Mor$/i);
    answerRadio(/Er du alene om omsorgen av barnet/i, /^Nei$/i);
    answerRadio(/Har den andre forelderen rett til foreldrepenger/i, /^Ja$/i);
    answerRadio(/Har du orientert den andre forelderen om søknaden din/i, /^Ja$/i);
    cy.clickNextStep();

    answerCheckbox(/Hva søker du om/i, /Utsettelse første 6 ukene etter fødsel/i);
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /Dato fra og med/i }).type('01.02.2025');
    cy.findByRole('textbox', { name: /Dato til og med/i }).type('14.02.2025');
    answerRadio(/Hvorfor skal du utsette foreldrepenger/i, /Jeg er innlagt i helseinstitusjon/i);
    cy.clickNextStep();

    selectVisibleAttachmentChoices();
    cy.clickNextStep();

    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');
    cy.contains(/Utsettelse første 6 ukene etter fødsel/i).should('exist');
    cy.contains(/Jeg er innlagt i helseinstitusjon/i).should('exist');

    cy.withinSummaryGroup('Vedlegg', () => {
      cy.contains(/Dokumentasjon på at du er innlagt/i).should('exist');
      cy.contains(/Legeerklæring som dokumenterer at du er syk/i).should('not.exist');
    });
  });
});
