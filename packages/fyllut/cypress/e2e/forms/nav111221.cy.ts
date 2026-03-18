const confirmIntroAndStart = () => {
  cy.get('body').then(($body) => {
    const checkbox = $body.find('input[type="checkbox"]');

    if (checkbox.length > 0) {
      cy.wrap(checkbox[0]).check({ force: true });
    }
  });
  cy.clickStart();
  cy.get('body').then(($body) => {
    const checkbox = $body.find('input[type="checkbox"]');

    if (checkbox.length > 0) {
      cy.wrap(checkbox[0]).check({ force: true });
      cy.clickNextStep();
    }
  });
};

const answerRadio = (question: RegExp, answer: RegExp) => {
  cy.findByRole('group', { name: question }).within(() => {
    cy.findByRole('radio', { name: answer }).check();
  });
};

const chooseCheckbox = (question: RegExp, answer: RegExp) => {
  cy.findByRole('group', { name: question }).within(() => {
    cy.findByRole('checkbox', { name: answer }).check();
  });
};

const attachNow = (name: RegExp) => {
  cy.findAttachment(name).within(() => {
    cy.findByRole('radio', { name: /Jeg legger det ved dette skjemaet/i }).check();
  });
};

describe('NAV 11-12.21 - Pengestøtte til daglig reise', () => {
  beforeEach(() => {
    cy.intercept('GET', '/fyllut/api/send-inn/activities*', {
      statusCode: 200,
      body: [],
    }).as('getActivities');

    cy.visitFixtureForm('components', { fixture: 'forms/nav111221.json', startOnFirstStep: false });
    confirmIntroAndStart();
  });

  it('uses data-fetcher fallback and lodash-based attachment conditions with summary parity', () => {
    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Ola');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Nordmann');
    answerRadio(/Har du norsk fødselsnummer eller d-nummer/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
    answerRadio(/Skal du reise fra din folkeregisterte adresse/i, /^Ja$/i);
    cy.clickNextStep();

    chooseCheckbox(/Mottar du eller har du nylig søkt om noe av dette/i, /Mottar ingen pengestøtte fra Nav/i);
    cy.findByRole('group', { name: /Jobber du i et annet land enn Norge/i }).should('be.visible');
    answerRadio(/Jobber du i et annet land enn Norge/i, /^Nei$/i);
    chooseCheckbox(/Mottar du pengestøtte fra et annet land enn Norge/i, /Mottar ikke pengestøtte fra annet land/i);
    answerRadio(/Har du oppholdt deg utenfor Norge i løpet av de siste 12 månedene/i, /^Nei$/i);
    cy.clickNextStep();

    cy.wait('@getActivities');
    cy.findByRole('group', { name: /Hvilken arbeidsrettet aktivitet har du/i }).should('be.visible');
    answerRadio(/Hvilken arbeidsrettet aktivitet har du/i, /Tiltak \/ arbeidsrettet utredning/i);
    answerRadio(/Hva slags type arbeidsrettet aktivitet går du på/i, /Annet tiltak/i);
    answerRadio(/Mottar du ordinær lønn gjennom tiltaket/i, /^Nei$/i);
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /Gateadresse/i }).type('Storgata 1');
    cy.findByRole('textbox', { name: /Postnummer/i }).type('0155');
    cy.findByRole('textbox', { name: /Poststed/i }).type('Oslo');
    cy.findByRole('textbox', { name: /Fra og med/i }).type('01.03.2026');
    cy.findByRole('textbox', { name: /Til og med/i }).type('30.06.2026');
    cy.findByRole('spinbutton', { name: /Hvor mange dager i uken skal du reise hit/i }).type('5');
    answerRadio(/Er reiseavstanden mellom der du bor og aktivitetsstedet 6 kilometer eller mer én vei/i, /^Ja$/i);
    cy.findByRole('spinbutton', { name: /Hvor lang er reiseveien din/i }).type('12');
    answerRadio(/Kan du reise med offentlig transport hele veien/i, /^Nei$/i);
    chooseCheckbox(/Hvorfor kan du ikke reise med offentlig transport/i, /Helsemessige årsaker/i);
    answerRadio(/Kan du kjøre bil til aktivitetsstedet/i, /^Nei$/i);
    chooseCheckbox(/Hvorfor kan du ikke kjøre bil til aktivitetsstedet/i, /Helsemessige årsaker/i);
    answerRadio(/Ønsker du å søke om få dekket utgifter til reise med taxi/i, /^Ja$/i);
    answerRadio(/Har du TT-kort/i, /^Ja$/i);
    cy.clickNextStep();

    cy.findAttachment(/Uttalelse fra helsepersonell/i).should('be.visible');
    cy.findAttachment(/Vedtaket for TT-kort/i).should('be.visible');
    attachNow(/Uttalelse fra helsepersonell/i);
    attachNow(/Vedtaket for TT-kort/i);
    cy.clickNextStep();

    cy.url().should('include', '/oppsummering');
    cy.contains('Tiltak / arbeidsrettet utredning').should('be.visible');
    cy.contains('Annet tiltak').should('be.visible');
    cy.contains('Helsemessige årsaker').should('be.visible');
    cy.contains('Ja').should('be.visible');
  });
});
