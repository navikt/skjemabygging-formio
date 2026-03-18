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

describe('NAV 10-07.86 - Hjelpemiddel til kognisjon, kommunikasjon og lese- og skrivevansker', () => {
  it('shows the digital-only self checkbox instead of the paper branching radios', () => {
    cy.visitFixtureForm('components', { fixture: 'forms/nav100786.json', startOnFirstStep: false, sub: 'digital' });
    confirmIntroAndStart();

    cy.findByRole('checkbox', { name: /Jeg søker på vegne av meg selv/i }).should('be.visible');
    cy.findByRole('group', { name: /Hvem fyller ut søknaden/i }).should('not.exist');
  });

  it('completes a digital self path and keeps key answers on the summary page', () => {
    cy.visitFixtureForm('components', { fixture: 'forms/nav100786.json', startOnFirstStep: false, sub: 'digital' });
    confirmIntroAndStart();

    cy.findByRole('checkbox', { name: /Jeg søker på vegne av meg selv/i }).check();
    answerRadio(/Er du over 18 år/i, /^Ja$/i);
    answerRadio(/Vet du hvilket hjelpemiddel du trenger/i, /^Ja$/i);
    cy.clickSaveAndContinue();

    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Kari');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Nordmann');
    answerRadio(/Har du norsk fødselsnummer eller d-nummer/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
    answerRadio(/Hvordan bor du/i, /For meg selv/i);
    cy.findByRole('textbox', { name: /Telefonnummer/i }).type('12345678');
    cy.findByRole('textbox', { name: /Hvilken kommune eller bydel bor du i/i }).type('Oslo');
    cy.clickSaveAndContinue();

    answerRadio(/Søker du om hjelpemidler som skal brukes spesielt i arbeidsliv eller høyere utdanning/i, /^Nei$/i);
    answerRadio(/Søker du om programvare for lese- og skrivevansker/i, /^Nei$/i);
    cy.findByRole('textbox', { name: /HMS-artikkelnummer/i }).type('123456');
    answerRadio(/Har du behov for mer enn 1 eksemplar av dette hjelpemiddelet/i, /^Nei$/i);
    cy.findByRole('textbox', { name: /Navn på eller beskrivelse av hjelpemiddelet/i }).type('Tale- og skrivehjelp');
    cy.findByRole('checkbox', {
      name: /Jeg er klar over at utlånte hjelpemidler er Arbeids- og velferdsetatens eiendom/i,
    }).check();
    cy.findByRole('checkbox', {
      name: /Jeg kan ikke kreve at hjelpemidlene er ubrukte eller av et bestemt merke/i,
    }).check();
    cy.findByRole('checkbox', {
      name: /Når jeg ikke lenger har bruk for et hjelpemiddel, skal det leveres tilbake til Nav/i,
    }).check();
    cy.clickSaveAndContinue();

    answerRadio(/Har du tidligere levert relevant dokumentasjon fra fagpersonell/i, /^Nei$/i);
    answerRadio(/Har du prøvd ut hjelpemiddelet tidligere/i, /^Ja$/i);
    answerRadio(/Har du allerede fått hjelpemiddelet/i, /^Nei$/i);
    cy.findByRole('textbox', {
      name: /Beskriv din diagnose eller hva slags vansker du har som gjør at du trenger hjelpemiddelet/i,
    }).type('Jeg har lese- og skrivevansker som gjør skole- og hverdagsoppgaver krevende.');
    cy.findByRole('textbox', {
      name: /Beskriv hvordan hjelpemiddelet er nødvendig for å bedre funksjonsevnen din i dagliglivet/i,
    }).type('Det gjør det lettere å lese tekst og skrive meldinger uten hjelp fra andre.');
    cy.findByRole('textbox', {
      name: /Beskriv hvilke andre tiltak eller hjelpemidler du har prøvd, og forklar hvorfor dette ikke er tilstrekkelig/i,
    }).type('Jeg har prøvd enkel rettefunksjon, men trenger mer omfattende støtte for opplesing og strukturering.');
    cy.clickSaveAndContinue();

    chooseCheckbox(/Har du tilleggsvansker/i, /Lesing og skriving/i);
    cy.findByRole('textbox', { name: /Beskriv dine vansker med lesing og skriving/i }).type(
      'Jeg mister oversikt i lange tekster og skriver sakte uten teknisk støtte.',
    );
    cy.clickSaveAndContinue();

    answerRadio(/Skal hjelpemidlene til din folkeregistrerte adresse/i, /^Ja$/i);
    answerRadio(/Hvem er kontaktperson ved utlevering/i, /Jeg tar imot hjelpemiddelet selv/i);
    cy.findByRole('textbox', { name: /Merknader ved utlevering/i }).type('Ring før levering.');
    cy.clickSaveAndContinue();

    answerRadio(
      /Har du noen som kan hjelpe deg å ta i bruk hjelpemiddelet og følge opp bruken av det/i,
      /Nei, jeg klarer det selv/i,
    );
    cy.clickSaveAndContinue();

    cy.findAttachment(/Uttalelse fra fagperson om diagnose og funksjonsevne/i).within(() => {
      cy.findByRole('radio', { name: /Jeg legger det ved dette skjemaet/i }).check();
    });
    cy.findAttachment(/Annen dokumentasjon/i).within(() => {
      cy.findByRole('radio', { name: /Jeg legger det ved dette skjemaet/i }).check();
    });
    cy.clickSaveAndContinue();

    cy.url().should('include', '/oppsummering');
    cy.contains('Tale- og skrivehjelp').should('be.visible');
    cy.contains('Lesing og skriving').should('be.visible');
    cy.contains('Ring før levering.').should('be.visible');
    cy.contains('Nei, jeg klarer det selv').should('be.visible');
  });
});
