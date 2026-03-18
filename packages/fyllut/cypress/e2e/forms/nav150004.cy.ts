const selectRadio = (groupName: RegExp, answer: RegExp) => {
  cy.findByRole('group', { name: groupName }).within(() => {
    cy.findByRole('radio', { name: answer }).check({ force: true });
  });
};

const visitFixtureComponentsForm = (fixture: string) => {
  const baseUrl = Cypress.config('baseUrl') ?? '';
  const path = baseUrl.endsWith('/fyllut') ? `${baseUrl}/components?sub=paper` : '/fyllut/components?sub=paper';

  cy.visitFixtureForm('components', { fixture, path, startOnFirstStep: false });
};

const advanceToQuestion = (attempts = 0) => {
  cy.get('body').then(($body) => {
    if ($body.text().match(/Søker du om stønad til skolepenger fra et bestemt tidspunkt/i)) {
      return;
    }

    const checkbox = $body.find('input[type="checkbox"]');

    if (checkbox.length > 0) {
      cy.wrap(checkbox[0]).check({ force: true });
    }

    if (attempts >= 2) {
      throw new Error('Did not reach the first questionnaire step for NAV 15-00.04');
    }

    cy.clickNextStep();
    advanceToQuestion(attempts + 1);
  });
};

const fillApplicantDetails = () => {
  cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Sara');
  cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Skole');
  selectRadio(/Har du norsk fødselsnummer eller d-nummer/i, /^Ja$/i);
  cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
  cy.findByRole('textbox', { name: /^Telefonnummer$/i }).type('12345678');
};

const fillChildRow = () => {
  cy.findAllByRole('textbox', { name: /Barnets fornavn/i })
    .last()
    .type('Mina');
  cy.findAllByRole('textbox', { name: /Barnets etternavn/i })
    .last()
    .type('Skolebarn');
  cy.findAllByRole('textbox', { name: /Barnets fødselsdato/i })
    .last()
    .type('15.03.2017');
  cy.findAllByRole('group', { name: /Bor barnet fast sammen med deg/i })
    .last()
    .within(() => {
      cy.findByRole('radio', { name: /^Ja$/i }).check({ force: true });
    });

  cy.findAllByRole('group', { name: /Har den andre forelderen samvær med barnet/i })
    .last()
    .within(() => {
      cy.findByRole('radio', { name: /^Ja$/i }).check({ force: true });
    });
  cy.findAllByRole('group', { name: /Har dere skriftlig samværsavtale/i })
    .last()
    .within(() => {
      cy.findByRole('radio', { name: /^Ja$/i }).check({ force: true });
    });
  cy.findAllByRole('group', { name: /Inneholder avtalen konkrete tidspunkt for samvær/i })
    .last()
    .within(() => {
      cy.findByRole('radio', { name: /^Nei$/i }).check({ force: true });
    });
  cy.findAllByRole('textbox', { name: /Beskriv hvordan samværet gjennomføres/i })
    .last()
    .type('Vi avtaler samvær fra uke til uke.');

  cy.findAllByRole('textbox', { name: /^Fornavn$/i })
    .last()
    .type('Per');
  cy.findAllByRole('textbox', { name: /^Etternavn$/i })
    .last()
    .type('Motforelder');
  cy.findAllByRole('group', { name: /Kjenner du til om den andre forelderen har norsk fødselsnummer eller D-nummer/i })
    .last()
    .within(() => {
      cy.findByRole('radio', { name: /^Nei$/i }).check({ force: true });
    });
  cy.findAllByRole('textbox', { name: /Den andre forelderens fødselsdato/i })
    .last()
    .type('10.10.1988');
  cy.findAllByRole('group', { name: /Bor den andre forelderen i utlandet/i })
    .last()
    .within(() => {
      cy.findByRole('radio', { name: /^Nei$/i }).check({ force: true });
    });
  cy.findAllByRole('group', { name: /Bor du og den andre forelderen nærme hverandre/i })
    .last()
    .within(() => {
      cy.findByRole('radio', { name: /^Nei$/i }).check({ force: true });
    });
  cy.findAllByRole('group', { name: /Har dere tidligere bodd i samme hus\/ leilighet/i })
    .last()
    .within(() => {
      cy.findByRole('radio', { name: /^Ja$/i }).check({ force: true });
    });
  cy.findAllByRole('textbox', { name: /Når flyttet dere fra hverandre/i })
    .last()
    .type('15.08.2022');
  cy.findAllByRole('group', { name: /Tilbringer du tid sammen med den andre forelderen/i })
    .last()
    .within(() => {
      cy.findByRole('radio', { name: /^Nei$/i }).check({ force: true });
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

describe('NAV 15-00.04 - production fixture parity', () => {
  it('keeps representative schooling and child conditionals aligned with the summary', () => {
    visitFixtureComponentsForm('forms/nav150004.json');
    advanceToQuestion();

    selectRadio(/Søker du om stønad til skolepenger fra et bestemt tidspunkt/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /^Fra dato/i }).type('01.08.2024');
    cy.findByRole('textbox', { name: /^Til dato/i }).type('30.06.2025');
    cy.clickNextStep();

    fillApplicantDetails();
    cy.clickNextStep();

    selectRadio(/Hva er din sivilstand/i, /^Separert$/i);
    selectRadio(/Ble du separert eller skilt i utlandet/i, /^Nei$/i);
    cy.findByRole('textbox', { name: /Dato for faktisk samlivsbrudd/i }).type('15.08.2022');
    selectRadio(/Deler du bolig med andre voksne/i, /^Nei$/i);
    selectRadio(/Har du planer om å gifte deg eller bli samboer/i, /^Nei$/i);
    cy.clickNextStep();

    selectRadio(/Er du nordisk statsborger/i, /^Ja$/i);
    selectRadio(/Oppholder du deg i Norge/i, /^Ja$/i);
    selectRadio(/Har du vært bosatt i Norge de siste 5 årene/i, /^Ja$/i);
    cy.clickNextStep();

    selectRadio(/Har du omsorg for barn under 18 år/i, /^Ja$/i);
    fillChildRow();
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /Navn på skole\/utdanningssted/i }).type('Oslo Met');
    cy.findByRole('textbox', { name: /Navn på utdanning/i }).type('Bachelor i økonomi');
    cy.findAllByRole('textbox', { name: /^Fra dato/i })
      .last()
      .type('01.08.2024');
    cy.findAllByRole('textbox', { name: /^Til dato/i })
      .last()
      .type('30.06.2025');
    selectRadio(/Studie tid/i, /Heltid/i);
    selectRadio(/Typestudie/i, /Offentlig/i);
    cy.findByRole('textbox', { name: /Utdanningsmål \/ yrkesmål/i }).type('Jeg skal fullføre graden min.');
    selectRadio(/Type utdanning/i, /Høyere utdanning/i);
    cy.findByRole('textbox', { name: /Studiepoeng per semester/i }).type('30');
    cy.findByRole('checkbox', { name: /Semesteravgift/i }).check({ force: true });
    cy.findByRole('checkbox', { name: /Skolepenger/i }).check({ force: true });
    cy.findAllByRole('textbox', { name: /^Semesteravgift$/i })
      .last()
      .type('900');
    cy.findAllByRole('textbox', { name: /^Skolepenger$/i })
      .last()
      .type('12000');
    cy.clickNextStep();

    selectRadio(/Har du andre opplysninger til saken/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Andre opplysninger/i }).type('Jeg trenger støtte for siste studieår.');
    cy.clickNextStep();

    cy.findByRole('checkbox', { name: /Jeg har gjort meg kjent med vilkårene for å motta skolepenger/i }).check();
    cy.findByRole('checkbox', {
      name: /Jeg er kjent med at jeg må legge ved dokumentasjon som bekrefter opplysningene i søknaden/i,
    }).check();
    cy.findByRole('checkbox', { name: /Jeg er kjent med at mangelfulle eller feilaktige opplysninger/i }).check();
    cy.clickNextStep();

    selectVisibleAttachmentChoices();
    cy.clickNextStep();

    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');

    cy.withinSummaryGroup('Sivilstatus og bosituasjon', () => {
      cy.contains('Separert').should('exist');
      cy.contains('15.08.2022').should('exist');
    });

    cy.withinSummaryGroup('Opplysninger om barn under 18 år som du har omsorgen for', () => {
      cy.contains('Mina').should('exist');
      cy.contains('Skolebarn').should('exist');
      cy.contains('Vi avtaler samvær fra uke til uke.').should('exist');
    });

    cy.withinSummaryGroup('Opplysninger om utdanningen', () => {
      cy.contains('Oslo Met').should('exist');
      cy.contains('Bachelor i økonomi').should('exist');
      cy.contains('30').should('exist');
    });

    cy.withinSummaryGroup('Vedlegg', () => {
      cy.contains('Avtale om samvær').should('exist');
      cy.contains('Erklæring om samlivsbrudd').should('exist');
      cy.contains('Dokumentasjon av utdanning det søkes stønad til').should('exist');
    });
  });
});
