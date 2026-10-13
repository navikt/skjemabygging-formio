/* eslint-disable vitest/no-import-node-test -- Standalone register maintenance tests. */
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { checkMigration } from './check-migration.mjs';
import { parseSource } from './migration-source.mjs';
import { describeChanges, formatChanges, reconcileInventory } from './reconcile-migration.mjs';

const inventory = JSON.parse(readFileSync('packages/fyllut/playwright/migration/inventory.json', 'utf8'));
const paths = inventory.files.map((file) => file.source);
const read = (path) => readFileSync(path, 'utf8');
const file = inventory.files.find((entry) => entry.id === 'F001');
const original = read(file.source);
const revision = 'a'.repeat(40);
const reason = 'Reviewed the changed Cypress source without approving migration coverage.';
const inspect = (source, snapshot = inventory, sources = paths) =>
  describeChanges(snapshot, sources, (path) => (path === file.source ? source : read(path)));
const reconcile = (source) => reconcileInventory(inventory, inspect(source), revision, reason);

test('report is read-only, ignores comments, and lists every changed file or shared dependency', () => {
  const before = JSON.stringify(inventory);
  assert.deepEqual(inspect(`// ordinary comment\n${original}`), []);
  const changedPaths = [file.source, paths[1], inventory.sharedSources[0].path];
  const changes = describeChanges(inventory, paths, (path) =>
    changedPaths.includes(path) ? `${read(path)}\nconst sourceChange = true;` : read(path),
  );
  assert.deepEqual(
    changes.map((change) => change.path),
    changedPaths,
  );
  assert.match(formatChanges(changes), /Shared Cypress support changed/);
  assert.throws(() => reconcileInventory(inventory, changes, revision, reason), /Manual review/);
  assert.equal(JSON.stringify(inventory), before);
});

test('routine source changes preserve IDs, untouched files, review fields and the global baseline', () => {
  const source = original.replace("should('exist')", "should('be.visible')");
  const next = reconcile(source);
  const updated = next.files[0];
  assert.deepEqual(
    updated.tests.map((test) => test.id),
    file.tests.map((test) => test.id),
  );
  assert.equal(next.revision, inventory.revision);
  assert.equal(updated.sourceRevision, revision);
  assert(updated.tests.every((test) => test.status === 'planned' && test.coverageReview === 'pending'));
  assert.deepEqual(next.files.slice(1), inventory.files.slice(1));
  assert.deepEqual(next.historicalTests, inventory.historicalTests);
  assert.equal(next.reconciliations.at(-1).previousSources[0].sourceHash, file.sourceHash);
  assert.equal(checkMigration(next, (path) => (path === file.source ? source : read(path))).length, 43);
  assert.deepEqual(inspect(source, next), []);
});

test('middle insertion appends an ID, and deletion reserves the original ID with a pending decision', () => {
  const added = original.replace(
    "    it('should render Vegadresse field'",
    "    it('new source case', () => cy.visit('/fyllut/example'));\n    it('should render Vegadresse field'",
  );
  const inserted = reconcile(added);
  const newId = `F001-T${String(file.tests.length + 1).padStart(3, '0')}`;
  assert.equal(inserted.files[0].tests[1].id, newId);
  assert.equal(inserted.files[0].tests[2].id, file.tests[1].id);
  assert.equal(inserted.staticTestDeclarations, inventory.staticTestDeclarations + 1);
  assert.equal(checkMigration(inserted, (path) => (path === file.source ? added : read(path))).length, 43);
  const parsed = parseSource(file.source, original).tests[1];
  const lines = original.split('\n');
  lines.splice(parsed.line - 1, parsed.endLine - parsed.line + 1);
  const removed = lines.join('\n');
  const deleted = reconcile(removed);
  assert.equal(deleted.files[0].tests[1].id, file.tests[2].id);
  assert.deepEqual(deleted.historicalTests.at(-1).test, file.tests[1]);
  assert.equal(deleted.historicalTests.at(-1).decision, 'pending');
  assert.equal(deleted.staticTestDeclarations, inventory.staticTestDeclarations - 1);
  assert.equal(checkMigration(deleted, (path) => (path === file.source ? removed : read(path))).length, 43);
});

test('new source files append a file ID even when alphabetically before the existing catalogue', () => {
  const path = 'packages/fyllut/cypress/e2e/aaa-new.cy.ts';
  const source = "describe('new file', () => { it('new test', () => cy.visit('/fyllut/example')); });";
  const reader = (entry) => (entry === path ? source : read(entry));
  const changes = describeChanges(inventory, [path, ...paths], reader);
  const next = reconcileInventory(inventory, changes, revision, reason);
  assert.deepEqual(next.files.slice(0, -1), inventory.files);
  assert.equal(next.files.at(-1).id, `F${String(inventory.files.length + 1).padStart(3, '0')}`);
  assert.equal(next.files.at(-1).tests[0].status, 'planned');
  assert.equal(checkMigration(next, reader).length, 43);
});

test('ambiguous renames, duplicate titles, file removal, and migrated files require explicit review', () => {
  const variants = [
    inspect(original.replace('should render C/O field', 'renamed test')),
    inspect(original.replace('should render Vegadresse field', 'should render C/O field')),
    describeChanges(inventory, paths.slice(1), read),
    describeChanges(inventory, paths, (path) =>
      path === inventory.files[3].source ? `${read(path)}\nconst changedHelper = true;` : read(path),
    ),
  ];
  for (const changes of variants) {
    assert(changes.some((change) => change.blockers.length));
    assert.throws(() => reconcileInventory(inventory, changes, revision, reason), /Manual review/);
  }
});

test('dynamic registrations cannot be auto-reconciled as single runtime cases', () => {
  for (const source of [
    "for (const value of [1, 2]) { it('same title', () => expect(value)); }",
    "[1, 2].forEach((value) => { it('same title', () => expect(value)); });",
    "describe('suite', () => { it(`case ${value}`, () => expect(value)); });",
    "describe(suiteName, () => { it('test', () => expect(true)); });",
  ]) {
    const changes = inspect(source);
    assert.match(formatChanges(changes), /Parameterized registration/);
    assert.throws(() => reconcileInventory(inventory, changes, revision, reason), /Manual review/);
  }
  assert.equal(
    parseSource('static.cy.ts', "describe('suite', () => { it('test', () => { for (;;) { break; } }); });")
      .dynamicRegistration,
    false,
  );
});

test('reconciliation requires provenance and a meaningful reason', () => {
  const changes = inspect(`${original}\nconst changedHelper = true;`);
  assert.throws(() => reconcileInventory(inventory, changes, 'HEAD', reason), /full source commit/);
  assert.throws(() => reconcileInventory(inventory, changes, revision, 'ok'), /meaningful --reason/);
});

test('the real CLI refuses uncommitted source, then writes an idempotent register for the committed source', () => {
  const fixture = mkdtempSync(resolve(import.meta.dirname, '.reconcile-cli-'));
  const registerPath = 'packages/fyllut/playwright/migration/inventory.json';
  const script = 'bin/playwright/reconcile-migration.mjs';
  const git = (...args) => execFileSync('git', args, { cwd: fixture, encoding: 'utf8' }).trim();
  const cli = (...args) => spawnSync(process.execPath, [script, ...args], { cwd: fixture, encoding: 'utf8' });
  const commit = () => {
    git('add', '.');
    git(
      '-c',
      'user.name=Reconciliation test',
      '-c',
      'user.email=reconciliation@example.invalid',
      'commit',
      '-qm',
      'test: record synthetic reconciliation source\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>',
    );
  };
  try {
    for (const path of [
      ...paths,
      ...inventory.sharedSources.map((shared) => shared.path),
      registerPath,
      script,
      'bin/playwright/check-migration.mjs',
      'bin/playwright/migration-source.mjs',
    ]) {
      const target = resolve(fixture, path);
      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(path, target);
    }
    git('init', '-q', '-b', 'reconciliation-test');
    commit();
    const baseline = readFileSync(resolve(fixture, registerPath), 'utf8');
    assert.equal(cli().status, 0);
    const modified = `${original}\nit('added source test', () => cy.visit('/fyllut/example'));\n`;
    writeFileSync(resolve(fixture, file.source), modified);
    const report = cli();
    assert.equal(report.status, 1);
    assert.match(report.stdout, /Added: added source test/);
    assert.equal(readFileSync(resolve(fixture, registerPath), 'utf8'), baseline);
    const args = ['--write', '--revision', 'HEAD', '--reason', reason];
    const refused = cli(...args);
    assert.equal(refused.status, 1);
    assert.match(refused.stderr, /Commit the source before reconciling/);
    assert.equal(readFileSync(resolve(fixture, registerPath), 'utf8'), baseline);
    commit();
    const accepted = cli(...args);
    assert.equal(accepted.status, 0, accepted.stderr);
    const updatedText = readFileSync(resolve(fixture, registerPath), 'utf8');
    const updated = JSON.parse(updatedText);
    assert.equal(updated.files[0].sourceRevision, git('rev-parse', 'HEAD'));
    assert.equal(updated.files[0].tests.length, file.tests.length + 1);
    assert.equal(cli().status, 0);
    assert.equal(cli(...args).status, 0);
    assert.equal(readFileSync(resolve(fixture, registerPath), 'utf8'), updatedText);
  } finally {
    rmSync(fixture, { recursive: true });
  }
});
