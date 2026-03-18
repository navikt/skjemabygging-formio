const selectRadio = (question: RegExp, answer: RegExp) => {
  cy.findByRole('group', { name: question }).within(() => {
    cy.findByRole('radio', { name: answer }).check({ force: true });
  });
};

const attachNow = (name: RegExp) => {
  cy.findAttachment(name).within(() => {
    cy.findByRole('radio', { name: /Jeg legger det ved dette skjemaet/i }).check({ force: true });
  });
};

describe('NAV 10-07.16 - Refusjon av reiseutgifter', () => {
  it('keeps transport and companion conditionals aligned with the summary page', () => {
    cy.visitFixtureForm('components', { fixture: 'forms/nav100716.json', startOnFirstStep: false });
    cy.clickStart();

    selectRadio(/Fyller du ut søknaden på vegne av andre enn deg selv/i, /^Nei$/i);
    selectRadio(/Er du over 18 år/i, /^Ja$/i);
    cy.clickNextStep();

    cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/i }).check({ force: true });
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Hanne');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Reisende');
    selectRadio(/Har du norsk fødselsnummer eller d-nummer/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
    cy.clickNextStep();

    selectRadio(/Hva er formålet med reisen/i, /Tilpasningskurs/i);
    selectRadio(/Har du hatt med pårørende\/andre nærstående som har deltatt på tilpasningskurs/i, /^Ja$/i);
    selectRadio(/Ønsker du å få dekket reiseutgifter for ledsager/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Avreisedato/i }).type('01.03.2026');
    cy.findByRole('textbox', { name: /Tidspunkt for avreise/i }).type('08:00');
    cy.findByRole('textbox', { name: /Hjemkomstdato/i }).type('02.03.2026');
    cy.findByRole('textbox', { name: /Tidspunkt for hjemkomst/i }).type('18:30');
    cy.findAllByRole('textbox', { name: /^Vegadresse$/i })
      .first()
      .type('Storgata 1');
    cy.findByRole('textbox', { name: /^Postnummer$/i }).type('0155');
    cy.findByRole('textbox', { name: /^Poststed$/i }).type('Oslo');
    cy.findByRole('textbox', { name: /^Firmanavn$/i }).type('Kurssenteret');
    cy.findAllByRole('textbox', { name: /^Vegadresse$/i })
      .last()
      .type('Kursveien 2');
    cy.findByRole('textbox', { name: /Kommune \/ by/i }).type('Bergen');
    cy.clickNextStep();

    cy.findByRole('group', { name: /Transportmiddel.*Oppgi alle transportmiddel/i }).within(() => {
      cy.findByRole('checkbox', { name: /^Bil$/i }).check({ force: true });
      cy.findByRole('checkbox', { name: /Buss \/ trikk \/ t-bane/i }).check({ force: true });
    });
    cy.findByRole('textbox', { name: /Antall kilometer kjørt med bil/i }).type('40');
    selectRadio(/Har du benyttet bilferge/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Beløp for bilfergen/i }).type('180');
    cy.findByRole('textbox', { name: /Beløp for buss \/ trikk \/ t-bane/i }).type('99');
    selectRadio(/Brukte du samme reisemåte på returreisen/i, /^Ja$/i);
    cy.clickNextStep();

    selectRadio(/Har du \/ dere vært på reise i mer enn 12 timer og søker kostgodtgjørelse/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Hvor mange døgn søker du \/ dere kostgodtgjørelse for/i }).type('1');
    selectRadio(/Har du \/ dere hatt overnattingsutgifter/i, /^Ja$/i);
    cy.findByRole('textbox', {
      name: /Hvor mange netter søker du \/ dere refusjon av overnattingsutgifter for/i,
    }).type('1');
    cy.findByRole('textbox', { name: /Oppgi navn og adresse på overnattingssted/i }).type('Hotell Sentrum, Bergen');
    selectRadio(/Har du yrkesskade og hatt tapt arbeidsfortjeneste i forbindelse med reisen/i, /^Nei$/i);
    selectRadio(/Har ledsager hatt tapt arbeidsinntekt i forbindelse med reisen/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Hvor mange timer søker du refusjon for ledsagers tapte arbeidsinntekt/i }).type(
      '6',
    );
    cy.clickNextStep();

    cy.findAllByRole('textbox', { name: /Ledsagers fornavn/i })
      .last()
      .type('Lise');
    cy.findAllByRole('textbox', { name: /Ledsagers etternavn/i })
      .last()
      .type('Ledsager');
    cy.findAllByRole('textbox', { name: /Ledsagers fødselsdato/i })
      .last()
      .type('02.05.1988');
    cy.clickNextStep();

    cy.findAllByRole('textbox', { name: /Pårørendes fornavn/i })
      .last()
      .type('Per');
    cy.findAllByRole('textbox', { name: /Pårørendes etternavn/i })
      .last()
      .type('Pårørende');
    cy.findAllByRole('textbox', { name: /Pårørendes fødselsdato/i })
      .last()
      .type('10.06.1982');
    cy.findAllByRole('textbox', { name: /Pårørendes vegadresse/i })
      .last()
      .type('Sidegata 3');
    cy.findAllByRole('textbox', { name: /Pårørendes postnummer/i })
      .last()
      .type('5003');
    cy.findAllByRole('textbox', { name: /Pårørendes poststed/i })
      .last()
      .type('Bergen');
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /Har du tilleggsopplysninger som kan være relevante for saken/i }).type(
      'Ledsager og pårørende deltok gjennom hele kurset.',
    );
    selectRadio(
      /Ønsker du å sende inn refusjonskrav for flere reiser til samme bestemmelsessted, med samme reisemåte og reiseutgifter/i,
      /^Ja$/i,
    );
    cy.findAllByRole('textbox', { name: /^Avreisedato \(dd.mm.åååå\)$/i })
      .last()
      .type('15.03.2026');
    cy.findAllByRole('textbox', { name: /^Tidspunkt for avreise \(tt:mm\)$/i })
      .last()
      .type('08:15');
    cy.findAllByRole('textbox', { name: /^Hjemkomstdato \(dd.mm.åååå\)$/i })
      .last()
      .type('16.03.2026');
    cy.findAllByRole('textbox', { name: /^Tidspunkt for hjemkomst \(tt:mm\)$/i })
      .last()
      .type('18:10');
    cy.clickNextStep();

    attachNow(/Dokumentasjon på fergeutgifter/i);
    attachNow(/Kvitteringer for transportutgifter/i);
    attachNow(/Kvittering for hotell \/ overnatting for deg\/dere/i);
    attachNow(/Dokumentasjon fra arbeidsgiver på bortfall av inntekt for ledsager/i);
    cy.clickNextStep();

    cy.url().should('include', '/oppsummering');
    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');
    cy.findByText(/Tilpasningskurs/i).should('exist');
    cy.findByText('Lise Ledsager').should('exist');
    cy.findByText('Per Pårørende').should('exist');
    cy.findByText(/Dokumentasjon på fergeutgifter/i).should('exist');
  });
});
