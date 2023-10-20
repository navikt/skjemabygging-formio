/*
 * Tests for checking that Amplitude logging works.
 *
 * Initially only testing digital submission.
 * TODO: We should add tests for "paper" and "no submission" options as well, as they initiate "completed" logging individually.
 * TODO: Maybe we should also have tests for opening sub=digital or sub=paper directly, to see that the "skjema startet" logging is handled correctly.
 */

describe('Amplitude', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    // TODO: Remove getConfig intercept (use default intercept) when mellomlagring is enabled
    cy.intercept('GET', '/fyllut/api/config', {
      body: {
        FEATURE_TOGGLES: { enableTranslations: true, enableMellomlagring: false },
        amplitudeApiEndpoint: '127.0.0.1:3300/amplitude/collect-auto',
      },
    }).as('getConfig');
    cy.intercept('GET', '/fyllut/api/forms/cypress101').as('getCypress101');
    cy.intercept('GET', '/fyllut/api/translations/cypress101').as('getTranslation');
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  it('logs for all relevant events', () => {
    // Disabler dekoratør, siden den også gjør kall til "/collect-auto". Det fører til at checkLogToAmplitude feiler, siden den er avhengig av at kall gjørers i riktig rekkefølge
    cy.visit('/fyllut/cypress101');
    cy.wait('@getConfig');
    cy.wait('@getCypress101');
    cy.wait('@getTranslation');
    cy.wait('@getGlobalTranslation');

    // Select digital submission and go to the form
    cy.get('[type="radio"]').check('digital');
    cy.clickStart();
    cy.checkLogToAmplitude('skjema åpnet', { innsendingskanal: 'digital' });

    // Veiledning step
    cy.clickNextStep();
    cy.checkLogToAmplitude('navigere', { lenkeTekst: 'Neste steg', destinasjon: '/cypress101/personopplysninger' });
    cy.checkLogToAmplitude('skjemasteg fullført', { steg: 1, skjemastegNokkel: 'veiledning' });

    // Dine opplysninger step
    cy.findByRoleWhenAttached('combobox', { name: 'Tittel' }).click();
    cy.findByText('Fru').should('exist').click();
    cy.checkLogToAmplitude('skjema startet');
    cy.checkLogToAmplitude('skjemaspørsmål besvart', { spørsmål: 'Tittel' });

    cy.findByRole('textbox', { name: 'Fornavn' }).should('exist');
    cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
    cy.findByRole('textbox', { name: 'Fornavn' }).blur();
    cy.checkLogToAmplitude('skjemaspørsmål besvart', { spørsmål: 'Fornavn' });

    cy.findByRole('textbox', { name: 'Etternavn' }).type('Norman');
    cy.findByRole('textbox', { name: 'Etternavn' }).blur();

    cy.checkLogToAmplitude('skjemaspørsmål besvart', { spørsmål: 'Etternavn' });

    cy.get('.navds-radio-group')
      .first()
      .should('exist')
      .within(($radio) => cy.findByLabelText('Nei').should('exist').check());
    cy.checkLogToAmplitude('skjemaspørsmål besvart', { spørsmål: 'Har du norsk fødselsnummer eller D-nummer?' });

    cy.findByRole('textbox', { name: 'Din fødselsdato (dd.mm.åååå)' }).should('be.visible').type('10.05.1995');
    cy.findByRole('textbox', { name: 'Din fødselsdato (dd.mm.åååå)' }).blur();

    cy.checkLogToAmplitude('skjemaspørsmål besvart', { spørsmål: 'Din fødselsdato (dd.mm.åååå)' });

    cy.get('.navds-radio-group')
      .eq(1)
      .should('exist')
      .within(($radio) => cy.findByLabelText('Ja').should('exist').check());
    cy.checkLogToAmplitude('skjemaspørsmål besvart', { spørsmål: 'Bor du i Norge?' });

    cy.get('.navds-radio-group')
      .eq(2)
      .should('exist')
      .within(($radio) => cy.findByLabelText('Vegadresse').should('exist').check());
    cy.checkLogToAmplitude('skjemaspørsmål besvart', {
      spørsmål: 'Er kontaktadressen din en vegadresse eller postboksadresse?',
    });

    cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist').type('Kirkegata 1');
    cy.findByRole('textbox', { name: 'Vegadresse' }).blur();

    cy.checkLogToAmplitude('skjemaspørsmål besvart', { spørsmål: 'Vegadresse' });

    cy.findByRole('textbox', { name: 'Postnummer' }).should('exist').type('1234');
    cy.findByRole('textbox', { name: 'Postnummer' }).blur();

    cy.checkLogToAmplitude('skjemaspørsmål besvart', { spørsmål: 'Postnummer' });

    cy.findByRole('textbox', { name: 'Poststed' }).should('exist').type('Nesvik');
    cy.findByRole('textbox', { name: 'Poststed' }).blur();

    cy.checkLogToAmplitude('skjemaspørsmål besvart', { spørsmål: 'Poststed' });

    cy.findByRole('textbox', { name: 'Fra hvilken dato skal denne adressen brukes (dd.mm.åååå)?' })
      .should('exist')
      .type('01.01.2020');
    cy.findByRole('textbox', { name: 'Fra hvilken dato skal denne adressen brukes (dd.mm.åååå)?' }).blur();

    cy.checkLogToAmplitude('skjemaspørsmål besvart', {
      spørsmål: 'Fra hvilken dato skal denne adressen brukes (dd.mm.åååå)?',
    });

    // Step 2 -> Oppsummering
    cy.clickNextStep();
    cy.checkLogToAmplitude('navigere', { lenkeTekst: 'Neste steg', destinasjon: '/cypress101/oppsummering' });
    cy.checkLogToAmplitude('skjemasteg fullført', { steg: 2, skjemastegNokkel: 'personopplysninger' });
    cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');

    // Gå tilbake til skjema fra oppsummering, og naviger til oppsummering på nytt
    // for å verifisere at ingen valideringsfeil oppstår grunnet manglende verdier.
    cy.findByRoleWhenAttached('link', { name: 'Fortsett utfylling' }).should('exist').click();
    // There is a weird re-render happening after navigating back to the form,
    // where the first panel will be rendered for a time before redirecting to the intended panel.
    // If the user navigates during this time period, the navigation is ignored.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);

    cy.checkLogToAmplitude('navigere', {
      lenkeTekst: 'Fortsett utfylling',
      destinasjon: '/cypress101/veiledning',
    });
    cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('not.exist');
    cy.clickNextStep();
    cy.checkLogToAmplitude('navigere', { lenkeTekst: 'Neste steg', destinasjon: '/cypress101/personopplysninger' });
    cy.clickNextStep();
    cy.checkLogToAmplitude('navigere', { lenkeTekst: 'Neste steg', destinasjon: '/cypress101/oppsummering' });

    // Oppsummering
    cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
    cy.get('dl')
      .eq(1)
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'Tittel');
        cy.get('dd').eq(0).should('contain.text', 'Fru');
        cy.get('dt').eq(1).should('contain.text', 'Fornavn');
        cy.get('dd').eq(1).should('contain.text', 'Kari');
        cy.get('dt').eq(2).should('contain.text', 'Etternavn');
        cy.get('dd').eq(2).should('contain.text', 'Norman');
        cy.get('dt').eq(3).should('contain.text', 'Har du norsk fødselsnummer eller D-nummer?');
        cy.get('dd').eq(3).should('contain.text', 'Nei');
        cy.get('dt').eq(4).should('contain.text', 'Din fødselsdato (dd.mm.åååå)');
        cy.get('dd').eq(4).should('contain.text', '10.5.1995');
      });

    // First attempt is intercepted and fails, so we can test "innsending feilet"
    cy.mocksUseRouteVariant('post-send-inn:failure');
    cy.intercept('POST', '/fyllut/api/send-inn').as('submitToSendinnFailure');
    cy.findByRole('button', { name: 'Gå videre' }).click();
    cy.checkLogToAmplitude('navigere', { lenkeTekst: 'Gå videre', destinasjon: '/sendinn' });
    cy.findByText('Feil ved kall til SendInn').should('be.visible');
    cy.wait('@submitToSendinnFailure');
    cy.checkLogToAmplitude('skjemainnsending feilet');

    // The second attempt is successful, causing "skjema fullført"
    cy.mocksUseRouteVariant('post-send-inn:success-with-delay');
    cy.mocksUseRouteVariant('send-inn-frontend:available-with-delay');
    cy.intercept('POST', '/fyllut/api/send-inn').as('submitToSendinnSuccess');
    cy.findByRole('button', { name: 'Gå videre' }).click();
    cy.wait('@submitToSendinnSuccess');
    cy.checkLogToAmplitude('navigere', { lenkeTekst: 'Gå videre', destinasjon: '/sendinn' });

    // FIXME https://trello.com/c/yAEGm8z4/1532-amplitude-cypress-test-feilet-pga-manglende-skjema-fullf%C3%B8rt
    cy.checkLogToAmplitude('skjema fullført', {
      skjemaId: 'cypress-101',
      skjemanavn: 'Skjema for Cypress-testing',
    });

    cy.url().should('include', '/send-inn-frontend');
  });
});
