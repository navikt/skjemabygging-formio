#!/usr/bin/env node
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { defaultPortRange, parsePortRange, parsePorts } from '../lib/test-ports.mjs';
import {
  checkDiscovery,
  checkMigration,
  checkResults,
  checkSourceSet,
  expandRuntimeCases,
  flattenDiscovery,
} from './check-migration.mjs';
import { loadExistingManifest } from './existing-manifest.mjs';
import { checkBuild } from './test-epoch.mjs';

const root = resolve(import.meta.dirname, '../..');
const args = process.argv.slice(2).filter((arg) => arg !== '--');
let mode = 'dev';
let builtRequested = false;
let listOnly = false;
let headed = false;
const selection = [];
let ports;
let portRange;
let existingPath;
for (let index = 0; index < args.length; index++) {
  const argument = args[index];
  if (argument === '--headed') {
    headed = true;
    continue;
  }
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
if (headed && !listOnly) {
  env.XDG_CONFIG_HOME = resolve(output, 'browser-config');
  mkdirSync(env.XDG_CONFIG_HOME, { recursive: true });
}
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
  const declarations = checkMigration(inventory);
  const implemented = expandRuntimeCases(declarations);
  checkSourceSet(inventory);
  assert.deepEqual(
    declarations.map((entry) => entry.id).sort(),
    [
      ...Array.from({ length: 7 }, (_, index) => `F004-T${String(index + 1).padStart(3, '0')}`),
      ...Array.from({ length: 11 }, (_, index) => `F017-T${String(index + 1).padStart(3, '0')}`),
      'F029-T002',
      ...Array.from({ length: 5 }, (_, index) => `F061-T${String(index + 1).padStart(3, '0')}`),
      ...Array.from({ length: 8 }, (_, index) => `F073-T${String(index + 1).padStart(3, '0')}`),
      ...Array.from({ length: 11 }, (_, index) => `F086-T${String(index + 1).padStart(3, '0')}`),
    ],
    'The step 3 run must declare exactly its 43 source migration IDs',
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
    assert(
      mode === 'built' || !implemented.find((entry) => entry.id === selectedIds[0]).buildOnly,
      'EXISTING_SKIP_NOT_EXECUTABLE',
    );
  }
  const selected = implemented.filter((entry) => selectedIds.includes(entry.id));
  checkDiscovery(selected, flattenDiscovery(report), mode);
  writeFileSync(resolve(output, 'discovery.json'), JSON.stringify(report, null, 2));
  writeFileSync(resolve(output, 'source.diff'), execFileSync('git', ['diff', 'HEAD', '--'], { cwd: root }));
  const manifest = {
    runId,
    mode,
    listOnly,
    headed,
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
      const presentation = headed ? ['--headed'] : [];
      runner = spawn(process.execPath, [...command, ...selection, ...presentation], {
        cwd: root,
        env,
        stdio: 'inherit',
      });
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
  const localOutput = relative(root, output);
  console.error(`Reports and local logs: ${localOutput}`);
  if (existsSync(resolve(output, 'html/index.html'))) {
    console.error(`Open report: pnpm --dir packages/fyllut exec playwright show-report "${resolve(output, 'html')}"`);
  }
  console.error(`Server logs: ${localOutput}/epochs/<epoch-id>/stack.log`);
  console.error(`Startup status: ${localOutput}/epochs/<epoch-id>/startup.json`);
  console.error(
    `Rerun one test: pnpm playwright:fyllut${mode === 'built' ? ':built' : ''} <spec-path> --grep '<test-title>'`,
  );
  console.error('Add --headed to watch the test in a browser. This needs a graphical display.');
  process.exitCode = interrupted === 'SIGINT' ? 130 : interrupted === 'SIGTERM' ? 143 : 1;
}
