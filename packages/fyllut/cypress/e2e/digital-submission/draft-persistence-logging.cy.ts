import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { expect } from 'chai';

const draftId = '8e3c3621-76d7-4ebd-90d4-34448ebcccc3';
const privateAnswer = 'PRIVATE_ANSWER_SENTINEL';

const rejectedDraft = (statusCode: number, errorCode: string) => ({
  statusCode,
  headers: { 'content-type': 'application/json' },
  body: { errorCode, message: privateAnswer, correlationId: 'correlation-123' },
});

const saveDraft = () => {
  cy.findByRole('button', { name: TEXTS.grensesnitt.navigation.saveDraft }).click();
  cy.get('dialog[open]').findByRole('button', { name: TEXTS.grensesnitt.confirmSavePrompt.confirm }).click();
};

const expectDraftFailure = (operation: string, errorCode: string, status: number) => {
  cy.wait('@draftError').then(({ request }) => {
    expect(request.body).to.deep.include({
      message: 'Draft persistence failed',
    });
    expect(request.body.metadata).to.deep.include({ operation, errorCode, status, correlationId: 'correlation-123' });
    expect(JSON.stringify(request.body)).not.to.include(draftId);
    expect(JSON.stringify(request.body)).not.to.include(privateAnswer);
  });
  cy.get('@draftError.all').should('have.length', 1);
};

describe('Draft persistence failures', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.intercept('GET', '/fyllut/api/config*', (req) => {
      req.continue((res) => {
        res.body.loggerConfig = { enabled: true, browserOnly: false, logLevel: 'info' };
      });
    }).as('getConfig');
    cy.intercept('POST', '/fyllut/api/log/error', { statusCode: 200, body: 'ok' }).as('draftError');
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  it('creates a usable draft when the create response has no document', () => {
    cy.intercept('POST', '/fyllut/api/send-inn/soknad*').as('createDraft');
    cy.intercept('PUT', '/fyllut/api/send-inn/soknad').as('updateDraft');
    cy.visitRouteAndWait('/fyllut/mellomlagring2mellomlagring?sub=digital');
    cy.clickStart();

    cy.wait('@createDraft').its('response.body.hoveddokumentVariant.document').should('be.null');
    cy.location('search').should('include', 'innsendingsId=');
    cy.findByRole('heading', { name: 'Valgfrie opplysninger' }).shouldBeVisible();
    cy.clickSaveAndContinue();
    cy.wait('@updateDraft');
    cy.get('@draftError.all').should('have.length', 0);
  });

  it('reports a rejected draft creation and keeps the create error visible', () => {
    cy.intercept('POST', '/fyllut/api/send-inn/soknad*', rejectedDraft(503, 'SERVICE_UNAVAILABLE')).as('createDraft');
    cy.visitRouteAndWait('/fyllut/mellomlagring2mellomlagring?sub=digital');
    cy.clickStart();
    cy.wait('@createDraft');

    cy.findByText(TEXTS.statiske.mellomlagringError.create.message).shouldBeVisible();
    expectDraftFailure('create', 'SERVICE_UNAVAILABLE', 503);
  });

  it('redirects on an absent draft without reporting a failed retrieval', () => {
    cy.intercept('GET', `/fyllut/api/send-inn/soknad/${draftId}`, rejectedDraft(404, 'NOT_FOUND')).as('retrieveDraft');
    cy.visitRouteAndWait(`/fyllut/mellomlagring2mellomlagring?sub=digital&innsendingsId=${draftId}`, [
      '@retrieveDraft',
    ]);

    cy.location('pathname').should('equal', '/fyllut/soknad-ikke-funnet');
    cy.get('@draftError.all').should('have.length', 0);
  });

  it('reports an unsuccessful retrieval instead of making the draft ready', () => {
    cy.intercept('GET', `/fyllut/api/send-inn/soknad/${draftId}`, rejectedDraft(500, 'INTERNAL_SERVER_ERROR')).as(
      'retrieveDraft',
    );
    cy.visitRouteAndWait(`/fyllut/mellomlagring2mellomlagring?sub=digital&innsendingsId=${draftId}`, [
      '@retrieveDraft',
    ]);

    cy.findByText(TEXTS.statiske.mellomlagringError.get.message).shouldBeVisible();
    expectDraftFailure('retrieve', 'INTERNAL_SERVER_ERROR', 500);
  });

  it('reports an invalid draft ID instead of treating it as an expired draft', () => {
    cy.intercept('GET', `/fyllut/api/send-inn/soknad/${draftId}`, rejectedDraft(400, 'BAD_REQUEST')).as(
      'retrieveDraft',
    );
    cy.visitRouteAndWait(`/fyllut/mellomlagring2mellomlagring?sub=digital&innsendingsId=${draftId}`, [
      '@retrieveDraft',
    ]);

    cy.findByText(TEXTS.statiske.mellomlagringError.get.message).shouldBeVisible();
    cy.location('pathname').should('not.equal', '/fyllut/soknad-ikke-funnet');
    expectDraftFailure('retrieve', 'BAD_REQUEST', 400);
  });

  it('keeps a rejected update alertable even when the response is BAD_REQUEST', () => {
    cy.intercept('PUT', '/fyllut/api/send-inn/soknad', rejectedDraft(400, 'BAD_REQUEST')).as('updateDraft');
    cy.visitRouteAndWait(`/fyllut/mellomlagring2mellomlagring/gave?sub=digital&innsendingsId=${draftId}&lang=nb-NO`);
    cy.findByRole('group', { name: 'Ønsker du å få gaven innpakket' }).shouldBeVisible();
    saveDraft();
    cy.wait('@updateDraft');

    cy.findByText(TEXTS.statiske.mellomlagringError.update.message).shouldBeVisible();
    expectDraftFailure('update', 'BAD_REQUEST', 400);
  });

  it('does not treat a network failure with no error code as a saved draft', () => {
    cy.intercept('PUT', '/fyllut/api/send-inn/soknad', { forceNetworkError: true }).as('updateDraft');
    cy.visitRouteAndWait(`/fyllut/mellomlagring2mellomlagring/gave?sub=digital&innsendingsId=${draftId}&lang=nb-NO`);
    cy.findByRole('group', { name: 'Ønsker du å få gaven innpakket' }).shouldBeVisible();
    saveDraft();
    cy.wait('@updateDraft');

    cy.findByText(TEXTS.statiske.mellomlagringError.update.message).shouldBeVisible();
    cy.wait('@draftError')
      .its('request.body')
      .should('deep.include', {
        message: 'Draft persistence failed',
        metadata: { operation: 'update', errorCode: 'UNCLASSIFIED_ERROR', status: 'UNKNOWN' },
      });
    cy.get('@draftError.all').should('have.length', 1);
  });

  it('reports a missing draft on update because changes could not be saved', () => {
    cy.intercept('PUT', '/fyllut/api/send-inn/soknad', rejectedDraft(404, 'NOT_FOUND')).as('updateDraft');
    cy.visitRouteAndWait(`/fyllut/mellomlagring2mellomlagring/gave?sub=digital&innsendingsId=${draftId}&lang=nb-NO`);
    cy.findByRole('group', { name: 'Ønsker du å få gaven innpakket' }).shouldBeVisible();
    saveDraft();
    cy.wait('@updateDraft');

    cy.findByText(TEXTS.statiske.mellomlagringError.updateNotFound.title).shouldBeVisible();
    expectDraftFailure('update', 'NOT_FOUND', 404);
  });

  it('reports a failed submission once when the fallback save succeeds', () => {
    cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad', rejectedDraft(503, 'SERVICE_UNAVAILABLE')).as(
      'submitDraft',
    );
    cy.intercept('PUT', '/fyllut/api/send-inn/soknad').as('fallbackUpdate');
    cy.visitRouteAndWait(
      `/fyllut/mellomlagring2mellomlagring/oppsummering?sub=digital&innsendingsId=${draftId}&lang=nb-NO`,
    );
    cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).shouldBeVisible();
    cy.clickSendNav();
    cy.wait(['@submitDraft', '@fallbackUpdate']);

    cy.findByText(TEXTS.statiske.mellomlagringError.submit.title).shouldBeVisible();
    cy.wait('@draftError').then(({ request }) => {
      expect(request.body.message).to.equal('Draft submission failed');
      expect(request.body.metadata).to.deep.include({
        operation: 'submit',
        errorCode: 'SERVICE_UNAVAILABLE',
        status: 503,
        correlationId: 'correlation-123',
      });
    });
    cy.get('@draftError.all').should('have.length', 1);
  });

  it('records submission and fallback-save failures in a single actionable error', () => {
    cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad', rejectedDraft(500, 'INTERNAL_SERVER_ERROR')).as(
      'submitDraft',
    );
    cy.intercept('PUT', '/fyllut/api/send-inn/soknad', rejectedDraft(400, 'BAD_REQUEST')).as('fallbackUpdate');
    cy.visitRouteAndWait(
      `/fyllut/mellomlagring2mellomlagring/oppsummering?sub=digital&innsendingsId=${draftId}&lang=nb-NO`,
    );
    cy.findByRole('heading', { name: TEXTS.statiske.summaryPage.title }).shouldBeVisible();
    cy.clickSendNav();
    cy.wait(['@submitDraft', '@fallbackUpdate']);

    cy.findByText(TEXTS.statiske.mellomlagringError.submit.title).shouldBeVisible();
    cy.wait('@draftError').then(({ request }) => {
      expect(request.body.message).to.equal('Draft persistence failed');
      expect(request.body.metadata).to.deep.include({
        operation: 'fallback_update',
        errorCode: 'BAD_REQUEST',
        status: 400,
      });
      expect(request.body.metadata.submissionFailure).to.deep.include({
        operation: 'submit',
        errorCode: 'INTERNAL_SERVER_ERROR',
        status: 500,
      });
      expect(JSON.stringify(request.body)).not.to.include(privateAnswer);
      expect(JSON.stringify(request.body)).not.to.include(draftId);
    });
    cy.get('@draftError.all').should('have.length', 1);
  });
});
