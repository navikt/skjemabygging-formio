import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseSource } from './migration-source.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const inventoryPath = 'packages/fyllut/playwright/migration/inventory.json';
const pilotIds = new Set(['F004', 'F017', 'F061', 'F073', 'F086']);
const migrationId = (fileId, index) => `${fileId}-T${String(index + 1).padStart(3, '0')}`;
const reservedRemovals = [
  'F006-T009',
  'F008-T006',
  'F013-T006',
  'F019-T008',
  'F049-T005',
  'F051-T011',
  'F055-T008',
  'F056-T010',
  'F056-T011',
];
const listSources = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listSources(path) : entry.name.endsWith('.cy.ts') ? [relative(root, path)] : [];
  });

const checkMigration = (inventory, read = (path) => readFileSync(resolve(root, path), 'utf8')) => {
  assert.match(inventory.revision, /^[a-f0-9]{40}$/, 'Invalid inventory baseline revision');
  assert(Number.isInteger(inventory.staticTestDeclarations), 'Invalid source test total');
  assert(inventory.staticTestDeclarations > 0, 'Empty source test total');
  assert(Array.isArray(inventory.files) && inventory.files.length > 0, 'Empty source file register');
  assert.equal(
    inventory.files.reduce((count, file) => count + file.tests.length, 0),
    inventory.staticTestDeclarations,
    'Inventory total is inconsistent',
  );
  const ids = new Set();
  assert(Array.isArray(inventory.historicalTests), 'Missing historical test register');
  const historicalIds = new Set();
  for (const historical of inventory.historicalTests) {
    const file = inventory.files.find((entry) => entry.id === historical.fileId);
    assert(file && file.source === historical.source, 'Unknown historical source');
    assert.match(historical.fromRevision, /^[a-f0-9]{40}$/, 'Invalid historical source revision');
    assert.match(historical.removedAtRevision, /^[a-f0-9]{40}$/, 'Invalid removal revision');
    assert.equal(historical.decision, 'pending', 'Historical removal requires separate human approval');
    assert(typeof historical.reason === 'string' && historical.reason.trim().length >= 12, 'Missing removal reason');
    assert.match(historical.test.id, new RegExp(`^${file.id}-T\\d{3}$`), 'Invalid historical test ID');
    assert.match(historical.test.sourceHash, /^[a-f0-9]{64}$/, 'Missing historical source hash');
    assert(
      historical.test.sourceUrl.startsWith(
        `https://github.com/navikt/skjemabygging-formio/blob/${historical.fromRevision}/${file.source}#L`,
      ),
      'Missing historical source reference',
    );
    assert(!ids.has(historical.test.id), `Duplicate historical ID: ${historical.test.id}`);
    ids.add(historical.test.id);
    historicalIds.add(historical.test.id);
  }
  for (const id of reservedRemovals) assert(historicalIds.has(id), `Missing reserved historical ID: ${id}`);
  const sources = new Set();
  const targets = new Set();
  const sourceOrderOverrides = inventory.sourceOrderOverrides ?? {};
  const stableOrders = {
    F014: [
      migrationId('F014', 0),
      migrationId('F014', 1),
      'F014-T008',
      ...Array.from({ length: 5 }, (_, index) => migrationId('F014', index + 2)),
    ],
    F017: ['F017-T011', ...Array.from({ length: 10 }, (_, index) => migrationId('F017', index))],
    F044: [
      ...Array.from({ length: 7 }, (_, index) => migrationId('F044', index)),
      'F044-T013',
      ...Array.from({ length: 5 }, (_, index) => migrationId('F044', index + 7)),
    ],
    F048: ['F048-T008', ...Array.from({ length: 7 }, (_, index) => migrationId('F048', index))],
    F063: [...Array.from({ length: 25 }, (_, index) => migrationId('F063', index)), 'F063-T027', 'F063-T026'],
    F074: [
      ...Array.from({ length: 8 }, (_, index) => migrationId('F074', index)),
      'F074-T015',
      ...Array.from({ length: 6 }, (_, index) => migrationId('F074', index + 8)),
    ],
    F082: [
      ...Array.from({ length: 8 }, (_, index) => migrationId('F082', index)),
      ...Array.from({ length: 4 }, (_, index) => migrationId('F082', index + 9)),
      'F082-T009',
    ],
  };
  for (const [fileId, order] of Object.entries(stableOrders)) {
    assert.deepEqual(sourceOrderOverrides[fileId], order, `Stable source order changed: ${fileId}`);
  }
  assert.deepEqual(
    Object.keys(sourceOrderOverrides).sort(),
    Object.keys(sourceOrderOverrides)
      .filter((fileId) => inventory.files.some((file) => file.id === fileId))
      .sort(),
    'Unknown source-order override',
  );
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
    const historical = inventory.historicalTests.filter((entry) => entry.fileId === file.id);
    const allFileIds = [...file.tests.map((test) => test.id), ...historical.map((entry) => entry.test.id)].sort();
    assert.deepEqual(
      allFileIds,
      allFileIds.map((_, index) => migrationId(file.id, index)),
      `Invalid test IDs: ${file.id}`,
    );
    assert.deepEqual(
      file.tests.map((test) => test.id),
      sourceOrderOverrides[file.id] ?? allFileIds.filter((id) => !historicalIds.has(id)),
      `Moved migration ID: ${file.id}`,
    );
    file.tests.forEach((test, index) => {
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
  assert.equal(
    ids.size,
    inventory.staticTestDeclarations + inventory.historicalTests.length,
    'Duplicate or missing migration ID',
  );
  assert(
    Number.isInteger(inventory.pilotTestDeclarations) && inventory.pilotTestDeclarations > 0,
    'Invalid pilot total',
  );
  assert.equal(
    [...pilotIds].reduce((count, id) => count + inventory.files.find((file) => file.id === id).tests.length, 0),
    inventory.pilotTestDeclarations,
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

const checkDiscovery = (implemented, discovered, mode = 'built') => {
  assert(['dev', 'built'].includes(mode), 'Invalid execution mode');
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
    const expectedSkip = mode === 'dev' && id === 'F086-T002';
    assert.equal(test.expectedStatus === 'skipped' || !!test.skipped, expectedSkip, `Unexpected skip: ${id}`);
    assert(
      ['passed', ...(expectedSkip ? ['skipped'] : [])].includes(test.expectedStatus ?? 'passed'),
      `Unexpected expected status: ${id}`,
    );
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
          results: entry.results,
          status: entry.status,
        });
      }
    }
    for (const child of suite.suites ?? []) visit(child, nested);
  };
  for (const suite of report.suites) visit(suite, [], true);
  return results;
};

const checkResults = (implemented, report, mode) => {
  assert(implemented.length > 0, 'EMPTY_SELECTION');
  const tests = flattenDiscovery(report);
  checkDiscovery(implemented, tests, mode);
  for (const test of tests) {
    const id = test.annotations.find((annotation) => annotation.type === 'migration-id').description;
    const skipped = mode === 'dev' && id === 'F086-T002';
    assert.equal(test.results?.length, 1, `Missing result or retry: ${id}`);
    assert.equal(test.results[0].retry, 0, `Retry: ${id}`);
    assert.equal(test.results[0].status, skipped ? 'skipped' : 'passed', `Unexpected result: ${id}`);
    assert.equal(test.status, skipped ? 'skipped' : 'expected', `Unexpected aggregate status: ${id}`);
    assert.equal(test.results[0].errors?.length ?? 0, 0, `Result errors: ${id}`);
  }
};

const checkSourceSet = (inventory) => {
  assert.deepEqual(
    listSources(resolve(root, 'packages/fyllut/cypress/e2e')).sort(),
    inventory.files.map((file) => file.source).sort(),
    'Cypress file set changed. Reconcile the register.',
  );
};

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const inventory = JSON.parse(readFileSync(resolve(root, inventoryPath), 'utf8'));
  checkSourceSet(inventory);
  const implemented = checkMigration(inventory);
  assert(implemented.length === 0 || process.argv[2], 'Playwright discovery JSON required for implemented tests');
  if (process.argv[2]) checkDiscovery(implemented, flattenDiscovery(JSON.parse(readFileSync(process.argv[2], 'utf8'))));
  console.log(
    `Migration register: ${inventory.staticTestDeclarations} source tests, ${implemented.length} implemented; reviews remain explicit.`,
  );
}

export { checkDiscovery, checkMigration, checkResults, checkSourceSet, flattenDiscovery };
