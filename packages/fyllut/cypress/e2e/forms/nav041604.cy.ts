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
  cy.clickNextStep();

  cy.get('body').then(($body) => {
    if ($body.text().match(/Hvilket land har du jobbet i/i)) {
      cy.findByRole('combobox', { name: /Hvilket land har du jobbet i/i }).type('Sverige{downArrow}{enter}');
      cy.clickNextStep();
    }
  });

  cy.get('body').then(($body) => {
    if ($body.text().match(/Har du jobbet i et annet EØS-land, Sveits eller Storbritannia/i)) {
      answerRadio(/Har du jobbet i et annet EØS-land, Sveits eller Storbritannia.*36 månedene/i, /^Nei$/i);
      cy.clickNextStep();
    }
  });
};

describe('NAV 04-16.04 - production fixture parity', () => {
  beforeEach(() => {
    cy.visitFixtureForm('nav041604', { fixture: 'forms/nav041604.json', startOnFirstStep: false });
    cy.clickStart();
    cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg har lest og forstått denne veiledningen/i }).check();
    cy.clickNextStep();
  });

  it('keeps permittering and rotation conditionals aligned with the summary page', () => {
    completePersonalia();

    cy.findByRole('textbox', { name: /Skriv årsaken til at dagpengene ble stanset/i }).type(
      'Dagpengene ble stanset mens permitteringen ble forlenget.',
    );
    cy.findByRole('textbox', { name: /Hvilken dato søker du gjenopptak av dagpenger fra/i }).type('01.03.2025');
    answerRadio(/Har du jobbet, eller hatt endringer i ett eller flere arbeidsforhold/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Arbeidsgiver/i }).type('Permittert Arbeid AS');
    answerRadio(/Er dette et midlertidig arbeidsforhold med en kontraktfestet sluttdato/i, /^Nei$/i);
    answerRadio(/Er du permittert fra fiskeforedlings- eller fiskeoljeindustrien/i, /^Nei$/i);
    answerRadio(/Vet du hvor mange timer du har jobbet i uka før du ble permittert/i, /^Ja$/i);
    cy.findByRole('textbox', {
      name: /Skriv inn hvor mange timer du har jobbet per uke i dette arbeidsforholdet/i,
    }).type('37');
    cy.findByRole('textbox', { name: /Hvor mange prosent er du permittert/i }).type('60');
    cy.findByRole('textbox', { name: /Når startet du i denne jobben/i }).type('01.08.2024');
    cy.findByRole('textbox', { name: /Fra hvilken dato er du permittert/i }).type('01.02.2025');
    answerRadio(/Vet du når lønnspliktperioden til arbeidsgiveren din er/i, /^Nei$/i);
    answerRadio(/Arbeidet du skift, turnus eller rotasjon/i, /Ja, jeg arbeidet rotasjon/i);
    cy.findByRole('textbox', { name: /Oppgi type rotasjon/i }).type('2 uker på, 2 uker av');
    cy.findByRole('textbox', { name: /Oppgi første dag i siste arbeidsperiode/i }).type('15.01.2025');
    cy.findByRole('textbox', { name: /Oppgi siste arbeidsdag/i }).type('31.01.2025');
    cy.findByRole('textbox', { name: /Oppgi første dag med avspasering i siste rotasjon/i }).type('01.02.2025');
    cy.findByRole('textbox', { name: /Oppgi siste dag med avspasering i siste rotasjon/i }).type('14.02.2025');
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
      /^Nei$/i,
    );
    cy.clickNextStep();

    answerRadio(/Forsørger du barn under 18 år/i, /^Nei$/i);
    cy.clickNextStep();

    answerRadio(/Kan du jobbe både heltid og deltid/i, /^Ja$/i);
    answerRadio(/Kan du jobbe i hele Norge/i, /^Ja$/i);
    answerRadio(/Kan du ta alle typer arbeid/i, /^Ja$/i);
    answerRadio(/Er du villig til å ta bytte yrke eller gå ned i lønn/i, /^Ja$/i);
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /Tilleggsopplysninger/i }).type(
      'Jeg er tilgjengelig for andre oppdrag mens permitteringen varer.',
    );
    cy.clickNextStep();

    cy.contains(/Permitteringsvarsel/i).should('exist');
    chooseVisibleAttachmentOptions();
    cy.clickNextStep();

    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');
    cy.contains('Permittert Arbeid AS').should('exist');
    cy.contains('60').should('exist');
    cy.contains('2 uker på, 2 uker av').should('exist');

    cy.withinSummaryGroup('Vedlegg', () => {
      cy.contains('Permitteringsvarsel').should('exist');
      cy.contains('Timelister').should('not.exist');
    });
  });
});
