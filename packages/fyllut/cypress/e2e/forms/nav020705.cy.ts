describe('NAV 02-07.05 - Søknad om frivillig medlemskap i folketrygden under opphold i Norge', () => {
  beforeEach(() => {
    cy.intercept('GET', '/fyllut/api/config*', { body: {} }).as('getConfig');
    cy.intercept('GET', '/fyllut/api/forms/*', { fixture: 'forms/nav020705.json' }).as('getForm');
    cy.intercept('GET', '/fyllut/api/translations/*', { body: {} }).as('getTranslations');
    cy.visit('/fyllut/nav020705?sub=paper');
    cy.wait('@getConfig');
    cy.wait('@getForm');
    cy.wait('@getTranslations');
    cy.clickStart();
  });

  it('should fill out and submit the form with one conditional branch', () => {
    // Fyller du ut søknaden på vegne av andre enn deg selv? Ja
    cy.findByRole('group', { name: /Fyller du ut.*vegne av andre.*deg selv/i }).within(() => {
      cy.findByRole('radio', { name: /^Ja$/i }).check();
    });
    cy.clickNextStep();

    // Fullmakt - Hvorfor søker du på vegne av en annen person? (choose first option)
    cy.findByRole('group', { name: /Hvorfor søker.*vegne av.*person/i }).within(() => {
      cy.findByRole('radio', { name: /^Jeg har fullmakt$/i }).check();
    });
    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Fullmaktfornavn');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Fullmaktetternavn');
    cy.clickNextStep();

    // Dine opplysninger
    cy.findByRole('textbox', { name: /Fornavn/i }).type('Ola');
    cy.findByRole('textbox', { name: /Etternavn/i }).type('Nordmann');
    // Answer Ja to 'Har du norsk fødselsnummer eller d-nummer?'
    cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/i }).within(() => {
      cy.findByRole('radio', { name: /^Ja$/i }).check();
    });
    cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
    cy.clickNextStep();

    // Om situasjonen din (choose "I Norge")
    cy.findByRole('group', { name: /Bor du i Norge eller et annet land til vanlig/i }).within(() => {
      cy.findByRole('radio', { name: /^I Norge$/i }).check();
    });
    cy.clickNextStep();

    // Er du medlem i en utenlandsk trygdeordning? (choose Nei)
    cy.findByRole('group', { name: /Er du medlem i en utenlandsk trygdeordning/i }).within(() => {
      cy.findByRole('radio', { name: /^Nei$/i }).check();
    });
    cy.clickNextStep();

    // Om søknaden - Hvilken periode søker du for?
    cy.findByRole('textbox', { name: /Fra dato/i }).type('01.01.2025');
    cy.findByRole('textbox', { name: /Til dato/i }).type('31.12.2025');
    cy.findByRole('group', { name: /Hvilken trygdedekning søker du om/i }).within(() => {
      cy.findByRole('radio', { name: /Folketrygdens helsedel/i }).check();
    });
    cy.findByRole('group', { name: /Skal du arbeide i Norge/i }).within(() => {
      cy.findByRole('radio', { name: /Ja/i }).check();
    });
    cy.clickNextStep();

    // Om arbeidet i Norge
    cy.findByRole('textbox', { name: /Navn på virksomhet/i }).type('Testbedrift AS');
    cy.findByRole('textbox', { name: /Organisasjonsnummer/i }).type('889640782');
    cy.findByRole('textbox', { name: /Gateadresse/i }).type('Testveien 1');
    cy.findByRole('textbox', { name: /Postnummer/i }).type('0123');
    cy.findByRole('textbox', { name: /Poststed/i }).type('Oslo');
    cy.findByRole('combobox', { name: /Land/i }).type('Norge{enter}');
    cy.findByRole('group', { name: /Hvor skal arbeidet utføres/i }).within(() => {
      cy.findByRole('radio', { name: /På samme adresse som over/i }).check();
    });
    cy.findByRole('textbox', { name: /Stilling/i }).type('Utvikler');
    cy.clickNextStep();

    // Skatteforhold og inntekt
    cy.findByRole('group', { name: /Betaler du skatt til Norge/i }).within(() => {
      cy.findByRole('radio', { name: /Ja/i }).check();
    });
    cy.findByRole('group', { name: /Lønnes du av en norsk virksomhet/i }).within(() => {
      cy.findByRole('radio', { name: /Ja/i }).check();
    });
    cy.findByRole('textbox', { name: /Oppgi forventet inntekt i søknadsperioden/i }).type('50000');
    cy.findByRole('group', { name: /Har du andre inntekter/i }).within(() => {
      cy.findByRole('radio', { name: /Nei/i }).check();
    });
    cy.clickNextStep();

    // Trygdeavgift til NAV (choose Nei)
    cy.findByRole('group', {
      name: /Ønsker du at noen andre skal motta og betale faktura for trygdeavgift for deg/i,
    }).within(() => {
      cy.findByRole('radio', { name: /^Nei$/i }).check();
    });
    cy.clickNextStep();

    // Familiemedlemmer (choose Nei)
    cy.findByRole('group', { name: /Søker du for.*barn under 18 år/i }).within(() => {
      cy.findByRole('radio', { name: /^Nei$/i }).check();
    });
    cy.clickNextStep();

    // Tilleggsopplysninger (choose Nei)
    cy.findByRole('group', { name: /Har du noen flere.*opplysninger til.*søknaden/i }).within(() => {
      cy.findByRole('radio', { name: /^Nei$/i }).check();
    });
    cy.clickNextStep();

    // Erklæring fra søker
    cy.findByRole('checkbox', {
      name: /Jeg bekrefter at opplysningene er korrekte, og er kjent med at NAV kan innhente opplysninger som er nødvendige for å vurdere søknaden/i,
    }).check();
    cy.clickNextStep();

    // Vedlegg (upload dummy file for required attachments)
    cy.findByRole('group', {
      name: /Dokumentasjon på at du har fullmakt til å sende inn skjema på vegne av søker/i,
    }).within(() => {
      cy.findByRole('radio', { name: /Jeg legger det ved dette skjemaet/i }).check();
    });
    cy.findByRole('group', { name: /Annen dokumentasjon/i }).within(() => {
      cy.findByRole('radio', { name: /Jeg legger det ved dette skjemaet/i }).check();
    });
    cy.clickNextStep();

    // Oppsummering
    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');
  });
});
