import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'vitest';

const script = resolve(import.meta.dirname, 'render-artifacts.mjs');
const makePlan = (withNonDevelopers) => ({
  schemaVersion: 4,
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
      journeyCheck: {
        status: 'verified',
        route: 'Digital innsending med testbruker',
        note: 'Testløpet er gjennomgått',
        evidence: ['Skjemarevisjon 1, gjennomgått i FyllUt'],
      },
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
      assert.match(publicOutput, /Testløpet er gjennomgått/);
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

test.each([false, true])('renders distinct submission verification options (collaboration: %s)', (collaboration) => {
  const plan = makePlan(collaboration);
  plan.integrations[0].system = 'innsending-api';
  plan.integrations[0].evidence = {
    options: [
      {
        id: 'team-logs',
        audience: 'public',
        method: 'Teamlogger i GCP',
        owner: 'Utvikler med loggtilgang',
        url: 'https://console.cloud.google.com/logs?project=team-soknad-dev&query=(test)',
        instructions: [
          'Finn innsendingen ved tidspunkt og skjemanummer',
          'Sammenlign avsender og bruker hvis feltene vises',
        ],
        expected: 'Riktig avsender og bruker; ellers må saken kontrolleres i Joark',
      },
      {
        id: 'joark',
        audience: 'public',
        method: 'Journalpost i Joark',
        owner: 'Tester med Joark-tilgang',
        instructions: ['Finn journalposten for riktig innsending'],
        expected: 'Riktig avsender og bruker er registrert',
      },
      {
        id: 'handoff',
        audience: 'public',
        method: 'Ingen innsyn',
        owner: 'Tester uten tilgang',
        instructions: ['Noter tidspunkt, skjemanummer og identiteter i teamets notat'],
        expected: 'Kontrollen står åpen til en med tilgang har undersøkt innsendingen',
      },
      {
        id: 'private-procedure',
        audience: 'internal',
        method: 'INTERNALMETHOD',
        owner: 'developer',
        instructions: ['INTERNALSTEP'],
        expected: 'INTERNALRESULT',
        repositoryReferences: ['docs/procedure.md'],
      },
    ],
  };
  const run = render(plan);
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    const publicOutput = run.read(collaboration ? 'index.html' : 'github-issue.md');
    const canvas = collaboration ? run.read('slack-canvas.md') : '';
    for (const text of ['Teamlogger i GCP', 'Journalpost i Joark']) {
      assert.match(publicOutput, new RegExp(text));
      if (collaboration) assert.match(canvas, new RegExp(text));
    }
    for (const text of ['Ingen innsyn', 'Kontrollen står åpen']) {
      if (collaboration) {
        assert.match(publicOutput, new RegExp(text));
        assert.match(canvas, new RegExp(text));
      } else {
        assert.doesNotMatch(publicOutput, new RegExp(text));
      }
    }
    assert.match(publicOutput, /console\.cloud\.google\.com\/logs\?project=team-soknad-dev/);
    assert.match(collaboration ? canvas : publicOutput, /query=%28test%29/);
    assert.doesNotMatch(publicOutput, /INTERNALMETHOD|INTERNALSTEP/);
    assert.match(run.read('internal-instructions.md'), /INTERNALMETHOD/);
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

test('requires handoff only when non-developers collaborate', () => {
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

test('accepts team logs and Joark without handoff for a non-collaborative issue', () => {
  const plan = makePlan(false);
  plan.integrations[0].system = 'innsending-api';
  plan.integrations[0].evidence = {
    options: ['team-logs', 'joark'].map((id) => ({
      id,
      audience: 'public',
      method: id === 'team-logs' ? 'Teamlogger i GCP' : 'Journalpost i Joark',
      owner: 'Utvikler',
      instructions: ['Finn riktig innsending'],
      expected: 'Rollene stemmer',
    })),
  };
  const run = render(plan);
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    assert.match(run.read('github-issue.md'), /Teamlogger i GCP/);
    assert.match(run.read('github-issue.md'), /Journalpost i Joark/);
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
    assert.match(run.result.stderr, /verification cases require a verified journey/);
  } finally {
    run.cleanup();
  }
});

test('rejects a verified route without walkthrough evidence', () => {
  const plan = makePlan(false);
  delete plan.testCases[0].journeyCheck.evidence;
  const run = render(plan);
  try {
    assert.equal(run.result.status, 1);
    assert.match(run.result.stderr, /journeyCheck\.evidence must identify how the route was checked/);
  } finally {
    run.cleanup();
  }
});

test.each([false, true])('shows the unchecked route on exploratory cases (collaboration: %s)', (collaboration) => {
  const plan = makePlan(collaboration);
  plan.testCases[0].mode = 'exploratory';
  plan.testCases[0].journeyCheck = {
    status: 'unverified',
    route: 'Papirinnsending, valg B',
    note: 'Siden etter valget er ikke gjennomgått',
  };
  const run = render(plan);
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    const publicOutput = run.read(collaboration ? 'index.html' : 'github-issue.md');
    assert.match(publicOutput, /Papirinnsending, valg B/);
    assert.match(publicOutput, /Siden etter valget er ikke gjennomgått/);
    if (collaboration) assert.match(run.read('slack-canvas.md'), /Papirinnsending, valg B/);
  } finally {
    run.cleanup();
  }
});

test('tracks separate routes through the same form independently', () => {
  const plan = makePlan(false);
  const alternate = structuredClone(plan.testCases[0]);
  alternate.id = 'TC-02';
  alternate.mode = 'exploratory';
  alternate.journeyCheck = {
    status: 'unverified',
    route: 'Papirinnsending, valg B',
    note: 'Denne grenen er ikke gjennomgått',
  };
  plan.testCases.push(alternate);
  const run = render(plan);
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    const issue = run.read('github-issue.md');
    assert.match(issue, /TC-01:[\s\S]*?Løpet er kontrollert: Testløpet er gjennomgått[\s\S]*?TC-02:/);
    assert.match(issue, /TC-02:[\s\S]*?Løpet er ikke kontrollert: Denne grenen er ikke gjennomgått/);
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
    assert.match(run.result.stderr, /testCases\[0\]\.journeyCheck\.status/);
  } finally {
    run.cleanup();
  }
});
