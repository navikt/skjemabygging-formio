import { submissionId } from '../support/testData';
const taskUrl = `/sendinn/oppgave?innsendingsId=${submissionId}`;
const formWithTaskUrl = `/sendinn/nav123456?innsendingsId=${submissionId}`;
const loginUrl = (returnPath: string) => `/sendinn/oauth2/login?redirect=${encodeURIComponent(returnPath)}`;

// sendinn-backend checks the session while it serves index.html, so these tests need the built app.
describe('Sign-in', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.skipIfNoIncludeDistTests();
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('without a session', () => {
    [taskUrl, formWithTaskUrl].forEach((url) => {
      it(`redirects ${url} to login with an encoded relative return path`, () => {
        cy.requestEntry(url).should((response) => {
          expect(response.status).to.eq(302);
          expect(response.headers.location).to.eq(loginUrl(url));
        });
      });
    });

    ['/sendinn/lospost', '/sendinn/nav123456'].forEach((url) => {
      it(`serves ${url} without sign-in`, () => {
        cy.requestEntry(url).its('status').should('eq', 200);
      });
    });

    it('serves the unavailable page with 404', () => {
      cy.requestEntry('/sendinn/oppgave').its('status').should('eq', 404);
    });
  });

  describe('with a session', () => {
    it('serves the task entry when the session has the required level', () => {
      cy.requestEntry(taskUrl, { signedIn: true }).its('status').should('eq', 200);
    });

    it('redirects to login when the session is no longer active', () => {
      cy.mocksUseRouteVariant('post-texas-introspect:signed-out');
      cy.requestEntry(taskUrl, { signedIn: true }).should((response) => {
        expect(response.status).to.eq(302);
        expect(response.headers.location).to.eq(loginUrl(taskUrl));
      });
    });

    it('redirects to login when the session has a lower level than required', () => {
      cy.mocksUseRouteVariant('post-texas-introspect:wrong-level');
      cy.requestEntry(taskUrl, { signedIn: true }).should((response) => {
        expect(response.status).to.eq(302);
        expect(response.headers.location).to.eq(loginUrl(taskUrl));
      });
    });
  });
});
