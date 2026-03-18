const answerRadio = (question: RegExp, answer: RegExp) => {
  cy.findByRole('group', { name: question }).within(() => {
    cy.findByRole('radio', { name: answer }).check({ force: true });
  });
};

const visitNav952000 = () => {
  cy.intercept('POST', '/fyllut/api/log*', { body: 'ok' }).as('logger');
  cy.intercept('GET', '/fyllut/api/config*', { body: {} }).as('getConfig');
  cy.intercept('GET', '/fyllut/api/global-translations/*', { body: {} }).as('getGlobalTranslations');
  cy.intercept('GET', '/fyllut/api/common-codes/currencies*', {
    body: [{ label: 'USD', value: 'USD' }],
  }).as('getCurrencies');
  cy.intercept('GET', '/fyllut/api/common-codes/area-codes', { body: [] }).as('getAreaCodes');
  cy.intercept('GET', '/fyllut/api/translations/nav020805*', { body: {} }).as('getTranslations');
  cy.intercept('GET', '/fyllut/api/forms/nav020805*', { fixture: 'forms/nav952000.json' }).as('getForm');
  cy.visit('/fyllut/nav020805?sub=paper');
  cy.defaultWaits();
  cy.clickStart();
  cy.clickNextStep();
};

const attachNow = (name: RegExp) => {
  cy.findByRole('group', { name }).within(() => {
    cy.findByRole('radio', { name: /Jeg legger det ved dette skjemaet/i }).check({ force: true });
  });
};

const markNoExtraDocumentation = () => {
  cy.get('body').then(($body) => {
    if ($body.text().includes('Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved')) {
      cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved/i }).check({
        force: true,
      });
    }
  });
};

describe('NAV 95-20.00 - Melding om nytt bankkontonummer', () => {
  beforeEach(() => {
    visitNav952000();
  });

  it('keeps deceased-heir attachments and foreign bank conditionals aligned with the summary page', () => {
    answerRadio(/Melder du om nytt bankkontonummer på vegne av andre enn deg selv/i, /^Ja$/i);
    answerRadio(/Hvorfor melder du om nytt bankkontonummer på vegne av en annen person/i, /Personen er død/i);
    answerRadio(/Er dere flere arvinger/i, /^Ja$/i);
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Ola');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Nordmann');
    cy.findByRole('textbox', { name: /Fødselsnummer \/ D-nummer/i }).type('22859597622');
    cy.findByRole('textbox', { name: /^Telefonnummer$/i }).type('12345678');
    answerRadio(/Hvilken ytelse gjelder utbetalingen/i, /Pensjon eller uføretrygd/i);
    cy.clickNextStep();

    answerRadio(/Har du norsk eller utenlandsk bankkonto/i, /Utenlandsk kontonummer/i);
    cy.wait('@getCurrencies');
    cy.findByRole('combobox', { name: /Bankens land/i }).type('USA{enter}');
    cy.findByRole('combobox', { name: /^Valuta$/i }).type('USD{downArrow}{enter}');
    cy.findByRole('textbox', { name: /^Bankens navn$/i }).type('First National Bank');
    cy.findByRole('textbox', { name: /^Kontonummer$/i })
      .should('be.visible')
      .type('987654321');
    cy.findByRole('textbox', { name: /^IBAN$/i }).should('not.exist');
    cy.findByRole('textbox', { name: /BIC \/ Swift-kode/i }).should('not.exist');
    cy.findByRole('textbox', { name: /^Bankkode FW$/i })
      .should('be.visible')
      .type('026009593');
    cy.findByRole('textbox', { name: /^Postadresse$/i }).type('123 Harbor Street');
    cy.findByRole('textbox', { name: /Utenlandsk postkode/i }).type('10001');
    cy.findByRole('textbox', { name: /^Poststed$/i }).type('New York');
    cy.findByRole('textbox', { name: /^Land$/i }).type('USA');
    cy.clickNextStep();

    cy.findByRole('group', { name: /Kopi av legitimasjon til den som signerer søknaden/i }).should('be.visible');
    cy.findByRole('group', { name: /Fullmakt fra de andre arvingene/i }).should('be.visible');
    cy.findByRole('group', { name: /Kopi av skifteattest/i }).should('be.visible');
    cy.get('main').should('not.contain.text', 'Kopi av din legitimasjon');
    cy.get('main').should('not.contain.text', 'Kopi av legitimasjon til den foresatte som signerer skjemaet');
    cy.get('main').should('not.contain.text', 'Dokumentasjon på at du har fullmakt til å sende inn skjema på vegne av');

    attachNow(/Kopi av legitimasjon til den som signerer søknaden/i);
    attachNow(/Fullmakt fra de andre arvingene/i);
    attachNow(/Kopi av skifteattest/i);
    markNoExtraDocumentation();
    cy.clickNextStep();

    cy.url().should('include', '/oppsummering');

    cy.withinSummaryGroup('Fullmakt', () => {
      cy.contains('Personen er død').should('exist');
      cy.contains('Er dere flere arvinger').should('exist');
    });

    cy.withinSummaryGroup('Bankkontonummer', () => {
      cy.contains('Bankens land').should('exist');
      cy.contains('USA').should('exist');
      cy.contains('Kontonummer').should('exist');
      cy.contains('987654321').should('exist');
      cy.contains('Bankkode FW').should('exist');
      cy.contains('026009593').should('exist');
      cy.contains('IBAN').should('not.exist');
      cy.contains('BIC / Swift-kode').should('not.exist');
      cy.contains('Norsk bankkontonummer').should('not.exist');
    });

    cy.withinSummaryGroup('Vedlegg', () => {
      cy.contains('Kopi av legitimasjon til den som signerer søknaden').should('exist');
      cy.contains('Fullmakt fra de andre arvingene').should('exist');
      cy.contains('Kopi av skifteattest').should('exist');
      cy.contains(/Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved/i).should('exist');
      cy.root().should('not.contain.text', 'Kopi av din legitimasjon');
      cy.root().should('not.contain.text', 'Kopi av legitimasjon til den foresatte som signerer skjemaet');
    });
  });
});
