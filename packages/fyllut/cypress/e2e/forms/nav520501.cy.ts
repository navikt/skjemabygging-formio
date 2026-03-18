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
    if ($body.text().match(/Hvilken part er du i saken/i)) {
      return;
    }

    const checkbox = $body.find('input[type="checkbox"]');

    if (checkbox.length > 0) {
      cy.wrap(checkbox[0]).check({ force: true });
    }

    if (attempts >= 2) {
      throw new Error('Did not reach the first questionnaire step for NAV 52-05.01');
    }

    cy.clickNextStep();
    advanceToQuestion(attempts + 1);
  });
};

const fillApplicantDetails = () => {
  cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Maren');
  cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Mottaker');
  selectRadio(/Har du norsk fødselsnummer eller d-nummer/i, /^Ja$/i);
  cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
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

describe('NAV 52-05.01 - production fixture parity', () => {
  it('keeps innkreving-back-in-time conditionals aligned with the summary', () => {
    visitFixtureComponentsForm('forms/nav520501.json');
    advanceToQuestion();

    selectRadio(/Hvilken part er du i saken/i, /Forelder som mottar barnebidrag/i);
    cy.clickNextStep();

    fillApplicantDetails();
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Pål');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Betaler');
    cy.clickNextStep();

    cy.findAllByRole('textbox', { name: /Barnets fornavn/i })
      .last()
      .type('Ella');
    cy.findAllByRole('textbox', { name: /Barnets etternavn/i })
      .last()
      .type('Innkreving');
    cy.findAllByRole('textbox', { name: /Barnets fødselsdato/i })
      .last()
      .type('20.08.2016');
    cy.findAllByRole('group', { name: /Nåværende bidrag er fastsatt ved/i })
      .last()
      .within(() => {
        cy.findByRole('radio', { name: /privat avtale/i }).check({ force: true });
      });
    cy.findAllByRole('checkbox', {
      name: /Jeg ønsker at Skatteetaten skal kreve inn barnebidraget for dette barnet/i,
    })
      .last()
      .check({ force: true });
    cy.findAllByRole('group', { name: /Ønsker du innkreving tilbake i tid/i })
      .last()
      .within(() => {
        cy.findByRole('radio', { name: /^Ja$/i }).check({ force: true });
      });
    cy.findAllByRole('textbox', { name: /Jeg ønsker innkreving fra Skatteetaten fra og med/i })
      .last()
      .type('01.2024');
    cy.findAllByRole('group', {
      name: /Har du fått noe barnebidrag i perioden du ønsker innkreving for, som gjelder tilbake i tid/i,
    })
      .last()
      .within(() => {
        cy.findByRole('radio', { name: /Jeg har fått noe/i }).check({ force: true });
      });
    cy.findAllByRole('textbox', {
      name: /Beskriv hva den bidragspliktige har betalt fra det tidspunktet du ønsker innkreving/i,
    })
      .last()
      .type('Det ble betalt 1500 kroner for januar 2024.');
    cy.clickNextStep();

    selectVisibleAttachmentChoices();
    cy.clickNextStep();

    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');

    cy.withinSummaryGroup('Barn og nåværende avtale', () => {
      cy.contains('Ella').should('exist');
      cy.contains('Innkreving').should('exist');
      cy.contains(/privat avtale/i).should('exist');
      cy.contains('Det ble betalt 1500 kroner for januar 2024.').should('exist');
    });

    cy.withinSummaryGroup('Vedlegg', () => {
      cy.contains('Kopi av privat avtale om barnebidrag').should('exist');
    });
  });
});
