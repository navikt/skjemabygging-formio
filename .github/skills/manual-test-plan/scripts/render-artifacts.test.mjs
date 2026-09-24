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
  scope: { included: ['FyllUt-skjemaet'], excluded: ['Sendinn skal testes senere'] },
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
  forms: [
    {
      id: 'test-form',
      kind: 'production',
      title: 'Testskjema',
      path: 'testskjema',
      journeyCheck: { status: 'unverified', note: 'Oppsummering er ikke prøvd' },
    },
  ],
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
      formId: 'test-form',
      steps: [
        {
          action: 'Perform *action*',
          command: "curl 'https://example.invalid' | jq '.result'",
          expected: 'Result',
        },
      ],
      evidence: ['Noter resultatet'],
      cleanup: ['Slett challenge.json'],
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
      assert.match(publicOutput, /Sendinn skal testes senere/);
      assert.match(publicOutput, /Oppsummering er ikke prøvd/);
      assert.match(publicOutput, /Slett challenge(?:\\)?\.json/);
      assert.match(run.read('manifest.json'), /"schemaVersion": 3/);
      if (collaboration) {
        const slack = run.read('slack-canvas.md');
        assert.doesNotMatch(slack, /INTERNALMETHOD|INTERNALSETUP/);
        assert.doesNotMatch(slack, /github\.io|Detaljerte instruksjoner:/);
        assert.match(slack, /Før du starter:|Steg:/);
        assert.match(slack, /- \[ \] TC\\-01: Slett challenge\\\.json/);
        assert.match(slack, /- \[ \] Åpne skjemaet: Fjern testdata/);
        assert.match(slack, /Summary \$' and/);
        assert.match(publicOutput, /Summary \$&#39; and/);
        assert.match(publicOutput, /class="cleanup-checklist"/);
        assert.match(publicOutput, /<input type="checkbox" \/>TC-01: Slett challenge\.json/);
        assert.match(publicOutput, /<input type="checkbox" \/>Åpne skjemaet: Fjern testdata/);
      } else {
        assert.match(publicOutput, /&lt;details\\>/);
        assert.match(publicOutput, /Perform \\\*action\\\*/);
        assert.doesNotMatch(publicOutput, /Resultat og merknader:|Ikke tildelt/);
        assert.match(publicOutput, /Ingen særskilt risiko registrert/);
        assert.match(publicOutput, /\*\*Forventet:\*\* Skjemaet vises/);
        assert.match(publicOutput, /\*\*Delt tilstand:\*\* Delt testdata/);
        assert.match(publicOutput, /\*\*Område:\*\* Test/);
        assert.match(publicOutput, /\[B-01\]\(#b-01\)/);
        assert.match(publicOutput, /### B-01/);
        assert.match(publicOutput, /~~~sh\ncurl 'https:\/\/example\.invalid' \| jq '\.result'\n~~~/);
        assert.match(publicOutput, /- \[ \] TC\\-01: Slett challenge\\\.json/);
        assert.match(publicOutput, /- \[ \] Åpne skjemaet: Fjern testdata/);
        assert.doesNotMatch(publicOutput.match(/\*\*Dokumentasjon:\*\*.*/)?.[0] ?? '', /challenge/);
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

test('Canvas includes public integration checks without a Pages link', () => {
  const plan = makePlan(true);
  plan.integrations[0].evidence = {
    audience: 'public',
    method: 'Se kvitteringen',
    owner: 'Tester',
    instructions: ['Kontroller verdien'],
    expected: 'Verdien er riktig',
    repositoryReferences: [],
  };
  const run = render(plan);
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    const canvas = run.read('slack-canvas.md');
    assert.match(canvas, /Kontroll av internal service/);
    assert.match(canvas, /Kontroller verdien/);
    assert.doesNotMatch(canvas, /github\.io/);
  } finally {
    run.cleanup();
  }
});

test.each(['generated', 'production'])('rejects %s forms without an explicit journey check', (kind) => {
  const plan = makePlan(false);
  plan.forms[0].kind = kind;
  delete plan.forms[0].journeyCheck;
  const run = render(plan);
  try {
    assert.equal(run.result.status, 1);
    assert.match(run.result.stderr, /forms\[0\]\.journeyCheck\.status/);
  } finally {
    run.cleanup();
  }
});
