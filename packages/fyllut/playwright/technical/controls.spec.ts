import { createServer } from 'node:http';
import submission from '../../../../mocks/mocks/data/test-cases/tc07-innsending-soknad-body.json' with { type: 'json' };
import pdf from '../../../../mocks/mocks/data/test-cases/tc07-pdf-body.json' with { type: 'json' };
import { restoreRouteVariants } from '../fixtures/mock-client';
import { expect, test } from '../fixtures/test';

const scenarios = [
  'unknown-variant',
  'missing-route',
  'wrong-json-variant',
  'wrong-middleware-variant',
  'body-mismatch',
  'reset-before',
  'restore-after',
  'test-and-restore',
  'poison-first',
  'poison-next',
  'concurrent-owner',
  'startup-collision',
  'cleanup-first',
  'cleanup-next',
];
for (const id of scenarios) {
  test.describe(id, () => {
    const faultTest = test.extend({
      // eslint-disable-next-line no-empty-pattern -- No dependencies needed by this fault injection.
      resetVariants: async ({}, use, info) => {
        const foreign = id === 'startup-collision' ? createServer((req, res) => res.end('foreign')) : undefined;
        if (foreign) await new Promise<void>((done) => foreign.listen(3440, '127.0.0.1', done));
        try {
          // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture callback.
          await use(async (url, phase) => {
            if (phase === 'before' && id === 'reset-before') throw new Error('CONTROLLED_RESET_FAILURE');
            if (phase === 'after' && ['restore-after', 'test-and-restore', 'poison-first'].includes(id)) {
              throw new Error('CONTROLLED_RESTORE_FAILURE');
            }
            await restoreRouteVariants(url);
          });
        } finally {
          if (foreign) {
            try {
              expect(await (await fetch('http://127.0.0.1:3440')).text()).toBe('foreign');
              await info.attach('foreign-survived', { body: Buffer.from('true'), contentType: 'text/plain' });
            } finally {
              await new Promise<void>((done, fail) => foreign.close((error) => (error ? fail(error) : done())));
            }
          }
        }
      },
      // eslint-disable-next-line no-empty-pattern -- Controlled failure after real owned-process cleanup.
      stopEpoch: async ({}, use) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture callback.
        await use(async (epoch) => {
          await epoch.stop();
          if (id === 'cleanup-first') throw new Error('CONTROLLED_PROCESS_CLEANUP_FAILURE');
        });
      },
    });
    faultTest(
      'checks the technical contract',
      {
        annotation: { type: 'technical-id', description: id },
      },
      async ({ readyPage: page, request, epoch, useRouteVariant, mockEvidence }, info) => {
        if (id === 'unknown-variant') {
          await useRouteVariant('post-familie-pdf:does-not-exist');
        }
        await info.attach('action-started', { body: Buffer.from(id), contentType: 'text/plain' });
        expect((await page.goto(`${epoch.baseURL}/fyllut/internal/isready`))?.status()).toBe(200);
        if (id === 'test-and-restore') throw new Error('CONTROLLED_TEST_FAILURE');
        if (
          ['reset-before', 'restore-after', 'poison-first', 'poison-next', 'cleanup-first', 'cleanup-next'].includes(id)
        )
          return;

        if (id === 'concurrent-owner') {
          const headers = { 'x-playwright-epoch': epoch.epochId, 'x-playwright-owner': 'first-owner' };
          const root = `${epoch.mockURL}/__playwright`;
          expect(
            (await request.post(`${root}/claim`, { headers, data: { 'post-familie-pdf': 'success-tc07' } })).status(),
          ).toBe(201);
          const before = await (await request.get(`${root}/snapshot`, { headers })).json();
          const second = await request.post(`${root}/claim`, {
            headers: { ...headers, 'x-playwright-owner': 'second-owner' },
            data: { 'post-digital-soknad': 'success-tc07' },
          });
          expect(second.status()).toBe(409);
          expect(await second.json()).toEqual({ code: 'EVIDENCE_ALREADY_OWNED' });
          expect(await (await request.get(`${root}/snapshot`, { headers })).json()).toEqual(before);
          expect((await request.post(`${root}/release`, { headers })).status()).toBe(204);
          return;
        }

        const route = id === 'wrong-middleware-variant' ? 'post-digital-soknad' : 'post-familie-pdf';
        await mockEvidence.expectRoutes({ [route]: 'success-tc07' });
        if (id !== 'missing-route') {
          const mismatch = id === 'body-mismatch';
          await useRouteVariant(`${route}:${mismatch ? 'success-tc07' : 'success'}`);
          const payload = structuredClone(pdf);
          if (mismatch) payload.bunntekst.lowerMiddle = 'controlled-wrong-version';
          const response = await request.post(
            `${epoch.mockURL}${
              route === 'post-familie-pdf' ? '/api/pdf/v3/opprett-pdf' : '/send-inn/v1/application-digital/controlled'
            }`,
            {
              data: route === 'post-familie-pdf' ? payload : submission,
            },
          );
          expect(response.status()).toBe(mismatch ? 400 : 200);
        }
        await mockEvidence.verify();
      },
    );
  });
}
