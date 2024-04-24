/*
 * Tests for checking that Amplitude logging works.
 *
 * Initially only testing digital submission.
 * TODO: We should add tests for "paper" and "no submission" options as well, as they initiate "completed" logging individually.
 * TODO: Maybe we should also have tests for opening sub=digital or sub=paper directly, to see that the "skjema startet" logging is handled correctly.
 */

import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('Amplitude', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.mocksRestoreRouteVariants();
  });

  it('logs for all relevant events', () => {
    cy.visit('/fyllut/cypress101');
    cy.defaultWaits();
    cy.wait('@getGlobalTranslations');

    // Select digital submission and go to the form
    cy.findByRole('group', { name: 'Hvordan vil du sende inn skjemaet?' })
      .should('exist')
      .within(() => {
        cy.findByLabelText('Send digitalt (krever innlogging)').should('exist').check();
      });
    cy.clickStart();
    cy.checkLogToAmplitude('skjema åpnet', { innsendingskanal: 'digital' });

    // Veiledning step
    cy.clickSaveAndContinue();
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

    cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller D-nummer?' })
      .should('exist')
      .within(() => {
        cy.findByLabelText('Nei').should('exist').check();
      });
    cy.checkLogToAmplitude('skjemaspørsmål besvart', { spørsmål: 'Har du norsk fødselsnummer eller D-nummer?' });

    cy.findByRole('textbox', { name: 'Din fødselsdato (dd.mm.åååå)' }).should('be.visible').type('10.05.1995{esc}');
    cy.findByRole('textbox', { name: 'Din fødselsdato (dd.mm.åååå)' }).blur();

    cy.checkLogToAmplitude('skjemaspørsmål besvart', { spørsmål: 'Din fødselsdato (dd.mm.åååå)' });

    cy.findByRole('group', { name: 'Bor du i Norge?' })
      .should('exist')
      .within(() => {
        cy.findByLabelText('Ja').should('exist').check();
      });
    cy.checkLogToAmplitude('skjemaspørsmål besvart', { spørsmål: 'Bor du i Norge?' });

    cy.findByRole('group', { name: 'Er kontaktadressen din en vegadresse eller postboksadresse?' })
      .should('exist')
      .within(() => {
        cy.findByLabelText('Vegadresse').should('exist').check();
      });
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
    cy.clickSaveAndContinue();
    cy.checkLogToAmplitude('navigere', { lenkeTekst: 'Neste steg', destinasjon: '/cypress101/oppsummering' });
    cy.checkLogToAmplitude('skjemasteg fullført', { steg: 2, skjemastegNokkel: 'personopplysninger' });
    cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');

    // Gå tilbake til skjema fra oppsummering, og naviger til oppsummering på nytt
    // for å verifisere at ingen valideringsfeil oppstår grunnet manglende verdier.
    cy.findByRoleWhenAttached('link', { name: TEXTS.grensesnitt.summaryPage.editAnswers }).should('exist').click();
    // There is a weird re-render happening after navigating back to the form,
    // where the first panel will be rendered for a time before redirecting to the intended panel.
    // If the user navigates during this time period, the navigation is ignored.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);

    cy.checkLogToAmplitude('navigere', {
      lenkeTekst: TEXTS.grensesnitt.summaryPage.editAnswers,
      destinasjon: '/cypress101/veiledning',
    });
    cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('not.exist');
    cy.clickSaveAndContinue();
    cy.checkLogToAmplitude('navigere', { lenkeTekst: 'Neste steg', destinasjon: '/cypress101/personopplysninger' });
    cy.clickSaveAndContinue();
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
        cy.get('dd').eq(4).should('contain.text', '10.05.1995');
      });

    // First attempt is intercepted and fails, so we can test "innsending feilet"
    cy.mocksUseRouteVariant('put-utfylt-soknad:failure');
    cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad').as('submitToSendinnFailure');
    cy.clickSaveAndContinue();
    cy.checkLogToAmplitude('navigere', { lenkeTekst: 'Lagre og fortsett', destinasjon: '/sendinn' });
    cy.wait('@submitToSendinnFailure');
    cy.checkLogToAmplitude('skjemainnsending feilet');
    cy.findByText('Beklager, vi har midlertidige tekniske problemer.').should('be.visible');

    // The second attempt is successful, causing "skjema fullført"
    cy.mocksUseRouteVariant('put-utfylt-soknad:success');
    cy.mocksUseRouteVariant('send-inn-frontend:available');
    cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad').as('submitToSendinnSuccess');
    cy.clickSaveAndContinue();
    cy.wait('@submitToSendinnSuccess');
    cy.checkLogToAmplitude('navigere', { lenkeTekst: 'Lagre og fortsett', destinasjon: '/sendinn' });

    // FIXME https://trello.com/c/yAEGm8z4/1532-amplitude-cypress-test-feilet-pga-manglende-skjema-fullf%C3%B8rt
    cy.checkLogToAmplitude('skjema fullført', {
      skjemaId: 'cypress-101',
      skjemanavn: 'Skjema for Cypress-testing',
    });

    cy.url().should('include', '/send-inn-frontend');
  });
});
