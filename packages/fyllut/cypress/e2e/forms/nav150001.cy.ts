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
  cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Line');
  cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Overgang');
  selectRadio(/Har du norsk fødselsnummer eller d-nummer/i, /^Ja$/i);
  cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
  cy.findByRole('textbox', { name: /^Telefonnummer$/i }).type('12345678');
};

const fillChildRow = () => {
  cy.findAllByRole('textbox', { name: /Barnets fornavn/i })
    .last()
    .type('Emma');
  cy.findAllByRole('textbox', { name: /Barnets etternavn/i })
    .last()
    .type('Overgangsdatter');
  cy.findAllByRole('textbox', { name: /Fødselsdato/i })
    .last()
    .type('03.05.2018');
  cy.findAllByRole('group', { name: /Bor barnet fast sammen med deg/i })
    .last()
    .within(() => {
      cy.findByRole('radio', { name: /^Ja$/i }).check({ force: true });
    });
  cy.findAllByRole('group', { name: /Skal barnet ha adresse hos deg/i })
    .last()
    .within(() => {
      cy.findByRole('radio', { name: /Ja, og vi har registrert adressen i Folkeregisteret/i }).check({ force: true });
    });
  cy.findAllByRole('group', { name: /Kan du gi oss navnet på den andre forelderen/i })
    .last()
    .within(() => {
      cy.findByRole('radio', { name: /^Ja$/i }).check({ force: true });
    });
  cy.findAllByRole('textbox', { name: /^Fornavn$/i })
    .last()
    .type('Per');
  cy.findAllByRole('textbox', { name: /^Etternavn$/i })
    .last()
    .type('Motforelder');
  cy.findAllByRole('checkbox', { name: /Jeg kjenner ikke fødselsnummer \/ d-nummer/i })
    .last()
    .check({ force: true });
  cy.findAllByRole('group', { name: /Bor barnets andre forelder i Norge/i })
    .last()
    .within(() => {
      cy.findByRole('radio', { name: /^Ja$/i }).check({ force: true });
    });
  cy.findAllByRole('group', {
    name: /Har du og den andre forelderen ha skriftlig avtale om delt fast bosted for barnet/i,
  })
    .last()
    .within(() => {
      cy.findByRole('radio', { name: /^Nei$/i }).check({ force: true });
    });
  cy.findAllByRole('group', { name: /Har den andre forelderen samvær med barnet/i })
    .last()
    .within(() => {
      cy.findByRole('radio', {
        name: /Ja, men ikke mer enn én ettermiddag i uken med overnatting og annenhver helg eller tilsvarende/i,
      }).check({ force: true });
    });
  cy.findAllByRole('group', { name: /Har dere skriftlig samværsavtale for barnet/i })
    .last()
    .within(() => {
      cy.findByRole('radio', { name: /Ja, men den beskriver ikke når barnet er sammen med hver av foreldrene/i }).check(
        {
          force: true,
        },
      );
    });
  cy.findAllByRole('textbox', { name: /Hvordan praktiserer dere samværet/i })
    .last()
    .type('Vi avtaler samvær fortløpende hver måned.');
  cy.findAllByRole('group', {
    name: /Bor du og den andre forelderen til barnet i samme hus, blokk, gårdstun, kvartal, vei eller gate/i,
  })
    .last()
    .within(() => {
      cy.findByRole('radio', { name: /^Nei$/i }).check({ force: true });
    });
  cy.findAllByRole('group', { name: /Har du bodd sammen med den andre forelderen til barnet før/i })
    .last()
    .within(() => {
      cy.findByRole('radio', { name: /^Ja$/i }).check({ force: true });
    });
  cy.findAllByRole('textbox', { name: /Når flyttet dere fra hverandre/i })
    .last()
    .type('01.06.2023');
  cy.findAllByRole('group', { name: /Hvor mye er du sammen med den andre forelderen til barnet/i })
    .last()
    .within(() => {
      cy.findByRole('radio', { name: /Vi skal kun møtes når barnet skal hentes eller leveres/i }).check({
        force: true,
      });
    });
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

describe('NAV 15-00.01 - production fixture parity', () => {
  it('keeps child, marital and work conditionals aligned with the summary', () => {
    visitFixtureComponentsForm('forms/nav150001.json');
    cy.findByRole('heading', { level: 2, name: /Introduksjon/i }).should('exist');
    cy.clickNextStep();
    cy.findByRole('checkbox', {
      name: /Jeg er klar over at jeg kan miste retten til overgangsstønad dersom jeg ikke har gitt riktige opplysninger/i,
    }).check({ force: true });
    cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil gi riktige og fullstendige opplysninger/i }).check({
      force: true,
    });
    cy.clickNextStep();

    fillApplicantDetails();
    cy.clickNextStep();

    selectRadio(/Hva er din sivilstand/i, /^Separert$/i);
    selectRadio(/Giftet du deg i utlandet/i, /^Nei$/i);
    selectRadio(/Ble du separert eller skilt i utlandet/i, /^Nei$/i);
    selectRadio(/Hvorfor er du alene med barn/i, /Samlivsbrudd med den andre forelderen/i);
    cy.findByRole('textbox', { name: /Dato for samlivsbrudd/i }).type('01.06.2023');
    cy.clickNextStep();

    selectRadio(/Oppholder du og barnet\/barna dere i Norge/i, /^Ja$/i);
    selectRadio(/Har du bodd i Norge sammenhengende de siste fem årene/i, /^Ja$/i);
    cy.clickNextStep();

    selectRadio(/Deler du bolig med andre voksne/i, /Nei, jeg bor alene med barn eller jeg er gravid og bor alene/i);
    selectRadio(/Har du konkrete planer om å gifte deg eller bli samboer/i, /^Nei$/i);
    cy.clickNextStep();

    selectRadio(/Venter du barn/i, /^Nei$/i);
    selectRadio(/Har du omsorg for barn under 18 år/i, /^Ja$/i);
    fillChildRow();
    cy.clickNextStep();

    cy.findByRole('checkbox', { name: /Jeg er arbeidstaker \(og\/eller lønnsmottaker som frilanser\)/i }).check({
      force: true,
    });
    cy.findAllByRole('textbox', { name: /Navn på arbeidssted/i })
      .last()
      .type('Lærlingplass AS');
    cy.findAllByRole('textbox', { name: /Hvor mye jobber du/i })
      .last()
      .type('60');
    cy.findAllByRole('group', { name: /Hva slags ansettelsesforhold har du/i })
      .last()
      .within(() => {
        cy.findByRole('radio', { name: /Lærling/i }).check({ force: true });
      });
    cy.clickNextStep();

    cy.findByRole('checkbox', { name: /^Nei$/i }).check({ force: true });
    selectRadio(/Har du sagt opp jobben eller redusert arbeidstiden de siste 6 månedene/i, /^Nei$/i);
    selectRadio(/Søker du overgangsstønad fra en bestemt måned/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Når søker du stønad fra/i }).type('08.2025');
    cy.clickNextStep();

    selectVisibleAttachmentChoices();
    cy.clickNextStep();

    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');

    cy.withinSummaryGroup('Sivilstand', () => {
      cy.contains('Separert').should('exist');
      cy.contains('Samlivsbrudd med den andre forelderen').should('exist');
      cy.contains('01.06.2023').should('exist');
    });

    cy.withinSummaryGroup('Barna og samvær', () => {
      cy.contains('Emma').should('exist');
      cy.contains('Overgangsdatter').should('exist');
      cy.contains('Vi avtaler samvær fortløpende hver måned.').should('exist');
    });

    cy.withinSummaryGroup('Arbeid, utdanning og andre aktiviteter', () => {
      cy.contains('Lærlingplass AS').should('exist');
      cy.contains('Lærling').should('exist');
    });

    cy.withinSummaryGroup('Vedlegg', () => {
      cy.contains('Samværsavtale').should('exist');
      cy.contains('Lærlingkontrakt').should('exist');
    });
  });
});
