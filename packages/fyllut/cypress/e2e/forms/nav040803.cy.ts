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

describe('NAV 04-08.03 - Bekreftelse på sluttårsak/nedsatt arbeidstid', () => {
  it('keeps reduced-hours conditionals aligned with the summary page', () => {
    cy.visitFixtureForm('components', { fixture: 'forms/nav040803.json' });

    cy.findByRole('textbox', { name: /^Arbeidsgiver$/i }).type('Eksempel AS');
    cy.findByRole('textbox', { name: /^Organisasjonsnummer$/i }).type('910825526');
    cy.findByRole('textbox', { name: /Postadresse/i }).type('Arbeidsveien 1');
    cy.findByRole('textbox', { name: /^Postnummer$/i }).type('0150');
    cy.findByRole('textbox', { name: /^Poststed$/i }).type('Oslo');
    cy.findByRole('textbox', { name: /Kontaktperson ved bedriften/i }).type('Leder Lise');
    cy.findByRole('textbox', { name: /^Telefonnummer$/i }).type('12345678');
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /Arbeidstakers fornavn/i }).type('Arne');
    cy.findByRole('textbox', { name: /Arbeidstakers etternavn/i }).type('Ansatt');
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /Arbeidstaker tiltrådte/i }).type('01.01.2020');
    cy.findByRole('textbox', { name: /Siste arbeidsdag/i }).type('31.01.2026');
    cy.findByRole('group', { name: /Hvordan har arbeidstakers arbeidstid vært/i }).within(() => {
      cy.findByRole('checkbox', {
        name: /Arbeidstaker har hatt varierende arbeidstid eller ikke hatt fast arbeidstid/i,
      }).check({ force: true });
    });
    cy.findByRole('spinbutton', { name: /^Timer per uke$/i }).type('37,5');
    cy.findByRole('textbox', { name: /^Periode fra/i }).type('01.08.2025');
    cy.findByRole('textbox', { name: /^Periode til/i }).type('31.01.2026');
    selectRadio(
      /Hva er arbeidstakers situasjon/i,
      /Arbeidstakeren har vært ekstrahjelp\/tilkallingsvikar og har fått redusert arbeidstiden/i,
    );
    cy.findByRole('textbox', { name: /Arbeidstiden er redusert fra dato/i }).type('01.02.2026');
    cy.findByRole('spinbutton', { name: /Ny arbeidstid per uke/i }).type('10');
    selectRadio(
      /Er det i løpet av de siste 36 avsluttede kalendermånedene utbetalt sykepenger som er innmeldt som lønn til A-ordningen/i,
      /^Nei$/i,
    );
    cy.clickNextStep();

    cy.findByRole('checkbox', {
      name: /Jeg vil legge ved dette i et eget vedlegg istedenfor å fylle ut tabellen nedenfor/i,
    }).check({ force: true });
    cy.clickNextStep();

    attachNow(/Timelister/i);
    cy.clickNextStep();

    cy.url().should('include', '/oppsummering');
    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');
    cy.findByText(/Eksempel AS/i).should('exist');
    cy.findByText('Arne Ansatt').should('exist');
    cy.findByText(/ekstrahjelp\/tilkallingsvikar/i).should('exist');
    cy.findByText(/Timelister/i).should('exist');
  });
});
