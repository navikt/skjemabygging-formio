#!/usr/bin/env node

import { createFormsApiClient } from './client.mjs';
import { fail, getArgument, getToken } from './common.mjs';

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

const { request } = createFormsApiClient(getToken());

if (query) {
  const { body: forms } = await request(
    `/v1/forms?${new URLSearchParams({
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
  const { body: form } = await request(`/v1/forms/${encodeURIComponent(formPath)}`);
  if (!form || typeof form !== 'object' || Array.isArray(form)) {
    fail(`Forms API returned an invalid form for ${formPath}`);
  }
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
