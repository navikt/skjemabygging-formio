import { expect } from 'chai';

// The new renderer counterpart is in playwright/e2e/digital-submission/resumed-draft-prefill.spec.ts.
describe('Resumed draft and prefill data (legacy renderer)', () => {
  const draftUrl = (innsendingsId: string) =>
    `/fyllut/yourinformation/dineOpplysninger?sub=digital&innsendingsId=${innsendingsId}`;

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

  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.mocksRestoreRouteVariants();
    cy.submitApplication();
    useLegacyRenderer();
  });

  const continueToSummaryAndSend = () => {
    cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
    cy.clickSaveAndContinue();
    cy.findByRole('heading', { name: 'Navn' }).should('exist');
    cy.clickSaveAndContinue();
    cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
    cy.clickSendNav();
  };

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  it('replaces the saved identity with the current prefill', () => {
    cy.mocksUseRouteVariant('get-soknad:success-your-information-without-person-data');
    cy.intercept('GET', '/fyllut/api/send-inn/prefill-data*').as('getPrefillData');

    cy.visit(draftUrl('8e1d4b7a-2422-4c3e-b6f0-1a9e5d2c7f30'));
    cy.defaultWaits();
    cy.wait('@getMellomlagring');
    cy.wait('@getPrefillData').its('response.statusCode').should('eq', 200);
    continueToSummaryAndSend();

    cy.wait('@submitApplication').then(({ request }) => {
      expect(request.body.submission.data.dineOpplysninger.identitet).to.deep.equal({
        identitetsnummer: '08842748500',
      });
    });
  });

  it('keeps the national identity number from the draft when prefill data fails', () => {
    // The legacy renderer does not handle a failed prefill request, and the user can still continue.
    cy.on('uncaught:exception', (error) => !error.message.includes('Feil ved kall til SendInn for preutfylling'));
    cy.mocksUseRouteVariant('get-soknad:success-your-information-with-identity');
    cy.intercept('GET', '/fyllut/api/send-inn/prefill-data*', {
      statusCode: 500,
      body: { message: 'Feil ved kall til SendInn for preutfylling' },
    }).as('getPrefillData');

    cy.visit(draftUrl('5c6a0f3e-2422-4f6b-9a51-7d3c2e8b1f42'));
    cy.defaultWaits();
    cy.wait('@getMellomlagring');
    cy.wait('@getPrefillData').its('response.statusCode').should('eq', 500);
    continueToSummaryAndSend();

    cy.wait('@submitApplication').then(({ request }) => {
      expect(request.body.submission.data.dineOpplysninger.identitet).to.deep.equal({
        identitetsnummer: '08842748500',
      });
    });
  });
});
