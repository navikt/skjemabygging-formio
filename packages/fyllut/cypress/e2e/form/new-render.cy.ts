/*
 * Tests the new shared-frontend native (non-Formio) render path for an allowlisted form.
 * Covers per-page validation, error summary, wizard navigation, summary step and digital submit.
 */

describe('New renderer path', () => {
  beforeEach(() => {
    cy.intercept('GET', '/fyllut/api/config*', (req) => {
      req.headers['accept-encoding'] = 'identity';
      req.continue((res) => {
        res.body.newRenderForms = ['newrender'];
      });
    });
    cy.intercept('POST', '/fyllut/api/log*', { body: 'ok' });
    cy.intercept('GET', '/fyllut/api/forms/*');
    cy.intercept('GET', '/fyllut/api/translations/*');
  });

  it('renders inputs, validates per page, and navigates', () => {
    cy.visit('/fyllut/newrender?sub=paper');

    cy.findByRole('heading', {
      name: 'Vær oppmerksom på dette før du begynner å fylle ut skjemaet',
      timeout: 20000,
    }).should('exist');
    cy.findByRole('button', { name: 'Neste steg' }).click();

    cy.findByRole('heading', { name: 'Page one' }).should('exist');
    cy.findByRole('textbox', { name: /First name/ }).should('exist');
    cy.findByRole('textbox', { name: /Comment/ }).should('exist');

    // Required field empty -> next shows error summary and moves focus into it
    cy.findByRole('button', { name: 'Neste steg' }).click();
    cy.get('[data-cy="error-summary"]').should('exist');
    cy.focused().should('have.class', 'aksel-error-summary__heading');

    // Clicking a summary item focuses the field without navigating away from the form page
    cy.get('[data-cy="error-summary"]').find('a').first().click();
    cy.location('pathname').should('eq', '/fyllut/newrender');
    cy.focused().should('have.attr', 'id', 'input-firstName');

    // Fix the error and advance
    cy.findByRole('textbox', { name: /First name/ }).type('Kari');
    cy.findByRole('button', { name: 'Neste steg' }).click();

    cy.findByRole('heading', { name: 'Page two' }).should('exist');
    cy.findByRole('combobox', { name: /Country/ }).should('exist');
    cy.findByRole('group', { name: /Contact method/ }).should('exist');

    cy.findByRole('button', { name: 'Forrige steg' }).click();
    cy.findByRole('heading', { name: 'Page one' }).should('exist');
  });

  it('saves a draft on next and submits from the summary (digital)', () => {
    cy.intercept('POST', '/fyllut/api/send-inn/soknad*', {
      statusCode: 201,
      body: { innsendingsId: 'native-test-id', hoveddokumentVariant: { document: { data: {}, language: 'nb' } } },
    }).as('createSoknad');
    cy.intercept('PUT', '/fyllut/api/send-inn/soknad', {
      statusCode: 200,
      body: { innsendingsId: 'native-test-id' },
    });
    cy.intercept('PUT', '/fyllut/api/send-inn/utfyltsoknad', {
      statusCode: 200,
      body: { innsendingsId: 'native-test-id' },
    }).as('submitSoknad');

    cy.visit('/fyllut/newrender?sub=digital');

    cy.findByRole('heading', {
      name: 'Vær oppmerksom på dette før du begynner å fylle ut skjemaet',
      timeout: 20000,
    }).should('exist');
    cy.findByRole('button', { name: 'Neste steg' }).click();

    cy.findByRole('heading', { name: 'Page one' }).should('exist');
    cy.findByRole('textbox', { name: /First name/ }).type('Kari');
    cy.findByRole('button', { name: 'Neste steg' }).click();

    // Draft saved when advancing past a valid page
    cy.wait('@createSoknad');

    cy.findByRole('heading', { name: 'Page two' }).should('exist');
    cy.findByRole('combobox', { name: /Country/ }).select('Norway');
    cy.findByRole('radio', { name: /Email/ }).check({ force: true });

    cy.findByRole('button', { name: 'Neste steg' }).click();

    // Summary step shows entered answers
    cy.findByText('Kari').should('exist');

    cy.findByRole('button', { name: 'Send inn' }).click();
    cy.wait('@submitSoknad')
      .its('request.body')
      .should((body) => {
        expect(body).to.have.property('innsendingsId', 'native-test-id');
        expect(body.submission.data).to.have.property('firstName', 'Kari');
      });
  });
});
