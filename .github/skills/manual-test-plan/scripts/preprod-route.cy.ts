const hostPattern = /^fyllut-preprod(?:-alt)?\.(?:intern|ansatt)\.dev\.nav\.no$/;
const formPathPattern = /^[a-zA-Z0-9-]+$/;
const safeActions = new Set(['Neste steg', 'Forrige steg', 'Start utfylling']);

describe('Read-only preprod route probe', () => {
  it('records visible navigation without uploading or submitting', () => {
    const baseUrl = new URL(Cypress.config('baseUrl') ?? '');
    const formPath = Cypress.env('PROBE_FORM_PATH');
    const method = Cypress.env('PROBE_METHOD');
    const caseId = Cypress.env('PROBE_CASE_ID');
    const branch = Cypress.env('PROBE_BRANCH');
    const revision = String(Cypress.env('PROBE_FORM_REVISION') ?? '');
    const commit = Cypress.env('PROBE_PR_HEAD');
    const requestedActions = Cypress.env('PROBE_ACTIONS');
    const actions = typeof requestedActions === 'string' && requestedActions ? requestedActions.split('|') : [];

    if (
      baseUrl.protocol !== 'https:' ||
      !hostPattern.test(baseUrl.hostname) ||
      typeof formPath !== 'string' ||
      !formPathPattern.test(formPath) ||
      !['paper', 'digitalnologin', 'digital'].includes(method) ||
      typeof caseId !== 'string' ||
      !/^TC-\d+$/.test(caseId) ||
      typeof branch !== 'string' ||
      !/^[a-z0-9-]+$/.test(branch) ||
      !/^[a-zA-Z0-9.-]+$/.test(revision) ||
      typeof commit !== 'string' ||
      !/^[a-f0-9]{40}$/.test(commit) ||
      actions.length > 10 ||
      actions.some((action) => typeof action !== 'string' || !safeActions.has(action))
    ) {
      throw new Error(
        'Set the approved preprod base URL, form, case, branch, revision, PR head, method and safe actions',
      );
    }

    cy.intercept({ method: /POST|PUT|PATCH|DELETE/, url: '**' }, (request) => {
      request.destroy();
      throw new Error('Read-only probe blocked a state-changing request. Stop and document this transition.');
    });

    const trace: {
      prHead: string;
      formRevision: string;
      caseId: string;
      branch: string;
      method: string;
      pages: Array<{
        url: string;
        heading: string | null;
        labels: string[];
        choices: string[];
        actions: string[];
        requiredControls: string[];
        arrival: string;
        nextPage?: string;
      }>;
    } = {
      prHead: commit,
      formRevision: revision,
      caseId,
      branch,
      method,
      pages: [],
    };

    const text = (element: Element) => element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const visibleText = (root: HTMLElement, selector: string) =>
      [...root.querySelectorAll(selector)]
        .filter((element) => Cypress.dom.isVisible(element))
        .map(text)
        .filter(Boolean);
    let previousUrl = '';
    const record = (arrival: string) => {
      cy.location('href')
        .should((href) => {
          if (previousUrl && href === previousUrl) {
            throw new Error('Navigation has not reached the next page');
          }
        })
        .then((href) => {
          const url = new URL(href);
          if (url.origin !== baseUrl.origin) {
            throw new Error('Browser left the approved preprod origin');
          }
          previousUrl = href;
          cy.get('body')
            .should('be.visible')
            .then(($body) => {
              const body = $body[0];
              if (trace.pages.length) {
                trace.pages[trace.pages.length - 1].nextPage = url.pathname;
              }
              trace.pages.push({
                url: `${url.origin}${url.pathname}?sub=${method}`,
                heading: visibleText(body, 'h1')[0] ?? null,
                labels: visibleText(body, 'main label, main legend'),
                choices: visibleText(
                  body,
                  'main label:has(input[type="radio"]), main label:has(input[type="checkbox"])',
                ),
                actions: visibleText(body, 'main button, main a'),
                requiredControls: [
                  ...body.querySelectorAll('main input[type="file"], main [required], main [aria-required="true"]'),
                ]
                  .map((element) =>
                    element instanceof HTMLInputElement
                      ? [...(element.labels ?? [])].map(text).join(' ') ||
                        (element.type === 'file' ? 'File upload' : '')
                      : text(element),
                  )
                  .filter(Boolean),
                arrival,
              });
              cy.writeFile(`.runtime/manual-test-plan-probe/${caseId}-${branch}-${method}.json`, trace);
            });
        });
    };

    cy.visit(`/fyllut/${formPath}?sub=${method}`);
    record('Open form');
    for (const action of actions) {
      cy.contains('main a, main button', new RegExp(`^${action}$`))
        .should('be.visible')
        .click();
      record(`Click ${action}`);
    }
  });
});
