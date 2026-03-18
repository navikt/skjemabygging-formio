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

const chooseVisibleAttachmentOptions = () => {
  cy.findAllByRole('radio', { name: /Jeg legger det ved dette skjemaet/i }).each(($radio) => {
    cy.wrap($radio).check({ force: true });
  });
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

describe('NAV 06-07.01 - production fixture parity', () => {
  beforeEach(() => {
    cy.visitFixtureForm('components', { fixture: 'forms/nav060701.json', startOnFirstStep: false, sub: 'paper' });
    confirmIntroAndStart();
    cy.clickNextStep();
  });

  it('keeps self-only technical-aid and transport conditionals aligned with the summary page', () => {
    answerRadio(/Svarer du for deg selv eller på vegne av en annen person/i, /Jeg svarer på vegne av meg selv/i);
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Ola');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Nordmann');
    cy.findByRole('textbox', { name: /Fødselsnummer \/ D-nummer/i }).type('22859597622');
    cy.findByRole('textbox', { name: /Telefonnummer/i }).type('12345678');
    answerRadio(/Hva er din sivilstand/i, /^Gift/i);
    cy.clickNextStep();

    answerRadio(/Er du fast bosatt i Norge/i, /^Ja$/i);
    answerRadio(/Mottar du ytelse fra et annet land enn Norge/i, /^Nei$/i);
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /Oppgi diagnose/i }).type('Nevrologisk tilstand');
    cy.findByRole('textbox', { name: /Navn på lege/i }).type('Dr. Test');
    cy.clickNextStep();

    cy.findByRole('group', { name: /Kryss av for det du skal svare på/i }).within(() => {
      cy.findByRole('checkbox', { name: /Drift av tekniske hjelpemidler/i }).check({ force: true });
      cy.findByRole('checkbox', { name: /Transport \/ drift av egen bil/i }).check({ force: true });
    });
    cy.findByRole('group', { name: /Kryss av for det personen skal svare på/i }).should('not.exist');
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /Svar på spørsmålene i brevet fra NAV/i }).type(
      'Jeg trenger hyppig vedlikehold og batteribytte på hjelpemiddelet.',
    );
    answerRadio(/Har NAV bedt om dokumentasjon på drift av tekniske hjelpemidler i brevet/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Hvor store er ekstrautgiftene per måned/i }).type('1500');
    cy.clickNextStep();

    chooseCheckbox(/Hvordan dekker du transportbehovet ditt i dag/i, /^Egen bil$/i);
    answerRadio(/Er du innvilget TT-kort/i, /^Nei$/i);
    cy.get('body').then(($body) => {
      if ($body.text().match(/Oppgi antall turer per halvår, eller kroner per halvår/i)) {
        answerRadio(/Oppgi antall turer per halvår, eller kroner per halvår/i, /Antall kroner/i);
        cy.findByRole('textbox', { name: /Oppgi kroner per halvår/i }).type('4000');
      }
    });
    cy.findByRole('textbox', { name: /Hvor langt klarer du å gå på en normal dag/i }).type('100 meter');
    cy.findByRole('textbox', { name: /Hvor langt er det til nærmeste offentlige transporttilbud/i }).type(
      '2 kilometer',
    );
    answerRadio(/Kan du bruke offentlige transportmidler/i, /^Nei$/i);
    cy.findByRole('textbox', { name: /Beskriv nærmere/i }).type('Jeg klarer ikke å stå eller vente lenge på buss.');
    chooseCheckbox(/Har du tilgang til egen bil/i, /Ja, jeg har egen bil/i);
    answerRadio(/Bruker noen andre bilen/i, /^Nei$/i);
    cy.findByRole('textbox', { name: /Beskriv ekstrautgiftene/i }).type(
      'Jeg bruker bilen til behandling og nødvendig oppfølging.',
    );
    cy.findByRole('textbox', { name: /^Reisemål$/i }).type('Behandling');
    cy.findByRole('textbox', { name: /Oppgi adressen du reiser fra/i }).type('Testveien 1, 0123 Oslo');
    cy.findByRole('textbox', { name: /Oppgi adressen du reiser til/i }).type('Sykehuset 2, 0456 Oslo');
    cy.findByRole('textbox', { name: /Hvor ofte reiser du/i }).type('Hver uke');
    answerRadio(/Velg reisemåte/i, /^Bil$/i);
    cy.findByRole('textbox', { name: /Svar på spørsmålene i brevet fra NAV/i })
      .last()
      .type('Transportbehovet gjelder reiser til behandling hver uke.');
    answerRadio(/Har NAV bedt om dokumentasjon på transport i brevet/i, /^Ja$/i);
    answerRadio(/Har du andre aktuelle opplysninger/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Her kan du oppgi andre aktuelle opplysninger/i }).type(
      'Jeg må ha med teknisk utstyr i bilen på alle turer.',
    );
    cy.clickNextStep();

    cy.findByRole('heading', { level: 2, name: /^Førerhund fra NAV$/i }).should('not.exist');
    cy.findByRole('heading', { level: 2, name: /^Slitasje på klær, sko og sengetøy$/i }).should('not.exist');

    cy.get('body').then(($body) => {
      if ($body.text().match(/Hvis du har opplysninger du mener er viktig/i)) {
        cy.findByRole('textbox', {
          name: /Hvis du har opplysninger du mener er viktig, kan du skrive dem her/i,
        }).type('Jeg ønsker at svaret vurderes sammen med tidligere dokumentasjon.');
        cy.clickNextStep();
      }
    });

    cy.findAttachment(/Dokumentasjon av ekstrautgifter til drift av tekniske hjelpemidler/i).should('exist');
    cy.findAttachment(/Dokumentasjon av ekstrautgifter til transport/i).should('exist');
    chooseVisibleAttachmentOptions();
    cy.clickNextStep();

    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');
    cy.contains('Nevrologisk tilstand').should('exist');
    cy.contains('1500').should('exist');
    cy.contains('Jeg bruker bilen til behandling og nødvendig oppfølging.').should('exist');
    cy.contains('Jeg må ha med teknisk utstyr i bilen på alle turer.').should('exist');
    cy.contains(/Hvordan dekker barnet transportbehovet sitt i dag/i).should('not.exist');

    cy.withinSummaryGroup('Vedlegg', () => {
      cy.contains('Dokumentasjon av ekstrautgifter til drift av tekniske hjelpemidler').should('exist');
      cy.contains('Dokumentasjon av ekstrautgifter til transport').should('exist');
      cy.contains('Dokumentasjon av ekstrautgifter til slitasje på klær, sko og sengetøy').should('not.exist');
    });
  });
});
