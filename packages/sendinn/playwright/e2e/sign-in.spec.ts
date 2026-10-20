import { expect, signedInHeaders, skipUnlessBuilt, test } from '../fixtures/test';
import { submissionId } from '../helpers/test-data';

const taskUrl = `/sendinn/oppgave?innsendingsId=${submissionId}`;
const formWithTaskUrl = `/sendinn/nav123456?innsendingsId=${submissionId}`;
const loginUrl = (returnPath: string) => `/sendinn/oauth2/login?redirect=${encodeURIComponent(returnPath)}`;

test.describe('Sign-in', () => {
  test.beforeEach(() => skipUnlessBuilt());

  test.describe('without a session', () => {
    for (const url of [taskUrl, formWithTaskUrl]) {
      test(`redirects ${url} to login with an encoded relative return path`, async ({ request }) => {
        const response = await request.get(url, { maxRedirects: 0 });
        expect(response.status()).toBe(302);
        expect(response.headers().location).toBe(loginUrl(url));
      });
    }

    for (const url of ['/sendinn/lospost', '/sendinn/nav123456']) {
      test(`serves ${url} without sign-in`, async ({ request }) => {
        const response = await request.get(url, { maxRedirects: 0 });
        expect(response.status()).toBe(200);
      });
    }

    for (const url of ['/sendinn/oppgave', '/sendinn/404']) {
      test(`serves ${url} with 404 without sign-in`, async ({ request }) => {
        const response = await request.get(url, { maxRedirects: 0 });
        expect(response.status()).toBe(404);
      });
    }
  });

  test.describe('with a session', () => {
    test('serves the task entry when the session has the required level', async ({ request }) => {
      const response = await request.get(taskUrl, { maxRedirects: 0, headers: signedInHeaders });
      expect(response.status()).toBe(200);
    });

    test('redirects to login when the session is no longer active', async ({ request, useRouteVariant }) => {
      await useRouteVariant('post-texas-introspect:signed-out');
      const response = await request.get(taskUrl, { maxRedirects: 0, headers: signedInHeaders });
      expect(response.status()).toBe(302);
      expect(response.headers().location).toBe(loginUrl(taskUrl));
    });

    test('redirects to login when the session has a lower level than required', async ({
      request,
      useRouteVariant,
    }) => {
      await useRouteVariant('post-texas-introspect:wrong-level');
      const response = await request.get(taskUrl, { maxRedirects: 0, headers: signedInHeaders });
      expect(response.status()).toBe(302);
      expect(response.headers().location).toBe(loginUrl(taskUrl));
    });
  });
});
