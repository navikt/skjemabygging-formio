#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
  node create-issue.mjs --title <title> --body <github-issue.md>
  node create-issue.mjs --title <title> --body <github-issue.md> \\
    --apply --confirm <operation>

Dry-run is the default. The script creates an issue only after an exact
confirmation.
`);
  process.exit(0);
}

const title = getArgument('--title')?.trim();
const bodyPath = resolve(getArgument('--body') ?? '');
if (!title) {
  fail('--title is required');
}
if (title.length > 256) {
  fail('--title must be at most 256 characters');
}
if (!getArgument('--body') || !existsSync(bodyPath) || !lstatSync(bodyPath).isFile()) {
  fail('--body must reference an existing file');
}
if (lstatSync(bodyPath).isSymbolicLink()) {
  fail('--body cannot be a symbolic link');
}

const body = readFileSync(bodyPath, 'utf8');
if (!body.trim()) {
  fail('--body cannot be empty');
}

const gh = (...args) =>
  execFileSync('gh', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

const repository = (() => {
  try {
    return JSON.parse(gh('repo', 'view', '--json', 'nameWithOwner')).nameWithOwner;
  } catch (error) {
    fail(`could not determine GitHub repository: ${error.stderr?.toString().trim() || error.message}`);
  }
})();

const digest = createHash('sha256').update(`${title}\n${body}`).digest('hex').slice(0, 12);
const operation = `CREATE-ISSUE:${digest}`;

process.stdout.write(`Repository: ${repository}\n`);
process.stdout.write(`Title: ${title}\n`);
process.stdout.write(`Body: ${bodyPath}\n`);
process.stdout.write(`Operation: ${operation}\n`);

if (!process.argv.includes('--apply')) {
  process.stdout.write(`\n--- Proposed issue body ---\n${body}\n--- End proposed issue body ---\n`);
  process.stdout.write(`Dry run only. To apply, rerun with --apply --confirm '${operation}'.\n`);
  process.exit(0);
}

if (getArgument('--confirm') !== operation) {
  fail(`confirmation does not match current operation; expected '${operation}'`);
}

try {
  const url = gh('issue', 'create', '--repo', repository, '--title', title, '--body-file', bodyPath);
  process.stdout.write(`${url}\n`);
} catch (error) {
  fail(`could not create issue: ${error.stderr?.toString().trim() || error.message}`);
}
