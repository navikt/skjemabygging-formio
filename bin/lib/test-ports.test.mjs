/* eslint-disable vitest/no-import-node-test -- Standalone launcher tests use node --test. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { startFyllutTestStack } from './fyllut-test-stack.mjs';
import { parsePortRange, parsePorts, selectPorts } from './test-ports.mjs';

test('port selection stays inside its bounded range and skips only occupied ports', async () => {
  const checked = [];
  assert.deepEqual(
    await selectPorts(4, {
      range: [3440, 3447],
      probe: async (port) => {
        checked.push(port);
        return ![3440, 3442].includes(port);
      },
    }),
    [3441, 3443, 3444, 3445],
  );
  assert.deepEqual(checked, [3440, 3441, 3442, 3443, 3444, 3445]);
  await assert.rejects(selectPorts(4, { range: [3440, 3443], probe: async () => false }), /RANGE_EXHAUSTED/);
});

test('invalid ports, overbroad ranges, permission failures and cancellation fail explicitly', async () => {
  assert.deepEqual(parsePorts('3440,3441,3442,3443'), [3440, 3441, 3442, 3443]);
  assert.deepEqual(parsePortRange('3440:3447'), [3440, 3447]);
  for (const value of ['3440,3440,3442,3443', '3440,3441', '0,1,2,3', 'a,b,c,d', '3440,3441,3442,65536']) {
    assert.throws(() => parsePorts(value), /INVALID_TEST_PORTS/);
  }
  for (const value of ['3440:3442', '3440:4000', 'a:b', '3447:3440']) {
    assert.throws(() => parsePortRange(value), /INVALID_TEST_PORT_RANGE/);
  }
  let probes = 0;
  await assert.rejects(
    selectPorts(4, {
      probe: async () => {
        probes++;
        throw new Error('controlled-permission-denied');
      },
    }),
    /controlled-permission-denied/,
  );
  assert.equal(probes, 1);
  await assert.rejects(
    selectPorts(4, { signal: AbortSignal.abort(new Error('controlled-abort')) }),
    /controlled-abort/,
  );
});

test('automatic startup retries only cleaned-up port collisions, never fixed ports or cleanup failures', async () => {
  const options = { repoRoot: '/repo', shouldWriteRuntimeConfig: false, portRange: [3440, 3451] };
  let attempts = 0;
  const start = async () => {
    attempts++;
    if (attempts < 3) throw Object.assign(new Error('controlled-collision'), { code: 'EADDRINUSE' });
    return { pids: [], stop: async () => {} };
  };
  const stack = await startFyllutTestStack(options, { start });
  assert.equal(attempts, 3);
  assert.equal(stack.startupAttempts.length, 3);
  assert.equal(new Set(stack.startupAttempts.flatMap((record) => record.ports)).size, 12);
  attempts = 0;
  await assert.rejects(
    startFyllutTestStack({ ...options, portRange: undefined, ports: [3440, 3441, 3442, 3443] }, { start }),
    /controlled-collision/,
  );
  assert.equal(attempts, 1);
  attempts = 0;
  await assert.rejects(
    startFyllutTestStack(options, {
      start: async () => {
        attempts++;
        throw new AggregateError(
          [Object.assign(new Error('collision'), { code: 'EADDRINUSE' }), new Error('cleanup')],
          'Stack startup and cleanup failed',
        );
      },
    }),
    /startup and cleanup failed/,
  );
  assert.equal(attempts, 1);
});
