import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { checkResults, flattenDiscovery } from './check-migration.mjs';

const duration = (value, label) => {
  assert(Number.isFinite(value) && value >= 0, `INVALID_DURATION: ${label}`);
  return value;
};

const measurementCases = (cases) => {
  const selected = cases.filter(({ id }) => id !== 'F029-T002');
  assert.equal(cases.length, 46, 'MEASUREMENT_REQUIRES_FULL_PILOT');
  assert.equal(selected.length, 45, 'MEASUREMENT_SELECTION_CHANGED');
  assert.equal(new Set(selected.map(({ id }) => id)).size, selected.length, 'MEASUREMENT_DUPLICATE_ID');
  assert.equal(new Set(selected.map(({ source }) => source)).size, 5, 'MEASUREMENT_FILES_CHANGED');
  return selected;
};

const playwrightMeasurements = (cases, report, epochs, wallMs) => {
  checkResults(cases, report, 'built');
  assert.equal(epochs.length, cases.length, 'MEASUREMENT_EPOCH_COUNT');
  const tests = flattenDiscovery(report);
  const records = cases.map(({ id }) => {
    const matching = epochs.filter(({ manifest }) => manifest.testId === id);
    assert.equal(matching.length, 1, `MEASUREMENT_EPOCH_ID: ${id}`);
    const { manifest, timings } = matching[0];
    assert.equal(manifest.state, 'stopped', `MEASUREMENT_EPOCH_NOT_STOPPED: ${id}`);
    assert(manifest.stoppedAt && manifest.quiescedAt, `MEASUREMENT_CLEANUP_MISSING: ${id}`);
    assert.equal(manifest.attempt, 0, `MEASUREMENT_RETRY: ${id}`);
    assert.equal(timings.epochId, manifest.epochId, `MEASUREMENT_TIMING_EPOCH: ${id}`);
    assert.equal(timings.testId, id, `MEASUREMENT_TIMING_ID: ${id}`);
    assert.equal(timings.attempt, 0, `MEASUREMENT_TIMING_RETRY: ${id}`);
    assert.equal(timings.completed, true, `MEASUREMENT_TIMING_INCOMPLETE: ${id}`);
    assert.deepEqual(
      timings.policy,
      {
        browser: 'chromium',
        workers: 1,
        retries: 0,
        viewport: { width: 1280, height: 1000 },
      },
      `MEASUREMENT_PLAYWRIGHT_POLICY: ${id}`,
    );
    assert(typeof timings.browserVersion === 'string' && timings.browserVersion, 'MEASUREMENT_BROWSER_VERSION');
    const record = {
      id,
      browserVersion: timings.browserVersion,
      startupMs: duration(manifest.startupMs, 'startup'),
      setupMs: duration(timings.setupMs, 'setup'),
      testScopeMs: duration(timings.testScopeMs, 'test scope'),
      teardownMs: duration(timings.teardownMs, 'teardown'),
      fixtureMs: duration(timings.totalMs, 'fixture'),
      reportedTestMs: duration(
        tests.find((test) => test.annotations.some((a) => a.type === 'migration-id' && a.description === id)).results[0]
          .duration,
        'Playwright result',
      ),
    };
    assert(Math.abs(record.setupMs + record.testScopeMs + record.teardownMs - record.fixtureMs) < 1);
    return record;
  });
  const sum = (key) => records.reduce((total, record) => total + record[key], 0);
  return {
    browser: 'chromium',
    browserVersions: [...new Set(records.map(({ browserVersion }) => browserVersion))],
    wallMs: duration(wallMs, 'Playwright command'),
    startupMs: sum('startupMs'),
    setupMs: sum('setupMs'),
    testScopeMs: sum('testScopeMs'),
    teardownMs: sum('teardownMs'),
    records,
  };
};

const cypressMeasurements = (cases, result, root, phases) => {
  assert.notEqual(result.status, 'failed', result.message);
  assert.equal(result.browserName, 'electron', 'MEASUREMENT_CYPRESS_BROWSER');
  assert.equal(result.config.retries, 0, 'MEASUREMENT_CYPRESS_RETRIES');
  assert.equal(result.config.testIsolation, false, 'MEASUREMENT_CYPRESS_ISOLATION');
  assert.deepEqual(
    [result.config.viewportWidth, result.config.viewportHeight],
    [1280, 1000],
    'MEASUREMENT_CYPRESS_VIEWPORT',
  );
  assert(typeof result.browserVersion === 'string' && result.browserVersion, 'MEASUREMENT_BROWSER_VERSION');
  assert.equal(result.totalTests, cases.length, 'MEASUREMENT_CYPRESS_COUNT');
  assert.equal(result.totalPassed, cases.length, 'MEASUREMENT_CYPRESS_FAILED');
  assert.equal(result.totalFailed + result.totalPending + result.totalSkipped, 0, 'MEASUREMENT_CYPRESS_NOT_PASSED');
  const sources = [...new Set(cases.map(({ source }) => resolve(root, source)))];
  assert.equal(result.runs.length, sources.length, 'MEASUREMENT_CYPRESS_FILES');
  const actual = result.runs.flatMap((run) => {
    assert.equal(run.error, null, 'MEASUREMENT_CYPRESS_SPEC_ERROR');
    const source = resolve(root, 'packages/fyllut', run.spec.relative);
    assert(sources.includes(source), 'MEASUREMENT_CYPRESS_FOREIGN_FILE');
    return run.tests.map((test) => ({ source, ...test }));
  });
  assert.equal(actual.length, cases.length, 'MEASUREMENT_CYPRESS_RESULTS');
  const records = cases.map(({ id, source, proposedTitlePath }) => {
    const matches = actual.filter(
      (test) =>
        test.source === resolve(root, source) && JSON.stringify(test.title) === JSON.stringify(proposedTitlePath),
    );
    assert.equal(matches.length, 1, `MEASUREMENT_CYPRESS_CASE: ${id}`);
    const test = matches[0];
    assert.equal(test.state, 'passed', `MEASUREMENT_CYPRESS_STATE: ${id}`);
    assert.equal(test.attempts.length, 1, `MEASUREMENT_CYPRESS_RETRY: ${id}`);
    assert.equal(test.attempts[0].state, 'passed', `MEASUREMENT_CYPRESS_ATTEMPT: ${id}`);
    return { id, reportedTestMs: duration(test.duration, `Cypress result ${id}`) };
  });
  return {
    browser: result.browserName,
    browserVersion: result.browserVersion,
    cypressVersion: result.cypressVersion,
    policy: {
      retries: result.config.retries,
      testIsolation: result.config.testIsolation,
      viewport: [result.config.viewportWidth, result.config.viewportHeight],
    },
    wallMs: duration(phases.wallMs, 'Cypress command'),
    startupMs: duration(phases.startupMs, 'Cypress startup'),
    executionMs: duration(phases.executionMs, 'Cypress execution'),
    teardownMs: duration(phases.teardownMs, 'Cypress teardown'),
    reportedTestsMs: records.reduce((total, { reportedTestMs }) => total + reportedTestMs, 0),
    records,
  };
};

const formatMeasurements = (summary) => {
  const seconds = (ms) => (ms / 1000).toFixed(2);
  const rows = summary.comparisons.map(
    ({ iteration, order, playwright, cypress }) =>
      `| ${iteration} | ${order.join(' then ')} | ${seconds(playwright.wallMs)} | ${seconds(cypress.wallMs)} | ${seconds(playwright.startupMs)} | ${seconds(playwright.testScopeMs)} | ${seconds(playwright.teardownMs)} |`,
  );
  return [
    '# FyllUt pilot measurements',
    '',
    `Status: ${summary.status}. ${summary.selectedIds.length} matching cases in five whole source files.`,
    `Commit: ${summary.source.commit}. Runner: ${summary.environment.runnerClass}.`,
    '',
    '| Sample | Order | Playwright wall s | Cypress wall s | PW startup s | PW test scope s | PW teardown s |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...rows,
    '',
    'Both use the same built entrypoints, 1280x1000 viewport and zero test retries.',
    'Playwright uses Chromium and a fresh process epoch per case. Cypress uses Electron and one shared epoch per sample.',
    'Playwright test scope includes dependent fixture setup/teardown. Cypress reported test duration has different boundaries.',
    'Command wall times include startup, execution and teardown, but exclude dependency installation, build and artifact upload.',
    'F029-T002 is covered by the separate full 46-case pilot run, not this 45-case benchmark.',
    'These are pilot measurements, not a whole-suite speedup or human coverage approval.',
    '',
  ].join('\n');
};

export { cypressMeasurements, duration, formatMeasurements, measurementCases, playwrightMeasurements };
