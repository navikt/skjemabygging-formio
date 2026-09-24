import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseSource } from './migration-source.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const inventoryPath = 'packages/fyllut/playwright/migration/inventory.json';
const pilotIds = new Set(['F004', 'F017', 'F061', 'F073', 'F086']);
const listSources = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listSources(path) : entry.name.endsWith('.cy.ts') ? [relative(root, path)] : [];
  });

const checkMigration = (inventory, read = (path) => readFileSync(resolve(root, path), 'utf8')) => {
  assert.match(inventory.revision, /^[a-f0-9]{40}$/, 'Invalid inventory baseline revision');
  assert.equal(inventory.staticTestDeclarations, 787, 'Unexpected baseline test total');
  assert.equal(inventory.files.length, 86, 'Unexpected source file total');
  const ids = new Set();
  const sources = new Set();
  const targets = new Set();
  assert.equal(inventory.sharedSources.length, 4, 'Unexpected shared source count');
  assert.equal(new Set(inventory.sharedSources.map((entry) => entry.path)).size, 4, 'Duplicate shared source');
  const implemented = [];
  for (const [fileIndex, file] of inventory.files.entries()) {
    assert.equal(file.id, `F${String(fileIndex + 1).padStart(3, '0')}`, 'Source IDs changed');
    assert(!sources.has(file.source), `Duplicate source: ${file.source}`);
    assert(!targets.has(file.target), `Duplicate target: ${file.target}`);
    sources.add(file.source);
    targets.add(file.target);
    assert.equal(
      file.target,
      file.source.replace('/cypress/e2e/', '/playwright/e2e/').replace(/\.cy\.ts$/, '.spec.ts'),
      `Invalid target: ${file.id}`,
    );
    const current = parseSource(file.source, read(file.source));
    assert.equal(current.sourceHash, file.sourceHash, `Source changed: ${file.source}. Reconcile the register.`);
    assert.equal(current.tests.length, file.tests.length, `Test count changed: ${file.source}`);
    assert.deepEqual(
      current.hooks.map(({ type, scopes, sourceHash }) => ({ type, scopes, sourceHash })),
      file.hooks.map(({ type, scopes, sourceHash }) => ({ type, scopes, sourceHash })),
      `Hooks changed: ${file.source}`,
    );
    assert.deepEqual(
      file.tests.map((test) => test.id).sort(),
      file.tests.map((_, index) => `${file.id}-T${String(index + 1).padStart(3, '0')}`).sort(),
      `Invalid test IDs: ${file.id}`,
    );
    file.tests.forEach((test, index) => {
      const expectedIndex = file.id === 'F063' && index >= 25 ? 52 - index : index + 1;
      assert.equal(test.id, `${file.id}-T${String(expectedIndex).padStart(3, '0')}`, `Moved migration ID: ${test.id}`);
      assert(!ids.has(test.id), `Duplicate migration ID: ${test.id}`);
      ids.add(test.id);
      const actual = current.tests[index];
      assert.deepEqual(actual.proposedTitlePath, test.proposedTitlePath, `Title changed: ${test.id}`);
      assert.equal(actual.sourceHash, test.sourceHash, `Test changed: ${test.id}`);
      assert.equal(actual.buildOnly, test.buildOnly, `Built-only status changed: ${test.id}`);
      assert.deepEqual(actual.modifiers, test.modifiers, `Test modifiers changed: ${test.id}`);
      assert(['planned', 'implemented', 'verified'].includes(test.status), `Invalid status: ${test.id}`);
      assert(['pending', 'approved'].includes(test.coverageReview), `Invalid coverage review: ${test.id}`);
      if (pilotIds.has(file.id)) {
        assert(
          Array.isArray(test.coverageChecklist) && test.coverageChecklist.length > 0,
          `Missing pilot checklist: ${test.id}`,
        );
        assert(
          test.coverageChecklist.every((item) => typeof item === 'string' && item.trim().length >= 12),
          `Invalid pilot checklist: ${test.id}`,
        );
        assert.equal(
          new Set(test.coverageChecklist).size,
          test.coverageChecklist.length,
          `Duplicate pilot checklist: ${test.id}`,
        );
        assert(['pending', 'approved'].includes(test.playwrightReview), `Invalid Playwright review: ${test.id}`);
      }
      if (test.status !== 'planned') {
        const pointer = `// Playwright: ${test.id} | ${file.target} | ${test.proposedTitlePath.join(' > ')}`;
        assert(actual.referenceComments.includes(pointer), `Missing or stale Cypress pointer: ${test.id}`);
        assert.equal(actual.modifiers.length, 0, `Skipped/exclusive source test: ${test.id}`);
        assert(
          Array.isArray(test.coverageChecklist) && test.coverageChecklist.length,
          `Missing coverage checklist: ${test.id}`,
        );
        assert(['pending', 'approved'].includes(test.playwrightReview), `Invalid Playwright review: ${test.id}`);
        implemented.push({ ...test, source: file.source, target: file.target });
        if (test.status === 'verified') {
          assert.equal(test.coverageReview, 'approved', `Coverage review missing: ${test.id}`);
          assert.equal(test.playwrightReview, 'approved', `Playwright review missing: ${test.id}`);
          assert(Array.isArray(test.evidence) && test.evidence.length > 0, `Verification evidence missing: ${test.id}`);
        }
      } else {
        assert.equal(test.coverageReview, 'pending', `Planned test has approved coverage: ${test.id}`);
        if (pilotIds.has(file.id))
          assert.equal(test.playwrightReview, 'pending', `Planned test has approved Playwright review: ${test.id}`);
        assert(
          !actual.referenceComments.some((c) => c.startsWith('// Playwright:')),
          `Planned test has pointer: ${test.id}`,
        );
      }
    });
  }
  assert.equal(ids.size, inventory.staticTestDeclarations, 'Inventory total is inconsistent');
  assert.equal(
    [...pilotIds].reduce((count, id) => count + inventory.files.find((file) => file.id === id).tests.length, 0),
    38,
    'Pilot total changed',
  );
  for (const shared of inventory.sharedSources) {
    assert.equal(
      parseSource(shared.path, read(shared.path)).sourceHash,
      shared.sourceHash,
      `Dependency changed: ${shared.path}`,
    );
  }
  return implemented;
};

const checkDiscovery = (implemented, discovered) => {
  assert(Array.isArray(discovered), 'Discovery must be a flat array of Playwright tests');
  assert.equal(discovered.length, implemented.length, 'Unexpected number of Playwright tests');
  const seen = new Set();
  for (const test of discovered) {
    const annotations = test.annotations.filter((a) => a.type === 'migration-id');
    assert.equal(annotations.length, 1, `Expected one migration ID: ${test.title}`);
    const id = annotations[0].description;
    assert(!seen.has(id), `Duplicate discovered ID: ${id}`);
    seen.add(id);
    const expected = implemented.find((entry) => entry.id === id);
    assert(expected, `Unregistered Playwright test: ${id}`);
    assert.equal(test.file, expected.target, `Wrong target file: ${id}`);
    assert.deepEqual(test.titlePath, expected.proposedTitlePath, `Wrong target title: ${id}`);
    assert(
      test.annotations.some((a) => a.type === 'cypress-source' && a.description === expected.source),
      `Missing backlink: ${id}`,
    );
    assert(!test.skipped && test.expectedStatus !== 'skipped', `Skipped Playwright test: ${id}`);
  }
};

const flattenDiscovery = (report) => {
  if (Array.isArray(report)) return report;
  assert(Array.isArray(report?.suites), 'Expected a Playwright JSON report with suites');
  assert.equal(report.errors?.length ?? 0, 0, 'Playwright discovery reported errors');
  const results = [];
  const visit = (suite, titles = [], isRoot = false) => {
    const nested = isRoot ? titles : [...titles, suite.title];
    for (const spec of suite.specs ?? []) {
      for (const entry of spec.tests ?? []) {
        results.push({
          file: relative(root, resolve(report.config?.rootDir ?? root, spec.file ?? suite.file)),
          title: spec.title,
          titlePath: [...nested, spec.title],
          annotations: entry.annotations ?? [],
          expectedStatus: entry.expectedStatus,
        });
      }
    }
    for (const child of suite.suites ?? []) visit(child, nested);
  };
  for (const suite of report.suites) visit(suite, [], true);
  return results;
};

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const inventory = JSON.parse(readFileSync(resolve(root, inventoryPath), 'utf8'));
  assert.deepEqual(
    listSources(resolve(root, 'packages/fyllut/cypress/e2e')).sort(),
    inventory.files.map((file) => file.source).sort(),
    'Cypress file set changed. Reconcile the register.',
  );
  const implemented = checkMigration(inventory);
  assert(implemented.length === 0 || process.argv[2], 'Playwright discovery JSON required for implemented tests');
  if (process.argv[2]) checkDiscovery(implemented, flattenDiscovery(JSON.parse(readFileSync(process.argv[2], 'utf8'))));
  console.log(
    `Migration register: ${inventory.staticTestDeclarations} source tests, ${implemented.length} implemented; reviews remain explicit.`,
  );
}

export { checkDiscovery, checkMigration, flattenDiscovery };
