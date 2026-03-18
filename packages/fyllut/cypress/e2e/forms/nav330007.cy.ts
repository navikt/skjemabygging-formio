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

const fillApplicantDetails = (firstName: string, lastName: string, nationalIdentityNumber: string) => {
  cy.findByRole('textbox', { name: /^Fornavn$/i }).type(firstName);
  cy.findByRole('textbox', { name: /^Etternavn$/i }).type(lastName);
  selectRadio(/Har du norsk fødselsnummer eller d-nummer/i, /Ja/i);
  cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type(nationalIdentityNumber);
  cy.findByRole('textbox', { name: /Telefonnummer/i }).type('12345678');
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

describe('NAV 33-00.07 - Søknad om barnetrygd', () => {
  it('covers applicant-role branching and child specific summary parity', () => {
    visitFixtureComponentsForm('forms/nav330007.json');

    cy.clickNextStep();
    selectRadio(/Hvem er du som søker/i, /^Forelder$/i);
    cy.clickNextStep();

    // Advance past info/confirmation panels until "Dine opplysninger" (text inputs visible)
    const advanceToDineOpplysninger = (attempts = 0) => {
      cy.get('body').then(($body) => {
        if ($body.find('input[type="text"]').length > 0) {
          return;
        }
        if (attempts >= 5) {
          throw new Error('Did not reach Dine opplysninger panel for NAV 33-00.07');
        }
        const checkbox = $body.find('input[type="checkbox"]');
        if (checkbox.length > 0) {
          cy.wrap(checkbox[0]).check({ force: true });
        }
        cy.clickNextStep();
        advanceToDineOpplysninger(attempts + 1);
      });
    };
    advanceToDineOpplysninger();

    fillApplicantDetails('Frida', 'Forelder', '22859597622');
    cy.clickNextStep();

    selectRadio(/Vil du søke om utvidet barnetrygd/i, /Nei/i);
    cy.clickNextStep();

    selectRadio(/Har du oppholdt deg sammenhengende i Norge de siste tolv månedene/i, /Ja/i);
    cy.clickNextStep();

    selectRadio(
      /Arbeider eller har du arbeidet utenfor Norge, på utenlandsk skip eller på utenlandsk kontinentalsokkel/i,
      /Nei/i,
    );
    cy.clickNextStep();

    selectRadio(/Får eller har du fått pensjon fra utlandet/i, /Nei/i);
    cy.clickNextStep();

    selectRadio(/Er barnet født/i, /Ja/i);
    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Ella');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Barn');
    cy.findByRole('textbox', { name: /Barnets fødselsnummer eller d-nummer/i }).type('14082100025');
    selectRadio(/Er barnet fosterbarn/i, /Nei/i);
    selectRadio(/Har du og den andre forelderen skriftlig avtale om delt bosted for barnet/i, /Nei/i);
    cy.findByRole('textbox', { name: /Fornavn \/ Etternavn/i }).type('Ole Motforelder');
    cy.findByRole('textbox', { name: /^Fødselsnummer eller d-nummer$/i }).type('12099000013');
    selectRadio(/Bor den andre forelderen i Norge/i, /Nei/i);
    cy.findByRole('combobox', { name: /I hvilket land bor den andre forelderen til dette barnet/i }).type(
      'Sverige{enter}',
    );
    selectRadio(
      /Arbeider eller har den andre forelderen til barnet arbeidet utenfor Norge, på utenlandsk skip eller på utenlandsk kontinentalsokkel/i,
      /Ja/i,
    );
    selectRadio(/Får eller har den andre forelderen pensjon fra utlandet/i, /Nei/i);
    selectRadio(/Får eller har den andre forelderen fått barnetrygd for dette barnet fra et annet EØS-land/i, /Nei/i);
    selectRadio(/Bor barnet fast sammen med deg/i, /Ja/i);
    selectRadio(/Bor du sammen med barnets andre forelder/i, /Nei/i);
    selectRadio(/Har du bodd sammen med barnets andre forelder/i, /Ja/i);
    cy.findByRole('textbox', { name: /Når flyttet dere fra hverandre/i }).type('01.06.2023');
    selectRadio(/Er barnet i barnverninstitusjon eller i annen institusjon/i, /Nei/i);
    selectRadio(/Er barnet adoptert fra utlandet/i, /Nei/i);
    selectRadio(/Er det søkt om asyl i Norge for barnet/i, /Nei/i);
    selectRadio(/Har barnet oppholdt seg sammenhengende i Norge de siste tolv månedene/i, /Nei/i);
    selectRadio(/Er det planlagt at barnet skal bo sammenhengende i Norge i mer enn tolv måneder/i, /Ja/i);
    selectRadio(/Får du, eller har du fått barnetrygd for barnet fra et annet EØS-land/i, /Nei/i);
    selectRadio(/Har du søkt om barnetrygd for barnet fra et annet EØS-land/i, /Nei/i);
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /Barnets navn/i }).type('Ella Barn');
    selectRadio(
      /Hva beskriver perioden barnet oppholdt seg utenfor Norge best/i,
      /Barnet har oppholdt seg utenfor Norge tidligere/i,
    );
    cy.findByRole('combobox', { name: /Hvilket land oppholdt barnet seg i/i }).type('Sverige{enter}');
    cy.findByRole('textbox', { name: /^Når startet oppholdet\? \(dd.mm.åååå\)$/i }).type('01.01.2023');
    cy.findByRole('textbox', { name: /Når ble oppholdet avsluttet/i }).type('01.03.2023');
    cy.clickNextStep();

    cy.findByRole('textbox', { name: /Navnet på den andre forelderen/i }).type('Ole Motforelder');
    selectRadio(/Er arbeidsperioden avsluttet/i, /Ja/i);
    cy.findByRole('combobox', { name: /Hvilket land arbeidet den andre forelderen i/i }).type('Sverige{enter}');
    cy.findByRole('textbox', { name: /^Arbeidsgiver$/i }).type('Nordic Work AB');
    cy.findByRole('textbox', { name: /Når startet arbeidsperioden\? \(dd.mm.åååå\)/i }).type('01.02.2022');
    cy.findByRole('textbox', { name: /Når ble arbeidsperioden avsluttet/i }).type('31.12.2022');
    cy.clickNextStep();

    selectRadio(/Ønsker du å gi andre opplysninger til Nav utover det du allerede har oppgitt/i, /Nei/i);
    cy.clickNextStep();

    selectVisibleAttachmentChoices();
    cy.clickNextStep();

    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');
    cy.findAllByText(/Forelder/).should('exist');
    cy.findAllByText('Ella Barn').should('exist');
    cy.findAllByText('Ole Motforelder').should('exist');
    cy.findAllByText(/Sverige/).should('exist');
    cy.findAllByText(/Har barnet oppholdt seg sammenhengende i Norge de siste tolv månedene/i).should('exist');
  });
});
