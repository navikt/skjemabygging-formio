describe('Form publication', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
    cy.intercept('GET', '/api/forms/nav112233', { fixture: 'nav112233.json' }).as('getForm');
    cy.intercept('GET', '/api/forms/nav112233/translations', { fixture: 'nav112233-translations.json' }).as(
      'getFormTranslations',
    );
    cy.intercept('GET', '/api/form-publications/nav112233', { fixture: 'nav112233-translations.json' }).as(
      'getPublishedForm',
    );
    cy.intercept('GET', '/api/translations', { fixture: 'globalTranslations.json' }).as('getGlobalTranslations');

    cy.visit('forms/nav112233');
    cy.wait('@getForm');
    cy.wait('@getFormTranslations');
    cy.wait('@getPublishedForm');
    cy.wait('@getGlobalTranslations');
  });

  it('shows the last published date', () => {
    cy.findByText('Sist publisert:').should('exist').next('p').should('contain', '14.02.25, kl. 14.47');
  });

  it('will unpublish the form', () => {
    cy.fixture('nav112233.json').then((formJson) => {
      cy.intercept('DELETE', '/api/form-publications/nav112233', (req) => {
        req.reply(201, {
          changed: true,
          form: {
            ...formJson,
            publishedAt: '2025-02-15T10:12:55.354+01',
            publishedBy: 'testuser',
            status: 'unpublished',
          },
        });
      }).as('unpublishFormRequest');
    });

    cy.findByRole('button', { name: 'Avpubliser' }).should('exist').click();
    cy.findByRole('heading', { name: 'Avpubliseringsadvarsel' }).should('exist');
    cy.findByRole('button', { name: 'Ja, avpubliser skjemaet' }).should('exist').click();
    cy.wait('@unpublishFormRequest');

    cy.findByText('Avpublisert:').should('exist').next('p').should('contain', '15.02.25, kl. 10.12');
  });
});
