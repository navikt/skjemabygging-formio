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
    cy.location('pathname').should('eq', '/fyllut/newrender/pageOne');
    cy.focused().should('have.attr', 'id', 'input-firstName');

    // Fix the error and advance
    cy.findByRole('textbox', { name: /First name/ }).type('Kari');
    cy.findByRole('button', { name: 'Neste steg' }).click();

    cy.findByRole('heading', { name: 'Page two' }).should('exist');
    cy.findByRole('combobox', { name: /Country/ }).should('exist');
    cy.findByRole('group', { name: /Contact method/ }).should('exist');

    cy.findByRole('button', { name: 'Forrige steg' }).click();
    cy.location('pathname').should('eq', '/fyllut/newrender/pageOne');
    cy.findByRole('heading', { name: 'Page one' }).should('exist');
  });

  it('shows a native submission-method selection when sub is missing', () => {
    cy.visit('/fyllut/newrender');

    cy.findByRole('link', { name: 'Kan ikke logge inn', timeout: 20000 }).click();
    cy.findByRole('link', { name: 'Send i posten' }).click();

    cy.location('pathname').should('eq', '/fyllut/newrender');
    cy.location('search').should('include', 'sub=paper');
    cy.findByRole('heading', {
      name: 'Vær oppmerksom på dette før du begynner å fylle ut skjemaet',
      timeout: 20000,
    }).should('exist');
  });

  it('supports direct panel slug routing in the new renderer', () => {
    cy.visit('/fyllut/newrender/pageTwo?sub=paper');

    cy.findByRole('heading', { name: 'Page two', timeout: 20000 }).should('exist');
    cy.findByRole('combobox', { name: /Country/ }).should('exist');
    cy.findByRole('group', { name: /Contact method/ }).should('exist');

    cy.findByRole('button', { name: 'Forrige steg' }).click();
    cy.location('pathname').should('eq', '/fyllut/newrender/pageOne');
    cy.findByRole('heading', { name: 'Page one' }).should('exist');
  });

  it('keeps page error state when leaving and returning via the step menu', () => {
    cy.visit('/fyllut/newrender?sub=paper');

    cy.findByRole('button', { name: 'Neste steg', timeout: 20000 }).click();
    cy.findByRole('heading', { name: 'Page one' }).should('exist');

    cy.findByRole('button', { name: 'Neste steg' }).click();
    cy.get('[data-cy="error-summary"]').should('exist');
    cy.findAllByText('Du må fylle ut: First name').should('have.length', 2);

    cy.clickShowAllSteps();
    cy.findByRole('link', { name: 'Page two' }).click();
    cy.findByRole('heading', { name: 'Page two' }).should('exist');
    cy.get('[data-cy="error-summary"]').should('not.exist');

    cy.clickShowAllSteps();
    cy.findByRole('link', { name: 'Page one' }).click();
    cy.findByRole('heading', { name: 'Page one' }).should('exist');
    cy.get('[data-cy="error-summary"]').should('not.exist');
    cy.findAllByText('Du må fylle ut: First name').should('have.length', 1);
  });

  it('does not clear existing page data when fixing multiple errors on an errored page', () => {
    cy.visit('/fyllut/newrender?sub=paper');

    cy.findByRole('button', { name: 'Neste steg', timeout: 20000 }).click();
    cy.findByRole('textbox', { name: /First name/ }).type('Kari');
    cy.findByRole('button', { name: 'Neste steg' }).click();

    cy.findByRole('heading', { name: 'Page two' }).should('exist');
    cy.findByRole('button', { name: 'Neste steg' }).click();
    cy.get('[data-cy="error-summary"]').should('exist');

    cy.findByRole('combobox', { name: /Country/ }).click();
    cy.findByRole('option', { name: 'Norway' }).click();
    cy.findByRole('radio', { name: /Email/ }).check({ force: true });

    cy.get('[data-cy="error-summary"]').should('not.exist');
    cy.findByRole('button', { name: 'Neste steg' }).click();
    cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
  });

  it('navigates from summary errors to the correct page and input', () => {
    cy.visit('/fyllut/newrender/oppsummering?sub=paper');

    cy.findByRole('heading', { name: 'Oppsummering', timeout: 20000 }).should('exist');
    cy.findByRole('button', { name: 'Send inn' }).click();

    cy.get('[data-cy="error-summary"]').should('exist');
    cy.get('[data-cy="error-summary"]').find('a').first().click();

    cy.location('pathname').should('eq', '/fyllut/newrender/pageOne');
    cy.focused().should('have.attr', 'id', 'input-firstName');
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
    cy.findByRole('combobox', { name: /Country/ }).click();
    cy.findByRole('option', { name: 'Norway' }).click();
    cy.findByRole('radio', { name: /Email/ }).check({ force: true });

    cy.findByRole('button', { name: 'Neste steg' }).click();
    cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');

    cy.findByRole('button', { name: 'Send inn' }).click();
    cy.wait('@submitSoknad')
      .its('request.body')
      .should((body) => {
        expect(body).to.have.property('innsendingsId', 'native-test-id');
        expect(body.submission.data).to.have.property('firstName', 'Kari');
      });
  });
});
