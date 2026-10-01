import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

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

export { makePlan, render };
