import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyEvidence } from '../../../../bin/playwright/mock-evidence.mjs';
import { startTestEpoch, type Epoch } from '../../../../bin/playwright/test-epoch.mjs';
import { restoreRouteVariants, useRouteVariant } from '../fixtures/mock-client';
import { preparePage } from '../fixtures/test';
import { prepareAttachmentSubmission, sendToNav } from '../helpers/attachments';

test(
  'late-request',
  { annotation: { type: 'technical-id', description: 'late-request' } },
  async ({ browser }, info) => {
    const output = process.env.FYLLUT_PLAYWRIGHT_OUTPUT_DIR;
    if (!output) throw new Error('Missing technical run output');
    const expected = { 'post-familie-pdf': 'success-tc07' };
    const first = await startTestEpoch({
      mode: 'built',
      testId: 'late-request',
      attempt: 0,
      output,
      mockFault: 'hold-pdf',
    });
    const context = await browser.newContext({ baseURL: first.baseURL });
    let second: Epoch | undefined;
    const headers = { 'x-playwright-epoch': first.epochId, 'x-playwright-owner': 'first-owner' };
    const control = async (epoch: Epoch, path: string, options: RequestInit = {}) => {
      const response = await fetch(`${epoch.mockURL}/__playwright/${path}`, {
        headers,
        ...options,
        signal: AbortSignal.timeout(15000),
      });
      return response;
    };
    try {
      await restoreRouteVariants(first.adminURL);
      const page = await context.newPage();
      await preparePage(page);
      await prepareAttachmentSubmission(page);
      await useRouteVariant(first.adminURL, 'post-familie-pdf:success-tc07');
      expect(
        (
          await control(first, 'claim', {
            method: 'POST',
            headers: { ...headers, 'content-type': 'application/json' },
            body: JSON.stringify(expected),
          })
        ).status,
      ).toBe(201);
      await sendToNav(page);
      expect((await control(first, 'wait-for-pdf')).status).toBe(200);
      const oldSnapshot: unknown = await (await control(first, 'snapshot')).json();
      expect(oldSnapshot).toMatchObject({
        records: [expect.objectContaining({ routeId: 'post-familie-pdf', response: 'pending' })],
      });
      await context.close();
      await restoreRouteVariants(first.adminURL);
      await first.stop();
      const firstManifest = JSON.parse(readFileSync(resolve(first.directory, 'manifest.json'), 'utf8'));
      expect(firstManifest.stoppedAt).toEqual(expect.any(String));
      for (const pid of first.pids) expect(() => process.kill(pid, 0)).toThrow();
      second = await startTestEpoch({ mode: 'built', testId: 'late-request-next', attempt: 0, output });
      expect((await control(second, 'snapshot')).status).toBe(409);
      expect((await control(second, 'claim', { method: 'POST' })).status).toBe(409);
      const nextHeaders = {
        'x-playwright-epoch': second.epochId,
        'x-playwright-owner': 'next-owner',
        'content-type': 'application/json',
      };
      expect(
        (await control(second, 'claim', { method: 'POST', headers: nextHeaders, body: JSON.stringify(expected) }))
          .status,
      ).toBe(201);
      const nextSnapshot: unknown = await (await control(second, 'snapshot', { headers: nextHeaders })).json();
      expect(nextSnapshot).toMatchObject({ records: [] });
      expect(() => verifyEvidence(oldSnapshot, second!, expected)).toThrow(/EVIDENCE_EPOCH_MISMATCH/);
      expect(() => verifyEvidence(nextSnapshot, second!, expected)).toThrow(/EVIDENCE_MISSING_ROUTE/);
      expect((await control(second, 'release', { method: 'POST', headers: nextHeaders })).status).toBe(204);
      await info.attach('late-request-proof', {
        body: Buffer.from(
          JSON.stringify({ oldEpoch: first.epochId, nextEpoch: second.epochId, oldStoppedAt: firstManifest.stoppedAt }),
        ),
        contentType: 'application/json',
      });
    } finally {
      await context.close();
      await first.stop();
      await second?.stop();
    }
  },
);
