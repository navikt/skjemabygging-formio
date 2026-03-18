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

const advancePastAttachmentsIfShown = () => {
  cy.get('body').then(($body) => {
    if ($body.text().match(/Vedlegg/i)) {
      if ($body.find('[data-cy="attachment-upload"]').length > 0) {
        chooseVisibleAttachmentOptions();
      }
      cy.clickNextStep();
    }
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

describe('NAV 04-01.03 - production fixture parity', () => {
  beforeEach(() => {
    cy.visitFixtureForm('nav040103', { fixture: 'forms/nav040103.json', startOnFirstStep: false });
    cy.clickStart();
    cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg har lest og forstått denne veiledningen/i }).check();
    cy.clickNextStep();
  });

  it('keeps dismissal and reduced-work-ability conditionals aligned with the summary page', () => {
    completePersonalia();

    cy.findByRole('textbox', { name: /Hvilken dato søker du dagpenger fra/i }).type('01.03.2025');
    answerRadio(/Velg det alternativet som passer best for deg/i, /Jeg har hatt fast arbeidstid i minst seks måneder/i);
    cy.findByRole('textbox', { name: /Arbeidsgiver/i }).type('Test Arbeidsgiver AS');
    answerRadio(/Hva er årsaken til endringen i arbeidsforholdet ditt/i, /Arbeidsgiver har sagt meg opp/i);
    cy.findByRole('textbox', { name: /Fra hvilken dato startet du i dette arbeidsforholdet/i }).type('01.08.2024');
    cy.findByRole('textbox', { name: /Til hvilken dato har du jobbet i dette arbeidsforholdet/i }).type('28.02.2025');
    cy.findByRole('textbox', { name: /Hva var årsaken til at du ble sagt opp/i }).type(
      'Arbeidsgiveren min la ned avdelingen.',
    );
    answerRadio(
      /Har du fått tilbud om å fortsette hos arbeidsgiveren din i en annen stilling eller et annet sted i Norge/i,
      /Nei, jeg har ikke fått tilbud om å fortsette hos arbeidsgiveren min/i,
    );
    answerRadio(/Arbeidet du skift, turnus eller rotasjon/i, /Nei, jeg arbeidet ikke skift, turnus eller rotasjon/i);
    answerRadio(/Hadde du flere arbeidsforhold da arbeidstiden din ble redusert/i, /^Nei$/i);
    answerRadio(
      /Vet du hvor mange timer du har jobbet i uka i dette arbeidsforholdet før arbeidsgiveren din sa deg opp/i,
      /^Ja$/i,
    );
    cy.findByRole('textbox', { name: /Hvor mange timer i uka jobbet du i dette arbeidsforholdet/i }).type('37');
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

    answerRadio(/Kan du jobbe både heltid og deltid/i, /^Nei$/i);
    chooseCheckbox(/Velg situasjonen som gjelder deg/i, /Redusert helse, fysisk eller psykisk/i);
    cy.findByRole('textbox', { name: /Før opp antall timer du kan arbeide per uke/i }).type('20');
    answerRadio(/Kan du jobbe i hele Norge/i, /^Ja$/i);
    answerRadio(/Kan du ta alle typer arbeid/i, /^Nei$/i);
    cy.findByRole('textbox', { name: /Hvilke typer arbeid kan du ikke ta/i }).type(
      'Jeg kan ikke ta fysisk krevende arbeid.',
    );
    answerRadio(/Er du villig til å bytte yrke eller gå ned i lønn/i, /^Ja$/i);
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /Tilleggsopplysninger/i }).type('Jeg ønsker rask behandling av søknaden.');
    cy.clickNextStep();

    advancePastAttachmentsIfShown();

    cy.findByRole('checkbox', {
      name: /Jeg bekrefter at jeg har gitt riktige og fullstendige opplysninger/i,
    }).check();
    cy.clickNextStep();

    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');
    cy.contains('Test Arbeidsgiver AS').should('exist');
    cy.contains('Arbeidsgiveren min la ned avdelingen.').should('exist');
    cy.contains('Redusert helse, fysisk eller psykisk').should('exist');
    cy.contains('Jeg kan ikke ta fysisk krevende arbeid.').should('exist');

    cy.get('body').then(($body) => {
      if ($body.text().match(/Vedlegg/i)) {
        cy.withinSummaryGroup('Vedlegg', () => {
          cy.contains('Timelister').should('not.exist');
        });
      }
    });
  });
});
