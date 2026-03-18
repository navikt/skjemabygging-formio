const completeApplicantStep = () => {
  cy.findByRole('group', { name: /Fyller du ut.*søknaden.*vegne av andre/i }).within(() => {
    cy.findByRole('radio', { name: /^Nei$/i }).check();
  });
  cy.clickNextStep();
};

const completePersonalDetailsStep = () => {
  cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Ola');
  cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Nordmann');
  cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/i }).within(() => {
    cy.findByRole('radio', { name: /^Ja$/i }).check();
  });
  cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
  cy.clickNextStep();
};

const completeApplicationStep = () => {
  cy.findByRole('combobox', { name: /Hvilket land skal du til/i }).type('USA{enter}');
  cy.findByRole('textbox', { name: /^Fra dato/i }).type('01.01.2025');
  cy.findByRole('textbox', { name: /^Til dato/i }).type('31.12.2025');
  cy.findByRole('group', { name: /Har du oppholdt deg i utlandet de siste fem årene/i }).within(() => {
    cy.findByRole('radio', { name: /^Nei$/i }).check();
  });
  cy.findByRole('group', { name: /Hvilken.*trygdedekning.*søker du om/i }).within(() => {
    cy.findByRole('radio', { name: /Helsedelen/i }).check();
  });
  cy.findByRole('group', { name: /Søker du i tillegg.*sykepenger.*foreldrepenger/i })
    .should('be.visible')
    .within(() => {
      cy.findByRole('radio', { name: /^Nei$/i }).check();
    });
  cy.clickNextStep();
};

const completeWorkIncomePanels = () => {
  cy.findByRole('group', { name: /Er du sendt ut av en norsk arbeidsgiver for å jobbe i utlandet/i }).within(() => {
    cy.findByRole('radio', { name: /^Ja$/i }).check();
  });
  cy.findByRole('textbox', { name: /Navn på arbeidsgiveren/i }).type('Testbedrift AS');
  cy.findByRole('textbox', { name: /Organisasjonsnummeret til underenheten der du er ansatt/i }).type('889640782');
  cy.findByRole('group', { name: /Hvem lønnes du av i søknadsperioden/i }).within(() => {
    cy.findByRole('radio', { name: /Samme arbeidsgiver som over/i }).check();
  });
  cy.clickNextStep();

  cy.findByRole('heading', { level: 2, name: /Hvor utføres arbeidet/i }).should('exist');
  cy.findByRole('group', { name: /Hvor skal du utføre arbeidet/i }).within(() => {
    cy.findByRole('radio', { name: /På land/i }).check();
  });
  cy.findByRole('textbox', { name: /Navn på virksomhet\/arbeidssted/i }).type('Prosjektkontor USA');
  cy.findByRole('textbox', { name: /^Adresse$/i })
    .last()
    .type('Main Street 1');
  cy.findByRole('textbox', { name: /^Postnummer$/i })
    .last()
    .type('10001');
  cy.findByRole('textbox', { name: /^Poststed$/i })
    .last()
    .type('New York');
  cy.findByRole('combobox', { name: /^Land$/i })
    .last()
    .type('USA{enter}');
  cy.findByRole('group', { name: /Skal du arbeide på hjemmekontor/i }).within(() => {
    cy.findByRole('radio', { name: /^Nei$/i }).check();
  });
  cy.findByRole('group', { name: /Arbeider du i en rotasjonsordning/i }).within(() => {
    cy.findByRole('radio', { name: /^Nei$/i }).check();
  });
  cy.clickNextStep();

  cy.findByRole('heading', { level: 2, name: /Skatteforhold og inntekt/i }).should('exist');
  cy.findByRole('group', { name: /Betaler du skatt til Norge/i }).within(() => {
    cy.findByRole('radio', { name: /^Ja$/i }).check();
  });
  cy.findByRole('group', { name: /Hvilken virksomhet får du inntekten fra/i }).within(() => {
    cy.findByRole('checkbox', { name: /Norsk virksomhet/i }).check();
  });
  cy.findByRole('group', { name: /^Hva mottar du\?$/i }).within(() => {
    cy.findByRole('checkbox', { name: /^Lønn$/i }).check();
  });
  cy.findByRole('textbox', { name: /^Angi sum$/i }).type('500000');
  cy.findByRole('group', { name: /Mottar du utenlandstillegg/i }).within(() => {
    cy.findByRole('radio', { name: /^Nei$/i }).check();
  });
  cy.findByRole('group', { name: /Mottar du naturalytelser/i }).within(() => {
    cy.findByRole('radio', { name: /^Nei$/i }).check();
  });
  cy.findByRole('group', { name: /Mottar du pensjon .*offentlig eller privat/i }).within(() => {
    cy.findByRole('radio', { name: /^Nei$/i }).check();
  });
  cy.findByRole('group', { name: /Har du andre arbeidsinntekter/i }).within(() => {
    cy.findByRole('radio', { name: /^Nei$/i }).check();
  });
  cy.clickNextStep();
};

const completeRepresentativeInNorwayStep = () => {
  cy.findByRole('heading', { level: 2, name: /Trygdeavgift til Nav/i }).should('exist');
  cy.findByRole('group', {
    name: /Ønsker du at noen andre skal motta og betale faktura for trygdeavgift for deg/i,
  }).within(() => {
    cy.findByRole('radio', { name: /^Nei$/i }).check();
  });
  cy.clickNextStep();
};

const completeFinalStepsToSummary = () => {
  cy.findByRole('group', { name: /Har du ektefelle.*partner.*samboer.*sender egen søknad/i }).within(() => {
    cy.findByRole('radio', { name: /^Nei$/i }).check();
  });
  cy.findByRole('group', { name: /Søker du for.*barn under 18 år.*med til utlandet/i }).within(() => {
    cy.findByRole('radio', { name: /^Nei$/i }).check();
  });
  cy.clickNextStep();

  cy.findByRole('group', { name: /Har du noen flere.*opplysninger til.*søknaden/i }).within(() => {
    cy.findByRole('radio', { name: /^Nei$/i }).check();
  });
  cy.clickNextStep();

  cy.findByRole('checkbox', {
    name: /Jeg bekrefter at opplysningene er korrekte, og er kjent med at NAV kan innhente opplysninger som er nødvendige for å vurdere søknaden/i,
  }).check();
  cy.clickNextStep();

  cy.findByRole('heading', { level: 2, name: /Vedlegg/i }).should('exist');
  cy.findAllByRole('radio', { name: /Jeg legger det ved dette skjemaet/i }).check({ force: true });
  cy.clickNextStep();

  cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');
};

describe('NAV 02-08.05 - production fixture parity', () => {
  beforeEach(() => {
    cy.visitFixtureForm('nav020805');
  });

  it('shows work-specific conditional panels on both the form and summary for a wage earner abroad', () => {
    completeApplicantStep();
    completePersonalDetailsStep();
    completeApplicationStep();

    cy.findByRole('group', { name: /Skal du arbeide eller drive næring i utlandet/i }).within(() => {
      cy.findByRole('radio', { name: /^Ja$/i }).check();
    });

    cy.findByRole('group', { name: /Hva er arbeidssituasjonen din/i })
      .should('be.visible')
      .within(() => {
        cy.findByRole('checkbox', { name: /Lønnsmottaker/i }).check();
      });
    cy.findByRole('group', { name: /Hva er situasjonen din i perioden/i }).should('not.exist');
    cy.findByRole('textbox', { name: /Hvilken stilling har du/i }).type('Utvikler');
    cy.clickNextStep();

    completeWorkIncomePanels();
    completeRepresentativeInNorwayStep();
    completeFinalStepsToSummary();

    cy.withinSummaryGroup('Opplysninger om utenlandsoppholdet', () => {
      cy.contains('Lønnsmottaker').should('exist');
      cy.contains('Jeg studerer').should('not.exist');
    });

    cy.findByRole('heading', { level: 3, name: /Lønnsmottaker/i }).should('exist');
    cy.findByRole('heading', { level: 3, name: /Hvor utføres arbeidet/i }).should('exist');
    cy.findByRole('heading', { level: 3, name: /Skatteforhold og inntekt/i }).should('exist');
    cy.findByRole('heading', { level: 3, name: /^Student$/i }).should('not.exist');
  });

  it('keeps work panels out of both the form flow and summary for a student without work abroad', () => {
    completeApplicantStep();
    completePersonalDetailsStep();
    completeApplicationStep();

    cy.findByRole('group', { name: /Skal du arbeide eller drive næring i utlandet/i }).within(() => {
      cy.findByRole('radio', { name: /^Nei$/i }).check();
    });

    cy.findByRole('group', { name: /Hva er situasjonen din i perioden/i })
      .should('be.visible')
      .within(() => {
        cy.findByRole('checkbox', { name: /Jeg studerer/i }).check();
      });
    cy.findByRole('group', { name: /Hva er arbeidssituasjonen din/i }).should('not.exist');
    cy.clickNextStep();

    cy.findByRole('heading', { level: 2, name: /^Student$/i }).should('exist');
    cy.findByRole('heading', { level: 2, name: /Hvor utføres arbeidet/i }).should('not.exist');
    cy.findByRole('heading', { level: 2, name: /Lønnsmottaker/i }).should('not.exist');
    cy.findByRole('group', { name: /Hvor skal du studere/i }).within(() => {
      cy.findByRole('radio', { name: /Ved et lærested/i }).check();
    });
    cy.findByRole('textbox', { name: /Lærestedets navn/i }).type('University of Test');
    cy.findByRole('textbox', { name: /^Adresse$/i }).type('Campus Road 1');
    cy.findByRole('textbox', { name: /^Postnummer$/i }).type('1000');
    cy.findByRole('textbox', { name: /^Poststed$/i }).type('Testby');
    cy.findByRole('combobox', { name: /^Land$/i }).type('USA{enter}');
    cy.findByRole('textbox', { name: /Hvilken utdanning tar du/i }).type('Master i informatikk');
    cy.findByRole('textbox', { name: /Når forventer du å avslutte utdanningen/i }).type('01.06.2026');
    cy.findByRole('group', { name: /Hvordan finansierer du studiene/i }).within(() => {
      cy.findByRole('checkbox', { name: /Privat finansiering/i }).check();
    });
    cy.findByRole('textbox', { name: /Beskriv hvordan du finansierer studiene/i }).type('Sparepenger');
    cy.findByRole('group', { name: /Finansieres studiene fra Norge/i }).within(() => {
      cy.findByRole('radio', { name: /^Ja$/i }).check();
    });
    cy.clickNextStep();

    cy.findByRole('heading', { level: 2, name: /Au pair\/praktikant eller arbeid ved siden av studier/i }).should(
      'not.exist',
    );
    cy.findByRole('heading', { level: 2, name: /Skatteforhold og inntekt/i }).should('not.exist');
    cy.findByRole('heading', { level: 2, name: /Trygdeavgift til Nav/i }).should('not.exist');

    cy.findByRole('heading', { level: 2, name: /Familiemedlemmer/i }).should('exist');
    completeFinalStepsToSummary();

    cy.withinSummaryGroup('Opplysninger om utenlandsoppholdet', () => {
      cy.contains('Jeg studerer').should('exist');
      cy.contains('Lønnsmottaker').should('not.exist');
    });

    cy.findByRole('heading', { level: 3, name: /^Student$/i }).should('exist');
    cy.findByRole('heading', { level: 3, name: /Lønnsmottaker/i }).should('not.exist');
    cy.findByRole('heading', { level: 3, name: /Hvor utføres arbeidet/i }).should('not.exist');
    cy.findByRole('heading', { level: 3, name: /Skatteforhold og inntekt/i }).should('not.exist');
  });
});
