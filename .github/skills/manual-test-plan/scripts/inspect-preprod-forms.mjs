#!/usr/bin/env node

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
  node inspect-preprod-forms.mjs --query <title-or-form-number> [--env-file <path>]
  node inspect-preprod-forms.mjs --path <form-path> [--env-file <path>]

Lists matching preprod forms or summarizes one form without printing its full
definition. Tokens are read from the environment or configured env file.
`);
  process.exit(0);
}

const query = getArgument('--query')?.trim().toLowerCase();
const formPath = getArgument('--path')?.trim();
if ((!query && !formPath) || (query && formPath)) {
  fail('provide exactly one of --query or --path');
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

const request = async (url) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 401) {
    fail("Forms API returned 401. Refresh the token with 'pnpm get-tokens forms-api', then retry.");
  }
  if (!response.ok) {
    fail(`GET ${url} returned ${response.status}`);
  }
  return response.json();
};

if (query) {
  const forms = await request(
    `${baseUrl}/v1/forms?${new URLSearchParams({
      select: 'path,skjemanummer,revision,status,title',
    })}`,
  );
  if (!Array.isArray(forms)) {
    fail('Forms API returned an unexpected form list');
  }
  const matches = forms
    .filter((form) =>
      [form.path, form.skjemanummer, form.title].some(
        (value) => typeof value === 'string' && value.toLowerCase().includes(query),
      ),
    )
    .slice(0, 20)
    .map(({ path, skjemanummer, revision, status, title }) => ({ path, skjemanummer, revision, status, title }));
  process.stdout.write(`${JSON.stringify(matches, null, 2)}\n`);
} else {
  const form = await request(`${baseUrl}/v1/forms/${encodeURIComponent(formPath)}`);
  const componentTypes = new Map();
  const visit = (value) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== 'object') {
      return;
    }
    if (typeof value.type === 'string') {
      componentTypes.set(value.type, (componentTypes.get(value.type) ?? 0) + 1);
    }
    for (const key of ['components', 'columns', 'rows']) {
      visit(value[key]);
    }
  };
  visit(form.components);
  process.stdout.write(
    `${JSON.stringify(
      {
        path: form.path,
        skjemanummer: form.skjemanummer,
        title: form.title,
        revision: form.revision,
        status: form.status,
        componentTypes: Object.fromEntries(
          [...componentTypes.entries()].sort(([left], [right]) => left.localeCompare(right)),
        ),
        properties: form.properties,
      },
      null,
      2,
    )}\n`,
  );
}
