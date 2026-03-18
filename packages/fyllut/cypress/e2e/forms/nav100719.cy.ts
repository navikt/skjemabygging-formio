const answerRadio = (question: RegExp, answer: RegExp) => {
  cy.findByRole('group', { name: question }).within(() => {
    cy.findByRole('radio', { name: answer }).check({ force: true });
  });
};

const chooseCheckbox = (question: RegExp, answer: RegExp, index = 0) => {
  cy.findAllByRole('group', { name: question })
    .eq(index)
    .within(() => {
      cy.findByRole('checkbox', { name: answer }).check({ force: true });
    });
};

const fillVisibleInputs = (name: RegExp, value: string) => {
  cy.findAllByRole('textbox', { name }).then(($inputs) => {
    const visibleInputs = Cypress.$($inputs).filter(':visible').toArray();

    cy.wrap(visibleInputs.length).should('be.greaterThan', 0);

    cy.wrap(visibleInputs).each((input) => {
      cy.wrap(input).scrollIntoView();
      cy.wrap(input).clear();
      cy.wrap(input).type(value);
      cy.wrap(input).blur();
    });
  });
};

const answerAllVisibleRadios = (question: RegExp, answer: RegExp) => {
  cy.findAllByRole('group', { name: question }).then(($groups) => {
    const visibleGroups = Cypress.$($groups).filter(':visible').toArray();

    cy.wrap(visibleGroups.length).should('be.greaterThan', 0);

    cy.wrap(visibleGroups).each((group) => {
      cy.wrap(group).within(() => {
        cy.findByRole('radio', { name: answer }).check({ force: true });
      });
    });
  });
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

describe('NAV 10-07.19 - Refusjon av reiseutgifter for tekniske hjelpemidler', () => {
  beforeEach(() => {
    cy.visitFixtureForm('nav020805', {
      fixture: 'forms/nav100719.json',
      path: '/fyllut/nav020805?sub=paper',
    });
  });

  it('keeps alternate transport conditionals and summary attachments in sync', () => {
    cy.findByRole('checkbox', {
      name: /NAV kan innhente opplysninger som er nødvendige for å behandle søknaden/i,
    }).check();
    cy.findByRole('checkbox', {
      name: /mangelfulle eller feilaktige opplysninger kan medføre krav om tilbakebetaling/i,
    }).check();
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Sara');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Hjelpemiddel');
    answerRadio(/Har du norsk fødselsnummer eller d-nummer/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
    cy.clickNextStep();

    answerRadio(/Hva er formålet med reisen/i, /^Annet$/i);
    cy.findByRole('textbox', { name: /Oppgi annet formål med reisen/i }).type('Tilpasning av teknisk hjelpemiddel.');
    answerRadio(/Ønsker du å få dekket reiseutgifter for ledsager/i, /^Nei$/i);
    cy.findByRole('textbox', { name: /^Avreisedato \(dd\.mm\.åååå\)$/i }).type('05.04.2026');
    cy.findByRole('textbox', { name: /^Tidspunkt for avreise \(tt:mm\)$/i }).type('09:15');
    cy.findByRole('textbox', { name: /^Hjemkomstdato \(dd\.mm\.åååå\)$/i }).type('05.04.2026');
    cy.findByRole('textbox', { name: /^Tidspunkt for hjemkomst \(tt:mm\)$/i }).type('15:45');
    cy.findAllByRole('textbox', { name: /^Vegadresse$/i })
      .eq(0)
      .type('Teknologiveien 1');
    cy.findAllByRole('textbox', { name: /^Postnummer$/i })
      .eq(0)
      .type('0484');
    cy.findAllByRole('textbox', { name: /^Poststed$/i })
      .eq(0)
      .type('Oslo');
    cy.findAllByRole('textbox', { name: /^Vegadresse$/i })
      .eq(1)
      .type('Hjelpemiddelsenteret 5');
    cy.findAllByRole('textbox', { name: /^Postnummer$/i })
      .eq(1)
      .type('7030');
    cy.findAllByRole('textbox', { name: /^Poststed$/i })
      .eq(1)
      .type('Trondheim');
    cy.clickNextStep();

    cy.findByRole('textbox', {
      name: /Gi en kort beskrivelse av de ulike etappene av reisen/i,
    }).type('Jeg fløy til avtalen og brukte en spesialtransport på siste del av reisen.');
    chooseCheckbox(
      /Transportmiddel Oppgi alle transportmiddel du brukte for å komme til reisemålet/i,
      /Buss \/ trikk \/ t-bane/i,
    );
    chooseCheckbox(/Transportmiddel Oppgi alle transportmiddel du brukte for å komme til reisemålet/i, /^Bil$/i);
    chooseCheckbox(/Transportmiddel Oppgi alle transportmiddel du brukte for å komme til reisemålet/i, /^Drosje$/i);
    answerRadio(/Brukte du samme reisemåte på returreisen/i, /^Ja$/i);
    fillVisibleInputs(/Antall kilometer kjørt med bil/i, '40');
    answerAllVisibleRadios(/Har du benyttet bilferge/i, /^Ja$/i);
    fillVisibleInputs(/Beløp for bilfergen/i, '85');
    fillVisibleInputs(
      /Beskriv årsaken til at du har valgt drosje og ikke en rimeligere reisemåte/i,
      'Jeg måtte bruke drosje på siste etappe for å rekke avtalen.',
    );
    fillVisibleInputs(/Beløp for buss \/ trikk \/ t-bane/i, '150');
    fillVisibleInputs(/Beløp for drosje/i, '320');
    cy.get('main').should('not.contain.text', 'Beløp for fly');
    cy.clickNextStep();

    answerRadio(/Har du eller dere vært på reise i mer enn 12 timer og søker kostgodtgjørelse/i, /^Nei$/i);
    answerRadio(/Har du\/dere hatt overnattingsutgifter/i, /^Nei$/i);
    answerRadio(/Har du yrkesskade og hatt tapt arbeidsfortjeneste i forbindelse med reisen/i, /^Nei$/i);
    cy.clickNextStep();

    cy.clickNextStep();

    answerRadio(
      /Ønsker du å sende inn refusjonskrav for flere reiser til samme bestemmelsessted, men samme reisemåte og reiseutgifter/i,
      /^Nei$/i,
    );
    cy.clickNextStep();

    cy.findByRole('group', { name: /Oppmøtebekreftelse/i }).should('be.visible');
    cy.findByRole('group', { name: /Kvitteringer for transportutgifter/i }).should('be.visible');
    cy.findByRole('group', { name: /Dokumentasjon på fergeutgifter/i }).should('be.visible');
    attachNow(/Oppmøtebekreftelse/i);
    attachNow(/Dokumentasjon på fergeutgifter/i);
    attachNow(/Kvitteringer for transportutgifter/i);
    markNoExtraDocumentation();
    cy.clickNextStep();

    cy.url().should('include', '/oppsummering');

    cy.withinSummaryGroup('Formål', () => {
      cy.contains('Annet').should('exist');
      cy.contains('Tilpasning av teknisk hjelpemiddel.').should('exist');
    });

    cy.withinSummaryGroup('Reisemåte og utgifter', () => {
      cy.contains('Beløp for buss / trikk / t-bane').should('exist');
      cy.contains('150').should('exist');
      cy.contains('Beløp for bilfergen').should('exist');
      cy.contains('85').should('exist');
      cy.contains('Beløp for drosje').should('exist');
      cy.contains('320').should('exist');
      cy.contains('Beløp for fly').should('not.exist');
    });

    cy.withinSummaryGroup('Vedlegg', () => {
      cy.contains('Oppmøtebekreftelse').should('exist');
      cy.contains('Kvitteringer for transportutgifter').should('exist');
      cy.contains('Dokumentasjon på fergeutgifter').should('exist');
      cy.contains(/Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved/i).should('exist');
    });
  });
});
