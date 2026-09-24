import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'vitest';

const script = resolve(import.meta.dirname, 'cleanup-form.mjs');

const createHarness = (scenario) => {
  const directory = mkdtempSync(join(tmpdir(), 'cleanup-form-test-'));
  const mockFile = join(directory, 'mock-fetch.mjs');
  const planPath = join(directory, 'plan.json');
  writeFileSync(
    planPath,
    JSON.stringify({
      schemaVersion: 3,
      forms: [
        {
          id: 'sample',
          kind: scenario === 'production-form' ? 'production' : 'generated',
          path: 'manualtest001',
          title: 'Manual test',
          artifact: 'form.json',
        },
      ],
    }),
  );
  writeFileSync(join(directory, 'form.json'), JSON.stringify({ skjemanummer: 'MANUALTEST-001', title: 'Manual test' }));
  writeFileSync(
    mockFile,
    `const form = {
  path: 'manualtest001',
  skjemanummer: process.env.FETCH_SCENARIO === 'unreserved' ? 'NAV-001' : 'MANUALTEST-001',
  title: process.env.FETCH_SCENARIO === 'different-form' ? 'Different form' : 'Manual test',
  revision: 4,
  properties: {},
};
let requestNumber = 0;
globalThis.fetch = async (_url, options = {}) => {
  requestNumber += 1;
  if (process.env.FETCH_SCENARIO === 'unauthorized') {
    return new Response('', { status: 401 });
  }
  if (requestNumber === 1) {
    return Response.json(form);
  }
  if (options.method === 'DELETE') {
    if (options.headers['Formsapi-Entity-Revision'] !== '4') {
      throw new Error('missing revision header');
    }
    return new Response(null, { status: 204 });
  }
  return new Response('', { status: 404 });
};
`,
  );
  const env = {
    ...process.env,
    FORMS_API_ACCESS_TOKEN: 'test-token',
    NODE_OPTIONS: `--import=${mockFile}`,
    FETCH_SCENARIO: scenario,
  };
  return {
    directory,
    run: (...args) =>
      spawnSync(process.execPath, [script, '--plan', planPath, '--form-id', 'sample', ...args], {
        env,
        encoding: 'utf8',
      }),
  };
};

test('dry run binds a generated test form to a confirmation', () => {
  const harness = createHarness('test-form');
  try {
    const result = harness.run();
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Operation: DELETE:manualtest001:4:[0-9a-f]{12}/);
    assert.match(result.stdout, /Dry run only/);
  } finally {
    rmSync(harness.directory, { recursive: true });
  }
});

test('refuses to delete a production form even if it appears in the plan', () => {
  const harness = createHarness('production-form');
  try {
    const result = harness.run();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /must identify a generated form/);
  } finally {
    rmSync(harness.directory, { recursive: true });
  }
});

test('refuses to delete a form whose identity no longer matches the plan', () => {
  const harness = createHarness('different-form');
  try {
    const result = harness.run();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /does not match the planned generated form/);
  } finally {
    rmSync(harness.directory, { recursive: true });
  }
});

test('refuses to delete a form outside the reserved manual-test namespace', () => {
  const harness = createHarness('unreserved');
  try {
    const result = harness.run();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /reserved MANUALTEST- prefix/);
  } finally {
    rmSync(harness.directory, { recursive: true });
  }
});

test('rejects a stale confirmation', () => {
  const harness = createHarness('test-form');
  try {
    const result = harness.run('--apply', '--confirm', 'DELETE:manualtest001:3:stale');
    assert.equal(result.status, 1);
    assert.match(result.stderr, /confirmation does not match current operation/);
  } finally {
    rmSync(harness.directory, { recursive: true });
  }
});

test('deletes with the current revision and verifies the form is gone', () => {
  const harness = createHarness('test-form');
  try {
    const dryRun = harness.run();
    const operation = dryRun.stdout.match(/Operation: (DELETE:[^\n]+)/)?.[1];
    assert.ok(operation);

    const result = harness.run('--apply', '--confirm', operation);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Deleted and verified generated form manualtest001/);
  } finally {
    rmSync(harness.directory, { recursive: true });
  }
});

test('explains how to recover from an unauthorized response', () => {
  const harness = createHarness('unauthorized');
  try {
    const result = harness.run();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /pnpm get-tokens forms-api/);
  } finally {
    rmSync(harness.directory, { recursive: true });
  }
});
