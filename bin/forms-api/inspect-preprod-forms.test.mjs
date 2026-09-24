import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'vitest';

const script = resolve(import.meta.dirname, 'inspect-preprod-forms.mjs');

const inspect = (scenario, ...args) => {
  const directory = mkdtempSync(join(tmpdir(), 'inspect-forms-test-'));
  const mockFile = join(directory, 'fetch.mjs');
  writeFileSync(
    mockFile,
    `globalThis.fetch = async (url, options) => {
  if (options.headers.Authorization !== 'Bearer test-token') {
    throw new Error('missing authorization header');
  }
  if (process.env.FETCH_SCENARIO === 'unauthorized') {
    return new Response(null, { status: 401 });
  }
  if (process.env.FETCH_SCENARIO === 'forbidden') {
    return new Response('sensitive upstream response', { status: 403 });
  }
  if (url.includes('?')) {
    return Response.json([
      { path: 'manualtest001', skjemanummer: 'MANUALTEST-001', title: 'Manual test', revision: 1, status: 'draft' },
      { path: 'different', skjemanummer: 'NAV-001', title: 'Unrelated', revision: 3, status: 'published' },
    ]);
  }
  if (process.env.FETCH_SCENARIO === 'empty-form') {
    return new Response(null, { status: 204 });
  }
  return Response.json({
    path: 'manualtest001',
    skjemanummer: 'MANUALTEST-001',
    title: 'Manual test',
    revision: 1,
    status: 'draft',
    properties: {},
    components: [{ type: 'textfield' }],
  });
};
`,
  );
  try {
    return spawnSync(process.execPath, [script, ...args], {
      env: {
        ...process.env,
        FORMS_API_ACCESS_TOKEN: 'test-token',
        NODE_OPTIONS: `--import=${mockFile}`,
        FETCH_SCENARIO: scenario,
      },
      encoding: 'utf8',
    });
  } finally {
    rmSync(directory, { recursive: true });
  }
};

test('filters list results without returning complete form definitions', () => {
  const result = inspect('ok', '--query', 'MANUALTEST');
  assert.equal(result.status, 0, result.stderr);
  const forms = JSON.parse(result.stdout);
  assert.deepEqual(
    forms.map(({ path }) => path),
    ['manualtest001'],
  );
  assert.equal(forms[0].components, undefined);
});

test('summarizes a form without printing its components', () => {
  const result = inspect('ok', '--path', 'manualtest001');
  assert.equal(result.status, 0, result.stderr);
  const form = JSON.parse(result.stdout);
  assert.deepEqual(form.componentTypes, { textfield: 1 });
  assert.equal(form.components, undefined);
});

test('gives token refresh instructions on 401', () => {
  const result = inspect('unauthorized', '--query', 'MANUALTEST');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /pnpm get-tokens forms-api/);
});

test('reports the HTTP status without exposing upstream response content', () => {
  const result = inspect('forbidden', '--query', 'MANUALTEST');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /returned 403/);
  assert.doesNotMatch(result.stderr, /sensitive upstream response/);
});

test('rejects an empty form response', () => {
  const result = inspect('empty-form', '--path', 'manualtest001');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /invalid form/);
});
