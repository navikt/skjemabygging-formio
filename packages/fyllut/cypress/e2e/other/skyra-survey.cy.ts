/*
 * The Skyra script is loaded by Nav's decorator, which is disabled in these tests.
 * The tests therefore verify that Fyllut renders the <skyra-survey> element with the configured slug.
 */
const SKYRA_SLUG = 'fyllut-cypress-survey';

const useLegacyRenderer = () => {
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
};

const submitToReceipt = (formPath: string) => {
  cy.visit(`/fyllut/${formPath}?sub=digital`);
  cy.defaultWaits();
  cy.wait('@createMellomlagring');

  cy.findByRole('heading', { level: 2, name: 'Introduksjon' }).should('exist');
  cy.clickSaveAndContinue();
  cy.wait('@updateMellomlagring');

  cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' }).should('exist');
  cy.findByRole('textbox', { name: 'Tekstfelt' }).type('Test');
  cy.clickSaveAndContinue();
  cy.wait('@updateMellomlagring');

  cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
  cy.clickSendNav();
  cy.wait('@submitApplication').its('response.statusCode').should('eq', 200);
  cy.findByRole('heading', { level: 2, name: 'Kvittering' }).should('exist');
};

describe('Skyra survey on receipt page', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.mocksUseRouteVariant('post-soknad:success-hardcoded');
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.intercept('POST', '/fyllut/api/send-inn/digital-application/*').as('submitApplication');
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('New renderer', () => {
    it('renders the survey when the form has a Skyra slug', () => {
      submitToReceipt('skyrasurvey');
      cy.get('skyra-survey').should('have.length', 1).and('have.attr', 'slug', SKYRA_SLUG);
    });

    it('does not render the survey when the form has no Skyra slug', () => {
      submitToReceipt('skyrasurveynoslug');
      cy.get('skyra-survey').should('not.exist');
    });
  });

  describe('Legacy renderer', () => {
    beforeEach(() => {
      useLegacyRenderer();
    });

    it('renders the survey when the form has a Skyra slug', () => {
      submitToReceipt('skyrasurvey');
      cy.get('skyra-survey').should('have.length', 1).and('have.attr', 'slug', SKYRA_SLUG);
    });

    it('does not render the survey when the form has no Skyra slug', () => {
      submitToReceipt('skyrasurveynoslug');
      cy.get('skyra-survey').should('not.exist');
    });
  });
});
