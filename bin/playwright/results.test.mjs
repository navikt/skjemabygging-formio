/* eslint-disable vitest/no-import-node-test -- Standalone result checker tests. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { checkResults, expandRuntimeCases } from './check-migration.mjs';
import { verifyEvidence } from './mock-evidence.mjs';
import { checkBuild } from './test-epoch.mjs';

const entries = [
  { id: 'F061-T004', target: 'a.spec.ts', source: 'a.cy.ts', proposedTitlePath: ['attachments'] },
  { id: 'F086-T002', target: 'b.spec.ts', source: 'b.cy.ts', proposedTitlePath: ['static'], buildOnly: true },
];

test('the root runner accepts visible debugging without exposing isolation overrides', () => {
  const run = (args) =>
    spawnSync(process.execPath, ['bin/playwright/run-fyllut.mjs', ...args], {
      cwd: resolve(import.meta.dirname, '../..'),
      encoding: 'utf8',
      timeout: 30000,
    });
  const result = run(['--list', 'bankaccount.spec.ts', '--grep', 'should be visible and interactable', '--headed']);
  assert.equal(result.status, 0, result.stderr);
  const directory = /PLAYWRIGHT_ARTIFACTS=(.+)/.exec(result.stdout)?.[1];
  assert(directory);
  const manifest = JSON.parse(readFileSync(resolve(directory, 'run.json'), 'utf8'));
  assert.equal(manifest.headed, true);
  assert.deepEqual(manifest.selectedIds, ['F004-T001']);
  const ambiguous = run(['--list', '--grep', '^no-matching-test$']);
  assert.equal(ambiguous.status, 1);
  assert.match(ambiguous.stderr, /No tests found/);
  assert.match(ambiguous.stderr, /Reports and local logs:/);
  assert.match(ambiguous.stderr, /Rerun one test:/);
  for (const flag of ['--workers=4', '--retries=1', '--ui', '--debug']) {
    const result = run(['--list', flag]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Unsupported runner argument/);
  }
});

test('all parameterized outcomes have distinct identities and missing or duplicated cases fail closed', () => {
  const declared = {
    ...entries[0],
    id: 'F061-T005',
    runtimeCases: ['upload', 'delete'].flatMap((operation) =>
      ['success', 'failure'].map((outcome) => ({ titlePath: [operation, outcome] })),
    ),
  };
  const expanded = expandRuntimeCases([declared]);
  assert.deepEqual(
    expanded.map(({ id }) => id),
    ['F061-T005-C001', 'F061-T005-C002', 'F061-T005-C003', 'F061-T005-C004'],
  );
  const report = expanded.map((entry) => ({
    file: entry.target,
    titlePath: entry.proposedTitlePath,
    annotations: [
      { type: 'migration-id', description: entry.id },
      { type: 'cypress-source', description: entry.source },
    ],
    expectedStatus: 'passed',
    status: 'expected',
    results: [{ retry: 0, status: 'passed', errors: [] }],
  }));
  checkResults(expanded, report, 'built');
  assert.throws(() => checkResults(expanded, report.slice(1), 'built'), /Unexpected number/);
  const duplicate = structuredClone(report);
  duplicate[1] = duplicate[0];
  assert.throws(() => checkResults(expanded, duplicate, 'built'), /Duplicate discovered ID/);
  const wrongTitle = structuredClone(report);
  wrongTitle[0].titlePath = ['delete', 'success'];
  assert.throws(() => checkResults(expanded, wrongTitle, 'built'), /Wrong target title/);
});

test('missing compiled artifacts fail before execution, while dev requires no build', () => {
  const missing = resolve('packages/fyllut/.runtime/nonexistent-playwright-build');
  assert.throws(() => checkBuild('built', missing), /BUILD_REQUIRED/);
  assert.deepEqual(checkBuild('dev', missing), []);
});
const results = (mode) =>
  entries.map((entry) => {
    const skipped = mode === 'dev' && entry.id === 'F086-T002';
    return {
      file: entry.target,
      titlePath: entry.proposedTitlePath,
      annotations: [
        { type: 'migration-id', description: entry.id },
        { type: 'cypress-source', description: entry.source },
      ],
      expectedStatus: skipped ? 'skipped' : 'passed',
      status: skipped ? 'skipped' : 'expected',
      results: [{ retry: 0, status: skipped ? 'skipped' : 'passed', errors: [] }],
    };
  });
test('exact per-mode results and explicit subsets pass, discovery alone does not', () => {
  for (const mode of ['dev', 'built']) {
    checkResults(entries, results(mode), mode);
    checkResults(entries.slice(0, 1), results(mode).slice(0, 1), mode);
    const discovery = results(mode);
    discovery[0].results = [];
    assert.throws(() => checkResults(entries, discovery, mode), /Missing result or retry/);
  }
  assert.throws(() => checkResults([], [], 'dev'), /EMPTY_SELECTION/);
});
test('missing, duplicate, foreign, skipped, failed, flaky and retried results fail closed', () => {
  for (const mutate of [
    (report) => report.pop(),
    (report) => {
      report[1] = structuredClone(report[0]);
    },
    (report) => {
      report[0].annotations[0].description = 'unknown';
    },
    (report) => {
      report[0].expectedStatus = 'skipped';
    },
    (report) => {
      report[0].expectedStatus = 'failed';
    },
    (report) => {
      report[0].results[0].status = 'failed';
    },
    (report) => {
      report[0].results[0].retry = 1;
    },
    (report) => {
      report[0].results.push(structuredClone(report[0].results[0]));
    },
    (report) => {
      report[0].status = 'flaky';
    },
    (report) => {
      report[0].results[0].errors.push({ message: 'error' });
    },
  ]) {
    const report = results('built');
    mutate(report);
    assert.throws(() => checkResults(entries, report, 'built'));
  }
  assert.throws(() => checkResults(entries, results('dev'), 'built'), /Unexpected skip/);
  assert.throws(() => checkResults(entries, results('built'), 'dev'), /Unexpected skip/);
});
test('foreign epochs, incomplete responses and body mismatches cannot supply mock proof', () => {
  const epoch = { epochId: 'epoch', testId: 'F061-T004', attempt: 0 };
  const expected = { 'post-familie-pdf': 'success-tc07' };
  const snapshot = {
    ...epoch,
    expected,
    records: [
      {
        ...epoch,
        requestId: 'request',
        routeId: 'post-familie-pdf',
        variantId: 'success-tc07',
        status: 200,
        response: 'completed',
        validation: 'passed',
        mismatchPaths: [],
      },
    ],
  };
  verifyEvidence(snapshot, epoch, expected);
  for (const [field, value, reason] of [
    ['epochId', 'old', 'EVIDENCE_EPOCH_MISMATCH'],
    ['response', 'pending', 'EVIDENCE_INCOMPLETE'],
    ['response', 'aborted', 'EVIDENCE_INCOMPLETE'],
    ['variantId', 'success', 'EVIDENCE_WRONG_VARIANT'],
    ['validation', 'not-run', 'EVIDENCE_VALIDATION_NOT_RUN'],
    ['validation', 'failed', 'EVIDENCE_BODY_MISMATCH'],
    ['status', 400, 'EVIDENCE_RESPONSE_STATUS'],
  ]) {
    const changed = structuredClone(snapshot);
    changed.records[0][field] = value;
    assert.throws(() => verifyEvidence(changed, epoch, expected), new RegExp(reason));
  }
});
