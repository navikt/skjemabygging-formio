import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { checkMigration, listSources } from './check-migration.mjs';
import { parseSource } from './migration-source.mjs';

const root = resolve(import.meta.dirname, '../..');
const inventoryPath = resolve(root, 'packages/fyllut/playwright/migration/inventory.json');
const sourceDirectory = 'packages/fyllut/cypress/e2e';
const titleKey = (test) => JSON.stringify(test.proposedTitlePath);
const describeChanges = (inventory, sources, read) => {
  const changes = [];
  for (const path of new Set([...inventory.files.map((file) => file.source), ...sources])) {
    const file = inventory.files.find((entry) => entry.source === path);
    if (!sources.includes(path)) {
      changes.push({ path, file, blockers: ['File removed or renamed: map its existing IDs explicitly.'] });
      continue;
    }
    const current = parseSource(path, read(path));
    if (current.sourceHash === file?.sourceHash) continue;
    const before = file?.tests ?? [];
    const added = current.tests.filter((test) => !before.some((old) => titleKey(old) === titleKey(test)));
    const removed = before.filter((test) => !current.tests.some((next) => titleKey(next) === titleKey(test)));
    const changed = before.filter((test) =>
      current.tests.some((next) => titleKey(next) === titleKey(test) && next.sourceHash !== test.sourceHash),
    );
    const blockers = [];
    if (before.some((test) => test.status !== 'planned')) {
      blockers.push('Migrated file: review the Playwright counterpart and reconcile explicitly.');
    }
    if (current.dynamicRegistration || before.some((test) => test.runtimeCases)) {
      blockers.push('Parameterized registration: review runtime identities explicitly.');
    }
    if (
      new Set(current.tests.map(titleKey)).size !== current.tests.length ||
      new Set(before.map(titleKey)).size !== before.length
    ) {
      blockers.push('Duplicate title paths: cannot match identities safely.');
    }
    if (added.length && removed.length) {
      blockers.push('Possible rename: map old IDs to new titles explicitly instead of replacing identities.');
    }
    const retainedTitles = before.filter((test) => !removed.includes(test)).map(titleKey);
    const currentRetainedTitles = current.tests.filter((test) => !added.includes(test)).map(titleKey);
    if (JSON.stringify(retainedTitles) !== JSON.stringify(currentRetainedTitles)) {
      blockers.push('Existing tests reordered: review the stable source order explicitly.');
    }
    if (!current.tests.length) blockers.push('Empty file: resolve the removed coverage explicitly.');
    changes.push({ path, file, current, added, removed, changed, blockers });
  }
  for (const shared of inventory.sharedSources) {
    if (parseSource(shared.path, read(shared.path)).sourceHash !== shared.sourceHash) {
      changes.push({
        path: shared.path,
        blockers: ['Shared Cypress support changed: review its effect on migrated tests explicitly.'],
      });
    }
  }
  return changes;
};

const reconcileInventory = (inventory, changes, revision, reason) => {
  assert.match(revision, /^[a-f0-9]{40}$/, 'A full source commit is required');
  assert(reason?.trim().length >= 12, 'Give a meaningful --reason for accepting these source changes');
  assert(
    changes.every((change) => !change.blockers.length),
    'Manual review required; no register changes written',
  );
  const next = structuredClone(inventory);
  const reconciliation = {
    toRevision: revision,
    reason,
    addedFiles: [],
    addedTestIds: [],
    removedTestIds: [],
    changedSources: [],
    changedTestIds: [],
    previousSources: [],
  };
  for (const { path, current, removed, changed } of changes) {
    let file = next.files.find((entry) => entry.source === path);
    if (!file) {
      file = {
        id: `F${String(next.files.length + 1).padStart(3, '0')}`,
        source: path,
        target: path.replace('/cypress/e2e/', '/playwright/e2e/').replace(/\.cy\.ts$/, '.spec.ts'),
        tests: [],
      };
      next.files.push(file);
      reconciliation.addedFiles.push({ id: file.id, source: path });
    } else {
      reconciliation.previousSources.push({
        id: file.id,
        revision: file.sourceRevision ?? inventory.revision,
        sourceHash: file.sourceHash,
      });
    }
    const previous = file.tests;
    const reserved = next.historicalTests.filter((entry) => entry.fileId === file.id).map((entry) => entry.test);
    let highestId = Math.max(0, ...[...previous, ...reserved].map((test) => Number(test.id.split('-T')[1])));
    for (const test of removed) {
      next.historicalTests.push({
        fileId: file.id,
        source: path,
        fromRevision: file.sourceRevision ?? inventory.revision,
        removedAtRevision: revision,
        decision: 'pending',
        reason,
        test,
      });
      reconciliation.removedTestIds.push(test.id);
    }
    file.tests = current.tests.map(({ referenceComments: _comments, ...metadata }) => {
      const old = previous.find((test) => titleKey(test) === titleKey(metadata));
      const id = old?.id ?? `${file.id}-T${String(++highestId).padStart(3, '0')}`;
      if (!old) reconciliation.addedTestIds.push(id);
      return {
        ...old,
        ...metadata,
        id,
        sourceUrl: `https://github.com/navikt/skjemabygging-formio/blob/${revision}/${path}#L${metadata.line}-L${metadata.endLine}`,
        status: 'planned',
        coverageReview: 'pending',
      };
    });
    file.sourceHash = current.sourceHash;
    file.sourceRevision = revision;
    file.hooks = current.hooks;
    next.sourceOrderOverrides[file.id] = file.tests.map((test) => test.id);
    reconciliation.changedSources.push(file.id);
    reconciliation.changedTestIds.push(...changed.map((test) => test.id));
  }
  next.staticTestDeclarations = next.files.reduce((count, file) => count + file.tests.length, 0);
  next.reconciliations.push(reconciliation);
  return next;
};

const formatChanges = (changes) =>
  changes.length
    ? changes
        .map(({ path, file, added = [], removed = [], changed = [], blockers }) =>
          [
            `${file?.id ?? 'NEW'} ${path}`,
            ...added.map((test) => `  Added: ${test.proposedTitlePath.join(' > ')}`),
            ...removed.map((test) => `  Removed: ${test.id} ${test.title} (requirement decision stays pending)`),
            ...changed.map((test) => `  Changed: ${test.id} ${test.title}`),
            ...(added.length || removed.length || changed.length ? [] : ['  File/helper/hook metadata changed']),
            ...blockers.map((blocker) => `  REVIEW REQUIRED: ${blocker}`),
            ...(blockers.length ? [] : ['  Can reconcile after committing the source and reviewing this report.']),
          ].join('\n'),
        )
        .join('\n\n')
    : 'Migration register matches the Cypress sources. No changes needed.';

const run = () => {
  const { values } = parseArgs({
    options: {
      write: { type: 'boolean', default: false },
      revision: { type: 'string' },
      reason: { type: 'string' },
    },
    allowPositionals: false,
  });
  const original = readFileSync(inventoryPath, 'utf8');
  const inventory = JSON.parse(original);
  const sources = listSources(resolve(root, sourceDirectory)).sort();
  const read = (path) => readFileSync(resolve(root, path), 'utf8');
  const changes = describeChanges(inventory, sources, read);
  console.log(formatChanges(changes));
  if (!values.write) {
    if (changes.length) {
      console.log('\nReview first. For eligible files: --write --revision HEAD --reason "Explain the source change"');
      process.exitCode = 1;
    }
    return;
  }
  if (!changes.length) return;
  assert(values.revision, '--write requires --revision pointing to the committed Cypress source');
  const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  const revision = git(['rev-parse', '--verify', `${values.revision}^{commit}`]);
  assert.equal(git(['merge-base', revision, 'HEAD']), revision, 'Source revision must be an ancestor of HEAD');
  const committedSources = git(['ls-tree', '-r', '--name-only', revision, '--', sourceDirectory])
    .split('\n')
    .filter((path) => path.endsWith('.cy.ts'))
    .sort();
  assert.deepEqual(sources, committedSources, 'Commit added/removed Cypress files before reconciling');
  for (const path of [...sources, ...inventory.sharedSources.map((shared) => shared.path)]) {
    // Immutable source links must refer to exactly these lines, not an uncommitted approximation.
    assert.equal(
      read(path),
      execFileSync('git', ['show', `${revision}:${path}`], { cwd: root, encoding: 'utf8' }),
      `Commit the source before reconciling: ${path}`,
    );
  }
  const next = reconcileInventory(inventory, changes, revision, values.reason);
  checkMigration(next, read);
  assert.equal(readFileSync(inventoryPath, 'utf8'), original, 'Register changed during reconciliation');
  const temporaryDirectory = mkdtempSync(resolve(dirname(inventoryPath), '.reconcile-'));
  try {
    const temporary = resolve(temporaryDirectory, 'inventory.json');
    writeFileSync(temporary, `${JSON.stringify(next, null, 2)}\n`);
    renameSync(temporary, inventoryPath);
  } finally {
    rmSync(temporaryDirectory, { recursive: true });
  }
  console.log('Register updated. Review the Git diff. No coverage approval or Playwright implementation was added.');
};

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    run();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

export { describeChanges, formatChanges, reconcileInventory };
