import { expect } from 'chai';

describe('Party mapping regression', () => {
  const startNoLoginSubmission = (formPath: string) => {
    cy.visit(`/fyllut/${formPath}/legitimasjon?sub=digitalnologin`);
    cy.defaultWaits();

    cy.findByRole('radiogroup', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
      cy.findByLabelText('Norsk pass').check(),
    );
    cy.uploadFile('id-billy-bruker.jpg', { verifyUpload: true });
    cy.clickNextStep();

    cy.clickIntroPageConfirmation();
    cy.clickNextStep();
    cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
  };

  const submitApplication = () => {
    cy.intercept('POST', '/fyllut/api/send-inn/nologin-application').as('submitApplication');
    cy.clickSendNav();
    cy.wait('@submitApplication').then(({ response }) => {
      expect(response?.statusCode, JSON.stringify(response?.body)).to.equal(200);
    });
    cy.findByRole('heading', { name: /Kvittering/ }).should('exist');
  };

  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  it('submits a person sender and an identified concerned user', () => {
    startNoLoginSubmission('partymappingpersonsender');

    cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
    cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
    cy.findByRole('radiogroup', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() =>
      cy.findByLabelText('Ja').check(),
    );
    cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).type('08842748500');
    cy.clickNextStep();

    cy.findByRole('textbox', { name: 'Representantens fødselsnummer eller d-nummer' }).type('13097248022');
    cy.findByRole('textbox', { name: 'Representantens fornavn' }).type('Kari');
    cy.findByRole('textbox', { name: 'Representantens etternavn' }).type('Sender');
    cy.clickNextStep();

    cy.mocksUseRouteVariant('post-nologin-soknad:success-tc23a');
    cy.mocksUseRouteVariant('post-familie-pdf:success');
    submitApplication();
  });

  it('submits an organization sender and an unidentified concerned user', () => {
    startNoLoginSubmission('partymappingorganizationsender');

    cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
    cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
    cy.findByRole('radiogroup', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() =>
      cy.findByLabelText('Nei').check(),
    );
    cy.findByRole('textbox', { name: /Fødselsdato/ }).type('01.01.1980');
    cy.findByRole('radiogroup', { name: 'Bor du i Norge?' }).within(() => cy.findByLabelText('Ja').check());
    cy.findByRole('radiogroup', { name: 'Er kontaktadressen en vegadresse eller postboksadresse?' }).within(() =>
      cy.findByLabelText('Vegadresse').check(),
    );
    cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testveien 1');
    cy.findByRole('textbox', { name: 'Postnummer' }).type('1234');
    cy.findByRole('textbox', { name: 'Poststed' }).type('Plassen');
    cy.findByRole('textbox', { name: /^Gyldig fra/ }).type('18.02.2026');
    cy.clickNextStep();

    cy.findByRole('textbox', {
      name: 'Organisasjonsnummeret til den virksomheten / underenheten du representerer',
    }).type('889640782');
    cy.findByRole('textbox', { name: 'Virksomhetens navn' }).type('Test organization');
    cy.clickNextStep();

    cy.mocksUseRouteVariant('post-nologin-soknad:success-tc23b');
    cy.mocksUseRouteVariant('post-familie-pdf:success');
    submitApplication();
  });

  it('submits the national identity number from the token as user when prefill data is unavailable', () => {
    cy.defaultInterceptsMellomlagring();
    cy.defaultInterceptsExternal();
    cy.mocksUseRouteVariant('get-prefill-data:failure');

    cy.visit('/fyllut/partymappingprefillunavailable?sub=digital');
    cy.defaultWaits();
    cy.clickIntroPageConfirmation();
    cy.clickStart();
    cy.wait('@getPrefillData').its('response.statusCode').should('eq', 200);
    cy.wait('@createMellomlagring');

    cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
    cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).should('have.value', '123456 78911');
    cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', '').and('have.attr', 'readonly');
    cy.findByRole('textbox', { name: 'Etternavn' }).should('have.value', '').and('have.attr', 'readonly');
    cy.clickSaveAndContinue();
    cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');

    cy.mocksUseRouteVariant('post-digital-soknad:success-tc24');
    cy.mocksUseRouteVariant('post-familie-pdf:success');
    cy.submitApplication();
    cy.clickSendNav();
    cy.wait('@submitApplication').then(({ response }) => {
      expect(response?.statusCode, JSON.stringify(response?.body)).to.equal(200);
    });
    cy.findByRole('heading', { name: /Kvittering/ }).should('exist');
  });

  it('submits the national identity number from the token as user when prefill data is unavailable (legacy renderer)', () => {
    cy.intercept('GET', '/fyllut/api/config*', (req) => {
      req.headers['accept-encoding'] = 'identity';
      delete req.headers['if-none-match'];
      delete req.headers['if-modified-since'];
      req.continue((res) => {
        if (typeof res.body === 'object' && res.body !== null) {
          res.body.newRenderForms = [];
        }
      });
    }).as('getConfig');
    cy.defaultInterceptsMellomlagring();
    cy.defaultInterceptsExternal();
    cy.mocksUseRouteVariant('get-prefill-data:failure');

    cy.visit('/fyllut/partymappingprefillunavailable?sub=digital');
    cy.defaultWaits();
    cy.clickIntroPageConfirmation();
    cy.clickStart();
    cy.wait('@getPrefillData').its('response.statusCode').should('be.oneOf', [200, 304]);
    cy.wait('@createMellomlagring');

    cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
    cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).should('have.value', '12345678911');
    cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', '');
    cy.findByRole('textbox', { name: 'Etternavn' }).should('have.value', '');
    cy.clickSaveAndContinue();
    cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');

    cy.mocksUseRouteVariant('post-digital-soknad:success-tc24');
    cy.mocksUseRouteVariant('post-familie-pdf:success');
    cy.submitApplication();
    cy.clickSendNav();
    cy.wait('@submitApplication').then(({ response }) => {
      expect(response?.statusCode, JSON.stringify(response?.body)).to.equal(200);
    });
    cy.findByRole('heading', { name: /Kvittering/ }).should('exist');
  });
});
