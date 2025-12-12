import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';

describe('Umami', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.intercept('POST', '/umami').as('umamiEvent');
  });

  describe('Submission method "digitalnologin"', () => {
    const fillNologinForm = () => {
      cy.visit('/fyllut/nologinform/legitimasjon?sub=digitalnologin');
      cy.defaultWaits();
      cy.findByRole('heading', { name: 'Legitimasjon' }).should('exist');

      cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
        cy.findByLabelText('Norsk pass').check(),
      );
      cy.uploadFile('id-billy-bruker.jpg');
      cy.wait('@umamiEvent');
      cy.clickNextStep();

      cy.clickIntroPageConfirmation();
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Veiledning' }).should('exist');

      cy.clickNextStep();
      cy.findByRole('heading', { name: /Dine opplysninger/ }).should('exist');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');

      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() =>
        cy.findByLabelText('Ja').check(),
      );
      cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).type('08842748500');
      cy.clickNextStep();

      cy.findByRole('group', { name: 'Høyeste fullførte utdanning' }).within(() => cy.findByLabelText('Annet').check());
      cy.clickNextStep();

      cy.findByRole('group', { name: 'Vedlegg med masse greier Beskrivelse til vedlegget' }).within(() =>
        cy.findByLabelText('Jeg ettersender dokumentasjonen senere').check(),
      );

      cy.findByRole('group', { name: 'Bekreftelse på utdanning' }).within(() =>
        cy.findByLabelText('Jeg legger det ved dette skjemaet').check(),
      );

      cy.uploadFile('another-small-file.txt', { id: 'e3xh1d' });
      cy.wait('@umamiEvent');

      cy.findByLabelText('Annen dokumentasjon').within(() => {
        cy.findByLabelText('Jeg legger det ved dette skjemaet').check();
      });
      cy.findByLabelText('Gi vedlegget et beskrivende navn').type('Vitnemål');
      cy.uploadFile('small-file.txt', { id: 'en5h1c' });
      cy.wait('@umamiEvent');

      cy.findByRole('button', { name: 'Legg til nytt vedlegg' }).click();
      cy.findByRole('textbox', { name: 'Gi vedlegget et beskrivende navn' }).type('Egenerklæring');
      cy.uploadFile('small-file.txt', { id: 'en5h1c-1' });
      cy.wait('@umamiEvent');

      cy.clickNextStep();

      cy.clickSendNav();
      cy.wait('@umamiEvent');
      cy.findByRole('button', { name: 'Vis alle steg' }).should('not.exist');
      cy.findByRole('button', { name: 'Skjul alle steg' }).should('not.exist');

      cy.findByRole('link', { name: 'Last ned kopi' }).should('exist').click();

      cy.get('@umamiEvent.all')
        .should('have.length', 6)
        .then((interceptions) => {
          const umamiEvents = interceptions.map((interception: any) => interception.request.body);
          expect(umamiEvents[0].name).to.equal('last opp');
          expect(umamiEvents[1].name).to.equal('last opp');
          expect(umamiEvents[2].name).to.equal('last opp');
          expect(umamiEvents[3].name).to.equal('last opp');
          expect(umamiEvents[4].name).to.equal('skjema fullført');
          expect(umamiEvents[5].name).to.equal('last ned');
          expect(umamiEvents[5].data.submissionMethod).to.equal('digitalnologin');
        });
    };

    it('logs umami events', () => {
      fillNologinForm();
    });

    it('ignores umami event logging failures', () => {
      cy.mocksUseRouteVariant('post-umami-event:failure');
      fillNologinForm();
    });

    it('logs umami events when session expires and user restarts', () => {
      cy.visit('/fyllut/nologinform/legitimasjon?sub=digitalnologin');
      cy.defaultWaits();
      cy.findByRole('heading', { name: 'Legitimasjon' }).should('exist');

      cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
        cy.findByLabelText('Norsk pass').check(),
      );
      cy.clock(Date.now());
      cy.uploadFile('id-billy-bruker.jpg');
      cy.wait('@umamiEvent');
      cy.clickNextStep();

      cy.tick(3660000); // Move time forward by 1 hour and 1 minute (in ms)
      cy.wait('@umamiEvent');
      cy.findByRole('heading', { name: TEXTS.statiske.error.sessionExpired.title }).should('exist');

      cy.findByRole('link', { name: TEXTS.statiske.error.sessionExpired.buttonText }).click();
      cy.wait('@umamiEvent');

      cy.get('@umamiEvent.all')
        .should('have.length', 3)
        .then((interceptions) => {
          const umamiEvents = interceptions.map((interception: any) => interception.request.body);
          expect(umamiEvents[0].name).to.equal('last opp');
          expect(umamiEvents[1].name).to.equal('sesjon utløpt');
          expect(umamiEvents[1].data.skjemaId).to.equal('TST 19-81.07');
          expect(umamiEvents[1].data.submissionMethod).to.equal('digitalnologin');
          expect(umamiEvents[2].name).to.equal('skjema restartet');
          expect(umamiEvents[2].data.skjemaId).to.equal('TST 19-81.07');
          expect(umamiEvents[2].data.submissionMethod).to.equal('digitalnologin');
        });
    });
  });

  describe('Submission method "digital"', () => {
    it('logs umami events', () => {
      cy.visit('/fyllut/nologinform?sub=digital');
      cy.defaultWaits();

      cy.clickIntroPageConfirmation();
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Veiledning' }).should('exist');

      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: /Dine opplysninger/ }).should('exist');
      cy.findByRole('textbox', { name: 'Fornavn' }).should('exist').should('have.value', 'Ola');

      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: /Utdanning/ }).should('exist');
      cy.findByRole('group', { name: 'Høyeste fullførte utdanning' }).within(() =>
        cy.findByLabelText('Videregående').check(),
      );
      cy.clickSaveAndContinue();

      cy.findByRole('heading', { name: /Oppsummering/ }).should('exist');
      cy.clickSaveAndContinue();
      cy.verifySendInnRedirect();

      cy.get('@umamiEvent.all').should('have.length', 0);
    });
  });

  describe('Submission method "paper"', () => {
    it('logs umami events', () => {
      cy.visit('/fyllut/nologinform?sub=paper');
      cy.defaultWaits();

      cy.clickIntroPageConfirmation();
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Veiledning' }).should('exist');

      cy.clickNextStep();
      cy.findByRole('heading', { name: /Dine opplysninger/ }).should('exist');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');

      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() =>
        cy.findByLabelText('Ja').check(),
      );
      cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).type('08842748500');
      cy.clickNextStep();

      cy.findByRole('heading', { name: /Utdanning/ }).should('exist');
      cy.findByRole('group', { name: 'Høyeste fullførte utdanning' }).within(() =>
        cy.findByLabelText('Videregående').check(),
      );
      cy.clickNextStep();

      cy.findByRole('heading', { name: /Vedlegg/ }).should('exist');
      cy.findByRole('group', { name: /Vedlegg med masse greier/ }).within(() =>
        cy.findByLabelText('Jeg legger det ved dette skjemaet').check(),
      );
      cy.findByLabelText('Tilleggsinfo').type('Ekstra opplysninger');

      cy.findByLabelText('Annen dokumentasjon').within(() => {
        cy.findByLabelText('Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved').check();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { name: /Oppsummering/ }).should('exist');

      cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();
      cy.findByRole('button', { name: /Last ned skjema|Download form/ }).click();
      cy.wait('@umamiEvent');

      cy.get('@umamiEvent.all')
        .should('have.length', 1)
        .then((interceptions) => {
          const umamiEvents = interceptions.map((interception: any) => interception.request.body);
          expect(umamiEvents[0].name).to.equal('last ned');
          expect(umamiEvents[0].data.submissionMethod).to.equal('paper');
        });
    });
  });

  describe('Submission method "ingen"', () => {
    it('logs umami events', () => {
      cy.visit('/fyllut/stnone');
      cy.defaultWaits();

      cy.clickStart();

      cy.findByLabelText('Tekstfelt').type('Test');
      cy.clickNextStep();

      cy.findByRole('heading', { name: /Oppsummering/ }).should('exist');

      cy.findByRole('link', { name: 'Instruksjoner for innsending' }).click();
      cy.findByRole('button', { name: /Last ned skjema|Download form/ }).click();
      cy.wait('@umamiEvent');

      cy.get('@umamiEvent.all')
        .should('have.length', 1)
        .then((interceptions) => {
          const umamiEvents = interceptions.map((interception: any) => interception.request.body);
          expect(umamiEvents[0].name).to.equal('last ned');
          expect(umamiEvents[0].data.submissionMethod).to.equal(undefined);
        });
    });
  });
});
