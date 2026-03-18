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

const completeApplicantAndStaySteps = () => {
  cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/i }).check({ force: true });
  answerRadio(/Fyller du ut.*søknaden.*vegne av andre/i, /^Nei$/i);
  cy.clickNextStep();

  cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Ola');
  cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Nordmann');
  answerRadio(/Har du norsk fødselsnummer eller d-nummer/i, /^Ja$/i);
  cy.findByRole('textbox', { name: /Fødselsnummer.?d-nummer/i }).type('22859597622');
  cy.clickNextStep();

  answerRadio(/Hva skal du gjøre i perioden du søker for/i, /Jeg skal ikke arbeide/i);
  answerRadio(/Hva er situasjonen din i perioden/i, /Jeg skal studere/i);
  answerRadio(/Har du bodd eller oppholdt deg i utlandet de siste tolv månedene/i, /^Nei$/i);
  cy.findByRole('textbox', { name: /^Fra dato/i }).type('01.01.2025');
  cy.findByRole('textbox', { name: /^Til dato/i }).type('31.12.2025');
  cy.clickNextStep();

  answerRadio(/Hvilket land skal du til/i, /Annet EØS-land/i);
  cy.findByRole('combobox', { name: /Hvilket land skal du til/i }).type('Sverige{enter}');
  answerRadio(/Skal du ha noen midlertidige opphold i Norge i perioden/i, /^Nei$/i);
  cy.clickNextStep();
};

describe('NAV 02-08.07 - production fixture parity', () => {
  beforeEach(() => {
    cy.visitFixtureForm('nav020805', { fixture: 'forms/nav020807.json' });
  });

  it('keeps the study-only conditional explanation and attachments aligned with the summary', () => {
    completeApplicantAndStaySteps();

    answerRadio(/Hvor skal du studere/i, /Ved et norsk lærested/i);
    cy.findByRole('textbox', { name: /Hvorfor skal du oppholde deg i utlandet mens du studerer/i }).should(
      'be.visible',
    );
    cy.findByRole('textbox', { name: /Hvorfor skal du oppholde deg i utlandet mens du studerer/i }).type(
      'Jeg skal være på utveksling nær grensen mens jeg følger undervisning fra et norsk lærested.',
    );
    cy.findByRole('textbox', { name: /Lærestedets navn/i }).type('Universitetet i Oslo');
    cy.findByRole('textbox', { name: /By \/ stedsnavn/i }).type('Oslo');
    cy.findByRole('combobox', { name: /^Land$/i }).type('Norge{enter}');
    cy.findByRole('textbox', { name: /Hvilken utdanning tar du/i }).type('Master i rettsvitenskap');
    cy.findByRole('textbox', { name: /Når forventer du å avslutte studiene/i }).type('06.2026');
    answerCheckbox(/Hvordan betaler du for studiene/i, /Med støtte fra Lånekassen/i);
    cy.clickNextStep();

    answerRadio(/Søker du for barn under 18 år som skal være med deg/i, /^Nei$/i);
    answerRadio(/Har du ektefelle.*sender egen søknad/i, /^Nei$/i);
    cy.clickNextStep();

    answerRadio(/Har du noen flere.*opplysninger til.*søknaden/i, /^Nei$/i);
    cy.clickNextStep();

    selectVisibleAttachmentChoices();
    cy.clickNextStep();

    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');
    cy.contains('Jeg skal være på utveksling nær grensen mens jeg følger undervisning fra et norsk lærested.').should(
      'exist',
    );
    cy.contains(/Ved et norsk lærested/i).should('exist');

    cy.contains(/Dokumentasjon på at du har fullmakt/i).should('not.exist');
  });
});
