/* eslint-disable vitest/no-import-node-test -- Exercises the real developer launcher with node --test. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { isPortFree } from './lib/managed-test-stack.mjs';

test('Bygger launcher becomes ready in dev despite root 404 and releases its ports on stop', async () => {
  const root = resolve(import.meta.dirname, '..');
  const runtimePath = resolve(root, 'packages/bygger/.runtime/cypress.mocks.json');
  const runtime = () => (existsSync(runtimePath) ? readFileSync(runtimePath, 'utf8') : undefined);
  const before = runtime();
  const child = spawn(process.execPath, ['bin/start.mjs', 'bygger', '--no-runtime-config'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const exited = once(child, 'exit');
  let output = '';
  const collect = (chunk) => {
    output += chunk.toString();
  };
  child.stdout.on('data', collect);
  child.stderr.on('data', collect);
  const urls = [];
  try {
    await new Promise((done, fail) => {
      const deadline = setTimeout(() => fail(new Error(`Launcher did not become ready:\n${output}`)), 75000);
      const ready = () => {
        if (!output.includes(`START_PID=${child.pid}`)) return;
        clearTimeout(deadline);
        done();
      };
      child.stdout.on('data', ready);
      child.once('error', (error) => {
        clearTimeout(deadline);
        fail(error);
      });
      child.once('exit', (code) => {
        clearTimeout(deadline);
        fail(new Error(`Launcher exited before readiness: ${code}\n${output}`));
      });
    });
    assert.match(output, new RegExp(`START_PID=${child.pid}\\b`));
    for (const name of ['BYGGER_BACKEND_URL', 'BYGGER_FRONTEND_URL']) {
      const match = output.match(new RegExp(`${name}=(http://127\\.0\\.0\\.1:\\d+)`));
      assert(match, `Missing ${name}`);
      urls.push(match[1]);
    }
    for (const [url, status, body] of [
      [urls[0], 404, undefined],
      [`${urls[0]}/internal/isReady`, 200, 'Ready'],
      [urls[1], 200, undefined],
    ]) {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const text = await response.text();
      assert.equal(response.status, status, url);
      if (body) assert.equal(text, body);
    }
    assert.equal(runtime(), before, 'AI startup must not modify Cypress runtime configuration');
  } finally {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
    await exited;
  }
  assert.equal(child.exitCode, 143);
  for (const url of urls) assert(await isPortFree(Number(new URL(url).port)), `Port still occupied: ${url}`);
  assert.equal(runtime(), before, 'Cleanup must not modify Cypress runtime configuration');
});
