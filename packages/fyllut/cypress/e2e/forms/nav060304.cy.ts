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
      cy.clickSaveAndContinue();
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

describe('NAV 06-03.04 - Søknad om grunnstønad', () => {
  beforeEach(() => {
    cy.visitFixtureForm('components', { fixture: 'forms/nav060304.json', startOnFirstStep: false, sub: 'digital' });
    confirmIntroAndStart();
  });

  it('covers digital representative and child-specific branching through summary parity', () => {
    answerRadio(/Hva ønsker du å søke om/i, /Jeg ønsker å søke om grunnstønad/i);
    cy.clickSaveAndContinue();

    answerRadio(/Søker du for deg selv eller på vegne av en annen person/i, /eget barn under 18 år/i);
    cy.findByText(/digitalt/i).should('be.visible');
    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Kari');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Nordmann');
    cy.findByRole('textbox', { name: /Telefonnummer/i }).type('12345678');
    cy.clickSaveAndContinue();

    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Maja');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Nordmann');
    cy.findByRole('textbox', { name: /Fødselsnummer \/ D-nummer/i }).type('22859597622');
    answerRadio(/Bor barnet i Norge/i, /^Nei$/i);
    cy.findByRole('combobox', { name: /Oppgi barnets bosettingsland/i }).type('Sverige{enter}');
    cy.clickSaveAndContinue();

    cy.findByRole('textbox', { name: /^Kontonummer$/i }).type('12345678901');
    answerRadio(/Mottar barnet ytelse fra et annet land/i, /^Nei$/i);
    cy.clickSaveAndContinue();

    answerRadio(/Er du fast bosatt i Norge/i, /^Ja$/i);
    answerRadio(/Mottar du ytelse fra et annet land enn Norge/i, /^Nei$/i);
    answerRadio(/Kan du oppgi navn og adresse til barnets andre forelder/i, /^Nei$/i);
    cy.findByRole('textbox', { name: /Hvorfor kan du ikke oppgi navn og adresse til barnets andre forelder/i }).type(
      'Jeg har ikke oppdatert kontaktinformasjon.',
    );
    cy.clickSaveAndContinue();

    cy.findByRole('textbox', { name: /Oppgi diagnose/i }).type('Autismespekterforstyrrelse');
    answerRadio(/Oppgi lege vi kan få opplysninger fra/i, /^Fastlege$/i);
    cy.clickSaveAndContinue();

    chooseCheckbox(
      /Har barnet på grunn av en medisinsk tilstand ekstrautgifter til/i,
      /Drift av tekniske hjelpemidler/i,
    );
    cy.clickSaveAndContinue();

    cy.findByRole('textbox', { name: /Fra hvilket tidspunkt har barnet hatt ekstrautgiftene/i }).type('01.01.2025');
    cy.findByRole('textbox', { name: /Hvilket teknisk hjelpemiddel har barnet ekstrautgifter til/i }).type(
      'Kommunikasjonshjelpemiddel',
    );
    cy.findByRole('spinbutton', { name: /Ekstrautgifter per måned/i }).type('1500');
    cy.findByRole('textbox', { name: /Nærmere beskrivelse av utgiftene/i }).type(
      'Løpende utgifter til vedlikehold og abonnement.',
    );
    cy.findByRole('textbox', { name: /Hvor kommer hjelpemiddelet fra/i }).type('Nav hjelpemiddelsentral');
    answerRadio(
      /Har du dokumentasjon av ekstrautgifter til drift av tekniske hjelpemidler du skal sende inn til oss/i,
      /^Ja$/i,
    );
    cy.clickSaveAndContinue();

    cy.findByRole('textbox', {
      name: /Hvis du har flere opplysninger du mener er viktig for søknaden, kan du skrive dem her/i,
    }).type('Barnet trenger teknisk utstyr daglig hjemme og på skole.');
    answerRadio(/Har du nyere medisinske opplysninger du vil sende inn til oss/i, /^Nei$/i);
    cy.clickSaveAndContinue();

    attachNow(/Dokumentasjon av ekstrautgifter til drift av tekniske hjelpemidler/i);
    attachNow(/Annen dokumentasjon/i);
    cy.clickSaveAndContinue();

    cy.findByRole('checkbox', {
      name: /Jeg er kjent med at NAV kan innhente de opplysningene som er nødvendige for å avgjøre søknaden/i,
    }).check();
    cy.clickSaveAndContinue();

    cy.url().should('include', '/oppsummering');
    cy.contains('Jeg søker på vegne av eget barn under 18 år.').should('be.visible');
    cy.contains('Sverige').should('be.visible');
    cy.contains('Kommunikasjonshjelpemiddel').should('be.visible');
    cy.contains('1500').should('be.visible');
    cy.contains('Jeg har ikke oppdatert kontaktinformasjon.').should('be.visible');
  });
});
