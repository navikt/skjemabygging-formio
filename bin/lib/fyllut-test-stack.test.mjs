/* eslint-disable vitest/no-import-node-test -- Standalone launcher tests use node --test. */
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { createFyllutTestStack } from './fyllut-test-stack.mjs';

const ports = [4101, 4102, 4103, 4104];

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
  assert.ok(stack.commands[1][1].includes('--strictPort'));
  assert.ok(stack.commands[2][1].includes('--strictPort'));
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
