describe('Preprod form clear admin page', { testIsolation: true }, () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('config');
  });

  it('previews, confirms, monitors and retries cleanup without starting a second run', () => {
    cy.intercept('POST', '/api/form-clear/preview', {
      toDelete: ['nested/old'],
      kept: ['kept'],
    }).as('preview');
    cy.intercept('POST', '/api/form-clear/jobs', { statusCode: 201, body: { jobId: 'job-1' } }).as('start');
    cy.intercept('GET', '/api/form-clear/jobs/job-1', {
      jobId: 'job-1',
      status: 'completed',
      totalCount: 2,
      processedCount: 2,
      deletedCount: 1,
      keptCount: 1,
      failedCount: 0,
      items: [
        { path: 'nested/old', outcome: 'deleted' },
        { path: 'kept', outcome: 'kept' },
      ],
    }).as('job');
    cy.intercept('POST', '/api/form-clear/publish-cleanup', {
      removed: [],
      failed: [{ path: 'nested/old', error: 'Could not remove published artifacts' }],
    }).as('cleanup');

    cy.visit('/form-clear', { onBeforeLoad: (window) => window.sessionStorage.removeItem('form-clear-job-id') });
    cy.wait('@config');
    cy.findByText(/Preprod og preprod-alt deler samme/).should('be.visible');
    cy.findByRole('checkbox', { name: 'Behold testskjemaer' }).should('be.checked');
    cy.findByRole('textbox', { name: 'Andre skjemastier som skal beholdes' }).type('kept');
    cy.findByRole('button', { name: 'Vis forhåndsvisning' }).click();
    cy.wait('@preview').its('request.body.keepFormPaths').should('deep.equal', ['kept']);
    cy.findByRole('heading', { name: 'Forhåndsvisning' }).should('be.visible');
    cy.findByText('nested/old').should('be.visible');
    cy.findByRole('button', { name: 'Start sletting' }).should('not.exist');
    cy.findByRole('checkbox', { name: /Jeg bekrefter/ }).check();
    cy.findByRole('button', { name: 'Start sletting' }).click();
    cy.wait('@start')
      .its('request.body')
      .should('deep.equal', {
        keepTestForms: true,
        keepLockedForms: true,
        keepFormPaths: ['kept'],
        expectedToDelete: ['nested/old'],
        expectedKept: ['kept'],
      });
    cy.wait('@job');
    cy.findByRole('status').first().should('contain.text', '2 av 2 behandlet');
    cy.findByRole('table').should('contain.text', 'Slettet').and('contain.text', 'Beholdt');
    cy.findByRole('button', { name: 'Rydd publiserte filer' }).click();
    cy.wait('@cleanup');
    cy.findByText(/nested\/old: Could not remove/).should('be.visible');
    cy.findByRole('button', { name: 'Rydd publiserte filer' }).click();
    cy.wait('@cleanup');
    cy.get('@start.all').should('have.length', 1);
    cy.findByRole('link', { name: 'Gå til bulkpublisering' }).should('have.attr', 'href', '/bulk-publisering');
    cy.findByRole('button', { name: 'Start ny forhåndsvisning' }).click();
    cy.findByRole('button', { name: 'Vis forhåndsvisning' }).should('be.visible');
  });

  it('shows per-form progress while the job runs and restores the job on reload', () => {
    cy.intercept('GET', '/api/form-clear/jobs/job-running', {
      jobId: 'job-running',
      status: 'running',
      totalCount: 2,
      processedCount: 1,
      deletedCount: 1,
      keptCount: 0,
      failedCount: 0,
      items: [{ path: 'nested/old', outcome: 'deleted' }],
    }).as('running');
    cy.visit('/form-clear', {
      onBeforeLoad: (window) => window.sessionStorage.setItem('form-clear-job-id', 'job-running'),
    });
    cy.wait('@running');
    cy.findByRole('status').should('contain.text', 'Pågår. 1 av 2 behandlet');
    cy.findByRole('table').should('contain.text', 'nested/old').and('contain.text', 'Slettet');
    cy.reload();
    cy.wait('@running');
    cy.findByText('Jobb-ID: job-running').should('be.visible');
  });

  it('discards a delayed preview when options change and starts only with the displayed snapshot', () => {
    let previewCount = 0;
    cy.intercept('POST', '/api/form-clear/preview', (req) => {
      if (++previewCount === 1) {
        req.alias = 'stalePreview';
        req.reply({ delay: 2500, body: { toDelete: ['stale'], kept: ['old'] } });
      } else {
        req.alias = 'freshPreview';
        req.reply({ toDelete: ['current'], kept: ['new'] });
      }
    });
    cy.intercept('POST', '/api/form-clear/jobs', { statusCode: 201, body: { jobId: 'job-2' } }).as('start');
    cy.intercept('GET', '/api/form-clear/jobs/job-2', {
      jobId: 'job-2',
      status: 'pending',
      totalCount: 1,
      processedCount: 0,
      deletedCount: 0,
      keptCount: 0,
      failedCount: 0,
      items: [],
    });
    cy.visit('/form-clear', { onBeforeLoad: (window) => window.sessionStorage.removeItem('form-clear-job-id') });
    cy.wait('@config');
    cy.findByRole('button', { name: 'Vis forhåndsvisning' }).click();
    cy.findByRole('checkbox', { name: 'Behold testskjemaer' }).uncheck();
    cy.findByRole('checkbox', { name: /Jeg bekrefter/ }).should('not.exist');
    cy.findByRole('button', { name: 'Vis forhåndsvisning' }).click();
    cy.wait('@freshPreview').its('request.body.keepTestForms').should('equal', false);
    cy.findByText('current').should('be.visible');
    cy.wait('@stalePreview');
    cy.findByText('stale').should('not.exist');
    cy.findByRole('checkbox', { name: /Jeg bekrefter/ }).check();
    cy.findByRole('button', { name: 'Start sletting' }).click();
    cy.wait('@start')
      .its('request.body')
      .should('deep.equal', {
        keepTestForms: false,
        keepLockedForms: true,
        keepFormPaths: [],
        expectedToDelete: ['current'],
        expectedKept: ['new'],
      });
  });

  it('requires a new preview when the server rejects a changed plan', () => {
    cy.intercept('POST', '/api/form-clear/preview', { toDelete: ['old'], kept: [] }).as('preview');
    cy.intercept('POST', '/api/form-clear/jobs', {
      statusCode: 409,
      body: { errorCode: 'CONFLICT', message: 'Plan changed' },
    }).as('conflict');
    cy.intercept('GET', '/api/form-clear/jobs/active', { statusCode: 404, body: { message: 'No active job' } }).as(
      'noActiveJob',
    );
    cy.visit('/form-clear', { onBeforeLoad: (window) => window.sessionStorage.removeItem('form-clear-job-id') });
    cy.findByRole('button', { name: 'Vis forhåndsvisning' }).click();
    cy.wait('@preview');
    cy.findByRole('checkbox', { name: /Jeg bekrefter/ }).check();
    cy.findByRole('button', { name: 'Start sletting' }).click();
    cy.wait('@conflict');
    cy.wait('@noActiveJob');
    cy.findByRole('alert').should('contain.text', 'Hent en ny forhåndsvisning');
    cy.findByRole('button', { name: 'Start sletting' }).should('not.exist');
    cy.findByRole('heading', { name: 'Forhåndsvisning' }).should('not.exist');
  });

  it('recovers an active job after a start conflict without submitting again', () => {
    cy.intercept('POST', '/api/form-clear/preview', { toDelete: ['old'], kept: [] }).as('preview');
    cy.intercept('POST', '/api/form-clear/jobs', { statusCode: 409, body: { message: 'Job already running' } }).as(
      'conflict',
    );
    cy.intercept('GET', '/api/form-clear/jobs/active', {
      jobId: 'active-1',
      status: 'running',
      totalCount: 1,
      processedCount: 0,
      deletedCount: 0,
      keptCount: 0,
      failedCount: 0,
      items: [],
    }).as('active');
    cy.intercept('GET', '/api/form-clear/jobs/active-1', {
      jobId: 'active-1',
      status: 'completed',
      totalCount: 1,
      processedCount: 1,
      deletedCount: 1,
      keptCount: 0,
      failedCount: 0,
      items: [{ path: 'old', outcome: 'deleted' }],
    }).as('status');
    cy.visit('/form-clear', { onBeforeLoad: (window) => window.sessionStorage.removeItem('form-clear-job-id') });
    cy.findByRole('button', { name: 'Vis forhåndsvisning' }).click();
    cy.wait('@preview');
    cy.findByRole('checkbox', { name: /Jeg bekrefter/ }).check();
    cy.findByRole('button', { name: 'Start sletting' }).click();
    cy.wait('@conflict');
    cy.wait('@active');
    cy.findByText('Jobb-ID: active-1').should('be.visible');
    cy.wait('@status');
    cy.findByRole('status').first().should('contain.text', 'Fullført');
    cy.window().its('sessionStorage').invoke('getItem', 'form-clear-job-id').should('equal', 'active-1');
    cy.get('@conflict.all').should('have.length', 1);
  });

  it('reports an active-job lookup failure instead of assuming the plan changed', () => {
    cy.intercept('POST', '/api/form-clear/preview', { toDelete: ['old'], kept: [] }).as('preview');
    cy.intercept('POST', '/api/form-clear/jobs', { statusCode: 409, body: { message: 'Conflict' } }).as('conflict');
    cy.intercept('GET', '/api/form-clear/jobs/active', { statusCode: 503, body: { message: 'Unavailable' } }).as(
      'lookupError',
    );
    cy.visit('/form-clear', { onBeforeLoad: (window) => window.sessionStorage.removeItem('form-clear-job-id') });
    cy.findByRole('button', { name: 'Vis forhåndsvisning' }).click();
    cy.wait('@preview');
    cy.findByRole('checkbox', { name: /Jeg bekrefter/ }).check();
    cy.findByRole('button', { name: 'Start sletting' }).click();
    cy.wait('@conflict');
    cy.wait('@lookupError');
    cy.findByRole('alert').should('contain.text', 'Kunne ikke kontrollere om en jobb allerede er startet');
    cy.findByRole('heading', { name: 'Forhåndsvisning' }).should('be.visible');
  });

  it('hides the page outside the admin preprod environment', () => {
    cy.intercept('GET', '/api/config', {
      isDevelopment: true,
      isProdGcp: true,
      user: { name: 'Admin', isAdmin: true },
    }).as('prodConfig');
    cy.visit('/form-clear', { onBeforeLoad: (window) => window.sessionStorage.removeItem('form-clear-job-id') });
    cy.wait('@prodConfig');
    cy.findByRole('heading', { name: 'Tøm skjemaer i preprod' }).should('not.exist');
    cy.findByRole('link', { name: 'Tøm preprod-skjemaer' }).should('not.exist');
  });

  it('hides the page from non-admins', () => {
    cy.intercept('GET', '/api/config', {
      isDevelopment: true,
      isProdGcp: false,
      user: { name: 'Regular user', isAdmin: false },
    }).as('nonAdminConfig');
    cy.visit('/form-clear', { onBeforeLoad: (window) => window.sessionStorage.removeItem('form-clear-job-id') });
    cy.wait('@nonAdminConfig');
    cy.findByRole('heading', { name: 'Tøm skjemaer i preprod' }).should('not.exist');
    cy.findByRole('link', { name: 'Tøm preprod-skjemaer' }).should('not.exist');
  });
});
