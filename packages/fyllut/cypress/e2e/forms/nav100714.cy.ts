const answerRadio = (question: RegExp, answer: RegExp) => {
  cy.findByRole('group', { name: question }).within(() => {
    cy.findByRole('radio', { name: answer }).check({ force: true });
  });
};

const chooseOption = (label: RegExp, value: string, index = 0) => {
  cy.findAllByRole('combobox', { name: label }).eq(index).type(`${value}{downArrow}{enter}`);
};

const attachNow = (name: RegExp) => {
  cy.findByRole('group', { name }).within(() => {
    cy.findByRole('radio', { name: /Jeg legger det ved dette skjemaet/i }).check({ force: true });
  });
};

const markNoExtraDocumentation = () => {
  cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved/i }).check({
    force: true,
  });
};

describe('NAV 10-07.14 - Søknad om briller til forebygging eller behandling av amblyopi', () => {
  beforeEach(() => {
    cy.visitFixtureForm('nav020805', {
      fixture: 'forms/nav100714.json',
      path: '/fyllut/nav020805?sub=paper',
    });
  });

  it('keeps address, prescription conditionals, and contact-lens attachments aligned with the summary page', () => {
    answerRadio(/Er du optiker eller øyelege/i, /Optiker/i);
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Lina');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Eksempel');
    answerRadio(/Har søker norsk fødselsnummer eller d-nummer/i, /^Nei$/i);
    cy.findByRole('textbox', { name: /Fødselsdato \(dd\.mm\.åååå\)/i }).type('01.01.2013');
    answerRadio(/Bor søker i Norge/i, /^Ja$/i);
    answerRadio(/kontaktadresse.*vegadresse eller postboksadresse/i, /Vegadresse/i);
    cy.findByRole('textbox', { name: /^Vegadresse$/i }).type('Testveien 1');
    cy.findByRole('textbox', { name: /^Postnummer$/i }).type('0155');
    cy.findByRole('textbox', { name: /^Poststed$/i }).type('Oslo');
    cy.findByRole('textbox', { name: /Gyldig fra \(dd\.mm\.åååå\)/i })
      .should('be.visible')
      .type('01.09.2025');
    cy.clickNextStep();

    answerRadio(/Er søker 10 år eller eldre/i, /^Ja$/i);
    answerRadio(/Er søker 18 år eller eldre/i, /^Nei$/i);
    answerRadio(/Det søkes om stønad til/i, /Kontaktlinser/i);
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /Dato for synsundersøkelse/i }).type('15.03.2025');
    chooseOption(/^Sfære \(SPH\)$/i, '2,00', 0);
    chooseOption(/^Sylinder \(CYL\)$/i, '0,00', 0);
    chooseOption(/^ADD$/i, '0,00', 0);
    cy.findAllByRole('textbox', { name: /Visus med gitt korreksjon/i })
      .eq(0)
      .type('0,8');

    chooseOption(/^Sfære \(SPH\)$/i, '1,75', 1);
    chooseOption(/^Sylinder \(CYL\)$/i, '0,00', 1);
    chooseOption(/^ADD$/i, '0,00', 1);
    cy.findAllByRole('textbox', { name: /Visus med gitt korreksjon/i })
      .eq(1)
      .type('0,7');

    cy.findByRole('group', { name: /Er det foretatt visusmålinger tidligere/i }).should('be.visible');
    answerRadio(/Er det foretatt visusmålinger tidligere/i, /^Nei$/i);
    cy.findByRole('textbox', {
      name: /Søknaden skal vurderes etter særskilte vilkår\. Beskriv amblyogene risikofaktorer/i,
    }).type('Søker har vedvarende behandlingsbehov og trenger kontaktlinser for å sikre oppfølgingen.');
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /Beskriv medisinsk behov for kontaktlinser/i }).type(
      'Kontaktlinser gir nødvendig behandling og bedre etterlevelse enn briller alene.',
    );
    cy.clickNextStep();

    cy.clickNextStep();

    cy.findByRole('textbox', { name: /HPR-nummer/i }).type('1234567');
    cy.findAllByRole('textbox', { name: /^Fornavn$/i })
      .last()
      .type('Kari');
    cy.findAllByRole('textbox', { name: /^Etternavn$/i })
      .last()
      .type('Optiker');
    cy.findByRole('textbox', { name: /Arbeidssted/i }).type('Optikkhuset');
    cy.findAllByRole('textbox', { name: /^Telefonnummer$/i })
      .last()
      .type('12345678');
    cy.findByRole('textbox', { name: /E-postadresse/i }).type('kari.optiker@example.com');
    cy.clickNextStep();

    cy.findByRole('group', { name: /Kvittering for kontaktlinser/i }).should('be.visible');
    cy.get('main').should('not.contain.text', 'Pristilbud fra optiker');
    attachNow(/Kvittering for kontaktlinser/i);
    markNoExtraDocumentation();
    cy.clickNextStep();

    cy.url().should('include', '/oppsummering');

    cy.withinSummaryGroup('Søkers opplysninger', () => {
      cy.contains('Adresse').should('exist');
      cy.contains('Testveien 1').should('exist');
      cy.contains('Gyldig fra').should('exist');
      cy.root().should('not.contain.text', 'Fødselsnummer eller d-nummer');
    });

    cy.withinSummaryGroup('Brille-/linseseddel', () => {
      cy.contains('Er det foretatt visusmålinger tidligere').should('exist');
      cy.contains('vedvarende behandlingsbehov').should('exist');
    });

    cy.withinSummaryGroup('Kontaktlinser', () => {
      cy.contains('Beskriv medisinsk behov for kontaktlinser').should('exist');
      cy.contains('Kontaktlinser gir nødvendig behandling').should('exist');
    });

    cy.withinSummaryGroup('Vedlegg', () => {
      cy.contains('Kvittering for kontaktlinser').should('exist');
      cy.contains(/Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved/i).should('exist');
      cy.root().should('not.contain.text', 'Pristilbud fra optiker');
    });
  });
});
