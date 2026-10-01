import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'vitest';

const script = resolve(import.meta.dirname, 'render-artifacts.mjs');
const makePlan = (withNonDevelopers) => ({
  schemaVersion: 4,
  slug: 'pr-123-test',
  title: 'Test $& <details>',
  summary: "Summary $' and *markdown*",
  scope: {
    included: ['FyllUt-skjemaet'],
    excluded: ['Sendinn skal testes senere'],
    notCoveredByTests: [{ area: 'Avbrutt innsending', reason: 'Dekkes av automatiserte feiltester' }],
  },
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
      skjemanummer: 'NAV 123.456',
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
  const invoke = (...args) =>
    spawnSync(process.execPath, [script, '--plan', planPath, '--out', out, ...args], {
      encoding: 'utf8',
    });
  const result = invoke();
  return {
    result,
    read: (name) => readFileSync(join(out, name), 'utf8'),
    rerun: () => invoke(),
    invoke,
    write: (name, content) => writeFileSync(join(out, name), content),
    exists: (name) => existsSync(join(out, name)),
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
      assert.match(publicOutput, /Avbrutt innsending/);
      assert.match(publicOutput, /Dekkes av automatiserte feiltester/);
      assert.match(publicOutput, /Testløpet er gjennomgått/);
      assert.match(publicOutput, /Slett challenge(?:\\)?\.json/);
      assert.match(run.read('manifest.json'), /"manifestVersion": 1/);
      if (collaboration) {
        assert.equal(run.exists('test-plan.pdf'), false);
        assert.match(run.result.stdout, /No PDF generated/);
        assert.doesNotMatch(run.read('manifest.json'), /pageUrl|github\.io|slack-canvas/);
        assert.match(publicOutput, /Summary \$&#39; and/);
        assert.match(publicOutput, /class="cleanup-checklist"/);
        assert.match(publicOutput, /<input type="checkbox" \/>TC-01: Slett challenge\.json/);
        assert.match(publicOutput, /<input type="checkbox" \/>Åpne skjemaet: Fjern testdata/);
        const contents = publicOutput.match(/<nav class="contents" aria-label="Innhold">([\s\S]*?)<\/nav>/)?.[1];
        assert.ok(contents);
        for (const target of [
          'dekning',
          'versjon',
          'oppsett',
          'testoppgaver',
          'tc-01',
          'opprydding',
          'oppforselsanalyse',
          'teknisk-informasjon',
        ]) {
          assert.match(contents, new RegExp(`href="#${target}"`));
          assert.match(publicOutput, new RegExp(`id="${target}"`));
        }
        assert.match(contents, /TC-01: A &lt;details&gt; test/);
        assert.match(publicOutput, /class="test-case" id="tc-01"/);
        assert.match(
          publicOutput,
          /<th>Skjemanummer<\/th>[\s\S]*?<a href="https:\/\/fyllut-preprod\.intern\.dev\.nav\.no\/fyllut\/testskjema">NAV 123\.456<\/a>/,
        );
        assert.doesNotMatch(publicOutput, /<th>Skjemasti<\/th>/);
        const caseHtml = publicOutput.match(/<details class="test-case" id="tc-01"[\s\S]*?<\/details>/)?.[0];
        assert.match(caseHtml, /<strong>Bakgrunn for testen:<\/strong> <a href="#b-01">B-01: A behavior<\/a>/);
        assert.ok(caseHtml.indexOf('Bakgrunn for testen:') < caseHtml.indexOf('Om testløpet'));
        assert.match(publicOutput, /\.contents \{\s*break-after: page;/);
        assert.match(publicOutput, /\.test-case \+ \.test-case \{\s*break-before: page;/);
        assert.match(publicOutput, /\.step \{\s*break-inside: avoid;/);
        assert.match(publicOutput, /details \{\s*break-inside: auto;\s*overflow: visible;/);
      } else {
        assert.match(publicOutput, /&lt;details\\>/);
        assert.match(publicOutput, /Perform \\\*action\\\*/);
        assert.doesNotMatch(publicOutput, /Resultat og merknader:|Ikke tildelt/);
        assert.match(publicOutput, /Ingen særskilt risiko registrert/);
        assert.match(publicOutput, /\*\*Forventet:\*\* Skjemaet vises/);
        assert.match(publicOutput, /\*\*Delt tilstand:\*\* Delt testdata/);
        assert.match(publicOutput, /\*\*Område:\*\* Test/);
        assert.match(publicOutput, /\[B\\-01: A behavior\]\(#b-01\)/);
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

test.each(['preprod', 'preprod-alt'])('uses matching FyllUt ingresses for %s', (name) => {
  const plan = makePlan(true);
  plan.environment.name = name;
  plan.environment.internBaseUrl = `https://fyllut-${name}.intern.dev.nav.no/fyllut`;
  plan.environment.ansattBaseUrl = `https://fyllut-${name}.ansatt.dev.nav.no/fyllut`;
  plan.environment.revisionCheck.endpoint = `${plan.environment.internBaseUrl}/api/config`;
  const run = render(plan);
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    assert.match(
      run.read('index.html'),
      new RegExp(`href="https://fyllut-${name}\\.intern\\.dev\\.nav\\.no/fyllut/testskjema">NAV 123\\.456</a>`),
    );
  } finally {
    run.cleanup();
  }
});

test('accepts matching Bygger ingresses with a supplied revision check', () => {
  const plan = makePlan(false);
  plan.environment.internBaseUrl = 'https://skjemabygging-preprod.intern.dev.nav.no';
  plan.environment.ansattBaseUrl = 'https://skjemabygging-preprod.ansatt.dev.nav.no';
  plan.environment.revisionCheck.endpoint = 'https://skjemabygging-preprod.intern.dev.nav.no/approved-check';
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

test('rejects a revision check pointed at the other preprod environment', () => {
  const plan = makePlan(false);
  plan.environment.revisionCheck.endpoint = 'https://fyllut-preprod-alt.intern.dev.nav.no/fyllut/api/config';
  const run = render(plan);
  try {
    assert.equal(run.result.status, 1);
    assert.match(run.result.stderr, /environment URLs must all point to the selected preprod environment/);
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

test('shows links to every related background point before the collapsed journey', () => {
  const plan = makePlan(true);
  plan.behaviorAnalysis.push({
    ...structuredClone(plan.behaviorAnalysis[0]),
    id: 'B-02',
    behavior: 'Another behavior',
  });
  plan.testCases[0].behaviorIds.push('B-02');
  const run = render(plan);
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    const html = run.read('index.html');
    const caseStart = html.indexOf('<details class="test-case" id="tc-01"');
    const journeyDetails = html.indexOf('<summary>Om testløpet</summary>', caseStart);
    for (const [id, title] of [
      ['b-01', 'A behavior'],
      ['b-02', 'Another behavior'],
    ]) {
      const link = html.indexOf(`<a href="#${id}">${id.toUpperCase()}: ${title}</a>`, caseStart);
      assert.ok(link > caseStart && link < journeyDetails, `missing visible link to ${id}`);
      assert.match(html, new RegExp(`id="${id}"`));
    }
  } finally {
    run.cleanup();
  }
});

test('rejects obsolete artifact manifests instead of attempting legacy cleanup', () => {
  const run = render(makePlan(false));
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    run.write('manifest.json', JSON.stringify({ manifestVersion: 2, files: [] }));
    const rerun = run.rerun();
    assert.equal(rerun.status, 1);
    assert.match(rerun.stderr, /supported manifestVersion/);
  } finally {
    run.cleanup();
  }
});

test('still accepts a manifest written with the legacy schemaVersion field', () => {
  const run = render(makePlan(false));
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    const manifest = JSON.parse(run.read('manifest.json'));
    const { manifestVersion, ...rest } = manifest;
    run.write('manifest.json', JSON.stringify({ schemaVersion: 3, ...rest }));
    const rerun = run.rerun();
    assert.equal(rerun.status, 0, rerun.stderr);
    assert.match(run.read('manifest.json'), /"manifestVersion": 1/);
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

test('keeps a manually printed PDF on rerender without claiming it is current', () => {
  const run = render(makePlan(true));
  try {
    assert.equal(run.result.status, 0);
    const manualPdf = '%PDF-1.7\nManually printed plan\n%%EOF\n';
    run.write('test-plan.pdf', manualPdf);
    const rerun = run.rerun();
    assert.equal(rerun.status, 0, rerun.stderr);
    assert.equal(run.read('test-plan.pdf'), manualPdf);
    assert.match(rerun.stdout, /unmanaged test-plan\.pdf exists; rerendering did not update it/);
    assert.doesNotMatch(run.read('manifest.json'), /test-plan\.pdf/);
  } finally {
    run.cleanup();
  }
});

test('refuses to remove a PDF tracked by an older manifest', () => {
  const run = render(makePlan(true));
  try {
    assert.equal(run.result.status, 0);
    const pdf = '%PDF-1.7\nOld plan\n%%EOF\n';
    run.write('test-plan.pdf', pdf);
    const manifest = JSON.parse(run.read('manifest.json'));
    manifest.files.push({ path: 'test-plan.pdf', sha256: 'a'.repeat(64) });
    run.write('manifest.json', JSON.stringify(manifest));
    const rerun = run.rerun();
    assert.equal(rerun.status, 1);
    assert.match(rerun.stderr, /move it outside the output directory before rerendering/);
    assert.equal(run.read('test-plan.pdf'), pdf);
    assert.equal(run.read('manifest.json'), JSON.stringify(manifest));
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

test('keeps public integration checks in the printable HTML', () => {
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
    assert.match(run.read('index.html'), /<summary>Se kvitteringen<\/summary>/);
    assert.match(run.read('index.html'), /Kontroller verdien/);
  } finally {
    run.cleanup();
  }
});

test('preserves long case instructions in the printable HTML', () => {
  const plan = makePlan(true);
  plan.testCases = [1, 2, 3].map((number) => ({
    ...structuredClone(plan.testCases[0]),
    id: `TC-0${number}`,
    title: `Sak ${number}`,
    steps: Array.from({ length: 20 }, (_, index) => ({
      action: `Unik handling ${number}-${index}`,
      expected: `Unikt resultat ${number}-${index}`,
    })),
  }));
  const run = render(plan);
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    const html = run.read('index.html');
    assert.match(html, /Unik handling 3-19/);
    assert.match(html, /Unikt resultat 3-19/);
    assert.equal(run.exists('test-plan.pdf'), false);
  } finally {
    run.cleanup();
  }
});

test.each([false, true])(
  'keeps navigation steps without unnecessary assessments (collaboration: %s)',
  (collaboration) => {
    const plan = makePlan(collaboration);
    plan.testCases[0].steps.unshift({ action: 'Åpne skjemaet og gå til første side.' });
    const run = render(plan);
    try {
      assert.equal(run.result.status, 0, run.result.stderr);
      const output = run.read(collaboration ? 'index.html' : 'github-issue.md');
      assert.match(output, /Åpne skjemaet og gå til første side/);
      assert.match(output, /Forventet:.*Result/s);
      if (collaboration) {
        assert.match(output, /<li class="step">Åpne skjemaet og gå til første side\.<\/li>/);
        assert.match(output, /Bruk bare syntetiske personopplysninger og filer\./);
        assert.match(output, /<summary>Om testløpet<\/summary>/);
      } else {
        assert.ok(output.indexOf('**Forventet:** Result') > output.indexOf('2. Perform'));
      }
    } finally {
      run.cleanup();
    }
  },
);

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

test.each([false, true])('renders distinct submission verification options (collaboration: %s)', (collaboration) => {
  const plan = makePlan(collaboration);
  if (collaboration) plan.testCases.push({ ...structuredClone(plan.testCases[0]), id: 'TC-02' });
  plan.integrations[0].system = 'innsending-api';
  plan.integrations[0].evidence = {
    options: [
      {
        id: 'team-logs',
        audience: 'public',
        method: 'Teamlogger i GCP',
        owner: 'Utvikler med loggtilgang',
        url: 'https://console.cloud.google.com/logs/query?project=team-soknad-dev-ee5e',
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
    assert.match(publicOutput, /Verifikasjon/);
    for (const text of ['Teamlogger i GCP', 'Journalpost i Joark']) {
      assert.match(publicOutput, new RegExp(text));
    }
    for (const text of ['Overlevering', 'Kontrollen står åpen']) {
      if (collaboration) {
        assert.match(publicOutput, new RegExp(text));
      } else {
        assert.doesNotMatch(publicOutput, new RegExp(text));
      }
    }
    assert.match(publicOutput, /console\.cloud\.google\.com\/logs\/query\?project=team-soknad-dev-ee5e/);
    assert.doesNotMatch(publicOutput, /Kontroll av innsending-api:/);
    if (collaboration) {
      for (const title of ['Teamlogger i GCP', 'Journalpost i Joark', 'Overlevering']) {
        assert.match(
          publicOutput,
          new RegExp(
            `<details name="verification-TC-01-INT-01" class="integration-evidence">\\s*<summary>${title}</summary>`,
          ),
        );
      }
      assert.equal(publicOutput.match(/name="verification-TC-01-INT-01"/g)?.length, 3);
      assert.equal(publicOutput.match(/name="verification-TC-02-INT-01"/g)?.length, 3);
      assert.doesNotMatch(publicOutput, /<details name="verification-TC-01-INT-01" class="integration-evidence" open>/);
    }
    assert.doesNotMatch(publicOutput, /INTERNALMETHOD|INTERNALSTEP/);
    assert.match(run.read('internal-instructions.md'), /INTERNALMETHOD/);
  } finally {
    run.cleanup();
  }
});

test('keeps choices for separate integrations independent', () => {
  const plan = makePlan(true);
  plan.integrations[0].evidence = {
    options: [
      {
        id: 'team-logs',
        audience: 'public',
        method: 'Logs',
        owner: 'Tester',
        instructions: ['Finn innsending'],
        expected: 'Riktig innsending',
      },
      {
        id: 'joark',
        audience: 'public',
        method: 'Joark',
        owner: 'Tester',
        instructions: ['Finn journalpost'],
        expected: 'Riktig journalpost',
      },
    ],
  };
  const secondIntegration = structuredClone(plan.integrations[0]);
  secondIntegration.id = 'INT-02';
  secondIntegration.system = 'familie-pdf';
  secondIntegration.evidence.options = [
    {
      id: 'pdf',
      audience: 'public',
      method: 'Åpne PDF',
      owner: 'Tester',
      instructions: ['Åpne fil'],
      expected: 'Riktig innhold',
    },
  ];
  plan.integrations.push(secondIntegration);
  plan.testCases[0].integrationIds.push('INT-02');
  const run = render(plan);
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    const html = run.read('index.html');
    assert.equal(html.match(/name="verification-TC-01-INT-01"/g)?.length, 2);
    assert.equal(html.match(/name="verification-TC-01-INT-02"/g)?.length, 1);
    assert.match(html, /item\.removeAttribute\('name'\);\s*item\.open = true/);
    assert.match(
      html,
      /<details name="verification-TC-01-INT-02" class="integration-evidence" open>\s*<summary>Åpne PDF<\/summary>/,
    );
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

test.each([false, true])('renders source-mapped verification cases (collaboration: %s)', (collaboration) => {
  const plan = makePlan(collaboration);
  plan.testCases[0].journeyCheck = {
    status: 'source-mapped',
    route: 'Papirinnsending, person som avsender',
    note: 'Kontroller sidene ved oppstart i preprod',
    evidence: ['PR head form revision 1: panels', 'paper.cy.ts: submission and summary'],
  };
  const run = render(plan);
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    const publicOutput = run.read(collaboration ? 'index.html' : 'github-issue.md');
    assert.match(publicOutput, /Kartlagt fra kilder, ikke prøvd i preprod/);
    assert.match(publicOutput, /Verifikasjon/);
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
  } finally {
    run.cleanup();
  }
});

test('accepts an exploratory assessment of a mapped, known behavior', () => {
  const plan = makePlan(false);
  plan.testCases[0].mode = 'exploratory';
  plan.testCases[0].steps[0].expected = 'Noter hva som skjer og vurder resultatet mot behovet';
  const run = render(plan);
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    assert.match(run.read('github-issue.md'), /Utforskende/);
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
    assert.match(issue, /TC-01:[\s\S]*?Prøvd i nettleser: Testløpet er gjennomgått[\s\S]*?TC-02:/);
    assert.match(issue, /TC-02:[\s\S]*?Testløpet er ikke kartlagt: Denne grenen er ikke gjennomgått/);
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

test('renders a plan for a pull request without a linked issue', () => {
  const plan = makePlan(true);
  delete plan.source.issue;
  const run = render(plan);
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    assert.doesNotMatch(run.read('index.html'), /<strong>Sak:<\/strong>/);
  } finally {
    run.cleanup();
  }
});
