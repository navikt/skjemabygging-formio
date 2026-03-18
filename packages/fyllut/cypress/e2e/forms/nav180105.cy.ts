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

const advanceUntil = (predicate: (body: JQuery<HTMLBodyElement>) => boolean, attempts = 0): void => {
  cy.get('body').then(($body) => {
    if (predicate($body)) return;
    if (attempts >= 8) throw new Error('advanceUntil: target not reached after max attempts');
    const checkbox = $body.find('input[type="checkbox"]:not(:checked)');
    if (checkbox.length > 0) cy.wrap(checkbox[0]).check({ force: true });
    cy.clickNextStep();
    advanceUntil(predicate, attempts + 1);
  });
};

describe('NAV 18-01.05 - Søknad om barnepensjon', () => {
  it('keeps deceased and child row conditionals aligned with the summary page', () => {
    visitFixtureComponentsForm('forms/nav180105.json');

    // Step 1: Veiledning – select applicant type and confirm
    advanceUntil(($body) => $body.text().includes('Hvem søker du barnepensjon for'));
    selectRadio(/Hvem søker du barnepensjon for/i, /mitt eller mine barn under 18 år/i);
    cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/i }).check();
    cy.clickNextStep();

    // Step 2 (if shown): Dine opplysninger – skip if not present for child path
    cy.get('body').then(($body) => {
      if ($body.text().match(/Har du norsk fødselsnummer eller d-nummer/i)) {
        cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Gina');
        cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Gjenlevende');
        selectRadio(/Har du norsk fødselsnummer eller d-nummer/i, /Ja/i);
        cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
        cy.findByRole('textbox', { name: /Telefonnummer/i }).type('12345678');
        cy.clickNextStep();
      }
    });

    // Step 3: Opplysninger om avdøde
    advanceUntil(($body) => $body.text().includes('Når skjedde dødsfallet'));
    cy.findAllByRole('textbox', { name: /^Fornavn$/i })
      .first()
      .type('Arne');
    cy.findAllByRole('textbox', { name: /^Etternavn$/i })
      .first()
      .type('Avdød');
    cy.findAllByRole('textbox', { name: /Fødselsnummer eller d-nummer/i })
      .first()
      .type('12909098311');
    cy.findByRole('textbox', { name: /^Når skjedde dødsfallet/i }).type('10.02.2024');
    selectRadio(/Skyldes dødsfallet en yrkesskade eller yrkessykdom/i, /Nei/i);
    selectRadio(/Har han eller hun bodd og\/eller arbeidet i et annet land enn Norge etter fylte 16 år/i, /Nei/i);
    cy.clickNextStep();

    // Step 4: Barn – fill child row
    advanceUntil(($body) => $body.text().includes('Barnets fornavn') || $body.text().includes('Legg til'));
    cy.get('body').then(($body) => {
      if ($body.find('[role="button"]').length === 0 && !$body.text().includes('Barnets fornavn')) {
        cy.findByRole('button', { name: /Legg til/i }).click();
      }
    });
    cy.findAllByRole('textbox', { name: /Barnets fornavn/i })
      .first()
      .type('Lina');
    cy.findAllByRole('textbox', { name: /Barnets etternavn/i })
      .first()
      .type('Avdødsen');
    cy.findAllByRole('textbox', { name: /Barnets fødselsnummer eller d-nummer/i })
      .first()
      .type('21812199999');
    cy.findAllByRole('textbox', { name: /Barnets fødselsdato/i })
      .first()
      .type('21.12.2021');
    cy.findAllByRole('textbox', { name: /Barnets statsborgerskap/i })
      .first()
      .type('Norsk');
    selectRadio(/Hvem er foreldre til barnet/i, /Jeg og avdøde/i);
    selectRadio(/Bor barnet i et annet land enn Norge/i, /Nei/i);
    selectRadio(/Er det oppnevnt en verge for barnet/i, /Nei/i);
    cy.findByRole('checkbox', { name: /Jeg søker om barnepensjon for dette barnet/i }).check();
    selectRadio(/Ønsker du å motta utbetalingen på norsk eller utenlandsk bankkonto/i, /Norsk kontonummer/i);
    cy.findAllByRole('textbox', { name: /Norsk (kontonummer|bankkontonummer)/i })
      .first()
      .type('12345678901');
    cy.clickNextStep();

    // Advance past any remaining steps (Vedlegg etc.) to Oppsummering
    advanceUntil(
      ($body) =>
        !!$body
          .find('h2, h1')
          .toArray()
          .some((el) => /Oppsummering/i.test(el.textContent ?? '')),
    );

    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');
    cy.findByText('Arne Avdød').should('exist');
    cy.findByText('Lina Avdødsen').should('exist');
    cy.findByText(/Har han eller hun bodd og\/eller arbeidet i et annet land enn Norge etter fylte 16 år/i).should(
      'exist',
    );
  });
});
