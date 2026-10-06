import assert from 'node:assert/strict';
import { test } from 'vitest';
import { makePlan, render } from './test-helpers.mjs';

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

test.each([false, true])('checks the deployed branch instead of the commit (collaboration: %s)', (collaboration) => {
  const run = render(makePlan(collaboration));
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    const output = run.read(collaboration ? 'index.html' : 'github-issue.md');
    const preflight = collaboration
      ? output.match(/<section class="card preflight" id="versjon">([\s\S]*?)<\/section>/)?.[1]
      : output.match(/## Kontroller versjonen[\s\S]*?(?=\n## )/)?.[0];
    assert.ok(preflight);
    assert.match(preflight, /https:\/\/fyllut-preprod\.intern\.dev\.nav\.no\/fyllut\//);
    assert.match(preflight, /git-branch/);
    assert.match(preflight, /feature\/test/);
    assert.match(preflight, /Noter verdien av .{0,7}git-version/);
    assert.doesNotMatch(preflight, /a{40}|api\/config|gitVersion/);
  } finally {
    run.cleanup();
  }
});
