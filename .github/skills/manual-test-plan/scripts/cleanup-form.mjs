#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { baseUrl, fail, getArgument, getToken } from './forms-api-common.mjs';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  process.stdout.write(`Usage:
  node cleanup-form.mjs --plan <plan.json> --form-id <id> [--env-file <path>]
  node cleanup-form.mjs --plan <plan.json> --form-id <id> --apply --confirm <operation>

Dry-run is the default. Only a generated form listed in the plan can be
deleted. The current revision and form contents are bound to confirmation.
`);
  process.exit(0);
}

const planArgument = getArgument('--plan');
const formId = getArgument('--form-id');
if (!planArgument || !formId) {
  fail('--plan and --form-id are required');
}
const planPath = resolve(planArgument);
const planDirectory = dirname(planPath);
const plan = JSON.parse(readFileSync(planPath, 'utf8'));
if (plan.schemaVersion !== 3 || !Array.isArray(plan.forms)) {
  fail('plan must use schema version 3 and contain forms');
}
const plannedForm = plan.forms.find((candidate) => candidate.id === formId);
if (!plannedForm || plannedForm.kind !== 'generated' || typeof plannedForm.artifact !== 'string') {
  fail(`${formId} must identify a generated form with an artifact in the plan`);
}
const formPath = plannedForm.path;
if (typeof formPath !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(formPath)) {
  fail('planned form path must contain lowercase letters, numbers, or hyphens');
}
const artifactPath = resolve(planDirectory, plannedForm.artifact);
const artifactRelative = relative(realpathSync(planDirectory), artifactPath);
if (
  isAbsolute(plannedForm.artifact) ||
  !artifactRelative ||
  artifactRelative === '..' ||
  artifactRelative.startsWith('../') ||
  !existsSync(artifactPath) ||
  lstatSync(artifactPath).isSymbolicLink() ||
  !lstatSync(artifactPath).isFile() ||
  relative(realpathSync(planDirectory), realpathSync(artifactPath)).startsWith('..')
) {
  fail('generated form artifact must be a regular file inside the plan directory');
}
const artifact = JSON.parse(readFileSync(artifactPath, 'utf8'));
if (
  typeof artifact.skjemanummer !== 'string' ||
  !artifact.skjemanummer.trim() ||
  artifact.title !== plannedForm.title
) {
  fail('generated form artifact does not match the planned form identity');
}

const token = getToken();

const headers = {
  Authorization: `Bearer ${token}`,
};

const formResponse = await fetch(`${baseUrl}/v1/forms/${encodeURIComponent(formPath)}`, { headers });
if (formResponse.status === 401) {
  fail("Forms API returned 401. Refresh the token with 'pnpm get-tokens forms-api', then retry.");
}
if (formResponse.status === 404) {
  fail(`form ${formPath} does not exist`);
}
if (!formResponse.ok) {
  fail(`GET form ${formPath} returned ${formResponse.status}`);
}

const form = await formResponse.json();
if (form.path !== formPath) {
  fail(`Forms API returned path ${form.path ?? '(missing)'} instead of ${formPath}`);
}
if (typeof form.skjemanummer !== 'string' || !form.skjemanummer.trim()) {
  fail(`form ${formPath} has an invalid form number`);
}
if (typeof form.title !== 'string' || !form.title.trim()) {
  fail(`form ${formPath} has an invalid title`);
}
if (form.skjemanummer !== artifact.skjemanummer || form.title !== plannedForm.title) {
  fail(`refusing to delete ${formPath}: the current form does not match the planned generated form`);
}
if (!Number.isInteger(form.revision) || form.revision < 1) {
  fail(`form ${formPath} has an invalid revision`);
}

const formIdentity = {
  path: form.path,
  skjemanummer: form.skjemanummer,
  title: form.title,
  revision: form.revision,
  contentDigest: createHash('sha256').update(JSON.stringify(form)).digest('hex'),
};
const digest = createHash('sha256').update(JSON.stringify(formIdentity)).digest('hex').slice(0, 12);
const operation = `DELETE:${formPath}:${form.revision}:${digest}`;

process.stdout.write(`Forms API: ${baseUrl}\n`);
process.stdout.write(`Form path: ${formPath}\n`);
process.stdout.write(`Form number: ${form.skjemanummer ?? ''}\n`);
process.stdout.write(`Title: ${form.title ?? ''}\n`);
process.stdout.write(`Revision: ${form.revision}\n`);
process.stdout.write(`Operation: ${operation}\n`);

if (!process.argv.includes('--apply')) {
  process.stdout.write(`Dry run only. To apply, rerun with --apply --confirm '${operation}'.\n`);
  process.exit(0);
}

if (getArgument('--confirm') !== operation) {
  fail(`confirmation does not match current operation; expected '${operation}'`);
}

const deleteResponse = await fetch(`${baseUrl}/v1/forms/${encodeURIComponent(formPath)}`, {
  method: 'DELETE',
  headers: {
    ...headers,
    'Formsapi-Entity-Revision': String(form.revision),
  },
});
if (deleteResponse.status === 401) {
  fail("Forms API returned 401. Refresh the token with 'pnpm get-tokens forms-api', then restart with a dry run.");
}
if (!deleteResponse.ok) {
  fail(`DELETE form ${formPath} returned ${deleteResponse.status}`);
}

const verificationResponse = await fetch(`${baseUrl}/v1/forms/${encodeURIComponent(formPath)}`, { headers });
if (verificationResponse.status === 401) {
  fail('Forms API returned 401 while verifying deletion. Refresh the token, then check the form path again.');
}
if (verificationResponse.status !== 404) {
  fail(`cleanup could not be verified: GET form ${formPath} returned ${verificationResponse.status}`);
}

process.stdout.write(`Deleted and verified generated form ${formPath}.\n`);
