#!/usr/bin/env node

import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const skillDirectory = resolve(scriptDirectory, '..');

const fail = (message) => {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
};

const getArgument = (name) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
};

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  process.stdout.write(`Usage:
  node render-artifacts.mjs --plan <plan.json> --out <directory> [--page-url <url>]

Generates either index.html and slack-canvas.md, or github-issue.md, plus
manifest.json and any generated form files.
`);
  process.exit(0);
}

const planArgument = getArgument('--plan');
const outputArgument = getArgument('--out');
const configuredPageUrl = getArgument('--page-url');

if (!planArgument || !outputArgument) {
  fail('--plan and --out are required');
}

const planPath = resolve(planArgument);
const outputDirectory = resolve(outputArgument);
const planDirectory = dirname(planPath);

const asNonEmptyString = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) {
    fail(`${field} must be a non-empty string`);
  }
  return value.trim();
};

const asStringArray = (value, field) => {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    fail(`${field} must be an array of strings`);
  }
  return value;
};

const asHttpUrl = (value, field) => {
  let url;
  try {
    url = new URL(asNonEmptyString(value, field));
  } catch {
    fail(`${field} must be a valid URL`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    fail(`${field} must use http or https`);
  }
  return url.toString();
};

const plan = (() => {
  try {
    return JSON.parse(readFileSync(planPath, 'utf8'));
  } catch (error) {
    fail(`could not read plan JSON: ${error.message}`);
  }
})();

if (plan.schemaVersion !== 3) {
  fail('schemaVersion must be 3');
}

asNonEmptyString(plan.slug, 'slug');
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(plan.slug)) {
  fail('slug must contain lowercase letters, numbers, and hyphens only');
}
asNonEmptyString(plan.title, 'title');
asNonEmptyString(plan.summary, 'summary');
if (!plan.collaboration || typeof plan.collaboration.withNonDevelopers !== 'boolean') {
  fail('collaboration.withNonDevelopers must be a boolean');
}

if (!plan.source || typeof plan.source !== 'object') {
  fail('source is required');
}
const sourceRepository = asNonEmptyString(plan.source.repository, 'source.repository');
if (!/^[^/\s]+\/[^/\s]+$/.test(sourceRepository)) {
  fail('source.repository must use owner/repository format');
}
if (plan.source.type !== 'pull-request') {
  fail('source.type must be pull-request');
}
if (!Number.isInteger(plan.source.number) || plan.source.number <= 0) {
  fail('source.number must be a positive pull request number');
}
const sourceUrl = new URL(asHttpUrl(plan.source.url, 'source.url'));
if (
  sourceUrl.hostname !== 'github.com' ||
  sourceUrl.pathname.replace(/\/$/, '') !== `/${sourceRepository}/pull/${plan.source.number}`
) {
  fail('source.url must match source.repository and source.number');
}
if (plan.source.issue !== undefined) {
  const issueUrl = new URL(asHttpUrl(plan.source.issue?.url, 'source.issue.url'));
  if (
    !plan.source.issue ||
    !Number.isInteger(plan.source.issue.number) ||
    plan.source.issue.number <= 0 ||
    issueUrl.hostname !== 'github.com' ||
    issueUrl.pathname.replace(/\/$/, '') !== `/${sourceRepository}/issues/${plan.source.issue.number}`
  ) {
    fail('source.issue must identify an issue in source.repository');
  }
}
asNonEmptyString(plan.source.ref, 'source.ref');
const expectedCommit = asNonEmptyString(plan.source.commitSha, 'source.commitSha');
if (!/^[0-9a-f]{40}$/i.test(expectedCommit)) {
  fail('source.commitSha must be a 40-character Git commit SHA');
}

if (!plan.environment || typeof plan.environment !== 'object') {
  fail('environment is required');
}
asNonEmptyString(plan.environment.name, 'environment.name');
const internBaseUrl = asHttpUrl(plan.environment.internBaseUrl, 'environment.internBaseUrl').replace(/\/$/, '');
const ansattBaseUrl = asHttpUrl(plan.environment.ansattBaseUrl, 'environment.ansattBaseUrl').replace(/\/$/, '');
if (!plan.environment.revisionCheck || typeof plan.environment.revisionCheck !== 'object') {
  fail('environment.revisionCheck is required');
}
const revisionEndpoint = asHttpUrl(plan.environment.revisionCheck.endpoint, 'environment.revisionCheck.endpoint');
const revisionField = asNonEmptyString(plan.environment.revisionCheck.field, 'environment.revisionCheck.field');

if (
  !Array.isArray(plan.integrations) ||
  !Array.isArray(plan.setupActions) ||
  !Array.isArray(plan.forms) ||
  !Array.isArray(plan.testCases)
) {
  fail('integrations, setupActions, forms, and testCases must be arrays');
}

plan.risks = asStringArray(plan.risks ?? [], 'risks');

if (!Array.isArray(plan.behaviorAnalysis) || plan.behaviorAnalysis.length === 0) {
  fail('behaviorAnalysis must contain at least one behavior');
}
const behaviors = new Map();
for (const [index, behavior] of plan.behaviorAnalysis.entries()) {
  const prefix = `behaviorAnalysis[${index}]`;
  const id = asNonEmptyString(behavior.id, `${prefix}.id`);
  if (!/^B-\d+$/.test(id)) {
    fail(`${prefix}.id must match B-<number>`);
  }
  if (behaviors.has(id)) {
    fail(`duplicate behavior id: ${id}`);
  }
  for (const field of ['behavior', 'before', 'intended', 'implemented']) {
    asNonEmptyString(behavior[field], `${prefix}.${field}`);
  }
  const evidence = asStringArray(behavior.evidence, `${prefix}.evidence`);
  if (evidence.length === 0) {
    fail(`${prefix}.evidence must contain at least one source`);
  }
  if (!['high', 'medium', 'low'].includes(behavior.confidence)) {
    fail(`${prefix}.confidence must be high, medium, or low`);
  }
  if (!['aligned', 'suspected-defect', 'open-question'].includes(behavior.status)) {
    fail(`${prefix}.status must be aligned, suspected-defect, or open-question`);
  }
  if (behavior.status === 'open-question' && behavior.confidence === 'high') {
    fail(`${prefix} open questions cannot have high confidence`);
  }
  if (behavior.status !== 'open-question' && behavior.confidence !== 'high') {
    fail(`${prefix} aligned and suspected-defect behaviors require high confidence`);
  }
  behaviors.set(id, behavior);
}

const formIds = new Set();
for (const [index, form] of plan.forms.entries()) {
  const prefix = `forms[${index}]`;
  const id = asNonEmptyString(form.id, `${prefix}.id`);
  if (formIds.has(id)) {
    fail(`duplicate form id: ${id}`);
  }
  formIds.add(id);
  if (!['production', 'generated'].includes(form.kind)) {
    fail(`${prefix}.kind must be production or generated`);
  }
  asNonEmptyString(form.path, `${prefix}.path`);
  asNonEmptyString(form.title, `${prefix}.title`);
}

const integrations = new Map();
for (const [index, integration] of plan.integrations.entries()) {
  const prefix = `integrations[${index}]`;
  const id = asNonEmptyString(integration.id, `${prefix}.id`);
  if (!/^INT-\d+$/.test(id)) {
    fail(`${prefix}.id must match INT-<number>`);
  }
  if (integrations.has(id)) {
    fail(`duplicate integration id: ${id}`);
  }
  asNonEmptyString(integration.system, `${prefix}.system`);
  if (!Array.isArray(integration.behaviorIds) || integration.behaviorIds.length === 0) {
    fail(`${prefix}.behaviorIds must contain at least one behavior id`);
  }
  for (const behaviorId of integration.behaviorIds) {
    if (!behaviors.has(behaviorId)) {
      fail(`${prefix}.behaviorIds references unknown behavior ${behaviorId}`);
    }
  }
  if (!integration.evidence || typeof integration.evidence !== 'object') {
    fail(`${prefix}.evidence is required`);
  }
  if (!['public', 'internal'].includes(integration.evidence.audience)) {
    fail(`${prefix}.evidence.audience must be public or internal`);
  }
  for (const field of ['method', 'owner', 'expected']) {
    asNonEmptyString(integration.evidence[field], `${prefix}.evidence.${field}`);
  }
  const instructions = asStringArray(integration.evidence.instructions, `${prefix}.evidence.instructions`);
  if (instructions.length === 0) {
    fail(`${prefix}.evidence.instructions must contain at least one step`);
  }
  asStringArray(integration.evidence.repositoryReferences, `${prefix}.evidence.repositoryReferences`);
  integrations.set(id, integration);
}

const setupIds = new Set();
for (const [index, action] of plan.setupActions.entries()) {
  const prefix = `setupActions[${index}]`;
  const id = asNonEmptyString(action.id, `${prefix}.id`);
  if (!/^SETUP-\d+$/.test(id)) {
    fail(`${prefix}.id must match SETUP-<number>`);
  }
  if (setupIds.has(id)) {
    fail(`duplicate setup action id: ${id}`);
  }
  setupIds.add(id);
  if (!['public', 'internal'].includes(action.audience)) {
    fail(`${prefix}.audience must be public or internal`);
  }
  if (
    !['forms-api-import', 'form-verification', 'test-user', 'feature-toggle', 'shared-state', 'other'].includes(
      action.kind,
    )
  ) {
    fail(`${prefix}.kind is invalid`);
  }
  asNonEmptyString(action.title, `${prefix}.title`);
  asNonEmptyString(action.expected, `${prefix}.expected`);
  const steps = asStringArray(action.steps, `${prefix}.steps`);
  const verification = asStringArray(action.verification, `${prefix}.verification`);
  const cleanup = asStringArray(action.cleanup, `${prefix}.cleanup`);
  if (steps.length === 0 || verification.length === 0) {
    fail(`${prefix}.steps and verification must not be empty`);
  }
  if (action.formId && !formIds.has(action.formId)) {
    fail(`${prefix}.formId references unknown form ${action.formId}`);
  }
  if (action.kind === 'forms-api-import') {
    if (!action.formId) {
      fail(`${prefix}.formId is required for Forms API imports`);
    }
    asNonEmptyString(action.sharedStateWarning, `${prefix}.sharedStateWarning`);
    if (cleanup.length === 0) {
      fail(`${prefix}.cleanup must describe deletion, restoration, or retention`);
    }
  } else if (action.sharedStateWarning !== undefined) {
    asNonEmptyString(action.sharedStateWarning, `${prefix}.sharedStateWarning`);
  }
}

const caseIds = new Set();
const referencedIntegrationIds = new Set();
for (const [index, testCase] of plan.testCases.entries()) {
  const prefix = `testCases[${index}]`;
  const id = asNonEmptyString(testCase.id, `${prefix}.id`);
  if (!/^TC-\d+$/.test(id)) {
    fail(`${prefix}.id must match TC-<number>`);
  }
  if (caseIds.has(id)) {
    fail(`duplicate test case id: ${id}`);
  }
  caseIds.add(id);
  asNonEmptyString(testCase.group, `${prefix}.group`);
  asNonEmptyString(testCase.title, `${prefix}.title`);
  asNonEmptyString(testCase.purpose, `${prefix}.purpose`);
  if (!['verification', 'exploratory'].includes(testCase.mode)) {
    fail(`${prefix}.mode must be verification or exploratory`);
  }
  if (!Array.isArray(testCase.behaviorIds) || testCase.behaviorIds.length === 0) {
    fail(`${prefix}.behaviorIds must contain at least one behavior id`);
  }
  const linkedBehaviors = testCase.behaviorIds.map((behaviorId) => {
    asNonEmptyString(behaviorId, `${prefix}.behaviorIds`);
    const behavior = behaviors.get(behaviorId);
    if (!behavior) {
      fail(`${prefix}.behaviorIds references unknown behavior ${behaviorId}`);
    }
    return behavior;
  });
  if (
    testCase.mode === 'verification' &&
    linkedBehaviors.some((behavior) => behavior.status === 'open-question' || behavior.confidence !== 'high')
  ) {
    fail(`${prefix} verification cases require high-confidence behaviors without open questions`);
  }
  if (testCase.mode === 'exploratory' && linkedBehaviors.some((behavior) => behavior.status !== 'open-question')) {
    fail(`${prefix} exploratory cases may reference only open-question behaviors`);
  }
  if (!['P0', 'P1', 'P2', 'P3'].includes(testCase.priority)) {
    fail(`${prefix}.priority must be P0, P1, P2, or P3`);
  }
  if (testCase.formId && !formIds.has(testCase.formId)) {
    fail(`${prefix}.formId references unknown form ${testCase.formId}`);
  }
  const integrationIds = asStringArray(testCase.integrationIds ?? [], `${prefix}.integrationIds`);
  for (const integrationId of integrationIds) {
    if (!integrations.has(integrationId)) {
      fail(`${prefix}.integrationIds references unknown integration ${integrationId}`);
    }
    referencedIntegrationIds.add(integrationId);
  }
  for (const field of ['prerequisites', 'testUsers', 'evidence', 'cleanup']) {
    testCase[field] = asStringArray(testCase[field] ?? [], `${prefix}.${field}`);
  }
  if (!Array.isArray(testCase.steps) || testCase.steps.length === 0) {
    fail(`${prefix}.steps must contain at least one step`);
  }
  for (const [stepIndex, step] of testCase.steps.entries()) {
    asNonEmptyString(step.action, `${prefix}.steps[${stepIndex}].action`);
    asNonEmptyString(step.expected, `${prefix}.steps[${stepIndex}].expected`);
  }
}
for (const integrationId of integrations.keys()) {
  if (!referencedIntegrationIds.has(integrationId)) {
    fail(`integration ${integrationId} is not referenced by a test case`);
  }
}

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
const escapeMarkdown = (value) =>
  String(value)
    .replaceAll(/\s*\n\s*/g, ' ')
    .replaceAll(/\\/g, '\\\\')
    .replaceAll(/([`*_{}()#+.!|>~-])/g, '\\$1')
    .replaceAll('[', '\\[')
    .replaceAll(']', '\\]')
    .replaceAll('<', '&lt;');

const list = (values) =>
  values.length ? `<ul>${values.map((value) => `<li>${escapeHtml(value)}</li>`).join('')}</ul>` : '<p>Ingen.</p>';

if (configuredPageUrl) {
  asHttpUrl(configuredPageUrl, '--page-url');
}
const [sourceOwner, sourceRepositoryName] = sourceRepository.split('/');
const defaultPageUrl = `https://${sourceOwner}.github.io/${sourceRepositoryName}/manual-tests/${plan.slug}`;
const pageUrl = configuredPageUrl?.replace(/\/$/, '') || defaultPageUrl;
const caseUrl = (id) => `${pageUrl}${pageUrl.endsWith('.html') ? '' : '/'}#${id.toLowerCase()}`;

const sourceNumber = plan.source.number ? ` #${escapeHtml(plan.source.number)}` : '';
const publicSetupActions = plan.setupActions.filter((action) => action.audience === 'public');
const internalSetupActions = plan.setupActions.filter((action) => action.audience === 'internal');
const setupHtml = publicSetupActions
  .map((item) => {
    return `<section class="setup-card">
      <h3>${escapeHtml(item.title)}</h3>
      ${list(item.steps)}
      <p><strong>Forventet:</strong> ${escapeHtml(item.expected)}</p>
      <h4>Kontroller</h4>
      ${list(item.verification)}
      ${item.sharedStateWarning ? `<p><strong>Delt tilstand:</strong> ${escapeHtml(item.sharedStateWarning)}</p>` : ''}
      ${item.cleanup.length ? `<h4>Rydd opp</h4>${list(item.cleanup)}` : ''}
    </section>`;
  })
  .join('');

const formsHtml = plan.forms.length
  ? `<div class="table-scroll" tabindex="0" role="region" aria-label="Skjema som brukes">
    <table>
      <thead><tr><th>Type</th><th>Skjema</th><th>Skjemasti</th><th>Merknad</th></tr></thead>
      <tbody>${plan.forms
        .map(
          (form) =>
            `<tr><td>${escapeHtml(form.kind === 'production' ? 'Produksjonsskjema' : 'Testskjema')}</td><td>${escapeHtml(
              form.title,
            )}</td><td><code>${escapeHtml(form.path)}</code></td><td>${escapeHtml(form.notes ?? '')}</td></tr>`,
        )
        .join('')}</tbody>
    </table>
  </div>`
  : '<p>Ingen egne skjema må klargjøres.</p>';

const behaviorStatusLabels = {
  aligned: 'Som forventet',
  'suspected-defect': 'Mulig feil',
  'open-question': 'Må undersøkes',
};
const behaviorConfidenceLabels = {
  high: 'Høy',
  medium: 'Middels',
  low: 'Lav',
};
const renderIntegrationEvidenceHtml = (integration) => `<section class="integration-evidence">
  <h3>${escapeHtml(integration.system)}</h3>
  <p><strong>Metode:</strong> ${escapeHtml(integration.evidence.method)}</p>
  <p><strong>Ansvarlig:</strong> ${escapeHtml(integration.evidence.owner)}</p>
  ${list(integration.evidence.instructions)}
  <p><strong>Forventet:</strong> ${escapeHtml(integration.evidence.expected)}</p>
</section>`;
const behaviorsHtml = `<ol class="behavior-list">
  ${plan.behaviorAnalysis
    .map(
      (behavior) =>
        `<li>
          <details class="behavior-card" id="${behavior.id.toLowerCase()}" tabindex="-1">
            <summary><code>${escapeHtml(behavior.id)}</code>: ${escapeHtml(behavior.behavior)}</summary>
            <div>
              <dl class="behavior-fields">
                <div class="behavior-field"><dt>Før</dt><dd>${escapeHtml(behavior.before)}</dd></div>
                <div class="behavior-field"><dt>Ønsket oppførsel</dt><dd>${escapeHtml(behavior.intended)}</dd></div>
                <div class="behavior-field"><dt>Oppførsel i endringen</dt><dd>${escapeHtml(behavior.implemented)}</dd></div>
                <div class="behavior-field behavior-field--wide"><dt>Grunnlag</dt><dd>${list(behavior.evidence)}</dd></div>
                <div class="behavior-field"><dt>Status</dt><dd>${escapeHtml(behaviorStatusLabels[behavior.status])}</dd></div>
                <div class="behavior-field"><dt>Sikkerhet i vurderingen</dt><dd>${escapeHtml(
                  behaviorConfidenceLabels[behavior.confidence],
                )}</dd></div>
              </dl>
            </div>
          </details>
        </li>`,
    )
    .join('')}
</ol>`;

const casesHtml = plan.testCases
  .map((testCase) => {
    const form = plan.forms.find((candidate) => candidate.id === testCase.formId);
    const testUsers = testCase.testUsers ?? [];
    const publicIntegrationEvidence = (testCase.integrationIds ?? [])
      .map((id) => integrations.get(id))
      .filter((integration) => integration.evidence.audience === 'public')
      .map(renderIntegrationEvidenceHtml)
      .join('');
    const priorityLabels = {
      P0: 'P0 - må testes',
      P1: 'P1 - bør testes',
      P2: 'P2 - test hvis det er tid',
      P3: 'P3 - valgfri kontroll',
    };
    const formLinks = form
      ? `<p><strong>Åpne skjemaet:</strong>
          <a href="${escapeHtml(`${internBaseUrl}/${encodeURIComponent(form.path)}`)}">intern-ingress</a>
          eller
          <a href="${escapeHtml(`${ansattBaseUrl}/${encodeURIComponent(form.path)}`)}">ansatt-ingress</a>
        </p>`
      : '';
    const testUserHtml = testUsers.length ? `<h3>Testbruker</h3>${list(testUsers)}` : '';
    return `<details id="${testCase.id.toLowerCase()}" tabindex="-1" open>
      <summary>${escapeHtml(testCase.id)}: ${escapeHtml(testCase.title)}</summary>
      <div>
        <div class="badges">
          <span class="badge">${escapeHtml(priorityLabels[testCase.priority])}</span>
          <span class="badge">${escapeHtml(testCase.group)}</span>
        </div>
        <p>${escapeHtml(testCase.purpose)}</p>
        <p class="muted"><strong>Bakgrunn for testen:</strong> ${testCase.behaviorIds
          .map((id) => `<a href="#${id.toLowerCase()}"><code>${escapeHtml(id)}</code></a>`)
          .join(', ')}</p>
        ${form ? `<p><strong>Skjema:</strong> ${escapeHtml(form.title)}</p>${formLinks}` : ''}
        <h3>Før du starter</h3>
        ${list(testCase.prerequisites)}
        ${testUserHtml}
        <h3>Steg</h3>
        <ol>${testCase.steps
          .map(
            (step) =>
              `<li class="step">${escapeHtml(step.action)}<div class="expected"><strong>Forventet:</strong> ${escapeHtml(
                step.expected,
              )}</div></li>`,
          )
          .join('')}</ol>
        <h3>Dokumentasjon</h3>
        ${list(testCase.evidence)}
        ${publicIntegrationEvidence ? `<h3>Kontroll av integrasjoner</h3>${publicIntegrationEvidence}` : ''}
        ${testCase.cleanup.length ? `<h3>Rydd opp</h3>${list(testCase.cleanup)}` : ''}
      </div>
    </details>`;
  })
  .join('');

const setupSection = `<details class="secondary-section" id="oppsett">
    <summary><h2>Oppsett før testing - åpne hvis dette ikke allerede er gjort</h2></summary>
    <div>
      ${setupHtml || '<p>Ingen ekstra oppsett.</p>'}
      <h3>Skjema som brukes</h3>
      ${formsHtml}
    </div>
  </details>`;

const behaviorSection = `<details class="secondary-section" id="oppforselsanalyse">
    <summary><h2>Bakgrunn for testene</h2></summary>
    <div>
      <h3>Risiko</h3>
      ${list(plan.risks ?? [])}
      <p>Forventede resultater bygger på avklart behov, etablerte avtaler eller uendret oppførsel.</p>
      ${behaviorsHtml}
    </div>
  </details>`;

const technicalSection = `<details class="secondary-section" id="teknisk-informasjon">
    <summary><h2>Teknisk informasjon</h2></summary>
    <div class="meta">
      <p><strong>Pull request:</strong> <a href="${escapeHtml(plan.source.url)}">${escapeHtml(
        plan.source.repository,
      )}${sourceNumber}</a></p>
      ${
        plan.source.issue
          ? `<p><strong>Sak:</strong> <a href="${escapeHtml(plan.source.issue.url)}">#${escapeHtml(
              plan.source.issue.number,
            )}</a></p>`
          : ''
      }
      <p><strong>Miljø:</strong> ${escapeHtml(plan.environment.name)}</p>
      <p><strong>Gren:</strong> <code>${escapeHtml(plan.source.ref)}</code></p>
      <p><strong>Commit:</strong> <code>${escapeHtml(expectedCommit)}</code></p>
    </div>
  </details>`;

const body = `<div class="page-tools">
    <button id="theme-toggle" type="button" aria-pressed="false">
      Mørkt tema: <span id="theme-state">av</span>
    </button>
  </div>
  <h1>${escapeHtml(plan.title)}</h1>
  <p>${escapeHtml(plan.summary)}</p>
  <section class="card preflight">
    <h2>Kontroller versjonen hver gang du starter testingen</h2>
    <ol>
      <li>Åpne <a href="${escapeHtml(revisionEndpoint)}">miljøinformasjonen</a>.</li>
      <li>Finn <code>${escapeHtml(revisionField)}</code>.</li>
      <li>Kontroller at verdien er <code>${escapeHtml(expectedCommit)}</code>.</li>
    </ol>
    <p><strong>Stopp hvis verdien er annerledes.</strong> Be utvikleren legge ut riktig versjon, og kontroller på nytt.</p>
  </section>
  ${setupSection}
  <h2>Testoppgaver</h2>
  ${casesHtml}
  ${behaviorSection}
  ${technicalSection}`;

const generatedAt = new Date().toISOString();
const htmlTemplate = readFileSync(join(skillDirectory, 'templates', 'plan-page.html'), 'utf8');
const html = htmlTemplate
  .replace('{{TITLE}}', () => escapeHtml(plan.title))
  .replace('{{BODY}}', () => body)
  .replace('{{GENERATED_AT}}', () => escapeHtml(generatedAt));

const slackCases = plan.testCases
  .map((testCase) => {
    const form = plan.forms.find((candidate) => candidate.id === testCase.formId);
    const links = form
      ? `  Skjema: ${internBaseUrl}/${encodeURIComponent(form.path)} eller ${ansattBaseUrl}/${encodeURIComponent(
          form.path,
        )}\n`
      : '';
    return `- [ ] *${testCase.id}: ${escapeMarkdown(testCase.title)}* (${testCase.priority})
  Område: ${escapeMarkdown(testCase.group)}
  Tester:
  Instruksjoner: ${caseUrl(testCase.id)}
${links}  Resultat og merknader:`;
  })
  .join('\n\n');
const slackTemplate = readFileSync(join(skillDirectory, 'templates', 'slack-canvas.md'), 'utf8');
const slack = slackTemplate
  .replace('{{TITLE}}', () => escapeMarkdown(plan.title))
  .replace('{{SUMMARY}}', () => escapeMarkdown(plan.summary))
  .replace('{{PAGE_URL}}', () => pageUrl)
  .replace('{{REVISION_ENDPOINT}}', () => revisionEndpoint)
  .replace('{{REVISION_FIELD}}', () => escapeMarkdown(revisionField))
  .replace('{{EXPECTED_COMMIT}}', () => expectedCommit)
  .replace('{{CASES}}', () => slackCases);

const issueBehaviors = plan.behaviorAnalysis
  .map(
    (behavior) => `<details id="${behavior.id.toLowerCase()}">
<summary><code>${behavior.id}</code>: ${escapeHtml(behavior.behavior)}</summary>

- **Før:** ${escapeMarkdown(behavior.before)}
- **Ønsket oppførsel:** ${escapeMarkdown(behavior.intended)}
- **Oppførsel i endringen:** ${escapeMarkdown(behavior.implemented)}
- **Status:** ${behaviorStatusLabels[behavior.status]}
- **Sikkerhet i vurderingen:** ${behaviorConfidenceLabels[behavior.confidence]}
- **Grunnlag:** ${behavior.evidence.map(escapeMarkdown).join('; ')}

</details>`,
  )
  .join('\n\n');

const renderSetupMarkdown = (item) => `### ${item.id}: ${escapeMarkdown(item.title)}

${item.steps.map((step) => `1. ${escapeMarkdown(step)}`).join('\n')}

**Forventet:** ${escapeMarkdown(item.expected)}

**Kontroller:**
${item.verification.map((step) => `- ${escapeMarkdown(step)}`).join('\n')}
${item.sharedStateWarning ? `\n**Delt tilstand:** ${escapeMarkdown(item.sharedStateWarning)}\n` : ''}
${item.cleanup.length ? `**Rydd opp:**\n${item.cleanup.map((step) => `- ${escapeMarkdown(step)}`).join('\n')}` : ''}`;

const issueSetup = publicSetupActions.map((item) => renderSetupMarkdown(item)).join('\n\n');

const issueForms = plan.forms.length
  ? plan.forms
      .map(
        (form) =>
          `- **${escapeMarkdown(form.title)}:** [intern-ingress](${internBaseUrl}/${encodeURIComponent(
            form.path,
          )}) eller [ansatt-ingress](${ansattBaseUrl}/${encodeURIComponent(form.path)})`,
      )
      .join('\n')
  : 'Ingen egne skjema må klargjøres.';

const issueCases = plan.testCases
  .map((testCase) => {
    const form = plan.forms.find((candidate) => candidate.id === testCase.formId);
    const testUsers = testCase.testUsers ?? [];
    const publicIntegrationEvidence = (testCase.integrationIds ?? [])
      .map((id) => integrations.get(id))
      .filter((integration) => integration.evidence.audience === 'public')
      .map(
        (integration) => `  **Kontroll av ${escapeMarkdown(integration.system)}:**
  - Metode: ${escapeMarkdown(integration.evidence.method)}
  - Ansvarlig: ${escapeMarkdown(integration.evidence.owner)}
${integration.evidence.instructions.map((step) => `  - ${escapeMarkdown(step)}`).join('\n')}
  - Forventet: ${escapeMarkdown(integration.evidence.expected)}`,
      )
      .join('\n');
    const formText = form
      ? `**Skjema:** [intern-ingress](${internBaseUrl}/${encodeURIComponent(
          form.path,
        )}) eller [ansatt-ingress](${ansattBaseUrl}/${encodeURIComponent(form.path)})`
      : '';
    const testUserText = testUsers.length
      ? `  **Testbruker:**\n${testUsers.map((value) => `    - ${escapeMarkdown(value)}`).join('\n')}\n`
      : '';
    return `- [ ] **${testCase.id}: ${escapeMarkdown(testCase.title)}** (${testCase.priority})

  ${escapeMarkdown(testCase.purpose)}

  ${formText}
  **Tester:** _Ikke tildelt_
  **Før du starter:** ${testCase.prerequisites.map(escapeMarkdown).join('; ') || 'Ingen ekstra forutsetninger.'}
${testUserText}
  **Steg:**
${testCase.steps.map((step, index) => `  ${index + 1}. ${escapeMarkdown(step.action)}\n     - Forventet: ${escapeMarkdown(step.expected)}`).join('\n')}

  **Dokumentasjon:** ${testCase.evidence.map(escapeMarkdown).join('; ') || 'Noter resultatet.'}
${publicIntegrationEvidence ? `${publicIntegrationEvidence}\n` : ''}
${testCase.cleanup.length ? `  **Rydd opp:** ${testCase.cleanup.map(escapeMarkdown).join('; ')}\n` : ''}
  **Resultat og merknader:**`;
  })
  .join('\n\n');

const issue = `# ${escapeMarkdown(plan.title)}

${escapeMarkdown(plan.summary)}

## Kontroller versjonen hver gang du starter testingen

1. Åpne [miljøinformasjonen](${revisionEndpoint}).
2. Finn \`${escapeMarkdown(revisionField)}\`.
3. Kontroller at verdien er \`${expectedCommit}\`.

**Stopp hvis verdien er annerledes.** Be utvikleren legge ut riktig versjon, og kontroller på nytt.

## Testoppgaver

${issueCases}

<details>
<summary>Oppsett og skjema</summary>

${issueSetup || 'Ingen ekstra oppsett.'}

### Skjema som brukes

${issueForms}

</details>

<details>
<summary>Bakgrunn og oppførselsanalyse</summary>

### Risiko

${plan.risks.map((risk) => `- ${escapeMarkdown(risk)}`).join('\n') || 'Ingen særskilt risiko registrert.'}

${issueBehaviors}

</details>

---

Pull request: ${plan.source.url}
${plan.source.issue ? `Sak: ${plan.source.issue.url}` : ''}
`;

const internalIntegrationEvidence = plan.integrations
  .filter((integration) => integration.evidence.audience === 'internal')
  .map(
    (integration) => `## ${integration.id}: ${escapeMarkdown(integration.system)}

**Metode:** ${escapeMarkdown(integration.evidence.method)}

**Ansvarlig:** ${escapeMarkdown(integration.evidence.owner)}

${integration.evidence.instructions.map((step) => `1. ${escapeMarkdown(step)}`).join('\n')}

**Forventet:** ${escapeMarkdown(integration.evidence.expected)}

${
  integration.evidence.repositoryReferences.length
    ? `**Referanser:**\n${integration.evidence.repositoryReferences.map((reference) => `- ${escapeMarkdown(reference)}`).join('\n')}`
    : ''
}`,
  )
  .join('\n\n');
const internalSetup = internalSetupActions.map(renderSetupMarkdown).join('\n\n');
const internalInstructions =
  internalSetup || internalIntegrationEvidence
    ? `# Interne instruksjoner for ${escapeMarkdown(plan.title)}

Denne filen skal ikke publiseres på GitHub Pages eller i en offentlig GitHub-sak.

${internalSetup ? `## Internt oppsett\n\n${internalSetup}` : ''}

${internalIntegrationEvidence ? `## Integrasjonsbevis\n\n${internalIntegrationEvidence}` : ''}
`
    : undefined;

const artifactFiles = plan.collaboration.withNonDevelopers
  ? new Map([
      ['index.html', html],
      ['slack-canvas.md', slack],
    ])
  : new Map([['github-issue.md', issue]]);
if (internalInstructions) {
  artifactFiles.set('internal-instructions.md', internalInstructions);
}
const reservedArtifactPaths = new Set(
  ['index.html', 'slack-canvas.md', 'github-issue.md', 'internal-instructions.md', 'manifest.json'].map((path) =>
    path.toLowerCase(),
  ),
);
const generatedArtifacts = [];
const generatedArtifactPaths = new Set();

for (const form of plan.forms.filter((entry) => entry.kind === 'generated' && entry.artifact)) {
  if (typeof form.artifact !== 'string' || !form.artifact.trim()) {
    fail('generated form artifact must be a non-empty relative path');
  }
  if (isAbsolute(form.artifact)) {
    fail(`generated form artifact must be relative: ${form.artifact}`);
  }
  const sourcePath = resolve(planDirectory, form.artifact);
  const destinationPath = resolve(outputDirectory, form.artifact);
  const normalizedDestination = relative(outputDirectory, destinationPath).replaceAll('\\', '/');
  const comparableDestination = normalizedDestination.toLowerCase();
  if (!normalizedDestination || normalizedDestination.startsWith('..')) {
    fail(`generated form artifact escapes the output directory: ${form.artifact}`);
  }
  if (reservedArtifactPaths.has(comparableDestination) || generatedArtifactPaths.has(comparableDestination)) {
    fail(`generated form artifact has a reserved or duplicate destination: ${form.artifact}`);
  }
  if (!existsSync(sourcePath)) {
    fail(`generated form artifact does not exist: ${sourcePath}`);
  }
  if (lstatSync(sourcePath).isSymbolicLink()) {
    fail(`generated form artifact cannot be a symbolic link: ${sourcePath}`);
  }
  if (!lstatSync(sourcePath).isFile()) {
    fail(`generated form artifact must be a file: ${sourcePath}`);
  }
  const canonicalSource = realpathSync(sourcePath);
  const canonicalPlanDirectory = realpathSync(planDirectory);
  if (canonicalSource !== canonicalPlanDirectory && !canonicalSource.startsWith(`${canonicalPlanDirectory}${sep}`)) {
    fail(`generated form artifact resolves outside the plan directory: ${sourcePath}`);
  }
  generatedArtifactPaths.add(comparableDestination);
  generatedArtifacts.push({ sourcePath, destinationPath, artifact: normalizedDestination });
}

mkdirSync(outputDirectory, { recursive: true });

const desiredArtifactPaths = new Set([
  ...artifactFiles.keys(),
  ...generatedArtifacts.map(({ artifact }) => artifact),
  'manifest.json',
]);
const previousManifestPath = join(outputDirectory, 'manifest.json');
if (readdirSync(outputDirectory).length > 0 && !existsSync(previousManifestPath)) {
  fail('output directory is not empty and has no artifact manifest');
}
if (existsSync(previousManifestPath) && lstatSync(previousManifestPath).isFile()) {
  try {
    const previousManifest = JSON.parse(readFileSync(previousManifestPath, 'utf8'));
    if (
      !previousManifest ||
      ![1, 2, 3].includes(previousManifest.schemaVersion) ||
      !Array.isArray(previousManifest.files) ||
      previousManifest.files.length === 0
    ) {
      throw new Error('manifest must contain a supported schemaVersion and a non-empty files array');
    }
    const previousPaths = new Set();
    for (const entry of previousManifest.files) {
      if (
        !entry ||
        typeof entry.path !== 'string' ||
        !entry.path ||
        typeof entry.sha256 !== 'string' ||
        !/^[0-9a-f]{64}$/.test(entry.sha256) ||
        isAbsolute(entry.path) ||
        entry.path.split(/[\\/]/).some((part) => !part || part === '.' || part === '..') ||
        previousPaths.has(entry.path)
      ) {
        throw new Error('manifest contains an invalid file entry');
      }
      previousPaths.add(entry.path);
      if (desiredArtifactPaths.has(entry.path)) {
        continue;
      }
      const previousArtifact = resolve(outputDirectory, entry.path);
      const relativePath = relative(outputDirectory, previousArtifact);
      if (relativePath && !relativePath.startsWith('..') && !isAbsolute(relativePath)) {
        rmSync(previousArtifact, { force: true });
      }
    }
  } catch (error) {
    fail(`could not read the previous artifact manifest: ${error.message}`);
  }
}

for (const staleArtifact of ['index.html', 'slack-canvas.md', 'github-issue.md', 'test-cases.csv', 'README.txt']) {
  if (!artifactFiles.has(staleArtifact)) {
    rmSync(join(outputDirectory, staleArtifact), { force: true });
  }
}

for (const [name, content] of artifactFiles) {
  writeFileSync(join(outputDirectory, name), content);
}

for (const { sourcePath, destinationPath } of generatedArtifacts) {
  mkdirSync(dirname(destinationPath), { recursive: true });
  if (sourcePath !== destinationPath) {
    copyFileSync(sourcePath, destinationPath);
  }
}

const manifestEntries = [];
for (const name of artifactFiles.keys()) {
  const content = readFileSync(join(outputDirectory, name));
  manifestEntries.push({
    path: name,
    sha256: createHash('sha256').update(content).digest('hex'),
  });
}
for (const { artifact } of generatedArtifacts) {
  const content = readFileSync(resolve(outputDirectory, artifact));
  manifestEntries.push({
    path: artifact,
    sha256: createHash('sha256').update(content).digest('hex'),
  });
}

writeFileSync(
  join(outputDirectory, 'manifest.json'),
  `${JSON.stringify({ schemaVersion: 3, slug: plan.slug, pageUrl: plan.collaboration.withNonDevelopers ? pageUrl : undefined, generatedAt, files: manifestEntries }, null, 2)}\n`,
);

process.stdout.write(
  `Generated ${artifactFiles.size + 1 + generatedArtifacts.length} artifacts in ${outputDirectory}\n`,
);
