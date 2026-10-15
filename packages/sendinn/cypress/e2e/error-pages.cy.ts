describe('Error pages', () => {
  describe('Unavailable page', () => {
    it('shows content, links, title and focuses the heading', () => {
      cy.visit('/sendinn', { failOnStatusCode: false });

      cy.findByRole('heading', { level: 1, name: 'Beklager, fant ikke siden' }).should('be.focused');
      cy.title().should('eq', 'Beklager, fant ikke siden');
      cy.findByText('Denne siden kan være slettet eller flyttet, eller det er en feil i lenken.').should('exist');
      cy.findByRole('button', { name: 'Gå til forsiden' }).should('have.attr', 'href', 'https://www.nav.no');
      cy.findByRole('link', { name: 'Gå til Min side' }).should('have.attr', 'href', 'https://www.nav.no/minside');
    });

    it('uses the language from the lang parameter', () => {
      cy.visit('/sendinn?lang=en', { failOnStatusCode: false });

      cy.findByRole('heading', { level: 1, name: 'Sorry, we could not find the page' }).should('be.focused');
      cy.findByRole('button', { name: 'Go to the front page' }).should('have.attr', 'href', 'https://www.nav.no/en');
    });
  });

  describe('Error page', () => {
    it('shows content, title and focuses the heading when config fails to load', () => {
      cy.intercept('GET', '/sendinn/api/config', { statusCode: 500 });
      cy.visit('/sendinn/lospost');

      cy.findByRole('heading', { level: 1, name: 'Beklager, det oppsto en feil' }).should('be.focused');
      cy.title().should('eq', 'Beklager, det oppsto en feil');
      cy.findByRole('link', { name: 'gå til forsiden' }).should('have.attr', 'href', 'https://www.nav.no');
    });
  });

  describe('Session expired', () => {
    it('shows a login link back to the current page when the session has expired', () => {
      cy.intercept('GET', '/sendinn/api/global-translations/en', { statusCode: 401 });
      cy.visit('/sendinn/lospost?lang=en');

      cy.findByRole('heading', { name: 'Du er logget ut' }).should('exist');
      cy.findByRole('link', { name: 'Logg inn på nytt' }).should(
        'have.attr',
        'href',
        `/sendinn/oauth2/login?redirect=${encodeURIComponent('/sendinn/lospost?lang=en')}`,
      );
    });
  });
});
