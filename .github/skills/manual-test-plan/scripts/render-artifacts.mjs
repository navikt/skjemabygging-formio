#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
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

Generates index.html, test-cases.csv, slack-canvas.md, README.txt, and manifest.json.
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

if (plan.schemaVersion !== 1) {
  fail('schemaVersion must be 1');
}

asNonEmptyString(plan.slug, 'slug');
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(plan.slug)) {
  fail('slug must contain lowercase letters, numbers, and hyphens only');
}
asNonEmptyString(plan.title, 'title');
asNonEmptyString(plan.summary, 'summary');

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
asNonEmptyString(plan.source.ref, 'source.ref');
const expectedCommit = asNonEmptyString(plan.source.commitSha, 'source.commitSha');
if (!/^[0-9a-f]{40}$/i.test(expectedCommit)) {
  fail('source.commitSha must be a 40-character Git commit SHA');
}

if (!plan.environment || typeof plan.environment !== 'object') {
  fail('environment is required');
}
asNonEmptyString(plan.environment.name, 'environment.name');
asHttpUrl(plan.environment.baseUrl, 'environment.baseUrl');
if (!plan.environment.revisionCheck || typeof plan.environment.revisionCheck !== 'object') {
  fail('environment.revisionCheck is required');
}
const revisionEndpoint = asHttpUrl(plan.environment.revisionCheck.endpoint, 'environment.revisionCheck.endpoint');
const revisionField = asNonEmptyString(plan.environment.revisionCheck.field, 'environment.revisionCheck.field');

if (!Array.isArray(plan.setup) || !Array.isArray(plan.forms) || !Array.isArray(plan.testCases)) {
  fail('setup, forms, and testCases must be arrays');
}

asStringArray(plan.risks ?? [], 'risks');

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

const caseIds = new Set();
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
  for (const field of ['prerequisites', 'testData', 'evidence', 'cleanup']) {
    asStringArray(testCase[field] ?? [], `${prefix}.${field}`);
  }
  if (!Array.isArray(testCase.steps) || testCase.steps.length === 0) {
    fail(`${prefix}.steps must contain at least one step`);
  }
  for (const [stepIndex, step] of testCase.steps.entries()) {
    asNonEmptyString(step.action, `${prefix}.steps[${stepIndex}].action`);
    asNonEmptyString(step.expected, `${prefix}.steps[${stepIndex}].expected`);
  }
}

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const escapeCsv = (value) => {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const list = (values) =>
  values.length ? `<ul>${values.map((value) => `<li>${escapeHtml(value)}</li>`).join('')}</ul>` : '<p>None.</p>';

if (configuredPageUrl) {
  asHttpUrl(configuredPageUrl, '--page-url');
}
const pageUrl = configuredPageUrl?.replace(/\/$/, '') || 'index.html';
const caseUrl = (id) => `${pageUrl}${pageUrl.endsWith('.html') ? '' : '/'}#${id.toLowerCase()}`;

const sourceNumber = plan.source.number ? ` #${escapeHtml(plan.source.number)}` : '';
const setupHtml = plan.setup
  .map((item) => {
    asNonEmptyString(item.title, 'setup.title');
    asStringArray(item.steps, `setup.${item.title}.steps`);
    return `<section class="card">
      <h3>${escapeHtml(item.title)}</h3>
      ${list(item.steps)}
      ${item.expected ? `<p><strong>Expected:</strong> ${escapeHtml(item.expected)}</p>` : ''}
    </section>`;
  })
  .join('');

const formsHtml = plan.forms.length
  ? `<table>
      <thead><tr><th>Kind</th><th>Form</th><th>Path</th><th>Notes</th></tr></thead>
      <tbody>${plan.forms
        .map(
          (form) =>
            `<tr><td>${escapeHtml(form.kind)}</td><td>${escapeHtml(form.title)}</td><td><code>${escapeHtml(
              form.path,
            )}</code></td><td>${escapeHtml(form.notes ?? '')}</td></tr>`,
        )
        .join('')}</tbody>
    </table>`
  : '<p>No special form setup.</p>';

const behaviorStatusLabels = {
  aligned: 'Aligned',
  'suspected-defect': 'Suspected defect',
  'open-question': 'Open question',
};
const behaviorsHtml = `<ol class="behavior-list">
  ${plan.behaviorAnalysis
    .map(
      (behavior) =>
        `<li>
          <article class="behavior-card" id="${behavior.id.toLowerCase()}">
            <h3><code>${escapeHtml(behavior.id)}</code>: ${escapeHtml(behavior.behavior)}</h3>
            <dl class="behavior-fields">
              <div class="behavior-field"><dt>Before</dt><dd>${escapeHtml(behavior.before)}</dd></div>
              <div class="behavior-field"><dt>Intended after</dt><dd>${escapeHtml(behavior.intended)}</dd></div>
              <div class="behavior-field"><dt>Implemented after</dt><dd>${escapeHtml(behavior.implemented)}</dd></div>
              <div class="behavior-field behavior-field--wide"><dt>Evidence</dt><dd>${list(behavior.evidence)}</dd></div>
              <div class="behavior-field"><dt>Status</dt><dd>${escapeHtml(behaviorStatusLabels[behavior.status])}</dd></div>
              <div class="behavior-field"><dt>Confidence</dt><dd>${escapeHtml(behavior.confidence)}</dd></div>
            </dl>
          </article>
        </li>`,
    )
    .join('')}
</ol>`;

const casesHtml = plan.testCases
  .map((testCase) => {
    const form = plan.forms.find((candidate) => candidate.id === testCase.formId);
    return `<details id="${testCase.id.toLowerCase()}" open>
      <summary>${escapeHtml(testCase.id)}: ${escapeHtml(testCase.title)}</summary>
      <div>
        <div class="badges">
          <span class="badge">${escapeHtml(testCase.priority)}</span>
          <span class="badge">${escapeHtml(testCase.group)}</span>
          <span class="badge">${escapeHtml(testCase.mode)}</span>
        </div>
        <p>${escapeHtml(testCase.purpose)}</p>
        <p><strong>Behaviors:</strong> ${testCase.behaviorIds
          .map((id) => `<a href="#${id.toLowerCase()}"><code>${escapeHtml(id)}</code></a>`)
          .join(', ')}</p>
        ${form ? `<p><strong>Form:</strong> ${escapeHtml(form.title)} (<code>${escapeHtml(form.path)}</code>)</p>` : ''}
        <h3>Prerequisites</h3>
        ${list(testCase.prerequisites)}
        <h3>Test data</h3>
        ${list(testCase.testData)}
        <h3>Steps</h3>
        <ol>${testCase.steps
          .map(
            (step) =>
              `<li class="step">${escapeHtml(step.action)}<div class="expected"><strong>Expected:</strong> ${escapeHtml(
                step.expected,
              )}</div></li>`,
          )
          .join('')}</ol>
        <h3>Evidence</h3>
        ${list(testCase.evidence)}
        <h3>Cleanup</h3>
        ${list(testCase.cleanup)}
      </div>
    </details>`;
  })
  .join('');

const body = `<h1>${escapeHtml(plan.title)}</h1>
  <p>${escapeHtml(plan.summary)}</p>
  <section class="meta">
    <p><strong>Source:</strong> <a href="${escapeHtml(plan.source.url)}">${escapeHtml(
      plan.source.repository,
    )}${sourceNumber}</a></p>
    <p><strong>Environment:</strong> <a href="${escapeHtml(plan.environment.baseUrl)}">${escapeHtml(
      plan.environment.name,
    )}</a></p>
    <p><strong>Branch:</strong> <code>${escapeHtml(plan.source.ref)}</code></p>
    <p><strong>Commit:</strong> <code>${escapeHtml(expectedCommit)}</code></p>
  </section>
  <section class="card preflight">
    <h2>Verify the deployed revision before testing</h2>
    <ol>
      <li>Open <a href="${escapeHtml(revisionEndpoint)}"><code>${escapeHtml(revisionEndpoint)}</code></a>.</li>
      <li>Find <code>${escapeHtml(revisionField)}</code>.</li>
      <li>Confirm its value is <code>${escapeHtml(expectedCommit)}</code>.</li>
    </ol>
    <p><strong>Stop if it differs.</strong> Ask the developer to deploy the expected revision, then repeat this check.</p>
  </section>
  <section class="card warning">
    <strong>Use synthetic test data.</strong> This page is public when published through GitHub Pages.
  </section>
  <h2>Risks</h2>
  ${list(plan.risks ?? [])}
  <h2>Behavior analysis</h2>
  <p>Expected results come from confirmed intent, established contracts, or unchanged baseline behavior.</p>
  ${behaviorsHtml}
  <h2>Setup</h2>
  ${setupHtml || '<p>No additional setup.</p>'}
  <h2>Forms</h2>
  ${formsHtml}
  <h2>Test cases</h2>
  ${casesHtml}`;

const generatedAt = new Date().toISOString();
const htmlTemplate = readFileSync(join(skillDirectory, 'templates', 'plan-page.html'), 'utf8');
const html = htmlTemplate
  .replace('{{TITLE}}', escapeHtml(plan.title))
  .replace('{{BODY}}', body)
  .replace('{{GENERATED_AT}}', escapeHtml(generatedAt));

const csvHeader = [
  'Case ID',
  'Group',
  'Title',
  'Mode',
  'Behaviors',
  'Priority',
  'Status',
  'Testers',
  'Result',
  'Instruction URL',
  'Notes',
];
const csvRows = plan.testCases.map((testCase) => [
  testCase.id,
  testCase.group,
  testCase.title,
  testCase.mode,
  testCase.behaviorIds.join(', '),
  testCase.priority,
  'Not started',
  '',
  '',
  caseUrl(testCase.id),
  testCase.purpose,
]);
const csv = [csvHeader, ...csvRows].map((row) => row.map(escapeCsv).join(',')).join('\n');

const slackCases = plan.testCases
  .map(
    (testCase) => `- [ ] *${testCase.id}: ${testCase.title}* (${testCase.priority})
  Group: ${testCase.group}
  Mode: ${testCase.mode}
  Behaviors: ${testCase.behaviorIds.join(', ')}
  Testers:
  Status: Not started
  Instructions: ${caseUrl(testCase.id)}
  Result/notes:`,
  )
  .join('\n\n');
const slackTemplate = readFileSync(join(skillDirectory, 'templates', 'slack-canvas.md'), 'utf8');
const slack = slackTemplate
  .replace('{{TITLE}}', plan.title)
  .replace('{{SUMMARY}}', plan.summary)
  .replace('{{PAGE_URL}}', pageUrl)
  .replace('{{REVISION_ENDPOINT}}', revisionEndpoint)
  .replace('{{REVISION_FIELD}}', revisionField)
  .replace('{{EXPECTED_COMMIT}}', expectedCommit)
  .replace('{{CASES}}', slackCases);

const readme = `Manual test plan artifacts

Source: ${plan.source.url}
Generated: ${generatedAt}

Files:
- index.html: detailed read-only plan
- test-cases.csv: import into Microsoft Lists
- slack-canvas.md: paste into Slack Canvas
- manifest.json: hashes for publication review

Microsoft Lists:
1. Create a new list from test-cases.csv.
2. Map Priority, Status, and Result to Choice columns if useful.
3. Replace Testers with a Person or Group column and allow multiple selections.
4. Keep Instruction URL as a hyperlink column.

Review every artifact for public or sensitive information before sharing it.
`;

const artifactFiles = new Map([
  ['index.html', html],
  ['test-cases.csv', `${csv}\n`],
  ['slack-canvas.md', slack],
  ['README.txt', readme],
]);
const reservedArtifactPaths = new Set([...artifactFiles.keys(), 'manifest.json'].map((path) => path.toLowerCase()));
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
  `${JSON.stringify({ schemaVersion: 1, slug: plan.slug, generatedAt, files: manifestEntries }, null, 2)}\n`,
);

process.stdout.write(
  `Generated ${artifactFiles.size + 1 + generatedArtifacts.length} artifacts in ${outputDirectory}\n`,
);
