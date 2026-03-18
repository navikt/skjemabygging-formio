const completeCommonOpeningSteps = () => {
  cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Ola');
  cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Nordmann');
  cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/i }).within(() => {
    cy.findByRole('radio', { name: /^Ja$/i }).check();
  });
  cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
  cy.clickNextStep();

  cy.findByRole('group', { name: /Bor du i Norge eller et annet land til vanlig/i }).within(() => {
    cy.findByRole('radio', { name: /^I Norge$/i }).check();
  });
  cy.clickNextStep();

  cy.findByRole('group', { name: /Er du medlem i en utenlandsk trygdeordning/i }).within(() => {
    cy.findByRole('radio', { name: /^Nei$/i }).check();
  });
  cy.clickNextStep();

  cy.findByRole('textbox', { name: /^Fra dato/i }).type('01.01.2025');
  cy.findByRole('textbox', { name: /^Til dato/i }).type('31.12.2025');
  cy.findByRole('group', { name: /Hvilken trygdedekning søker du om/i }).within(() => {
    cy.findByRole('radio', { name: /Folketrygdens helsedel/i }).check();
  });
  cy.findByRole('group', { name: /Skal du arbeide i Norge/i }).within(() => {
    cy.findByRole('radio', { name: /^Ja$/i }).check();
  });
  cy.clickNextStep();

  cy.findByRole('textbox', { name: /Navn på virksomhet/i }).type('Testbedrift AS');
  cy.findByRole('textbox', { name: /Organisasjonsnummer/i }).type('889640782');
  cy.findByRole('textbox', { name: /Gateadresse/i }).type('Testveien 1');
  cy.findByRole('textbox', { name: /^Postnummer$/i }).type('0123');
  cy.findByRole('textbox', { name: /^Poststed$/i }).type('Oslo');
  cy.findByRole('combobox', { name: /^Land$/i }).type('Norge{enter}');
  cy.findByRole('group', { name: /Hvor skal arbeidet utføres/i }).within(() => {
    cy.findByRole('radio', { name: /På samme adresse som over/i }).check();
  });
  cy.findByRole('textbox', { name: /Stilling/i }).type('Utvikler');
  cy.clickNextStep();

  cy.findByRole('group', { name: /Betaler du skatt til Norge/i }).within(() => {
    cy.findByRole('radio', { name: /^Ja$/i }).check();
  });
  cy.findByRole('group', { name: /Lønnes du av en norsk virksomhet/i }).within(() => {
    cy.findByRole('radio', { name: /^Ja$/i }).check();
  });
  cy.findByRole('textbox', { name: /Oppgi forventet inntekt i søknadsperioden/i }).type('50000');
  cy.findByRole('group', { name: /Har du andre inntekter/i }).within(() => {
    cy.findByRole('radio', { name: /^Nei$/i }).check();
  });
  cy.clickNextStep();
};

const completeFinalStepsToSummary = () => {
  cy.findByRole('group', { name: /Søker du for.*barn under 18 år/i }).within(() => {
    cy.findByRole('radio', { name: /^Nei$/i }).check();
  });
  cy.clickNextStep();

  cy.findByRole('group', { name: /Har du noen flere.*opplysninger til.*søknaden/i }).within(() => {
    cy.findByRole('radio', { name: /^Nei$/i }).check();
  });
  cy.clickNextStep();

  cy.findByRole('checkbox', {
    name: /Jeg bekrefter at opplysningene er korrekte, og er kjent med at NAV kan innhente opplysninger som er nødvendige for å vurdere søknaden/i,
  }).check();
  cy.clickNextStep();

  cy.findByRole('heading', { level: 2, name: /Vedlegg/i }).should('exist');
  cy.findAllByRole('radio', { name: /Jeg legger det ved dette skjemaet/i }).check({ force: true });
  cy.clickNextStep();

  cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');
};

describe('NAV 02-07.05 - production fixture parity', () => {
  beforeEach(() => {
    cy.visitFixtureForm('nav020705');
  });

  it('shows fullmakt-specific panels and attachments on both the form and summary', () => {
    cy.findByRole('group', { name: /Fyller du ut.*vegne av andre.*deg selv/i }).within(() => {
      cy.findByRole('radio', { name: /^Ja$/i }).check();
    });
    cy.clickNextStep();

    cy.findByRole('heading', { level: 2, name: /Fullmakt/i }).should('exist');
    cy.findByRole('group', { name: /Hvorfor søker.*vegne av.*person/i }).within(() => {
      cy.findByRole('radio', { name: /^Jeg har fullmakt$/i }).check();
    });
    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Fullmaktfornavn');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Fullmaktetternavn');
    cy.clickNextStep();

    completeCommonOpeningSteps();

    cy.findByRole('group', {
      name: /Ønsker du at noen andre skal motta og betale faktura for trygdeavgift for deg/i,
    }).within(() => {
      cy.findByRole('radio', { name: /^Nei$/i }).check();
    });
    cy.clickNextStep();

    completeFinalStepsToSummary();

    cy.withinSummaryGroup('Fullmakt', () => {
      cy.contains('Hvorfor søker du på vegne av en annen person?').should('exist');
      cy.contains('Jeg har fullmakt').should('exist');
      cy.contains('Fullmaktfornavn').should('exist');
      cy.contains('Fullmaktetternavn').should('exist');
      cy.contains('Virksomhetens navn').should('not.exist');
    });

    cy.withinSummaryGroup('Vedlegg', () => {
      cy.contains('Dokumentasjon på at du har fullmakt til å sende inn skjema på vegne av søker').should('exist');
      cy.contains('Fullmakt for mottak og betaling av faktura').should('not.exist');
    });
  });

  it('replaces the invoice recipient organisation number with address details in both the form and summary when it is unknown', () => {
    cy.findByRole('group', { name: /Fyller du ut.*vegne av andre.*deg selv/i }).within(() => {
      cy.findByRole('radio', { name: /^Nei$/i }).check();
    });
    cy.clickNextStep();

    completeCommonOpeningSteps();

    cy.findByRole('group', {
      name: /Ønsker du at noen andre skal motta og betale faktura for trygdeavgift for deg/i,
    }).within(() => {
      cy.findByRole('radio', { name: /^Ja$/i }).check();
    });

    cy.findByRole('group', { name: /Hvem skal motta faktura for deg/i })
      .should('be.visible')
      .within(() => {
        cy.findByRole('radio', { name: /En arbeidsgiver eller virksomhet/i }).check();
      });

    cy.findByRole('textbox', { name: /Virksomhetens navn/i }).type('Fakturabedrift AS');
    cy.findByRole('textbox', { name: /Organisasjonsnummer til enheten som skal motta faktura/i }).should('be.visible');
    cy.findByRole('checkbox', { name: /Jeg vet ikke hva organisasjonsnummeret er/i }).check();
    cy.findByRole('textbox', { name: /Organisasjonsnummer til enheten som skal motta faktura/i }).should('not.exist');

    cy.findByRole('textbox', { name: /^Adresse$/i })
      .last()
      .type('Fakturaveien 10');
    cy.findByRole('textbox', { name: /^Postnummer$/i })
      .last()
      .type('0456');
    cy.findByRole('textbox', { name: /^Poststed$/i })
      .last()
      .type('Oslo');
    cy.findByRole('textbox', { name: /Kontaktperson/i }).type('Nina Betaler');
    cy.findByRole('textbox', { name: /^Telefonnummer$/i }).type('99887766');
    cy.findByRole('group', {
      name: /For hvilken periode skal denne virksomheten motta og betale faktura for deg/i,
    }).within(() => {
      cy.findByRole('radio', { name: /For perioden søknaden gjelder/i }).check();
    });
    cy.clickNextStep();

    completeFinalStepsToSummary();

    cy.withinSummaryGroup('Trygdeavgift til NAV', () => {
      cy.contains('Virksomhetens navn').should('exist');
      cy.contains('Fakturabedrift AS').should('exist');
      cy.contains('Organisasjonsnummer til enheten som skal motta faktura').should('not.exist');
      cy.contains('Fakturaveien 10').should('exist');
      cy.contains('Nina Betaler').should('exist');
    });
  });
});
