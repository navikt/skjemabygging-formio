describe('Watermark for skjemautfylling-delingslenke', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.mocksRestoreRouteVariants();
  });

  it('sets the vannmerke property in the request body sent to familie-pdf', () => {
    // This variant only matches (returns 200) if the request body contains
    // "vannmerke": "Testskjema - Ikke send til Nav". Any mismatch, including a
    // missing vannmerke field, makes the mock respond with 400 and the
    // submission below will fail instead of reaching "Kvittering".
    cy.mocksUseRouteVariant('post-familie-pdf:success-tc21');

    cy.visit('/fyllut/conditionalpage?sub=digital');
    cy.defaultWaits();

    // Because we run with NAIS_APP_NAME=skjemautfylling-delingslenke, isDelingslenke
    // is true and the app shows a "Forhåndsvisning" preview dialog on load. Dismiss it.
    cy.findByRole('button', { name: 'Ok' }).click();

    cy.clickIntroPageConfirmation();
    cy.clickStart();

    cy.findByRole('heading', { name: 'Page 1' }).shouldBeVisible();
    cy.clickSaveAndContinue();
    cy.submitApplication();
    cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();
    cy.clickSendNav();

    cy.wait('@submitApplication');
    cy.findByRole('heading', { name: 'Kvittering' }).should('exist');
  });
});
