const fillEmployeeStep = ({ hasNorwegianId }: { hasNorwegianId: boolean }) => {
  cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Ola');
  cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Nordmann');

  cy.findByRole('group', { name: /Har arbeidstakeren norsk fødselsnummer eller d-nummer/i }).within(() => {
    cy.findByRole('radio', { name: hasNorwegianId ? /^Ja$/i : /^Nei$/i }).check();
  });

  if (hasNorwegianId) {
    cy.findByRole('textbox', { name: /Oppgi arbeidstakers fødselsnummer/i })
      .should('be.visible')
      .type('22859597622');
    cy.findByRole('textbox', { name: /Oppgi arbeidstakers fødselsdato/i }).should('not.exist');
  } else {
    cy.findByRole('textbox', { name: /Oppgi arbeidstakers fødselsdato/i })
      .should('be.visible')
      .type('01.01.1990');
    cy.findByRole('textbox', { name: /Oppgi arbeidstakers fødselsnummer/i }).should('not.exist');
  }

  cy.clickNextStep();
};

const fillEmployerStep = () => {
  cy.findByRole('textbox', { name: /Navn på arbeidsgiveren som sender arbeidstakeren til utlandet/i }).type(
    'Testbedrift AS',
  );
  cy.findByRole('textbox', { name: /^Organisasjonsnummer$/i }).type('889640782');
  cy.clickNextStep();
};

const fillAssignmentStep = ({ hasAssignmentInCountry }: { hasAssignmentInCountry: boolean }) => {
  cy.findByRole('combobox', { name: /Hvilket land sendes arbeidstakeren til/i }).type('USA{enter}');
  cy.findByRole('textbox', { name: /^Fra dato/i }).type('01.01.2025');
  cy.findByRole('textbox', { name: /^Til dato/i }).type('31.12.2025');

  cy.findByRole('group', { name: /Har du som arbeidsgiver oppdrag i landet den ansatte skal sendes ut til/i }).within(
    () => {
      cy.findByRole('radio', { name: hasAssignmentInCountry ? /^Ja$/i : /^Nei$/i }).check();
    },
  );

  if (hasAssignmentInCountry) {
    cy.findByRole('textbox', { name: /Beskriv formålet med utenlandsoppholdet/i }).should('not.exist');
  } else {
    cy.findByRole('textbox', { name: /Beskriv formålet med utenlandsoppholdet/i })
      .should('be.visible')
      .type('Opplæring av ansatte');
  }

  cy.findByRole('group', {
    name: /Plikter du som arbeidsgiver å betale arbeidsgiveravgift til Norge av lønnen den ansatte tjener under utenlandsoppholdet/i,
  }).within(() => {
    cy.findByRole('radio', { name: /^Ja$/i }).check();
  });

  cy.clickNextStep();
};

const fillSubmitterStep = ({ employerType }: { employerType: 'employer' | 'representative' }) => {
  cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Kari');
  cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Hansen');
  cy.findByRole('textbox', { name: /^Telefonnummer$/i }).type('12345678');

  cy.findByRole('textbox', { name: /Oppgi firmanavn/i }).should('not.exist');

  cy.findByRole('group', { name: /Hvor er du ansatt/i }).within(() => {
    cy.findByRole('radio', {
      name: employerType === 'employer' ? /Hos arbeidsgiveren/i : /Hos et firma som representerer arbeidsgiveren/i,
    }).check();
  });

  if (employerType === 'representative') {
    cy.findByRole('textbox', { name: /Oppgi firmanavn/i })
      .should('be.visible')
      .type('Representant AS');
  } else {
    cy.findByRole('textbox', { name: /Oppgi firmanavn/i }).should('not.exist');
  }

  cy.findByRole('textbox', { name: /Organisasjonsnummeret til underenheten der du er ansatt/i }).type('889640782');
  cy.clickNextStep();
};

const goToSummary = () => {
  cy.findByRole('checkbox', {
    name: /Jeg bekrefter at opplysningene er korrekte, og er kjent med at NAV kan innhente opplysninger som er nødvendige for å vurdere søknaden/i,
  }).check();
  cy.clickNextStep();
  cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');
};

describe('NAV 02-08.06 - production fixture parity', () => {
  beforeEach(() => {
    cy.visitFixtureForm('nav020806', { path: '/fyllut/nav020806', skipIntroSteps: 1 });
  });

  it('keeps fødselsdato and purpose description in sync with the summary when both conditionals are triggered', () => {
    fillEmployeeStep({ hasNorwegianId: false });
    fillEmployerStep();
    fillAssignmentStep({ hasAssignmentInCountry: false });
    fillSubmitterStep({ employerType: 'employer' });
    goToSummary();

    cy.withinSummaryGroup('Opplysninger om arbeidstakeren som sendes til utlandet', () => {
      cy.contains('Oppgi arbeidstakers fødselsdato').should('exist');
      cy.contains('01.01.1990').should('exist');
      cy.contains('Oppgi arbeidstakers fødselsnummer/d-nummer').should('not.exist');
    });

    cy.withinSummaryGroup('Oppdraget', () => {
      cy.contains('Beskriv formålet med utenlandsoppholdet').should('exist');
      cy.contains('Opplæring av ansatte').should('exist');
    });

    cy.withinSummaryGroup('Opplysninger om deg som fyller ut skjemaet', () => {
      cy.contains('Oppgi firmanavn').should('not.exist');
    });
  });

  it('keeps representative-only fields off the summary unless the representative path is chosen', () => {
    fillEmployeeStep({ hasNorwegianId: true });
    fillEmployerStep();
    fillAssignmentStep({ hasAssignmentInCountry: true });
    fillSubmitterStep({ employerType: 'representative' });
    goToSummary();

    cy.withinSummaryGroup('Opplysninger om arbeidstakeren som sendes til utlandet', () => {
      cy.contains('Oppgi arbeidstakers fødselsnummer/d-nummer').should('exist');
      cy.contains('Oppgi arbeidstakers fødselsdato').should('not.exist');
    });

    cy.withinSummaryGroup('Oppdraget', () => {
      cy.contains('Beskriv formålet med utenlandsoppholdet').should('not.exist');
    });

    cy.withinSummaryGroup('Opplysninger om deg som fyller ut skjemaet', () => {
      cy.contains('Oppgi firmanavn').should('exist');
      cy.contains('Representant AS').should('exist');
    });
  });
});
