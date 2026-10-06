import assert from 'node:assert/strict';
import { test } from 'vitest';
import { makePlan, render } from './test-helpers.mjs';

test('accepts matching Bygger ingresses', () => {
  const plan = makePlan(false);
  plan.environment.internBaseUrl = 'https://skjemabygging-preprod.intern.dev.nav.no';
  plan.environment.ansattBaseUrl = 'https://skjemabygging-preprod.ansatt.dev.nav.no';
  const run = render(plan);
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
  } finally {
    run.cleanup();
  }
});

test('rejects mixed deployment URLs rather than linking to the wrong preprod', () => {
  const plan = makePlan(true);
  plan.environment.ansattBaseUrl = 'https://fyllut-preprod-alt.ansatt.dev.nav.no/fyllut';
  const run = render(plan);
  try {
    assert.equal(run.result.status, 1);
    assert.match(run.result.stderr, /environment URLs must all point to the selected preprod environment/);
  } finally {
    run.cleanup();
  }
});

test.each(['refs/heads/feature/test', 'feature test', ''])('rejects source.ref %j that is not a branch name', (ref) => {
  const plan = makePlan(false);
  plan.source.ref = ref;
  const run = render(plan);
  try {
    assert.equal(run.result.status, 1);
    assert.match(run.result.stderr, /source\.ref must be the pull request head branch name/);
  } finally {
    run.cleanup();
  }
});

test('still accepts a plan with the obsolete revisionCheck field', () => {
  const plan = makePlan(false);
  plan.environment.revisionCheck = {
    endpoint: 'https://fyllut-preprod.intern.dev.nav.no/fyllut/api/config',
    field: 'gitVersion',
  };
  const run = render(plan);
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
  } finally {
    run.cleanup();
  }
});

test('requires a form number instead of guessing one from the stored path', () => {
  const plan = makePlan(true);
  delete plan.forms[0].skjemanummer;
  const run = render(plan);
  try {
    assert.equal(run.result.status, 1);
    assert.match(run.result.stderr, /forms\[0\]\.skjemanummer/);
  } finally {
    run.cleanup();
  }
});

test('requires a reason for each uncovered in-scope behavior', () => {
  const plan = makePlan(false);
  delete plan.scope.notCoveredByTests[0].reason;
  const run = render(plan);
  try {
    assert.equal(run.result.status, 1);
    assert.match(run.result.stderr, /scope\.notCoveredByTests\[0\]\.reason/);
  } finally {
    run.cleanup();
  }
});

test('rejects the retired Pages URL option', () => {
  const run = render(makePlan(false));
  try {
    assert.equal(run.invoke('--page-url', 'https://example.org').status, 1);
  } finally {
    run.cleanup();
  }
});

test('requires at least one relevant expected result in a verification case', () => {
  const plan = makePlan(true);
  delete plan.testCases[0].steps[0].expected;
  const run = render(plan);
  try {
    assert.equal(run.result.status, 1);
    assert.match(run.result.stderr, /verification cases require at least one expected result/);
  } finally {
    run.cleanup();
  }
});

test('rejects an empty submission verification option list', () => {
  const plan = makePlan(false);
  plan.integrations[0].evidence = { options: [] };
  const run = render(plan);
  try {
    assert.equal(run.result.status, 1);
    assert.match(run.result.stderr, /integrations\[0\]\.evidence\.options must contain at least one option/);
  } finally {
    run.cleanup();
  }
});

test('requires handoff for collaborative submission checks', () => {
  const plan = makePlan(true);
  plan.integrations[0].system = 'innsending-api';
  const run = render(plan);
  try {
    assert.equal(run.result.status, 1);
    assert.match(run.result.stderr, /plus handoff for collaboration/);
  } finally {
    run.cleanup();
  }
});

test('rejects a verification case whose route has not been checked', () => {
  const plan = makePlan(false);
  plan.testCases[0].journeyCheck = {
    status: 'unverified',
    route: 'Digital innsending med testbruker',
    note: 'Siden etter introduksjonen er ukjent',
  };
  const run = render(plan);
  try {
    assert.equal(run.result.status, 1);
    assert.match(run.result.stderr, /verification cases require a source-mapped or browser-observed journey/);
  } finally {
    run.cleanup();
  }
});

test.each(['verified', 'source-mapped'])('rejects a %s route without evidence', (status) => {
  const plan = makePlan(false);
  plan.testCases[0].journeyCheck.status = status;
  delete plan.testCases[0].journeyCheck.evidence;
  const run = render(plan);
  try {
    assert.equal(run.result.status, 1);
    assert.match(run.result.stderr, /journeyCheck\.evidence must identify the route sources/);
  } finally {
    run.cleanup();
  }
});

test('rejects a case with no route check', () => {
  const plan = makePlan(false);
  delete plan.testCases[0].journeyCheck;
  const run = render(plan);
  try {
    assert.equal(run.result.status, 1);
    assert.match(run.result.stderr, /testCases\[0\]\.journeyCheck is required/);
  } finally {
    run.cleanup();
  }
});
