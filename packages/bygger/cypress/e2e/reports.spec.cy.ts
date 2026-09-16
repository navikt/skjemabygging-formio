describe('Reports', () => {
  const reports = [
    {
      id: 'all-forms-summary',
      title: 'Alle skjema med nøkkelinformasjon',
      contentType: 'text/csv',
      fileEnding: 'csv',
    },
    {
      id: 'forms-published-languages',
      title: 'Publiserte språk per skjema',
      contentType: 'text/csv',
      fileEnding: 'csv',
    },
  ];

  beforeEach(() => {
    cy.defaultIntercepts();
  });

  it('explains the unavailable date without removing the report download links', () => {
    cy.intercept('GET', '/api/reports', reports).as('getReports');
    cy.visit('/rapporter');
    cy.wait('@getReports');

    cy.findByRole('heading', { name: 'Rapporter' }).should('be.visible');
    cy.findByText(/Kolonnen «første publiseringsdato».*er foreløpig tom/).should('be.visible');
    cy.findByRole('link', { name: reports[0].title })
      .should('have.attr', 'href')
      .and('match', /\/api\/reports\/all-forms-summary$/);
    cy.findByRole('link', { name: reports[0].title }).should(
      'have.attr',
      'aria-describedby',
      'first-publication-notice',
    );
    cy.findByRole('link', { name: reports[1].title }).should('be.visible');
    cy.findByRole('textbox').should('not.exist');
  });

  it('keeps the date explanation visible when fetching the report list fails', () => {
    cy.intercept('GET', '/api/reports', { statusCode: 500, body: {} }).as('getReports');
    cy.visit('/rapporter');
    cy.wait('@getReports');

    cy.findByText('Henting av rapportoversikt feilet').should('be.visible');
    cy.findByText(/Datoen avventer støtte i forms-api/).should('be.visible');
  });

  it('does not expose download links or the date notice to non-admin users', () => {
    cy.fixture('config.json').then((config) => {
      cy.intercept('GET', '/api/config', {
        ...config,
        user: { ...config.user, isAdmin: false },
      });
    });
    cy.visit('/rapporter');

    cy.findByText('Du er ikke autorisert til å ta ut rapporter').should('be.visible');
    cy.findByRole('link', { name: reports[0].title }).should('not.exist');
    cy.findByText(/Datoen avventer støtte i forms-api/).should('not.exist');
  });
});
