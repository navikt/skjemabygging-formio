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
  node import-form.mjs --form <form.json> [--env-file <path>]
  node import-form.mjs --form <form.json> --apply --confirm <operation>

Dry-run is the default. The token is read from FORMS_API_ACCESS_TOKEN or the
configured environment file and is never accepted as a command-line argument.
`);
  process.exit(0);
}

const formArgument = getArgument('--form');
if (!formArgument) {
  fail('--form is required');
}

const formPath = resolve(formArgument);
const envFile = resolve(getArgument('--env-file') ?? defaultEnvFile);
const shouldApply = process.argv.includes('--apply');
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
requireString(form.title, 'title');
if (!Array.isArray(form.components)) {
  fail('components must be an array');
}
if (!form.properties || typeof form.properties !== 'object' || Array.isArray(form.properties)) {
  fail('properties must be an object');
}

const normalizeFormNumber = (value) => value.toLowerCase().replaceAll(/[^a-z0-9]/g, '');
const normalizedFormNumber = normalizeFormNumber(formNumber);

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

const token = process.env.FORMS_API_ACCESS_TOKEN || parseEnvFile(envFile).FORMS_API_ACCESS_TOKEN;
if (!token) {
  fail(`FORMS_API_ACCESS_TOKEN is not set; run 'pnpm get-tokens forms-api' or set it in ${envFile}`);
}

const getResponseBody = async (response) => {
  const text = await response.text();
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const body = await getResponseBody(response);
  if (response.status === 401) {
    fail("Forms API returned 401. Refresh the token with 'pnpm get-tokens forms-api', then retry.");
  }
  if (!response.ok) {
    const detail = typeof body === 'string' ? body : JSON.stringify(body);
    fail(`${options.method ?? 'GET'} ${url} returned ${response.status}: ${detail.slice(0, 2000)}`);
  }
  return body;
};

const forms = await request(
  `${baseUrl}/v1/forms?${new URLSearchParams({
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
const commonBody = {
  title: form.title,
  components: form.components,
  properties: form.properties,
  ...(form.introPage !== undefined ? { introPage: form.introPage } : {}),
};
const requestBody = existing ? commonBody : { skjemanummer: formNumber, ...commonBody };
const payloadDigest = createHash('sha256').update(JSON.stringify(requestBody)).digest('hex').slice(0, 12);
const operation = existing
  ? `UPDATE:${existing.path}:${existing.revision}:${payloadDigest}`
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

const result = existing
  ? await request(`${baseUrl}/v1/forms/${encodeURIComponent(existing.path)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Formsapi-Entity-Revision': String(existing.revision),
      },
      body: JSON.stringify(commonBody),
    })
  : await request(`${baseUrl}/v1/forms`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

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
