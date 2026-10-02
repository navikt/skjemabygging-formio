#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createFormsApiClient } from './client.mjs';
import { baseUrl, fail, getArgument, getToken, isGeneratedFormNumber } from './common.mjs';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  process.stdout.write(`Usage:
  node import-form.mjs --form <form.json> [--env-file <path>]
  node import-form.mjs --form <form.json> --apply --confirm <operation>
  node import-form.mjs --form <form.json> --replace-existing [--apply --confirm <operation>]

Dry-run is the default. Replacing an existing form requires --replace-existing
and a confirmation bound to the existing form and the new payload.
`);
  process.exit(0);
}

const formArgument = getArgument('--form');
if (!formArgument) {
  fail('--form is required');
}

const formPath = resolve(formArgument);
const shouldApply = process.argv.includes('--apply');
const shouldReplaceExisting = process.argv.includes('--replace-existing');
const suppliedConfirmation = getArgument('--confirm');

const form = (() => {
  try {
    return JSON.parse(readFileSync(formPath, 'utf8'));
  } catch (error) {
    fail(`could not read form JSON: ${error.message}`);
  }
})();

const requireString = (value, name) => {
  if (typeof value !== 'string' || !value.trim()) {
    fail(`${name} must be a non-empty string`);
  }
  return value.trim();
};

const formNumber = requireString(form.skjemanummer, 'skjemanummer');
if (!isGeneratedFormNumber(formNumber)) {
  fail('skjemanummer must use the reserved MANUALTEST- prefix and contain at most 20 characters');
}
requireString(form.title, 'title');
if (!Array.isArray(form.components)) {
  fail('components must be an array');
}
if (!form.properties || typeof form.properties !== 'object' || Array.isArray(form.properties)) {
  fail('properties must be an object');
}

const normalizeFormNumber = (value) => value.toLowerCase().replaceAll(/[^a-z0-9]/g, '');
const normalizedFormNumber = normalizeFormNumber(formNumber);

const { request } = createFormsApiClient(getToken());

const { body: forms } = await request(
  `/v1/forms?${new URLSearchParams({
    select: 'path,skjemanummer,revision,status,lock,title',
  })}`,
);

if (!Array.isArray(forms)) {
  fail('Forms API returned an unexpected form list');
}

const matches = forms.filter(
  (candidate) =>
    typeof candidate.skjemanummer === 'string' && normalizeFormNumber(candidate.skjemanummer) === normalizedFormNumber,
);

if (matches.length > 1) {
  fail(`more than one form matches ${formNumber}`);
}

const existing = matches[0];
if (existing && (!Number.isInteger(existing.revision) || existing.revision < 1)) {
  fail(`existing form ${existing.path ?? formNumber} has an invalid revision`);
}
if (existing && !shouldReplaceExisting) {
  fail(
    `form ${existing.path} already exists; reuse it or obtain explicit approval to replace it and rerun with --replace-existing`,
  );
}
const currentForm = existing ? (await request(`/v1/forms/${encodeURIComponent(existing.path)}`)).body : undefined;
if (existing && (!currentForm || typeof currentForm !== 'object' || Array.isArray(currentForm))) {
  fail('Forms API returned an invalid existing form; retry the dry run');
}
if (
  currentForm &&
  (currentForm.path !== existing.path ||
    currentForm.revision !== existing.revision ||
    normalizeFormNumber(currentForm.skjemanummer ?? '') !== normalizedFormNumber)
) {
  fail('existing form identity or revision changed between lookup and inspection; retry the dry run');
}
const commonBody = {
  title: form.title,
  components: form.components,
  properties: form.properties,
  ...(form.introPage !== undefined ? { introPage: form.introPage } : {}),
};
const requestBody = existing ? commonBody : { skjemanummer: formNumber, ...commonBody };
const payloadDigest = createHash('sha256').update(JSON.stringify(requestBody)).digest('hex').slice(0, 12);
const existingDigest =
  currentForm && createHash('sha256').update(JSON.stringify(currentForm)).digest('hex').slice(0, 12);
const operation = existing
  ? `UPDATE:${existing.path}:${existing.revision}:${existingDigest}:${payloadDigest}`
  : `CREATE:${normalizedFormNumber}:${payloadDigest}`;

process.stdout.write(`Forms API: ${baseUrl}\n`);
process.stdout.write(`Form number: ${formNumber}\n`);
process.stdout.write(`Operation: ${operation}\n`);
if (existing) {
  process.stdout.write(`Current title: ${existing.title ?? ''}\n`);
  process.stdout.write(`Current status: ${existing.status ?? ''}\n`);
  if (existing.lock) {
    process.stdout.write(`Warning: the form is locked: ${existing.lock.reason ?? 'no reason supplied'}\n`);
  }
} else {
  process.stdout.write(`Expected path: ${normalizedFormNumber}\n`);
}

if (!shouldApply) {
  process.stdout.write(`Dry run only. To apply, rerun with --apply --confirm '${operation}'.\n`);
  process.exit(0);
}

if (suppliedConfirmation !== operation) {
  fail(`confirmation does not match current operation; expected '${operation}'`);
}

const { body: result } = existing
  ? await request(`/v1/forms/${encodeURIComponent(existing.path)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Formsapi-Entity-Revision': String(existing.revision),
      },
      body: JSON.stringify(commonBody),
    })
  : await request('/v1/forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
if (!result || typeof result !== 'object' || Array.isArray(result)) {
  fail('Forms API returned no form details after the write; inspect Forms API before retrying.');
}

process.stdout.write(
  `${JSON.stringify(
    {
      id: result?.id,
      path: result?.path,
      revision: result?.revision,
      status: result?.status,
      title: result?.title,
    },
    null,
    2,
  )}\n`,
);
