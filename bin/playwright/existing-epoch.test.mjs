/* eslint-disable vitest/no-import-node-test -- Test exclusive ownership and real worker-loss cleanup. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { isPortFree } from '../lib/managed-test-stack.mjs';
import { attachExistingEpoch } from './existing-epoch.mjs';
import { loadExistingManifest, repoRoot } from './existing-manifest.mjs';
import { prepareExistingEpoch } from './existing-owner.mjs';

const options = () => {
  const output = resolve(repoRoot, 'packages/fyllut/.runtime/playwright', `existing-control-${randomUUID()}`);
  mkdirSync(output, { recursive: true });
  return { output, manifestPath: resolve(output, 'existing.json'), mode: 'built', testId: 'F029-T002' };
};
const attach = (prepared, extra = {}) =>
  attachExistingEpoch({
    manifestPath: prepared.manifestPath,
    mode: 'built',
    testId: 'F029-T002',
    attempt: 0,
    output: resolve(prepared.manifestPath, '..', `client-${randomUUID()}`),
    ...extra,
  });
const fakeStart = async ({ output, mode, testId, attempt }) => {
  const directory = resolve(output, 'fake');
  mkdirSync(directory, { recursive: true });
  const manifest = {
    state: 'ready',
    repoRoot,
    epochId: randomUUID(),
    mode,
    testId,
    attempt,
    ownerPid: process.pid,
    pids: [process.pid],
    ports: [3440, 3441, 3442, 3443],
    mockURL: 'http://127.0.0.1:3440',
    adminURL: 'http://127.0.0.1:3441',
    backendURL: 'http://127.0.0.1:3442',
    baseURL: 'http://127.0.0.1:3442',
    startupMs: 0,
  };
  const save = () => writeFileSync(resolve(directory, 'manifest.json'), JSON.stringify(manifest));
  save();
  return {
    directory,
    assertHealthy: () => {},
    fatal: () => {},
    quiesce: async () => {
      manifest.quiescedAt = new Date().toISOString();
      save();
    },
    stop: async () => {
      manifest.state = 'stopped';
      manifest.stoppedAt = new Date().toISOString();
      save();
    },
  };
};
const waitFor = async (condition) => {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (condition()) return;
    await delay(50);
  }
  throw new Error('EXISTING_CONTROL_DID_NOT_COMPLETE');
};

test('an existing epoch accepts one concurrent claimant and cannot be replayed after consumption', async () => {
  const prepared = await prepareExistingEpoch(options(), { startEpoch: fakeStart });
  try {
    const attempts = await Promise.allSettled([attach(prepared), attach(prepared)]);
    const passed = attempts.filter((result) => result.status === 'fulfilled');
    const failed = attempts.filter((result) => result.status === 'rejected');
    assert.equal(passed.length, 1);
    assert.equal(failed.length, 1);
    assert.match(failed[0].reason.message, /EXISTING_BUSY|EXISTING_NOT_AVAILABLE/);
    const epoch = passed[0].value;
    await epoch.quiesce();
    await epoch.stop();
    const local = JSON.parse(readFileSync(resolve(epoch.directory, 'manifest.json')));
    assert(local.quiescedAt && local.stoppedAt);
    assert.equal(local.controllerPid, process.pid);
    assert.equal(local.existingManifest, prepared.manifestPath);
    assert.equal(prepared.manifest.state, 'consumed');
    assert.doesNotThrow(() => process.kill(prepared.manifest.controllerPid, 0));
    await assert.rejects(attach(prepared), /EXISTING_NOT_AVAILABLE: consumed/);
  } finally {
    await prepared.close();
  }
});

test('wrong roots, identities, mode, origins, source, expiry and stale controllers fail before use', async () => {
  const prepared = await prepareExistingEpoch(options(), { startEpoch: fakeStart });
  const original = structuredClone(prepared.manifest);
  try {
    for (const [update, expected] of [
      [{ repoRoot: '/different-worktree' }, 'EXISTING_WRONG_WORKTREE'],
      [{ expiresAt: new Date(0).toISOString() }, 'EXISTING_EXPIRED'],
      [{ epoch: { ...original.epoch, baseURL: 'https://example.invalid' } }, 'EXISTING_INVALID_ORIGIN'],
      [{ claimToken: 'invalid' }, 'EXISTING_INVALID_TOKEN'],
      [{ controllerPid: -1 }, 'EXISTING_INVALID_CONTROLLER'],
      [{ epoch: { ...original.epoch, pids: [] } }, 'EXISTING_INVALID_EPOCH'],
      [{ fingerprint: 'changed' }, 'EXISTING_SOURCE_CHANGED'],
    ]) {
      writeFileSync(prepared.manifestPath, JSON.stringify({ ...original, ...update }));
      assert.throws(() => loadExistingManifest(prepared.manifestPath), new RegExp(expected));
    }
    writeFileSync(prepared.manifestPath, JSON.stringify({ ...original, claimToken: '0'.repeat(64) }));
    await assert.rejects(attach(prepared), /EXISTING_AUTH_FAILED/);
    writeFileSync(prepared.manifestPath, JSON.stringify(original));
    for (const extra of [{ testId: 'F004-T005' }, { mode: 'dev' }, { attempt: 1 }])
      await assert.rejects(attach(prepared, extra), /EXISTING_IDENTITY_MISMATCH/);
    const source = resolve(repoRoot, 'bin/playwright', `.existing-source-control-${randomUUID()}.mjs`);
    try {
      writeFileSync(source, 'export const controlledSourceChange = true;\n');
      assert.throws(() => loadExistingManifest(prepared.manifestPath), /EXISTING_SOURCE_CHANGED/);
    } finally {
      rmSync(source);
    }
    await prepared.close();
    writeFileSync(prepared.manifestPath, JSON.stringify(original));
    await assert.rejects(attach(prepared), /ENOENT|ECONNREFUSED/);
  } finally {
    await prepared.close();
  }
});

test('an unclaimed manifest expires and cleans up its dedicated epoch', async () => {
  const errors = [];
  const prepared = await prepareExistingEpoch(options(), {
    startEpoch: fakeStart,
    ttlMs: 20,
    onError: (error) => errors.push(error.message),
  });

  try {
    await waitFor(() => prepared.manifest.state === 'expired' && prepared.manifest.epoch.stoppedAt);
    assert.deepEqual(errors, ['EXISTING_EXPIRED']);
    assert.throws(() => loadExistingManifest(prepared.manifestPath), /EXISTING_NOT_AVAILABLE: expired/);
  } finally {
    await prepared.close();
  }
});

test('cancellation after epoch readiness still awaits owned cleanup and emits no usable manifest', async () => {
  const configuration = options();
  const controller = new AbortController();
  await assert.rejects(
    prepareExistingEpoch(
      { ...configuration, signal: controller.signal },
      {
        startEpoch: async (input) => {
          const epoch = await fakeStart(input);
          controller.abort(new Error('controlled-ready-abort'));
          return epoch;
        },
      },
    ),
    /controlled-ready-abort/,
  );
  const manifest = JSON.parse(readFileSync(configuration.manifestPath));
  assert.equal(manifest.state, 'failed');
  assert(manifest.epoch.stoppedAt);
});

test('skipping the producer barrier is rejected and disconnect still cleans the leased epoch', async () => {
  const errors = [];
  const prepared = await prepareExistingEpoch(options(), {
    startEpoch: fakeStart,
    onError: (error) => errors.push(error.message),
  });
  try {
    const epoch = await attach(prepared);
    await assert.rejects(epoch.stop(), /EXISTING_QUIESCE_REQUIRED/);
    await waitFor(() => prepared.manifest.state === 'failed' && prepared.manifest.epoch.stoppedAt);
    assert.deepEqual(errors, ['EXISTING_CLAIMANT_DISCONNECTED']);
  } finally {
    await prepared.close();
  }
});

test('an attached real epoch quiesces producers before stopping mocks and preserves its controller', async () => {
  const prepared = await prepareExistingEpoch(options());
  try {
    const epoch = await attach(prepared);
    await epoch.quiesce();
    for (const pid of epoch.pids.slice(1)) assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
    assert.equal((await fetch(`${epoch.adminURL}/api/about`)).status, 200);
    assert(!prepared.manifest.epoch.stoppedAt);
    await epoch.stop();
    for (const pid of [prepared.manifest.epoch.ownerPid, ...epoch.pids])
      assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
    assert.doesNotThrow(() => process.kill(prepared.manifest.controllerPid, 0));
    for (const port of epoch.ports) assert(await isPortFree(port));
  } finally {
    await prepared.close();
  }
});

for (const signal of ['SIGTERM', 'SIGKILL']) {
  test(`existing worker ${signal} cleans owned processes without stopping a foreign service or controller`, async () => {
    const foreign = createServer((req, res) => res.end('foreign'));
    await new Promise((done, fail) => {
      foreign.once('error', fail);
      foreign.listen(3440, '127.0.0.1', done);
    });
    let prepared;
    let worker;
    let exited;
    const errors = [];
    try {
      prepared = await prepareExistingEpoch(options(), { onError: (error) => errors.push(error.message) });
      worker = spawn(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          `
        import {attachExistingEpoch} from './bin/playwright/existing-epoch.mjs';
        const epoch = await attachExistingEpoch(JSON.parse(process.env.EXISTING_WORKER_OPTIONS));
        process.send({epochId:epoch.epochId});
      `,
        ],
        {
          cwd: repoRoot,
          stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
          env: {
            ...process.env,
            EXISTING_WORKER_OPTIONS: JSON.stringify({
              manifestPath: prepared.manifestPath,
              mode: 'built',
              testId: 'F029-T002',
              attempt: 0,
              output: resolve(prepared.manifestPath, '..', 'worker'),
            }),
          },
        },
      );
      let diagnostics = '';
      worker.stderr.on('data', (chunk) => {
        diagnostics += chunk;
      });
      exited = new Promise((done) => worker.once('exit', done));
      await new Promise((done, fail) => {
        worker.once('error', fail);
        worker.once('message', done);
        exited.then((code) => fail(new Error(`Existing worker exited before claim: ${code}: ${diagnostics}`)));
      });
      worker.kill(signal);
      await exited;
      await waitFor(() => prepared.manifest.state === 'failed' && prepared.manifest.epoch.stoppedAt);
      assert.deepEqual(errors, ['EXISTING_CLAIMANT_DISCONNECTED']);
      for (const pid of [prepared.manifest.epoch.ownerPid, ...prepared.manifest.epoch.pids])
        assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
      assert.equal(await (await fetch('http://127.0.0.1:3440')).text(), 'foreign');
      assert.doesNotThrow(() => process.kill(prepared.manifest.controllerPid, 0));
      await assert.rejects(attach(prepared), /EXISTING_NOT_AVAILABLE: failed/);
    } finally {
      if (worker && worker.exitCode === null && worker.signalCode === null) worker.kill('SIGTERM');
      if (exited) await exited;
      if (prepared) await prepared.close();
      await new Promise((done, fail) => foreign.close((error) => (error ? fail(error) : done())));
    }
  });
}

test('controller SIGKILL fails the attachment and its surviving owner still cleans every child', async () => {
  const launcher = spawn(process.execPath, ['bin/playwright/prepare-existing.mjs', 'F029-T002', '--built'], {
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const exited = new Promise((done, fail) => {
    launcher.once('error', fail);
    launcher.once('exit', done);
  });
  let epoch;
  try {
    const path = await new Promise((done, fail) => {
      let output = '';
      const timer = setTimeout(() => fail(new Error('Existing controller did not become ready')), 60000);
      const read = (chunk) => {
        output += chunk;
        const match = output.match(/PLAYWRIGHT_EXISTING_MANIFEST=(.*)\nSTART_PID=/);
        if (match) {
          clearTimeout(timer);
          done(match[1]);
        }
      };
      launcher.stdout.on('data', read);
      launcher.stderr.on('data', read);
      exited.then((code) => {
        clearTimeout(timer);
        fail(new Error(`Controller exited: ${code}: ${output}`));
      });
    });
    const prepared = JSON.parse(readFileSync(path));
    epoch = await attachExistingEpoch({
      manifestPath: path,
      mode: 'built',
      testId: 'F029-T002',
      attempt: 0,
      output: resolve(path, '..', 'controller-loss-client'),
    });
    launcher.kill('SIGKILL');
    await exited;
    const ownerDirectory = resolve(path, '..', 'epochs', epoch.epochId);
    await waitFor(() => JSON.parse(readFileSync(resolve(ownerDirectory, 'manifest.json'))).stoppedAt);
    assert.throws(() => epoch.assertHealthy(), /EXISTING_CONTROLLER_DISCONNECTED/);
    for (const pid of [prepared.epoch.ownerPid, ...prepared.epoch.pids])
      assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
    await assert.rejects(epoch.stop(), /closed|destroyed|DISCONNECTED/i);
    for (const port of prepared.epoch.ports) assert(await isPortFree(port));
  } finally {
    if (launcher.exitCode === null && launcher.signalCode === null) launcher.kill('SIGTERM');
    await exited;
  }
});
