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

describe('NAV 17-01.06 - Søknad om omstillingsstønad', () => {
  beforeEach(() => {
    cy.visitFixtureForm('components', { fixture: 'forms/nav170106.json', startOnFirstStep: false });
    confirmIntroAndStart();
  });

  it('covers branch-heavy relationship and income conditionals through summary parity', () => {
    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Kari');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Nordmann');
    answerRadio(/Har du norsk fødselsnummer eller d-nummer/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
    cy.findByRole('textbox', { name: /Din fødselsdato/i }).type('01.01.1950');
    cy.findByRole('textbox', { name: /Statsborgerskap/i }).type('Norsk');
    cy.findByRole('textbox', { name: /Telefonnummer/i }).type('12345678');
    cy.clickNextStep();

    answerRadio(/Ønsker du å motta utbetalingen på norsk eller utenlandsk bankkonto/i, /Norsk/i);
    cy.findByRole('textbox', { name: /Norsk kontonummer for utbetaling/i }).type('12345678901');
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Per');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Nordmann');
    answerRadio(/Jeg kjenner ikke avdødes fødselsnummer/i, /^Nei$/i);
    cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i })
      .last()
      .type('07848398724');
    cy.findByRole('textbox', { name: /Når skjedde dødsfallet/i }).type('15.01.2026');
    answerRadio(/Skyldes dødsfallet yrkesskade eller yrkessykdom/i, /^Nei$/i);
    answerRadio(/Har han eller hun bodd og\/eller arbeidet i et annet land enn Norge etter fylte 16 år/i, /^Nei$/i);
    cy.clickNextStep();

    answerRadio(/Hva var relasjonen din til avdøde da dødsfallet skjedde/i, /^Skilt$/i);
    cy.findByRole('textbox', { name: /Når ble dere gift/i }).type('01.01.2000');
    cy.findByRole('textbox', { name: /Når ble dere skilt/i }).type('01.01.2020');
    answerRadio(/Har eller har dere hatt felles barn/i, /^Ja$/i);
    answerRadio(/Var dere samboere og hadde dere felles barn før dere giftet dere/i, /^Ja$/i);
    answerRadio(/Ble du forsørget av bidrag fra avdøde/i, /^Ja$/i);
    cy.findByRole('spinbutton', { name: /Bidragsummen du mottok siste måneden før dødsfallet/i }).type('5000');
    cy.clickNextStep();

    answerRadio(/Hva er sivilstanden din i dag/i, /^Enslig$/i);
    answerRadio(/Hadde du minst 50 prosent omsorg for barn under 18 år på dødsfallstidspunktet/i, /^Nei$/i);
    answerRadio(/Venter du barn eller har du barn som ikke er registrert i Folkeregisteret/i, /^Nei$/i);
    answerRadio(/Er du bosatt i Norge/i, /^Ja$/i);
    answerRadio(/Har du bodd eller oppholdt deg i utlandet de siste 12 månedene/i, /^Nei$/i);
    cy.clickNextStep();

    chooseCheckbox(/Hva er situasjonen din nå/i, /Jeg er arbeidstaker og\/eller lønnsmottaker som frilanser/i);
    cy.findByRole('textbox', { name: /Navn på arbeidssted/i }).type('Nordmann AS');
    answerRadio(/Hva slags type ansettelsesforhold har du/i, /Midlertidig ansatt/i);
    cy.findByRole('checkbox', { name: /Jeg vil heller oppgi arbeidsmengden i antall timer/i }).check();
    answerRadio(/Vil du oppgi arbeidstimer per uke eller per måned/i, /Per uke/i);
    cy.findByRole('spinbutton', { name: /Antall arbeidstimer per uke/i }).type('20');
    answerRadio(/Har du en sluttdato/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Sluttdato/i }).type('30.06.2026');
    answerRadio(/Forventer du endringer i arbeidsforholdet fremover i tid/i, /^Nei$/i);
    cy.clickNextStep();

    chooseCheckbox(/Velg alle typer inntekter du har/i, /Arbeidsinntekt/i);
    chooseCheckbox(/Hvor har du arbeidsinntekt fra/i, /Norge/i);
    cy.findByRole('spinbutton', { name: /Hva var brutto årsinntekt i fjor/i }).type('350000');
    cy.findByRole('spinbutton', { name: /Hva var brutto arbeidsinntekt frem til dødsfallet/i }).type('25000');
    cy.findByRole('spinbutton', { name: /Hva forventer du å ha i brutto årsinntekt i år/i }).type('320000');
    answerRadio(/Regner du med at lønnsinntekten din endrer seg fremover i tid/i, /^Nei$/i);
    cy.clickNextStep();

    answerRadio(/Har du felles barn under 18 år sammen med avdøde/i, /^Nei$/i);
    cy.clickNextStep();

    attachNow(/Kopi av din legitimasjon/i);
    attachNow(/Annen dokumentasjon/i);
    cy.clickNextStep();

    cy.url().should('include', '/oppsummering');
    cy.contains('Skilt').should('be.visible');
    cy.contains('Midlertidig ansatt').should('be.visible');
    cy.contains('20').should('be.visible');
    cy.contains('350000').should('be.visible');
    cy.contains('Kopi av din legitimasjon').should('be.visible');
  });
});
