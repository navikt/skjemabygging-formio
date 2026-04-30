#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fyllutRoot = resolve(repoRoot, 'packages/fyllut');
const productionRoot = resolve(fyllutRoot, 'cypress/e2e/production');
const args = process.argv.slice(2).filter((arg, index) => arg !== '--' || index !== 0);
const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

const usage = [
  'Usage:',
  '  pnpm cypress:fyllut:production',
  '  pnpm cypress:fyllut:production -- <count>',
  '  pnpm cypress:fyllut:production -- <start> <end>',
  '',
  'Examples:',
  '  pnpm cypress:fyllut:production -- 10      # first 10 tests',
  '  pnpm cypress:fyllut:production -- 10 20',
  '',
  'Range semantics:',
  '  start is inclusive, end is exclusive, both zero-based.',
].join('\n');

const toNonNegativeInteger = (value, name) => {
  if (!/^\d+$/.test(value)) {
    throw new Error(`${name} must be a non-negative integer, got "${value}"`);
  }

  return Number(value);
};

const readProductionSpecs = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const specs = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = resolve(dir, entry.name);

      if (entry.isDirectory()) {
        return readProductionSpecs(fullPath);
      }

      if (entry.isFile() && entry.name.endsWith('.cy.ts')) {
        return [relative(fyllutRoot, fullPath)];
      }

      return [];
    }),
  );

  return specs.flat();
};

if (args.includes('--help') || args.includes('-h')) {
  console.log(usage);
  process.exit(0);
}

if (args.length > 2) {
  console.error(usage);
  process.exit(1);
}

const allSpecs = (await readProductionSpecs(productionRoot)).sort((a, b) =>
  a.localeCompare(b, undefined, { numeric: true }),
);

if (allSpecs.length === 0) {
  console.error(`No Cypress production specs found in ${productionRoot}`);
  process.exit(1);
}

let start = 0;
let end = allSpecs.length;

if (args.length === 1) {
  end = toNonNegativeInteger(args[0], 'count');
} else if (args.length === 2) {
  start = toNonNegativeInteger(args[0], 'start');
  end = toNonNegativeInteger(args[1], 'end');
}

if (start > end) {
  console.error(`start must be less than or equal to end, got start=${start} end=${end}`);
  process.exit(1);
}

const selectedSpecs = allSpecs.slice(start, end);

if (selectedSpecs.length === 0) {
  console.error(
    `No Cypress production specs selected from ${allSpecs.length} available files with start=${start} and end=${end}`,
  );
  process.exit(1);
}

console.log(
  `Running ${selectedSpecs.length} production spec(s) from index ${start} to ${end} (${allSpecs.length} total)`,
);

const child = spawn(pnpmCommand, ['cypress', '--browser', 'electron', '--spec', selectedSpecs.join(',')], {
  cwd: fyllutRoot,
  stdio: 'inherit',
  shell: false,
});

child.on('error', (error) => {
  console.error(error.message);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
