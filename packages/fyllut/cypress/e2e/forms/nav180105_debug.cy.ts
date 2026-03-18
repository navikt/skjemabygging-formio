describe('NAV 18-01.05 debug flow', () => {
  it('logs each step', () => {
    const baseUrl = Cypress.config('baseUrl') ?? '';
    const path = baseUrl.endsWith('/fyllut') ? `${baseUrl}/components?sub=paper` : '/fyllut/components?sub=paper';

    cy.intercept('POST', '/fyllut/api/log*', { body: 'ok' });
    cy.intercept('GET', '/fyllut/api/config*', { body: {} });
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: {} });
    cy.intercept('GET', '/fyllut/api/common-codes/currencies*', { body: [] });
    cy.intercept('GET', '/fyllut/api/common-codes/area-codes', { body: [] });
    cy.intercept('GET', '/fyllut/api/translations/components*', { body: {} });
    cy.intercept('GET', '/fyllut/api/forms/components*', { fixture: 'forms/nav180105.json' });

    cy.visit(path);

    const logPage = (step: number) => {
      cy.get('body').then(($b) => {
        const heading = $b.find('h1, h2').first().text() || '(no heading)';
        const inputs = $b.find('input, textarea, select').length;
        cy.log(`Step ${step}: heading="${heading}", inputs=${inputs}`);
      });
    };

    logPage(0);
    cy.clickNextStep();
    logPage(1);
    cy.get('body').then(($b) => {
      cy.findByRole('group', { name: /Hvem søker du barnepensjon for/i }).within(() => {
        cy.findByRole('radio', { name: /mitt eller mine barn under 18 år/i }).check({ force: true });
      });
      cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/i }).check();
    });
    cy.clickNextStep();
    logPage(2);
    cy.clickNextStep();
    logPage(3);
    cy.clickNextStep();
    logPage(4);
    cy.clickNextStep();
    logPage(5);
    cy.clickNextStep();
    logPage(6);
  });
});
