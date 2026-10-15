/* eslint-disable vitest/no-import-node-test -- Verify the real epoch owner survives worker loss. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, watch } from 'node:fs';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { isPortFree } from '../lib/managed-test-stack.mjs';
import { startTestEpoch } from './test-epoch.mjs';

const waitForStop = (directory) =>
  new Promise((done, fail) => {
    const check = () => {
      const manifest = JSON.parse(readFileSync(resolve(directory, 'manifest.json'), 'utf8'));
      if (manifest.stoppedAt) {
        cleanup();
        done(manifest);
      }
    };
    const watcher = watch(directory, check);
    const timer = setTimeout(() => {
      cleanup();
      fail(new Error('Owner did not finish cleanup'));
    }, 20000);
    const cleanup = () => {
      clearTimeout(timer);
      watcher.close();
    };
    watcher.once('error', (error) => {
      cleanup();
      fail(error);
    });
    check();
  });

test('a real epoch startup failure saves diagnostics and leaves a foreign listener untouched', async () => {
  const output = resolve('packages/fyllut/.runtime/playwright', `startup-diagnostics-${randomUUID()}`);
  const foreign = createServer((req, res) => res.end('foreign'));
  await new Promise((done, fail) => {
    foreign.once('error', fail);
    foreign.listen(3440, '127.0.0.1', done);
  });
  try {
    await assert.rejects(
      startTestEpoch({
        mode: 'built',
        testId: 'startup-diagnostics',
        attempt: 0,
        output,
        ports: [3440, 3441, 3442, 3443],
      }),
      /STACK_PORT_COLLISION/,
    );
    const [id] = readdirSync(resolve(output, 'epochs'));
    const directory = resolve(output, 'epochs', id);
    const { attempts } = JSON.parse(readFileSync(resolve(directory, 'startup.json'), 'utf8'));
    assert.equal(attempts.length, 1);
    assert.equal(attempts[0].state, 'failed');
    assert.equal(attempts[0].reason, 'port-check');
    assert(attempts[0].services.every(({ pid }) => pid === null));
    const manifest = JSON.parse(readFileSync(resolve(directory, 'manifest.json'), 'utf8'));
    assert(manifest.stoppedAt);
    assert.throws(() => process.kill(manifest.ownerPid, 0), { code: 'ESRCH' });
    assert.equal(await (await fetch('http://127.0.0.1:3440')).text(), 'foreign');
  } finally {
    await new Promise((done, fail) => foreign.close((error) => (error ? fail(error) : done())));
  }
  assert(await isPortFree(3440));
});

test('quiesce awaits application exit but leaves mocks available for final evidence', async () => {
  const output = resolve('packages/fyllut/.runtime/playwright', `quiesce-${randomUUID()}`);
  const epoch = await startTestEpoch({ mode: 'built', testId: 'quiesce', attempt: 0, output });
  try {
    const { attempts } = JSON.parse(readFileSync(resolve(epoch.directory, 'startup.json'), 'utf8'));
    assert.equal(attempts.at(-1).state, 'ready');
    assert.deepEqual(
      attempts.at(-1).services.map(({ name }) => name),
      ['mocks', 'backend'],
    );
    assert(attempts.at(-1).probes.every(({ status }) => status >= 200 && status < 300));
    await epoch.quiesce();
    await epoch.quiesce();
    epoch.assertHealthy();
    const manifest = JSON.parse(readFileSync(resolve(epoch.directory, 'manifest.json'), 'utf8'));
    assert(manifest.quiescedAt);
    assert(!manifest.stoppedAt);
    for (const pid of epoch.pids.slice(1)) assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
    assert.equal((await fetch(`${epoch.adminURL}/api/about`)).status, 200);
    assert(await isPortFree(3442));
    await assert.rejects(
      startTestEpoch({ mode: 'built', testId: 'next', attempt: 0, output }),
      /PREVIOUS_EPOCH_ACTIVE/,
    );
  } finally {
    await epoch.stop();
  }
  for (const pid of epoch.pids) assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
});

for (const mode of ['dev', 'built']) {
  test(`two automatic ${mode} epochs have independent ports and stopping one preserves the other`, async () => {
    const base = resolve('packages/fyllut/.runtime/playwright', `concurrent-${randomUUID()}`);
    const epochs = [];
    const errors = [];
    try {
      const results = await Promise.allSettled(
        ['first', 'second'].map(async (testId) => {
          const epoch = await startTestEpoch({
            mode,
            testId,
            attempt: 0,
            output: resolve(base, testId),
            portRange: [3440, 3455],
          });
          epochs.push(epoch);
          return epoch;
        }),
      );
      for (const result of results) if (result.status === 'rejected') throw result.reason;
      const [first, second] = epochs;
      const boundCount = mode === 'built' ? 3 : 4;
      assert.equal(
        new Set([...first.ports.slice(0, boundCount), ...second.ports.slice(0, boundCount)]).size,
        boundCount * 2,
      );
      assert.notEqual(first.epochId, second.epochId);
      assert(first.pids.every((pid) => !second.pids.includes(pid)));
      await first.stop();
      for (const pid of first.pids) assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
      second.assertHealthy();
      assert.equal((await fetch(`${second.adminURL}/api/about`)).status, 200);
      assert.equal((await fetch(`${second.backendURL}/fyllut/internal/isready`)).status, 200);
      const claim = await fetch(`${second.mockURL}/__playwright/claim`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-playwright-epoch': second.epochId,
          'x-playwright-owner': randomUUID(),
        },
        body: JSON.stringify({ 'post-familie-pdf': 'success-tc07', 'post-digital-soknad': 'success-tc07' }),
      });
      assert.equal(claim.status, 201);
    } catch (error) {
      errors.push(error);
    } finally {
      const stopped = await Promise.allSettled(epochs.map((epoch) => epoch.stop()));
      for (const result of stopped) if (result.status === 'rejected') errors.push(result.reason);
    }
    if (errors.length) throw new AggregateError(errors, errors.map(String).join('\n'));
    for (const epoch of epochs) {
      for (const port of epoch.ports) assert(await isPortFree(port));
      const manifest = JSON.parse(readFileSync(resolve(epoch.directory, 'manifest.json'), 'utf8'));
      assert.equal(manifest.repoRoot, resolve('.'));
      for (const attempt of manifest.startupAttempts) {
        if (!attempt.readyAt) assert(attempt.cleanedUpAt);
        for (const pid of attempt.pids) assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
      }
    }
  });
}

for (const signal of ['SIGTERM', 'SIGKILL']) {
  test(`worker ${signal} cannot leave its application processes or permit another epoch`, async () => {
    const output = resolve('packages/fyllut/.runtime/playwright', `owner-${randomUUID()}`);
    mkdirSync(output, { recursive: true });
    const child = spawn(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `
      import { startTestEpoch } from './bin/playwright/test-epoch.mjs';
      const epoch = await startTestEpoch({mode:'built', testId:'owner-loss', attempt:0, output:process.env.OWNER_TEST_OUTPUT});
      process.send({directory:epoch.directory, pids:epoch.pids});
    `,
      ],
      { env: { ...process.env, OWNER_TEST_OUTPUT: output }, stdio: ['ignore', 'pipe', 'pipe', 'ipc'] },
    );
    let diagnostics = '';
    child.stderr.on('data', (chunk) => {
      diagnostics += chunk;
    });
    const exited = new Promise((done) => child.once('exit', done));
    const ready = await new Promise((done, fail) => {
      child.once('error', fail);
      child.once('message', done);
      child.once('exit', (code) => fail(new Error(`Worker exited before ready: ${code}: ${diagnostics}`)));
    });
    const stopped = waitForStop(ready.directory);
    await assert.rejects(
      startTestEpoch({ mode: 'built', testId: 'concurrent', attempt: 0, output }),
      /PREVIOUS_EPOCH_ACTIVE/,
    );
    child.kill(signal);
    await exited;
    const manifest = await stopped;
    assert.equal(manifest.state, 'failed');
    assert.match(readFileSync(resolve(output, 'fatal-cleanup.txt'), 'utf8'), /EPOCH_OWNER_DISCONNECTED/);
    for (const pid of ready.pids) assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
    for (const port of [3440, 3441, 3442, 3443]) assert(await isPortFree(port));
    await assert.rejects(
      startTestEpoch({ mode: 'built', testId: 'next', attempt: 0, output }),
      /PREVIOUS_EPOCH_FAILED/,
    );
    assert.equal(readdirSync(resolve(output, 'epochs')).length, 1);
  });
}
