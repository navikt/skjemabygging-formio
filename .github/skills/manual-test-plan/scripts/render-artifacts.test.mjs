import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'vitest';

const script = resolve(import.meta.dirname, 'render-artifacts.mjs');
const makePlan = (withNonDevelopers) => ({
  schemaVersion: 3,
  slug: 'pr-123-test',
  title: 'Test $& <details>',
  summary: "Summary $' and *markdown*",
  collaboration: { withNonDevelopers },
  source: {
    repository: 'navikt/skjemabygging-formio',
    type: 'pull-request',
    number: 123,
    url: 'https://github.com/navikt/skjemabygging-formio/pull/123',
    ref: 'feature/test',
    commitSha: 'a'.repeat(40),
  },
  environment: {
    name: 'preprod',
    internBaseUrl: 'https://fyllut-preprod.intern.dev.nav.no/fyllut',
    ansattBaseUrl: 'https://fyllut-preprod.ansatt.dev.nav.no/fyllut',
    revisionCheck: { endpoint: 'https://fyllut-preprod.intern.dev.nav.no/fyllut/api/config', field: 'gitVersion' },
  },
  integrations: [
    {
      id: 'INT-01',
      system: 'internal service',
      behaviorIds: ['B-01'],
      evidence: {
        audience: 'internal',
        method: 'INTERNALMETHOD',
        owner: 'developer',
        instructions: ['INTERNALSTEP'],
        expected: 'INTERNALRESULT',
        repositoryReferences: ['mocks/mocks/routes/innsending-api.ts'],
      },
    },
  ],
  setupActions: [
    {
      id: 'SETUP-01',
      audience: 'internal',
      kind: 'other',
      title: 'INTERNALSETUP',
      steps: ['INTERNALACTION'],
      verification: ['Verify internally'],
      sharedStateWarning: 'INTERNALSHAREDSTATE',
      cleanup: ['INTERNALCLEANUP'],
      expected: 'Internal expected',
    },
    {
      id: 'SETUP-02',
      audience: 'public',
      kind: 'other',
      title: 'Åpne skjemaet',
      steps: ['Åpne testsiden'],
      verification: ['Kontroller skjemaet'],
      sharedStateWarning: 'Delt testdata',
      cleanup: ['Fjern testdata'],
      expected: 'Skjemaet vises',
    },
  ],
  forms: [],
  behaviorAnalysis: [
    {
      id: 'B-01',
      behavior: 'A behavior',
      before: 'Before',
      intended: 'Intent',
      implemented: 'Change',
      evidence: ['Issue 123'],
      confidence: 'high',
      status: 'aligned',
    },
  ],
  testCases: [
    {
      id: 'TC-01',
      group: 'Test',
      title: 'A <details> test',
      mode: 'verification',
      behaviorIds: ['B-01'],
      integrationIds: ['INT-01'],
      priority: 'P0',
      purpose: 'Check $&',
      steps: [{ action: 'Perform *action*', expected: 'Result' }],
    },
  ],
});

const render = (plan) => {
  const directory = mkdtempSync(join(tmpdir(), 'render-artifacts-test-'));
  const planPath = join(directory, 'plan.json');
  const out = join(directory, 'output');
  writeFileSync(planPath, JSON.stringify(plan));
  const result = spawnSync(process.execPath, [script, '--plan', planPath, '--out', out], { encoding: 'utf8' });
  return {
    result,
    read: (name) => readFileSync(join(out, name), 'utf8'),
    rerun: () => spawnSync(process.execPath, [script, '--plan', planPath, '--out', out], { encoding: 'utf8' }),
    write: (name, content) => writeFileSync(join(out, name), content),
    cleanup: () => rmSync(directory, { recursive: true }),
  };
};

test.each([false, true])(
  'renders optional arrays without leaking internal instructions (collaboration: %s)',
  (collaboration) => {
    const run = render(makePlan(collaboration));
    try {
      assert.equal(run.result.status, 0, run.result.stderr);
      const publicOutput = run.read(collaboration ? 'index.html' : 'github-issue.md');
      const internalOutput = run.read('internal-instructions.md');
      for (const text of [
        'INTERNALSETUP',
        'INTERNALMETHOD',
        'INTERNALSTEP',
        'INTERNALSHAREDSTATE',
        'INTERNALCLEANUP',
      ]) {
        assert.doesNotMatch(publicOutput, new RegExp(text));
        assert.match(internalOutput, new RegExp(text));
      }
      assert.match(internalOutput, /^# Internal instructions for PR #123/m);
      assert.match(internalOutput, /## Internal setup/);
      assert.match(internalOutput, /## Integration evidence/);
      for (const label of ['Expected', 'Verify', 'Shared state', 'Cleanup', 'Method', 'Owner', 'References']) {
        assert.match(internalOutput, new RegExp(`\\*\\*${label}:\\*\\*`));
      }
      assert.doesNotMatch(internalOutput, /Forventet|Kontroller:|Delt tilstand|Rydd opp|Metode|Ansvarlig|Referanser/);
      assert.match(publicOutput, /Test \$&/);
      assert.match(run.read('manifest.json'), /"schemaVersion": 3/);
      if (collaboration) {
        const slack = run.read('slack-canvas.md');
        assert.doesNotMatch(slack, /INTERNALMETHOD|INTERNALSETUP/);
        assert.match(slack, /pr-123-test\/#tc-01/);
        assert.match(slack, /Summary \$' and/);
        assert.match(publicOutput, /Summary \$&#39; and/);
      } else {
        assert.match(publicOutput, /&lt;details\\>/);
        assert.match(publicOutput, /Perform \\\*action\\\*/);
        assert.match(publicOutput, /Ingen særskilt risiko registrert/);
        assert.match(publicOutput, /\*\*Forventet:\*\* Skjemaet vises/);
        assert.match(publicOutput, /\*\*Delt tilstand:\*\* Delt testdata/);
        assert.match(publicOutput, /\*\*Rydd opp:\*\*/);
      }
    } finally {
      run.cleanup();
    }
  },
);

test('rejects obsolete artifact manifests instead of attempting legacy cleanup', () => {
  const run = render(makePlan(false));
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    run.write('manifest.json', JSON.stringify({ schemaVersion: 2, files: [] }));
    const rerun = run.rerun();
    assert.equal(rerun.status, 1);
    assert.match(rerun.stderr, /supported schemaVersion/);
  } finally {
    run.cleanup();
  }
});
