/* eslint-disable vitest/no-import-node-test -- Standalone launcher tests use node --test. */
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { createFyllutTestStack } from './fyllut-test-stack.mjs';

const ports = [4101, 4102, 4103, 4104];

test('built stack serves frontend from compiled backend with deterministic fixture metadata', () => {
  const stack = createFyllutTestStack({
    repoRoot: '/repo',
    ports,
    shouldWriteRuntimeConfig: false,
    mode: 'built',
    epoch: 'epoch',
  });
  assert.equal(stack.commands.length, 2);
  assert.deepEqual(stack.commands[1][1], ['/repo/packages/fyllut-backend/dist/server.mjs']);
  assert.equal(stack.commands[1][2].PORT, '4103');
  assert.equal(stack.commands[1][2].FYLLUT_BUILD_DIR, '/repo/packages/fyllut/dist');
  assert.equal(stack.commands[1][2].GIT_SHA, 'git-sha');
  assert.equal(stack.commands[1][2].MONOREPO_GIT_SHA, 'mr-sha');
  assert.equal(stack.commands[1][2].PDF_FOOTER_ENV_SLUG, 'dev-local');
  assert.deepEqual(stack.listeningPorts, [[4101, 4102], [4103]]);
  assert.equal(stack.healthUrls.at(-1), 'http://127.0.0.1:4103/fyllut/');
});

test('fyllut stack exposes its URLs and commands without writing shared runtime config', () => {
  const stack = createFyllutTestStack({ repoRoot: '/repo', ports, shouldWriteRuntimeConfig: false });

  assert.deepEqual(stack.summaryLines, [
    'FYLLUT_MOCK_URL=http://127.0.0.1:4101',
    'FYLLUT_MOCK_ADMIN_PORT=4102',
    'FYLLUT_BACKEND_URL=http://127.0.0.1:4103',
    'FYLLUT_FRONTEND_URL=http://127.0.0.1:4104/fyllut',
  ]);
  assert.deepEqual(stack.healthUrls, [
    'http://127.0.0.1:4101/forms-api/v1/global-translations',
    'http://127.0.0.1:4102/api/about',
    'http://127.0.0.1:4103/fyllut/internal/isready',
    'http://127.0.0.1:4104/fyllut/',
  ]);
  assert.equal(stack.commands.length, 3);
  for (const [, args] of stack.commands.slice(1)) {
    assert.ok(args.includes('--strictPort'));
    const hostIndex = args.indexOf('--host');
    assert.notEqual(hostIndex, -1);
    assert.equal(args[hostIndex + 1], '127.0.0.1');
  }
  assert.equal(stack.commands[1][2].SKJEMABYGGING_PROXY_URL, 'http://127.0.0.1:4101/skjemabygging-proxy');
  assert.equal(stack.commands[2][2].BACKEND_PORT, '4103');
  assert.equal(stack.onReady, undefined);
  assert.equal(stack.onCleanup, undefined);
});

test('Cypress mode writes config on readiness and removes its own config on cleanup', () => {
  // Keep test files in the repository, never in the system temp directory.
  const repoRoot = mkdtempSync(resolve(import.meta.dirname, '.fyllut-stack-test-'));
  const runtimePath = resolve(repoRoot, 'packages/fyllut/.runtime/cypress.mocks.json');
  try {
    const stack = createFyllutTestStack({ repoRoot, ports, shouldWriteRuntimeConfig: true });
    stack.onCleanup();
    assert.equal(existsSync(runtimePath), false);
    stack.onReady();
    const config = JSON.parse(readFileSync(runtimePath, 'utf8'));
    assert.equal(config.baseUrl, 'http://127.0.0.1:4104');
    assert.equal(config.env.MOCKS_ADMIN_PORT, '4102');
    stack.onCleanup();
    assert.equal(existsSync(runtimePath), false);
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});
