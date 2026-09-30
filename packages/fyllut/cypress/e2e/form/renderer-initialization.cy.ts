import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

describe('Renderer initialization redirects', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  it('resolves an unsupported deep link to a usable legacy form', () => {
    const createDraft = cy.spy().as('createDraft');
    const getPrefill = cy.spy().as('getPrefill');
    cy.intercept('POST', '/fyllut/api/send-inn/soknad*', createDraft);
    cy.intercept('GET', '/fyllut/api/send-inn/prefill-data*', getPrefill);
    cy.visit('/fyllut/rendererfallback', {
      onBeforeLoad: (window) => {
        // Enter client-side so backend redirects cannot mask the initialization-cache regression.
        window.history.replaceState(null, '', '/fyllut/rendererfallback/first');
      },
    });
    cy.defaultWaits();
    cy.location('pathname').should('equal', '/fyllut/rendererfallback');
    cy.findByRole('link', { name: TEXTS.grensesnitt.introPage.sendOnPaper }).should('be.visible').click();
    cy.clickStart();

    cy.findByRole('textbox', { name: 'Legacy answer' }).type('rejected');
    cy.clickNextStep();
    cy.contains('Enter accepted').should('be.visible');
    cy.findByRole('textbox', { name: 'Legacy answer' }).clear();
    cy.findByRole('textbox', { name: 'Legacy answer' }).type('accepted');
    cy.clickNextStep();
    cy.findByRole('heading', { name: 'Oppsummering' }).should('be.visible');
    cy.get('@createDraft').should('not.have.been.called');
    cy.get('@getPrefill').should('not.have.been.called');
  });

  it('consumes a draft redirect once and retains initialization and edits across page navigation', () => {
    const draftId = 'a5230708-d0b1-4d2f-b30a-6c6519e67027';
    const draft = {
      innsendingsId: draftId,
      hoveddokumentVariant: { document: { data: { data: { answer: 'Saved answer' } }, language: 'nb' } },
      endretDato: '2026-09-29T12:00:00.000Z',
      skalSlettesDato: '2026-10-27T12:00:00.000Z',
    };
    const requests = { create: 0, load: 0 };
    cy.intercept('POST', '/fyllut/api/send-inn/soknad*', (request) => {
      requests.create += 1;
      request.reply(draft);
    }).as('createDraft');
    cy.intercept('GET', `/fyllut/api/send-inn/soknad/${draftId}`, (request) => {
      requests.load += 1;
      request.reply(draft);
    }).as('loadDraft');
    cy.visit('/fyllut/rendererready/first?sub=digital');
    cy.defaultWaits();
    cy.wait('@createDraft');
    cy.wait('@loadDraft');
    cy.location('search').should('include', `innsendingsId=${draftId}`);
    cy.findByRole('textbox', { name: /^Answer/ }).should('have.value', 'Saved answer');
    cy.findByRole('textbox', { name: /^Answer/ }).clear();
    cy.findByRole('textbox', { name: /^Answer/ }).type('Unsaved edit');

    cy.clickShowAllSteps();
    cy.findByRole('link', { name: 'Second page' }).click();
    cy.findByRole('heading', { name: 'Second page', level: 2 }).should('be.visible');
    cy.findByRole('link', { name: 'First page' }).click();
    cy.findByRole('textbox', { name: /^Answer/ }).should('have.value', 'Unsaved edit');
    cy.wrap(requests).should('deep.equal', { create: 1, load: 1 });
  });
});
