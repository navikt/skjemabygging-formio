/* eslint-disable vitest/no-import-node-test -- Standalone measurement contract tests. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { test } from 'node:test';
import { checkMigration, expandRuntimeCases } from './check-migration.mjs';
import {
  cypressArtifactOptions,
  cypressMeasurements,
  duration,
  formatMeasurements,
  measurementCases,
  playwrightMeasurements,
} from './measurements.mjs';

const root = resolve(import.meta.dirname, '../..');
test('failure artifacts have narrow upload paths and do not upload raw server logs', () => {
  const workflow = readFileSync(resolve(root, '.github/workflows/playwright-tests.yaml'), 'utf8');
  assert.deepEqual(cypressArtifactOptions('/run/cypress-1'), {
    screenshotsFolder: resolve('/run/cypress-1/screenshots'),
    screenshotOnRunFailure: true,
  });
  assert.match(workflow, /playwright\/\*\/epochs\/\*\/startup\.json/);
  assert.match(workflow, /playwright-measurements\/ci\/cypress-\*\/screenshots\//);
  assert.doesNotMatch(workflow, /stack\.log|source\.diff|cypress-home/);
});
test('workflow display names identify the Playwright pilot and uploaded reports', () => {
  const workflow = readFileSync(resolve(root, '.github/workflows/playwright-tests.yaml'), 'utf8');
  assert.match(workflow, /^name: Playwright pilot in FyllUt$/m);
  assert.match(workflow, /^ {4}name: Playwright pilot in FyllUt$/m);
  assert.match(workflow, /^ {6}- name: Upload HTML test reports and timing summaries$/m);
  assert.match(workflow, /echo "# Playwright pilot in FyllUt - CI timing"/);
});

test('only manual workflow runs install Cypress and repeat the cases for benchmarking', () => {
  const workflow = readFileSync(resolve(root, '.github/workflows/playwright-tests.yaml'), 'utf8');
  const steps = workflow.split(/^ {6}- name: /m).slice(1);
  for (const name of ['Install Cypress for the manual comparison', 'Measure matching cases on the same build']) {
    const step = steps.find((entry) => entry.startsWith(`${name}\n`));
    assert(step, `Missing step: ${name}`);
    assert.match(step, /^ {8}if: github\.event_name == 'workflow_dispatch'$/m);
  }
  for (const name of [
    'Install Chromium',
    'Verify isolation, lifecycle and failure controls',
    'Run all 46 built pilot cases',
  ]) {
    const step = steps.find((entry) => entry.startsWith(`${name}\n`));
    assert(step, `Missing validation step: ${name}`);
    assert.doesNotMatch(step, /^ {8}if:/m);
  }
  assert.equal((workflow.match(/exec cypress install/g) ?? []).length, 1);
  assert.match(
    steps.find((entry) => entry.startsWith('Install dependencies\n')),
    /CYPRESS_INSTALL_BINARY: '0'/,
  );
  assert.equal((workflow.match(/pnpm playwright:fyllut:measure --repetitions/g) ?? []).length, 1);
  assert.match(workflow, /Benchmark not requested\. Push runs validate the pilot/);
  assert.match(workflow, /group: playwright-fyllut-\$\{\{ github.event_name \}\}-\$\{\{ github.ref \}\}/);
});

const inventory = JSON.parse(readFileSync(resolve(root, 'packages/fyllut/playwright/migration/inventory.json')));
const implemented = checkMigration(inventory);
const cases = measurementCases(expandRuntimeCases(implemented));
const phases = { wallMs: 1000, startupMs: 100, executionMs: 800, teardownMs: 100 };
const cypressResult = () => ({
  browserName: 'electron',
  browserVersion: 'test-browser',
  cypressVersion: 'test-cypress',
  config: { retries: 0, testIsolation: false, viewportWidth: 1280, viewportHeight: 1000 },
  totalTests: cases.length,
  totalPassed: cases.length,
  totalFailed: 0,
  totalPending: 0,
  totalSkipped: 0,
  runs: [...new Set(cases.map(({ source }) => source))].map((source) => ({
    error: null,
    spec: { relative: relative(resolve(root, 'packages/fyllut'), resolve(root, source)) },
    tests: cases
      .filter((entry) => entry.source === source)
      .map(({ proposedTitlePath }) => ({
        title: proposedTitlePath,
        state: 'passed',
        attempts: [{ state: 'passed' }],
        duration: 10,
      })),
  })),
});
const playwrightResult = () =>
  cases.map(({ id, target, source, proposedTitlePath }) => ({
    file: target,
    titlePath: proposedTitlePath,
    annotations: [
      { type: 'migration-id', description: id },
      { type: 'cypress-source', description: source },
    ],
    expectedStatus: 'passed',
    status: 'expected',
    results: [{ retry: 0, status: 'passed', errors: [], duration: 100 }],
  }));
const epochs = () =>
  cases.map(({ id }) => ({
    manifest: {
      testId: id,
      epochId: `epoch-${id}`,
      attempt: 0,
      state: 'stopped',
      stoppedAt: 'test-stop',
      quiescedAt: 'test-quiesce',
      startupMs: 20,
    },
    timings: {
      testId: id,
      epochId: `epoch-${id}`,
      attempt: 0,
      completed: true,
      browserVersion: 'test-browser',
      policy: {
        browser: 'chromium',
        workers: 1,
        retries: 0,
        viewport: { width: 1280, height: 1000 },
      },
      setupMs: 30,
      testScopeMs: 40,
      teardownMs: 20,
      totalMs: 90,
    },
  }));

test('the benchmark has exactly 45 cases in five complete files; F029 remains in the full pilot', () => {
  assert.equal(cases.length, 45);
  assert(!cases.some(({ id }) => id === 'F029-T002'));
  for (const source of new Set(cases.map((entry) => entry.source))) {
    const file = inventory.files.find((file) => file.source === source);
    assert(
      file.tests.every(({ status }) => status === 'implemented'),
      'Partial Cypress file selected',
    );
    assert.equal(cases.filter((entry) => entry.source === source).length, expandRuntimeCases(file.tests).length);
  }
  const all = expandRuntimeCases(implemented);
  assert.throws(() => measurementCases(all.slice(1)), /FULL_PILOT/);
  const duplicate = structuredClone(all);
  duplicate[1] = duplicate[0];
  assert.throws(() => measurementCases(duplicate), /DUPLICATE_ID/);
});

test('successful Cypress API results do not need a status field and map every case by exact source and title', () => {
  const result = cypressResult();
  assert.equal(result.status, undefined);
  const measured = cypressMeasurements(cases, result, root, phases);
  assert.deepEqual(
    measured.records.map(({ id }) => id),
    cases.map(({ id }) => id),
  );
  assert.equal(measured.reportedTestsMs, 450);
  assert.equal(measured.wallMs, 1000);
});

test('Cypress failure, extra cases, duplicate titles, skips, retries and foreign files fail closed', () => {
  for (const mutate of [
    (result) => {
      result.status = 'failed';
    },
    (result) => {
      result.totalTests++;
    },
    (result) => {
      result.totalPending++;
    },
    (result) => {
      result.runs[0].tests[1].title = result.runs[0].tests[0].title;
    },
    (result) => {
      result.runs[0].tests[0].state = 'pending';
    },
    (result) => {
      result.runs[0].tests[0].attempts.push({ state: 'passed' });
    },
    (result) => {
      result.runs[0].spec.relative = 'foreign.cy.ts';
    },
    (result) => {
      result.runs[0].error = 'spec failed';
    },
    (result) => {
      result.runs[0].tests[0].duration = null;
    },
    (result) => {
      result.config.retries = 1;
    },
    (result) => {
      result.config.viewportWidth = 800;
    },
  ]) {
    const result = cypressResult();
    mutate(result);
    assert.throws(() => cypressMeasurements(cases, result, root, phases));
  }
});

test('Playwright separates startup, test scope and teardown without inferring them from total duration', () => {
  const measured = playwrightMeasurements(cases, playwrightResult(), epochs(), 5000);
  assert.equal(measured.startupMs, 900);
  assert.equal(measured.setupMs, 1350);
  assert.equal(measured.testScopeMs, 1800);
  assert.equal(measured.teardownMs, 900);
  assert.equal(measured.wallMs, 5000);
});

test('missing, active, mismatched or incomplete epoch timings and retried results cannot supply a measurement', () => {
  for (const mutate of [
    (values) => values.pop(),
    (values) => {
      values[0] = values[1];
    },
    (values) => {
      values[0].manifest.state = 'ready';
    },
    (values) => {
      delete values[0].manifest.quiescedAt;
    },
    (values) => {
      values[0].timings.epochId = 'foreign';
    },
    (values) => {
      values[0].timings.completed = false;
    },
    (values) => {
      values[0].timings.testScopeMs = null;
    },
    (values) => {
      values[0].timings.totalMs++;
    },
    (values) => {
      values[0].timings.policy.workers = 2;
    },
    (values) => {
      values[0].timings.policy.viewport.height = 900;
    },
  ]) {
    const values = epochs();
    mutate(values);
    assert.throws(() => playwrightMeasurements(cases, playwrightResult(), values, 5000));
  }
  const report = playwrightResult();
  report[0].results[0].retry = 1;
  assert.throws(() => playwrightMeasurements(cases, report, epochs(), 5000), /Retry/);
});

test('duration fields reject missing, negative and non-finite values instead of defaulting to zero', () => {
  for (const value of [null, undefined, -1, NaN, Infinity, '100']) {
    assert.throws(() => duration(value, 'test'), /INVALID_DURATION/);
  }
  assert.equal(duration(0, 'test'), 0);
});

test('the human-readable report distinguishes command timing, job timing and browser/isolation policies', () => {
  const report = formatMeasurements({
    status: 'passed',
    source: { commit: 'test-commit' },
    environment: { runnerClass: 'test-runner' },
    selectedIds: cases.map(({ id }) => id),
    comparisons: [
      {
        iteration: 1,
        order: ['playwright', 'cypress'],
        playwright: playwrightMeasurements(cases, playwrightResult(), epochs(), 5000),
        cypress: cypressMeasurements(cases, cypressResult(), root, phases),
      },
    ],
  });
  assert.equal(report.split('\n')[0], '# Measurements for the Playwright pilot in FyllUt');
  assert.match(report, /45 matching cases/);
  assert.match(report, /exclude dependency installation, build and artifact upload/);
  assert.match(report, /Cypress uses Electron and one shared epoch/);
  assert.match(report, /not a whole-suite speedup or human coverage approval/);
});
