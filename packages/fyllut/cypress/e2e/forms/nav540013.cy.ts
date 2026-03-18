const selectRadio = (question: RegExp, answer: RegExp) => {
  cy.findByRole('group', { name: question }).within(() => {
    cy.findByRole('radio', { name: answer }).check({ force: true });
  });
};

const fillField = (label: RegExp, value: string) => {
  cy.findByLabelText(label).type(value);
};

const fillLastField = (label: RegExp, value: string) => {
  cy.findAllByLabelText(label).last().type(value);
};

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

const completeIntroStepIfPresent = () => {
  cy.get('body').then(($body) => {
    if (!$body.text().includes('Jeg bekrefter at jeg vil svare så riktig som jeg kan')) {
      return;
    }

    cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/i }).check({ force: true });
    cy.clickNextStep();
  });
};

const attachNow = (name: RegExp) => {
  cy.findAttachment(name).within(() => {
    cy.findByRole('radio', { name: /Jeg legger det ved dette skjemaet/i }).check({ force: true });
  });
};

describe('NAV 54-00.13 - Søknad om særbidrag', () => {
  it('keeps child specific conditional answers aligned with the summary page', () => {
    cy.visitFixtureForm('components', { fixture: 'forms/nav540013.json', startOnFirstStep: false });
    confirmIntroAndStart();
    completeIntroStepIfPresent();

    fillField(/^Fornavn$/i, 'Siri');
    fillField(/^Etternavn$/i, 'Søker');
    selectRadio(/Har du norsk fødselsnummer eller d-nummer/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
    cy.clickNextStep();

    fillLastField(/Barnets fornavn/i, 'Mina');
    fillLastField(/Barnets etternavn/i, 'Eksempel');
    fillLastField(/Barnets fødselsdato/i, '03.04.2014');
    cy.findAllByRole('group', { name: /^Bor barnet i Norge\?$/i })
      .last()
      .within(() => {
        cy.findByRole('radio', { name: /^Ja$/i }).check({ force: true });
      });
    cy.findAllByRole('group', { name: /^Bor barnet fast hos deg\?$/i })
      .last()
      .within(() => {
        cy.findByRole('radio', { name: /^Ja$/i }).check({ force: true });
      });
    cy.findAllByRole('group', { name: /Har barnet delt fast bosted/i })
      .last()
      .within(() => {
        cy.findByRole('radio', { name: /^Ja$/i }).check({ force: true });
      });
    fillField(/Hvor mange netter er barnet hos den andre forelderen per måned/i, '8');
    cy.findAllByRole('group', {
      name: /Har Nav mottatt avtalen om delt fast bosted for dette barnet i denne saken/i,
    })
      .last()
      .within(() => {
        cy.findByRole('radio', { name: /^Nei$/i }).check({ force: true });
      });
    cy.clickNextStep();

    cy.findAllByRole('group', { name: /Hva søker du særbidrag for til dette barnet/i })
      .last()
      .within(() => {
        cy.findByRole('checkbox', { name: /Konfirmasjon/i }).check({ force: true });
      });
    fillLastField(/Barnets fornavn/i, 'Mina');
    fillField(/Beløp for utgift til konfirmasjon/i, '12000');
    selectRadio(/Har du oppgitt beløpet for konfirmasjon i norske kroner/i, /^Ja$/i);
    selectRadio(/Har du og den andre parten hatt en avtale om å dele på utgiftene til konfirmasjonen/i, /^Ja$/i);
    fillField(/Oppgi hva du og den andre parten har avtalt om konfirmasjonen/i, 'Vi avtalte å dele kostnadene likt.');
    selectRadio(/Har du fått særbidraget til konfirmasjonen i henhold til avtalen/i, /Jeg har fått noe/i);
    fillField(/Oppgi hva den andre parten har betalt for konfirmasjonen/i, 'Motparten har ikke betalt noe ennå.');
    selectRadio(
      /Ønsker du at Skatteetaten skal kreve inn særbidraget for dette barnet/i,
      /Nei, vi gjør opp privat oss i mellom/i,
    );
    cy.clickNextStep();

    fillField(/^Fornavn$/i, 'Morten');
    fillField(/^Etternavn$/i, 'Motpart');
    selectRadio(/Kjenner du den andre partens norske fødselsnummer eller d-nummer/i, /^Nei$/i);
    selectRadio(/Vet du fødselsdatoen til den andre parten/i, /^Ja$/i);
    fillField(/Den andre partens fødselsdato/i, '12.02.1985');
    cy.findByRole('textbox', { name: /^Telefonnummer$/i }).type('12345678');
    selectRadio(/Bor den andre parten i Norge/i, /^Nei$/i);
    selectRadio(/Vet du adressen/i, /^Nei$/i);
    cy.findByRole('combobox', { name: /Hvilket land bor den andre parten i/i }).type('Sverige{enter}');
    cy.clickNextStep();

    selectRadio(/Er du i jobb/i, /^Nei$/i);
    fillField(/Beskriv hva som er grunnen til at du ikke er i jobb/i, 'Jeg er mellom to arbeidsforhold.');
    cy.clickNextStep();

    selectRadio(/Har du skattepliktig inntekt i Norge/i, /Nei, jeg har ikke skattepliktig inntekt/i);
    fillField(
      /Beskriv hva som er grunnen til at du ikke har skattepliktig inntekt/i,
      'Jeg har ingen skattepliktig inntekt i perioden.',
    );
    cy.clickNextStep();

    attachNow(/Dokumentasjon på utgiftene til konfirmasjon/i);
    attachNow(/Kopi av avtale om delt fast bosted/i);
    cy.clickNextStep();

    cy.url().should('include', '/oppsummering');
    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');
    cy.findByText('Mina Eksempel').should('exist');
    cy.findByText(/Konfirmasjon/i).should('exist');
    cy.findByText(/Sverige/i).should('exist');
    cy.findByText(/Kopi av avtale om delt fast bosted/i).should('exist');
  });
});
