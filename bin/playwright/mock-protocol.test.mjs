/* eslint-disable vitest/no-import-node-test -- Exercise real mock HTTP middleware with node:test. */
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { createFyllutTestStack } from '../lib/fyllut-test-stack.mjs';
import { startManagedStack } from '../lib/managed-test-stack.mjs';
import { verifyEvidence } from './mock-evidence.mjs';

const root = resolve(import.meta.dirname, '../..');
const pdf = JSON.parse(readFileSync(resolve(root, 'mocks/mocks/data/test-cases/tc07-pdf-body.json')));
const submission = JSON.parse(
  readFileSync(resolve(root, 'mocks/mocks/data/test-cases/tc07-innsending-soknad-body.json')),
);
const call = (path, method = 'GET', body, headers = {}) =>
  fetch(`http://127.0.0.1:3440${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
const select = async (id) => {
  const response = await fetch('http://127.0.0.1:3441/api/mock/custom-route-variants', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id }),
    signal: AbortSignal.timeout(10000),
  });
  assert.equal(response.status, 204, `MOCK_VARIANT_SELECTION_FAILED: ${id}`);
};
const start = async (epoch, observeMocks) => {
  const plan = createFyllutTestStack({
    repoRoot: root,
    ports: [3440, 3441, 3442, 3443],
    shouldWriteRuntimeConfig: false,
    mode: 'built',
    epoch: JSON.stringify(epoch),
    observeMocks,
  });
  return startManagedStack(
    {
      commands: [plan.commands[0]],
      listeningPorts: [plan.listeningPorts[0]],
      healthUrls: plan.healthUrls.slice(0, 2),
    },
    { log: () => {} },
  );
};
const contract = async (response) => {
  assert.match(response.headers.get('x-request-id'), /^[a-f0-9-]{36}$/);
  return {
    status: response.status,
    bodyHash: createHash('sha256')
      .update(await response.text())
      .digest('hex'),
    headers: Object.fromEntries(
      [...response.headers]
        .filter(([name]) => !['date', 'connection', 'keep-alive'].includes(name))
        .map(([name, value]) => [name, name === 'x-request-id' ? '<generated UUID>' : value]),
    ),
  };
};

test('real mock middleware preserves responses and supplies request-bound validation evidence', async () => {
  const contracts = [];
  for (const enabled of [false, true]) {
    const epoch = { epochId: randomUUID(), testId: 'mock-protocol', attempt: 0 };
    const stack = await start(epoch, enabled);
    const headers = { 'x-playwright-epoch': epoch.epochId, 'x-playwright-owner': 'owner' };
    const expected = { 'post-familie-pdf': 'success-tc07', 'post-digital-soknad': 'success-tc07' };
    const control = (path, method = 'GET', body, customHeaders = headers) =>
      call(`/__playwright/${path}`, method, body, customHeaders);
    const responses = [];
    try {
      assert.equal((await control('snapshot')).status, enabled ? 409 : 404);
      if (enabled) {
        assert.equal((await control('claim', 'POST', expected)).status, 201);
        assert.equal(
          (await control('claim', 'POST', expected, { ...headers, 'x-playwright-owner': 'other' })).status,
          409,
        );
        const initial = await (await control('snapshot')).json();
        assert.deepEqual(initial.records, []);
        assert.throws(() => verifyEvidence(initial, epoch, expected), /EVIDENCE_MISSING_ROUTE/);
      }
      for (const [route, path, payload] of [
        ['post-familie-pdf', '/api/pdf/v3/opprett-pdf', pdf],
        ['post-digital-soknad', '/send-inn/v1/application-digital/controlled', submission],
      ]) {
        await select(`${route}:success-tc07`);
        responses.push(await contract(await call(path, 'POST', payload)));
      }
      if (enabled) verifyEvidence(await (await control('snapshot')).json(), epoch, expected);
      await select('post-familie-pdf:success');
      responses.push(await contract(await call('/api/pdf/v3/opprett-pdf', 'POST', pdf)));
      if (enabled) {
        const snapshot = await (await control('snapshot')).json();
        assert.equal(snapshot.records.at(-1).validation, 'not-run');
        assert.throws(() => verifyEvidence(snapshot, epoch, expected), /EVIDENCE_WRONG_VARIANT/);
      }
      await select('post-familie-pdf:success-tc07');
      const wrong = structuredClone(pdf);
      wrong.bunntekst.lowerMiddle = 'controlled-wrong-version';
      const mismatch = await call('/api/pdf/v3/opprett-pdf', 'POST', wrong);
      assert.equal(mismatch.status, 400);
      responses.push(await contract(mismatch));
      if (enabled) {
        const snapshot = await (await control('snapshot')).json();
        assert.deepEqual(snapshot.records.at(-1).mismatchPaths, ['bunntekst.lowerMiddle']);
        assert.equal(snapshot.records.at(-1).validation, 'failed');
        assert.equal(snapshot.records.at(-1).status, 400);
        assert.equal(snapshot.records.at(-1).response, 'completed');
        assert.equal((await control('release', 'POST')).status, 204);
        assert.equal((await control('snapshot')).status, 409);
      }
      contracts.push(responses);
    } finally {
      await stack.stop();
    }
  }
  assert.deepEqual(contracts[1], contracts[0], 'Instrumentation changed a mock response contract');
});
