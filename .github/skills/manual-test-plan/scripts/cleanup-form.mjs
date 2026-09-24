#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const baseUrl = 'https://forms-api.intern.dev.nav.no';
const defaultEnvFile = 'packages/bygger-backend/.env';

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
  node cleanup-form.mjs --path <form-path> [--env-file <path>]
  node cleanup-form.mjs --path <form-path> --apply --confirm <operation>

Dry-run is the default. Only forms with properties.isTestForm set to true can
be deleted. The current revision and form metadata are bound to confirmation.
`);
  process.exit(0);
}

const formPath = getArgument('--path')?.trim();
if (!formPath || !/^[a-z0-9][a-z0-9-]*$/.test(formPath)) {
  fail('--path must contain lowercase letters, numbers, or hyphens');
}

const parseEnvFile = (path) => {
  if (!existsSync(path)) {
    return {};
  }
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.trimStart().startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
  );
};

const envFile = resolve(getArgument('--env-file') ?? defaultEnvFile);
const token = process.env.FORMS_API_ACCESS_TOKEN || parseEnvFile(envFile).FORMS_API_ACCESS_TOKEN;
if (!token) {
  fail(`FORMS_API_ACCESS_TOKEN is not set; run 'pnpm get-tokens forms-api' or set it in ${envFile}`);
}

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
if (form.properties?.isTestForm !== true) {
  fail(`refusing to delete ${formPath}: properties.isTestForm is not true`);
}
if (form.path !== formPath) {
  fail(`Forms API returned path ${form.path ?? '(missing)'} instead of ${formPath}`);
}
if (typeof form.skjemanummer !== 'string' || !form.skjemanummer.trim()) {
  fail(`form ${formPath} has an invalid form number`);
}
if (typeof form.title !== 'string' || !form.title.trim()) {
  fail(`form ${formPath} has an invalid title`);
}
if (!Number.isInteger(form.revision) || form.revision < 1) {
  fail(`form ${formPath} has an invalid revision`);
}

const formIdentity = {
  path: form.path,
  skjemanummer: form.skjemanummer,
  title: form.title,
  revision: form.revision,
  isTestForm: form.properties.isTestForm,
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

process.stdout.write(`Deleted and verified test form ${formPath}.\n`);
