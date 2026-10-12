#!/usr/bin/env node
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { defaultPortRange, parsePortRange, parsePorts } from '../lib/test-ports.mjs';
import { checkDiscovery, checkMigration, checkResults, checkSourceSet, flattenDiscovery } from './check-migration.mjs';
import { loadExistingManifest } from './existing-manifest.mjs';
import { checkBuild } from './test-epoch.mjs';

const root = resolve(import.meta.dirname, '../..');
const args = process.argv.slice(2).filter((arg) => arg !== '--');
let mode = 'dev';
let builtRequested = false;
let listOnly = false;
const selection = [];
let ports;
let portRange;
let existingPath;
for (let index = 0; index < args.length; index++) {
  const argument = args[index];
  if (argument === '--built') {
    builtRequested = true;
    mode = 'built';
    continue;
  }
  if (argument === '--list') {
    listOnly = true;
    continue;
  }
  if (argument === '--grep') {
    assert(args[index + 1], '--grep needs a value');
    selection.push(argument, args[++index]);
    continue;
  }
  if (argument === '--existing') {
    assert(!existingPath && args[index + 1], '--existing needs one manifest path');
    existingPath = resolve(args[++index]);
    continue;
  }
  if (argument === '--ports' || argument === '--port-range') {
    assert(args[index + 1], `${argument} needs a value`);
    if (argument === '--ports') {
      assert(!ports, 'Duplicate --ports');
      ports = parsePorts(args[++index]);
    } else {
      assert(!portRange, 'Duplicate --port-range');
      portRange = parsePortRange(args[++index]);
    }
  } else selection.push(argument);
}
assert(!(ports && portRange), 'TEST_PORT_OPTIONS_CONFLICT');
assert(!(existingPath && (ports || portRange)), 'EXISTING_PORT_OPTIONS_FORBIDDEN');
const existing = existingPath ? loadExistingManifest(existingPath) : undefined;
if (existing) {
  assert(!builtRequested || existing.epoch.mode === 'built', 'EXISTING_MODE_MISMATCH');
  mode = existing.epoch.mode;
} else portRange ??= ports ? undefined : defaultPortRange;
// Do not allow runner options to disable isolation, retries or the result reporter.
for (let index = 0; index < selection.length; index++) {
  if (selection[index] === '--grep') {
    assert(selection[++index], '--grep needs a value');
  } else {
    assert(!selection[index].startsWith('-'), `Unsupported runner argument: ${selection[index]}`);
  }
}
const runId = `${Date.now()}-${process.pid}`;
const output = resolve(root, 'packages/fyllut/.runtime/playwright', runId);
mkdirSync(output, { recursive: true });
const env = {
  ...process.env,
  FYLLUT_PLAYWRIGHT_MODE: mode,
  FYLLUT_PLAYWRIGHT_OUTPUT_DIR: output,
  FYLLUT_PLAYWRIGHT_PORTS: ports?.join(',') ?? '',
  FYLLUT_PLAYWRIGHT_PORT_RANGE: portRange?.join(':') ?? '',
  FYLLUT_PLAYWRIGHT_EXISTING_MANIFEST: existingPath ?? '',
};
const command = [
  resolve(root, 'packages/fyllut/node_modules/@playwright/test/cli.js'),
  'test',
  '--config',
  'packages/fyllut/playwright.config.ts',
];
let runner;
let interrupted;
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    interrupted = signal;
    runner?.kill(signal);
  });
}
try {
  const buildFiles = listOnly ? [] : checkBuild(mode);
  const inventory = JSON.parse(
    readFileSync(resolve(root, 'packages/fyllut/playwright/migration/inventory.json'), 'utf8'),
  );
  const implemented = checkMigration(inventory);
  checkSourceSet(inventory);
  assert.deepEqual(
    implemented.map((entry) => entry.id).sort(),
    [
      'F004-T005',
      'F004-T006',
      'F017-T007',
      'F029-T002',
      'F061-T001',
      'F061-T004',
      'F073-T001',
      'F073-T003',
      'F086-T001',
      'F086-T002',
    ],
    'The step 1b run must declare exactly its ten migration IDs',
  );
  const discover = (filters) =>
    JSON.parse(
      execFileSync(process.execPath, [...command, ...filters, '--list', '--reporter=json'], {
        cwd: root,
        env,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
      }),
    );
  const all = discover([]);
  checkDiscovery(implemented, flattenDiscovery(all), mode);
  const report = selection.length ? discover(selection) : all;
  const selectedIds = flattenDiscovery(report).map(
    (test) => test.annotations.find((annotation) => annotation.type === 'migration-id')?.description,
  );
  assert(selectedIds.length, 'EMPTY_SELECTION');
  if (existing) {
    assert.deepEqual(selectedIds, [existing.epoch.testId], 'EXISTING_REQUIRES_ONE_MATCHING_TEST');
    assert(mode === 'built' || selectedIds[0] !== 'F086-T002', 'EXISTING_SKIP_NOT_EXECUTABLE');
  }
  const selected = implemented.filter((entry) => selectedIds.includes(entry.id));
  checkDiscovery(selected, flattenDiscovery(report), mode);
  writeFileSync(resolve(output, 'discovery.json'), JSON.stringify(report, null, 2));
  writeFileSync(resolve(output, 'source.diff'), execFileSync('git', ['diff', 'HEAD', '--'], { cwd: root }));
  const manifest = {
    runId,
    mode,
    listOnly,
    selection,
    selectedIds,
    commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    untracked: execFileSync('git', ['ls-files', '--others', '--exclude-standard'], {
      cwd: root,
      encoding: 'utf8',
    }).trim(),
    fixtureVersion: 'dev-local/mr-sha/forms@git-sha',
    repoRoot: root,
    existingManifest: existingPath,
    portSelection: ports ? { ports } : { portRange },
    build: buildFiles.map((file) => ({
      file: relative(root, file),
      modifiedAt: statSync(file).mtime.toISOString(),
      sha256: createHash('sha256').update(readFileSync(file)).digest('hex'),
    })),
  };
  writeFileSync(resolve(output, 'run.json'), JSON.stringify(manifest, null, 2));
  console.log(`PLAYWRIGHT_MODE=${mode}\nPLAYWRIGHT_ARTIFACTS=${output}\nPLAYWRIGHT_IDS=${selectedIds.join(',')}`);
  if (!listOnly) {
    const exitCode = await new Promise((done, fail) => {
      runner = spawn(process.execPath, [...command, ...selection], { cwd: root, env, stdio: 'inherit' });
      runner.once('error', fail);
      runner.once('exit', (code) => done(code ?? 1));
    });
    assert.equal(exitCode, 0, 'PLAYWRIGHT_RUN_FAILED');
    assert(!interrupted, `PLAYWRIGHT_INTERRUPTED: ${interrupted}`);
    assert(!existsSync(resolve(output, 'fatal-cleanup.txt')), 'EPOCH_CLEANUP_FAILED');
    const results = JSON.parse(readFileSync(resolve(output, 'results.json'), 'utf8'));
    checkResults(selected, results, mode);
    console.log(`Verified actual results for ${selected.length} migration IDs (${mode}).`);
  }
} catch (error) {
  console.error(error);
  process.exitCode = interrupted === 'SIGINT' ? 130 : interrupted === 'SIGTERM' ? 143 : 1;
}
