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

const fillApplicantDetails = () => {
  cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Frida');
  cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Forskudd');
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

describe('NAV 54-00.09 - production fixture parity', () => {
  it('keeps contribution and counterparty conditionals aligned with the summary', () => {
    visitFixtureComponentsForm('forms/nav540009.json');
    cy.findByRole('heading', { level: 2, name: /Introduksjon/i }).should('exist');
    cy.clickNextStep();
    cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/i }).check({ force: true });
    cy.clickNextStep();

    fillApplicantDetails();
    cy.clickNextStep();

    selectRadio(/Hva er din sivilstand/i, /Jeg er enslig/i);
    cy.findByRole('textbox', { name: /Hvor mange egne barn har du i husstanden din/i }).type('1');
    selectRadio(/Er du i jobb/i, /^Ja$/i);
    cy.findByRole('checkbox', { name: /^Ansatt$/i }).check({ force: true });
    cy.clickNextStep();

    cy.findAllByRole('textbox', { name: /Barnets fornavn/i })
      .last()
      .type('Sofie');
    cy.findAllByRole('textbox', { name: /Barnets etternavn/i })
      .last()
      .type('Forskuddsbarn');
    cy.findAllByRole('checkbox', { name: /Barnet har ikke norsk fødselsnummer eller d-nummer/i })
      .last()
      .check({ force: true });
    cy.findAllByRole('textbox', { name: /Barnets fødselsdato/i })
      .last()
      .type('15.06.2018');
    cy.findAllByRole('group', { name: /Bor barnet fast hos deg/i })
      .last()
      .within(() => {
        cy.findByRole('radio', { name: /^Ja$/i }).check({ force: true });
      });
    cy.findAllByRole('group', { name: /Har barnet bodd sammen med deg siden fødselen/i })
      .last()
      .within(() => {
        cy.findByRole('radio', { name: /^Nei$/i }).check({ force: true });
      });
    cy.findAllByRole('textbox', { name: /Fra hvilken dato har barnet bodd fast sammen med deg/i })
      .last()
      .type('01.02.2020');
    cy.findAllByRole('group', { name: /Har barnet delt fast bosted/i })
      .last()
      .within(() => {
        cy.findByRole('radio', { name: /^Ja$/i }).check({ force: true });
      });
    cy.findAllByRole('group', { name: /Bor barnet i Norge/i })
      .last()
      .within(() => {
        cy.findByRole('radio', { name: /^Ja$/i }).check({ force: true });
      });
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Ola');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Motpart');
    selectRadio(/Kjenner du den andre partens norske fødselsnummer eller d-nummer/i, /^Nei$/i);
    selectRadio(/Vet du fødselsdatoen til den andre parten/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Den andre partens fødselsdato/i }).type('20.09.1985');
    selectRadio(/Bor den andre parten i Norge/i, /^Nei$/i);
    selectRadio(/Vet du adressen/i, /^Nei$/i);
    cy.findByRole('combobox', { name: /Hvilket land bor den andre parten i/i }).type('Sverige{enter}');
    cy.clickNextStep();

    selectRadio(/Du og den andre partens boforhold/i, /Vi har flyttet fra hverandre/i);
    cy.findByRole('textbox', { name: /Når flyttet dere fra hverandre/i }).type('01.06.2021');
    cy.clickNextStep();

    selectRadio(/Har du avtale om barnebidrag for barnet eller barna du søker bidragsforskudd for/i, /^Ja$/i);
    cy.findAllByRole('textbox', { name: /Barnets navn/i })
      .last()
      .type('Sofie Forskuddsbarn');
    cy.findAllByRole('group', { name: /Bidraget er fastsatt ved/i })
      .last()
      .within(() => {
        cy.findByRole('radio', { name: /rettsforlik/i }).check({ force: true });
      });
    cy.findAllByRole('group', { name: /Er bidraget fastsatt i Norge/i })
      .last()
      .within(() => {
        cy.findByRole('radio', { name: /^Ja$/i }).check({ force: true });
      });
    cy.findAllByRole('textbox', { name: /Avtalt bidrag per måned/i })
      .last()
      .type('3000');
    cy.findAllByRole('group', { name: /Har du oppgitt beløpet i norske kroner/i })
      .last()
      .within(() => {
        cy.findByRole('radio', { name: /^Ja$/i }).check({ force: true });
      });
    cy.findAllByRole('group', { name: /Har du fått barnebidraget i henhold til fastsettelsen/i })
      .last()
      .within(() => {
        cy.findByRole('radio', { name: /Jeg har fått noe/i }).check({ force: true });
      });
    cy.findAllByRole('textbox', {
      name: /Beskriv hva den andre parten har betalt, og for hvilke perioder det gjelder/i,
    })
      .last()
      .type('Det ble betalt deler av bidraget våren 2024.');
    cy.findAllByRole('group', { name: /Krever Skatteetaten inn dette barnebidraget/i })
      .last()
      .within(() => {
        cy.findByRole('radio', { name: /^Nei$/i }).check({ force: true });
      });
    cy.findAllByRole('group', { name: /Ønsker du at Skatteetaten skal kreve inn bidraget/i })
      .last()
      .within(() => {
        cy.findByRole('radio', { name: /^Ja$/i }).check({ force: true });
      });
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /Fra hvilken måned søker du bidragsforskudd fra/i }).type('08.2024');
    cy.clickNextStep();

    selectVisibleAttachmentChoices();
    cy.clickNextStep();

    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');

    cy.withinSummaryGroup('Barn søknaden gjelder for', () => {
      cy.contains('Sofie').should('exist');
      cy.contains('Forskuddsbarn').should('exist');
      cy.contains('01.02.2020').should('exist');
    });

    cy.withinSummaryGroup('Opplysninger om den andre parten', () => {
      cy.contains('Ola').should('exist');
      cy.contains('Motpart').should('exist');
      cy.contains('Sverige').should('exist');
    });

    cy.withinSummaryGroup('Nåværende avtale om bidrag', () => {
      cy.contains(/rettsforlik/i).should('exist');
      cy.contains(/3.?000/).should('exist');
      cy.contains('Det ble betalt deler av bidraget våren 2024.').should('exist');
    });

    cy.withinSummaryGroup('Vedlegg', () => {
      cy.contains('Kopi av avtale om delt fast bosted').should('exist');
      cy.contains('Kopi av rettsforlik om fastsettelse av barnebidrag').should('exist');
    });
  });
});
