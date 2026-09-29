import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyEvidence } from '../../../../bin/playwright/mock-evidence.mjs';
import type { Epoch } from '../../../../bin/playwright/test-epoch.mjs';

const createMockEvidence = (epoch: Epoch) => {
  const owner = randomUUID();
  let expected: Record<string, string> | undefined;
  const control = async (path: string, method: string, body?: unknown) => {
    const response = await fetch(`${epoch.mockURL}/__playwright/${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
        'x-playwright-epoch': epoch.epochId,
        'x-playwright-owner': owner,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`EVIDENCE_CONTROL_FAILED: ${path}: HTTP ${response.status}`);
    return response;
  };
  const verify = async () => {
    if (!expected) throw new Error('EVIDENCE_NOT_CLAIMED');
    const snapshot: unknown = await (await control('snapshot', 'GET')).json();
    writeFileSync(resolve(epoch.directory, 'mock-evidence.json'), JSON.stringify(snapshot, null, 2));
    verifyEvidence(snapshot, epoch, expected);
  };
  return {
    expectRoutes: async (routes: Record<string, string>) => {
      if (expected) throw new Error('EVIDENCE_ALREADY_CLAIMED');
      await control('claim', 'POST', routes);
      expected = { ...routes };
    },
    verify,
    finish: async () => {
      if (!expected) return;
      const errors: unknown[] = [];
      try {
        await verify();
      } catch (error) {
        errors.push(error);
      }
      try {
        await control('release', 'POST');
      } catch (error) {
        errors.push(error);
      }
      if (errors.length) throw new AggregateError(errors, errors.map(String).join('\n'));
    },
  };
};

export { createMockEvidence };
