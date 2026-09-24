import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'vitest';

const script = resolve(import.meta.dirname, 'import-form.mjs');
const makeHarness = (scenario) => {
  const directory = mkdtempSync(join(tmpdir(), 'import-form-test-'));
  const formPath = join(directory, 'form.json');
  writeFileSync(
    formPath,
    JSON.stringify({
      skjemanummer:
        scenario === 'unreserved' ? 'NAV-001' : scenario === 'too-long' ? 'MANUALTEST-ABCDEFGHIJ' : 'MANUALTEST-001',
      title: 'Manual test',
      properties: {},
      components: [],
    }),
  );
  const mockFile = join(directory, 'fetch.mjs');
  writeFileSync(
    mockFile,
    `globalThis.fetch = async (url, options = {}) => {
  if (url.includes('?')) {
    return Response.json(process.env.FETCH_SCENARIO === 'new' ? [] : [{
      skjemanummer: 'MANUALTEST-001',
      path: 'manualtest001',
      revision: 4,
      title: 'Existing form',
      status: 'DRAFT',
    }]);
  }
  if (options.method === 'PUT') {
    if (options.headers['Formsapi-Entity-Revision'] !== '4') {
      throw new Error('missing revision header');
    }
    return Response.json({ path: 'manualtest001', revision: 5 });
  }
  if (options.method === 'POST') {
    return Response.json({ path: 'manualtest001', revision: 1 });
  }
  return Response.json({
    path: 'manualtest001',
    skjemanummer: 'MANUALTEST-001',
    revision: 4,
    title: 'Existing form',
    components: [{ type: 'textfield' }],
  });
};
`,
  );
  return {
    directory,
    run: (...args) =>
      spawnSync(process.execPath, [script, '--form', formPath, ...args], {
        env: {
          ...process.env,
          FORMS_API_ACCESS_TOKEN: 'test-token',
          NODE_OPTIONS: `--import=${mockFile}`,
          FETCH_SCENARIO: scenario,
        },
        encoding: 'utf8',
      }),
  };
};

test('does not overwrite a form with the same number by default', () => {
  const harness = makeHarness('existing');
  try {
    const result = harness.run();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /already exists/);
    assert.doesNotMatch(result.stdout, /Operation: UPDATE/);
  } finally {
    rmSync(harness.directory, { recursive: true });
  }
});

test('refuses to import a form outside the reserved manual-test namespace', () => {
  const harness = makeHarness('unreserved');
  try {
    const result = harness.run();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /reserved MANUALTEST- prefix/);
  } finally {
    rmSync(harness.directory, { recursive: true });
  }
});

test('refuses a form number that Bygger cannot validate', () => {
  const harness = makeHarness('too-long');
  try {
    const result = harness.run();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /at most 20 characters/);
  } finally {
    rmSync(harness.directory, { recursive: true });
  }
});

test('requires explicit replacement and binds it to the existing contents', () => {
  const harness = makeHarness('existing');
  try {
    const dryRun = harness.run('--replace-existing');
    assert.equal(dryRun.status, 0, dryRun.stderr);
    const operation = dryRun.stdout.match(/Operation: (UPDATE:[^\n]+)/)?.[1];
    assert.match(operation, /^UPDATE:manualtest001:4:[a-f0-9]{12}:[a-f0-9]{12}$/);
    assert.equal(harness.run('--replace-existing', '--apply', '--confirm', 'UPDATE:stale').status, 1);
    const applied = harness.run('--replace-existing', '--apply', '--confirm', operation);
    assert.equal(applied.status, 0, applied.stderr);
    assert.match(applied.stdout, /"revision": 5/);
  } finally {
    rmSync(harness.directory, { recursive: true });
  }
});

test('can create a form without marking it as a test form', () => {
  const harness = makeHarness('new');
  try {
    const dryRun = harness.run();
    const operation = dryRun.stdout.match(/Operation: (CREATE:[^\n]+)/)?.[1];
    assert.ok(operation);
    const applied = harness.run('--apply', '--confirm', operation);
    assert.equal(applied.status, 0, applied.stderr);
  } finally {
    rmSync(harness.directory, { recursive: true });
  }
});
