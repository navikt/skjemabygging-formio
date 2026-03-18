const selectRadio = (question: RegExp, answer: RegExp) => {
  cy.findByRole('group', { name: question }).within(() => {
    cy.findByRole('radio', { name: answer }).check({ force: true });
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

describe('NAV 11-13.05 - Søknad om arbeidsavklaringspenger', () => {
  it('keeps foreign-work and child conditionals aligned with the summary page', () => {
    cy.visitFixtureForm('components', { fixture: 'forms/nav111305.json', startOnFirstStep: false });
    confirmIntroAndStart();
    completeIntroStepIfPresent();

    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Ada');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Aap');
    selectRadio(/Har du norsk fødselsnummer eller d-nummer/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
    cy.findByRole('textbox', { name: /^E-post \(valgfritt\)$/i }).type('aap@example.com');
    cy.findByRole('textbox', { name: /^Telefonnummer$/i }).type('12345678');
    cy.clickNextStep();

    selectRadio(/Har du sykepenger nå/i, /^Ja$/i);
    selectRadio(/Har du planer om å ta ferie før du er ferdig med sykepenger/i, /^Ja$/i);
    selectRadio(/Vet du når du skal ta ferie/i, /Ja, jeg vet fra-dato og til-dato/i);
    cy.findByRole('textbox', { name: /^Fra dato \(dd.mm.åååå\)$/i }).type('01.07.2026');
    cy.findByRole('textbox', { name: /^Til dato \(dd.mm.åååå\)$/i }).type('10.07.2026');
    cy.clickNextStep();

    selectRadio(/Har du bodd sammenhengende i Norge de fem siste årene/i, /^Ja$/i);
    selectRadio(/Har du jobbet utenfor Norge de fem siste årene/i, /^Ja$/i);
    cy.findByRole('combobox', { name: /Hvilket land jobbet du i/i }).type('Sverige{enter}');
    cy.findByRole('textbox', { name: /Fra og med måned og år \(mm.åååå\)/i }).type('01.2024');
    cy.findByRole('textbox', { name: /Til og med måned og år \(mm.åååå\)/i }).type('12.2024');
    cy.findByRole('textbox', { name: /ID-nummer\/personnummer for det landet du har jobbet i/i }).type('SE123456');
    cy.clickNextStep();

    selectRadio(/Har du en yrkesskade eller yrkessykdom som påvirker hvor mye du kan jobbe/i, /^Ja$/i);
    selectRadio(/Har NAV godkjent yrkesskaden eller yrkessykdommen din/i, /^Ja$/i);
    cy.clickNextStep();

    selectRadio(/Har du en fastlege/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Lena');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Lege');
    cy.findByRole('textbox', { name: /^Legekontor( \(valgfritt\))?$/i }).type('Legekontoret Sentrum');
    cy.findByRole('textbox', { name: /^Adresse( \(valgfritt\))?$/i }).type('Legestien 1');
    cy.findByRole('textbox', { name: /^Postnummer( \(valgfritt\))?$/i }).type('0151');
    cy.findByRole('textbox', { name: /^Poststed( \(valgfritt\))?$/i }).type('Oslo');
    cy.findByRole('textbox', { name: /^Telefonnummer$/i })
      .last()
      .type('23456789');
    selectRadio(
      /Har du en annen lege eller behandler som du ønsker at NAV skal kunne kontakte for helseopplysninger/i,
      /^Nei$/i,
    );
    cy.clickNextStep();

    selectRadio(/Forsørger du barn under 18 år/i, /^Ja$/i);
    cy.findAllByRole('textbox', { name: /Fornavn og mellomnavn/i })
      .last()
      .type('Emma');
    cy.findAllByRole('textbox', { name: /^Etternavn$/i })
      .last()
      .type('Eksempel');
    cy.findAllByRole('textbox', { name: /^Fødselsdato \(dd.mm.åååå\)$/i })
      .last()
      .type('14.08.2018');
    cy.findAllByRole('group', { name: /Hvilken relasjon har du til barnet/i })
      .last()
      .within(() => {
        cy.findByRole('radio', { name: /^Forelder$/i }).check({ force: true });
      });
    cy.clickNextStep();

    selectRadio(/Er du student/i, /Ja, men har avbrutt studiet helt på grunn av sykdom/i);
    selectRadio(/Har du planer om å komme tilbake til studiet/i, /^Ja$/i);
    cy.clickNextStep();

    selectRadio(/Har du fått eller skal du få ekstra utbetalinger fra arbeidsgiver/i, /^Nei$/i);
    cy.findByRole('group', { name: /Kryss av for utbetalinger du får, eller nylig har søkt om/i }).within(() => {
      cy.findByRole('checkbox', { name: /Ingen av disse/i }).check({ force: true });
    });
    cy.clickNextStep();

    cy.findByRole('textbox', {
      name: /Hvis du har flere opplysninger du mener er viktig for søknaden din, kan du skrive dem her/i,
    }).type('Jeg trenger AAP mens jeg følger opp behandlingen min.');
    cy.clickNextStep();

    attachNow(/Bekreftelse fra studiested på hvilken dato studiet ble avbrutt fra/i);
    attachNow(/Fødselsattest eller adopsjonsbevis for barn under 18 som du forsørger og er forelder til/i);
    cy.clickNextStep();

    cy.url().should('include', '/oppsummering');
    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');
    cy.findByText(/Sverige/i).should('exist');
    cy.findByText('Emma Eksempel').should('exist');
    cy.findByText(/Bekreftelse fra studiested/i).should('exist');
    cy.findByText(/Fødselsattest eller adopsjonsbevis/i).should('exist');
  });
});
