describe('Renderer initialization redirects', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
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
