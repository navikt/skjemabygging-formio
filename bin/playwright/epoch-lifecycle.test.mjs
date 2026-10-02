/* eslint-disable vitest/no-import-node-test -- Verify the real epoch owner survives worker loss. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, watch } from 'node:fs';
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
