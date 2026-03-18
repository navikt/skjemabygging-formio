const answerRadio = (question: RegExp, answer: RegExp) => {
  cy.findByRole('group', { name: question }).within(() => {
    cy.findByRole('radio', { name: answer }).check({ force: true });
  });
};

const chooseCheckbox = (question: RegExp, answer: RegExp) => {
  cy.findByRole('group', { name: question }).within(() => {
    cy.findByRole('checkbox', { name: answer }).check({ force: true });
  });
};

const completePersonalia = () => {
  cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Ola');
  cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Nordmann');
  answerRadio(/Har du norsk fødselsnummer eller d-nummer/i, /^Ja$/i);
  cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
  answerRadio(/Er Norge ditt bostedsland/i, /^Ja$/i);
  cy.clickNextStep();
};

const chooseVisibleAttachmentOptions = () => {
  cy.findAllByRole('radio', { name: /Jeg legger det ved dette skjemaet/i }).each(($radio) => {
    cy.wrap($radio).check({ force: true });
  });
};

const completeEosStep = () => {
  // Already on Panel 3 (Arbeidsforhold i EØS) when called
  answerRadio(/Har du jobbet i et annet EØS-land, Sveits eller Storbritannia/i, /^Nei$/i);
  cy.clickNextStep();
};

describe('NAV 04-16.03 - production fixture parity', () => {
  beforeEach(() => {
    cy.visitFixtureForm('nav041603', { fixture: 'forms/nav041603.json', startOnFirstStep: false });
    cy.clickStart();
    cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg har lest og forstått denne veiledningen/i }).check();
    cy.clickNextStep();
  });

  it('keeps restart-specific work and EØS conditionals aligned with the summary page', () => {
    completePersonalia();

    cy.findByRole('textbox', { name: /Skriv årsaken til at dagpengene ble stanset/i }).type(
      'Meldekortet ble stoppet mens jeg ventet på nytt arbeidsforhold.',
    );
    cy.findByRole('textbox', { name: /Hvilken dato søker du gjenopptak av dagpenger fra/i }).type('01.03.2025');
    answerRadio(/Har du jobbet, eller hatt endringer i ett eller flere arbeidsforhold/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Arbeidsgiver/i }).type('Nordisk Bemanning AS');
    answerRadio(/Hva er årsaken til endringen i arbeidsforholdet ditt/i, /Kontrakten er utgått/i);
    cy.findByRole('textbox', { name: /Fra hvilken dato startet du i dette arbeidsforholdet/i }).type('01.10.2024');
    cy.findByRole('textbox', { name: /Til hvilken dato har du jobbet i dette arbeidsforholdet/i }).type('28.02.2025');
    answerRadio(
      /Har du fått tilbud om forlengelse av arbeidskontrakten eller tilbud om annen stilling hos arbeidsgiveren din/i,
      /Nei, jeg har ikke fått tilbud om å fortsette hos arbeidsgiveren min/i,
    );
    answerRadio(/Arbeidet du skift, turnus eller rotasjon/i, /Nei, jeg arbeidet ikke skift, turnus eller rotasjon/i);
    answerRadio(/Hadde du flere arbeidsforhold da arbeidstiden din ble redusert/i, /^Nei$/i);
    answerRadio(
      /Vet du hvor mange timer du har jobbet i uka i dette arbeidsforholdet før kontrakten din gikk ut/i,
      /^Ja$/i,
    );
    cy.findByRole('textbox', { name: /Hvor mange timer i uka jobbet du i dette arbeidsforholdet/i }).type('25');
    cy.clickNextStep();

    completeEosStep();

    answerRadio(/Driver du egen næringsvirksomhet/i, /Nei, jeg driver ikke egen næringsvirksomhet/i);
    answerRadio(/Driver du eget gårdsbruk/i, /Nei, jeg driver ikke gårdsbruk/i);
    cy.clickNextStep();

    answerRadio(/Har du avtjent verneplikt i tre av de siste 12 månedene/i, /^Nei$/i);
    cy.clickNextStep();

    chooseCheckbox(
      /Mottar du eller har du søkt om noen av disse ytelsene/i,
      /Nei, jeg verken mottar eller har søkt om noen av disse ytelsene/i,
    );
    answerRadio(/Får du eller vil du få lønn eller andre økonomiske goder fra tidligere arbeidsgiver/i, /^Nei$/i);
    cy.clickNextStep();

    answerRadio(/Tar du utdanning eller opplæring/i, /har ikke vært det de siste seks månedene/i);
    answerRadio(
      /Planlegger du å starte eller fullføre utdanning eller opplæring samtidig som du mottar dagpenger/i,
      /^Ja$/i,
    );
    cy.clickNextStep();

    answerRadio(/Forsørger du barn under 18 år/i, /^Nei$/i);
    cy.clickNextStep();

    answerRadio(/Kan du jobbe både heltid og deltid/i, /^Ja$/i);
    answerRadio(/Kan du jobbe i hele Norge/i, /^Ja$/i);
    answerRadio(/Kan du ta alle typer arbeid/i, /^Nei$/i);
    cy.findByRole('textbox', { name: /Hvilke typer arbeid kan du ikke ta/i }).type(
      'Jeg kan ikke ta nattarbeid i denne perioden.',
    );
    answerRadio(/Er du villig til å ta bytte yrke eller gå ned i lønn/i, /^Ja$/i);
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /Tilleggsopplysninger/i }).type('Jeg står klar for å starte i arbeid igjen.');
    cy.clickNextStep();

    cy.findAttachment(/Dokumentasjon av arbeidsforhold i EØS/i).should('exist');
    chooseVisibleAttachmentOptions();
    cy.clickNextStep();

    cy.findByRole('checkbox', {
      name: /Jeg bekrefter at jeg har gitt riktige og fullstendige opplysninger/i,
    }).check();
    cy.clickNextStep();

    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');
    cy.contains('Meldekortet ble stoppet mens jeg ventet på nytt arbeidsforhold.').should('exist');
    cy.contains('Jeg kan ikke ta nattarbeid i denne perioden.').should('exist');

    cy.withinSummaryGroup('Vedlegg', () => {
      cy.contains('Dokumentasjon av arbeidsforhold i EØS').should('not.exist');
      cy.contains('Kopi av oppsigelse').should('not.exist');
    });
  });
});
