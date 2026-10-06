/* eslint-disable vitest/no-import-node-test -- Standalone checker tests use node --test. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { test } from 'node:test';
import { checkDiscovery, checkMigration, flattenDiscovery } from './check-migration.mjs';
import { parseSource } from './migration-source.mjs';

const currentInventory = JSON.parse(readFileSync('packages/fyllut/playwright/migration/inventory.json', 'utf8'));
const inventory = structuredClone(currentInventory);
for (const file of inventory.files) {
  for (const entry of file.tests) {
    if (entry.status === 'implemented') entry.status = 'planned';
  }
}
const sources = new Map();
const read = (path) => {
  if (!sources.has(path)) {
    const source = execFileSync('git', ['show', `${inventory.revision}:${path}`], { encoding: 'utf8' });
    sources.set(path, source.replace(/^\s*\/\/ Playwright: .*\n/gm, ''));
  }
  return sources.get(path);
};
const bank = inventory.files.find((file) => file.id === 'F004');
const first = bank.tests[0];
const original = read(bank.source);
const pointer = `// Playwright: ${first.id} | ${bank.target} | ${first.proposedTitlePath.join(' > ')}`;
const withPointer = original.replace(
  "    it('should be visible and interactable'",
  `    ${pointer}\n    it('should be visible and interactable'`,
);
const withPointerRead = (path) => (path === bank.source ? withPointer : read(path));
const implementedInventory = () => {
  const copy = structuredClone(inventory);
  copy.files.find((file) => file.id === 'F004').tests[0].status = 'implemented';
  return copy;
};

test('canonical hashes ignore pointers and other comments, including comments inside test bodies', () => {
  const plain = parseSource(bank.source, original);
  const commented = parseSource(
    bank.source,
    withPointer.replace(
      "      const label = 'Kontonummer';",
      "      // A comment within the test body.\n      const label = 'Kontonummer';",
    ),
  );
  assert.equal(plain.sourceHash, commented.sourceHash);
  assert.equal(plain.tests[0].sourceHash, commented.tests[0].sourceHash);
  assert.deepEqual(commented.tests[0].referenceComments, [pointer]);
  assert.equal(
    checkMigration(inventory, (path) =>
      path === bank.source
        ? original.replace(
            "    it('should be visible and interactable'",
            "    // An ordinary comment.\n    it('should be visible and interactable'",
          )
        : read(path),
    ).length,
    0,
  );
});

test('per-test hashes include applicable hooks, exclude sibling hooks, and detect changed assertions', () => {
  const source = `describe('form', () => {
    beforeEach(() => setup('outer'));
    describe('first', () => {
      beforeEach(() => setup('first'));
      it('one', () => assert.equal(1, 1));
    });
    describe('second', () => {
      beforeEach(() => setup('second'));
      it('two', () => assert.equal(2, 2));
    });
  });`;
  const before = parseSource('example.cy.ts', source);
  const hookChange = parseSource('example.cy.ts', source.replace("setup('first')", "setup('changed')"));
  assert.notEqual(before.tests[0].sourceHash, hookChange.tests[0].sourceHash);
  assert.equal(before.tests[1].sourceHash, hookChange.tests[1].sourceHash);
  const assertionChange = parseSource('example.cy.ts', source.replace('assert.equal(1, 1)', 'assert.equal(1, 2)'));
  assert.notEqual(before.tests[0].sourceHash, assertionChange.tests[0].sourceHash);
  assert.equal(before.tests[1].sourceHash, assertionChange.tests[1].sourceHash);
  assert.deepEqual(
    parseSource('skipped.cy.ts', "describe.skip('group', () => { it('test', () => expect(true)); });").tests[0]
      .modifiers,
    ['skip'],
  );
});

test('current 92-file register has 809 active declarations and 41 pending pilot checklists', () => {
  assert.equal(checkMigration(inventory, read).length, 0);
  assert.equal(inventory.files.length, 92);
  assert.equal(inventory.staticTestDeclarations, 809);
  assert.equal(inventory.historicalTests.length, 9);
  const pilots = inventory.files.filter((file) => ['F004', 'F017', 'F061', 'F073', 'F086'].includes(file.id));
  assert.equal(
    pilots.reduce((count, file) => count + file.tests.length, 0),
    41,
  );
  assert.equal(inventory.files.find((file) => file.id === 'F063').tests.at(-1).id, 'F063-T026');
  assert.deepEqual(
    inventory.files
      .find((file) => file.id === 'F074')
      .tests.slice(8, 11)
      .map((entry) => entry.id),
    ['F074-T015', 'F074-T009', 'F074-T010'],
  );
  assert.deepEqual(
    inventory.files.slice(-3).map(({ id, tests }) => [id, tests.length]),
    [
      ['F090', 2],
      ['F091', 3],
      ['F092', 1],
    ],
  );
  assert.equal(
    inventory.files.find((file) => file.id === 'F074').tests.find((entry) => entry.id === 'F074-T010').title,
    'does not submit a deleted attachment without uploaded files',
  );
  assert.equal(
    inventory.files.find((file) => file.id === 'F085').tests.find((entry) => entry.id === 'F085-T005').title,
    'sends all values and the versioned footer',
  );
});

test('merged insertions and renamed cases retain their earlier identities', () => {
  const date = inventory.files.find((file) => file.id === 'F017');
  assert.equal(date.tests[0].id, 'F017-T011');
  assert.equal(date.tests[7].id, 'F017-T007');
  const group = inventory.files.find((file) => file.id === 'F045');
  assert.deepEqual(
    group.tests
      .filter((entry) => ['F045-T001', 'F045-T003', 'F045-T004'].includes(entry.id))
      .map(({ id, title }) => [id, title]),
    [
      ['F045-T001', 'should render a native legend and children with group spacing'],
      ['F045-T003', 'should show a background color when backgroundColor is true'],
      ['F045-T004', 'should have a transparent background when backgroundColor is false'],
    ],
  );
  const shifted = structuredClone(inventory);
  const rewritten = shifted.files.find((file) => file.id === 'F017');
  rewritten.tests.forEach((entry, index) => {
    entry.id = `F017-T${String(index + 1).padStart(3, '0')}`;
  });
  shifted.sourceOrderOverrides.F017 = rewritten.tests.map((entry) => entry.id);
  assert.throws(() => checkMigration(shifted, read), /Stable source order changed/);
  const translation = inventory.files.find((file) => file.id === 'F082');
  assert.equal(translation.tests.at(-1).id, 'F082-T009');
  assert.equal(translation.tests.find((entry) => entry.id === 'F082-T013').runtimeCases.length, 3);
  assert(
    translation.tests
      .filter((entry) => ['F082-T010', 'F082-T011', 'F082-T012'].includes(entry.id))
      .every((entry) => entry.buildOnly),
  );
});

test('historical removals reserve IDs and keep requirement decisions pending', () => {
  assert(inventory.historicalTests.every((entry) => entry.decision === 'pending'));
  assert.deepEqual(
    inventory.files.find((file) => file.id === 'F008').tests.map((entry) => entry.id),
    ['F008-T001', 'F008-T002', 'F008-T003', 'F008-T004', 'F008-T005', 'F008-T007', 'F008-T008'],
  );
  const forgotten = structuredClone(inventory);
  forgotten.historicalTests.splice(0, 1);
  assert.throws(() => checkMigration(forgotten, read), /Missing reserved historical ID/);
  const reused = structuredClone(inventory);
  reused.files.find((file) => file.id === 'F008').tests[5].id = 'F008-T006';
  assert.throws(() => checkMigration(reused, read), /Invalid test IDs|Duplicate migration ID/);
  const duplicate = structuredClone(inventory);
  duplicate.historicalTests.push(structuredClone(duplicate.historicalTests[0]));
  assert.throws(() => checkMigration(duplicate, read), /Duplicate historical ID/);
  const approved = structuredClone(inventory);
  approved.historicalTests[0].decision = 'approved';
  assert.throws(() => checkMigration(approved, read), /separate human approval/);
});

test('a further middle deletion preserves active IDs and accepts a historical reservation', () => {
  const copy = structuredClone(inventory);
  const file = copy.files.find((entry) => entry.id === bank.id);
  const [removed] = file.tests.splice(1, 1);
  const parsed = parseSource(bank.source, original);
  const lines = original.split('\n');
  lines.splice(parsed.tests[1].line - 1, parsed.tests[1].endLine - parsed.tests[1].line + 1);
  const source = lines.join('\n');
  const current = parseSource(bank.source, source);
  file.sourceHash = current.sourceHash;
  file.hooks = current.hooks;
  copy.staticTestDeclarations--;
  copy.pilotTestDeclarations--;
  copy.historicalTests.push({
    fileId: file.id,
    source: file.source,
    fromRevision: copy.revision,
    removedAtRevision: copy.revision,
    decision: 'pending',
    reason: 'Synthetic deletion exercises stable identities without approving retirement.',
    test: removed,
  });
  assert.equal(file.tests[1].id, 'F004-T003');
  assert.equal(checkMigration(copy, (path) => (path === bank.source ? source : read(path))).length, 0);
});

test('an inserted middle case appends a new ID instead of shifting existing cases', () => {
  const copy = structuredClone(inventory);
  const file = copy.files.find((entry) => entry.id === bank.id);
  const source = original.replace(
    "    it('should be visible and interactable'",
    "    it('new synthetic case', () => expect(true));\n    it('should be visible and interactable'",
  );
  const parsed = parseSource(bank.source, source);
  const { referenceComments: _comments, ...metadata } = parsed.tests[0];
  file.tests.unshift({
    ...metadata,
    id: 'F004-T008',
    status: 'planned',
    coverageReview: 'pending',
    playwrightReview: 'pending',
    coverageChecklist: ['Synthetic insertion preserves the original identities of later cases.'],
  });
  file.sourceHash = parsed.sourceHash;
  file.hooks = parsed.hooks;
  copy.sourceOrderOverrides.F004 = file.tests.map((entry) => entry.id);
  copy.staticTestDeclarations++;
  copy.pilotTestDeclarations++;
  assert.equal(file.tests[1].id, 'F004-T001');
  assert.equal(checkMigration(copy, (path) => (path === bank.source ? source : read(path))).length, 0);
});

test('built-only classification inherits real skip calls and ignores comments or strings', () => {
  const source = `describe('outer', () => {
    describe('built', () => {
      beforeEach(() => { cy.skipIfNoIncludeDistTests(); });
      it('inherited', () => expect(true));
    });
    it('comment', () => { /* cy.skipIfNoIncludeDistTests(); */ expect(true); });
    it('string', () => expect('cy.skipIfNoIncludeDistTests('));
    it('direct', () => { cy.skipIfNoIncludeDistTests(); expect(true); });
  });`;
  assert.deepEqual(
    parseSource('example.cy.ts', source).tests.map((entry) => entry.buildOnly),
    [true, false, false, true],
  );
});

test('ten pilot pointers match the current working tree', () => {
  const entries = checkMigration(currentInventory);
  assert.equal(entries.length, 10);
});

test('source or inventory tampering fails closed', () => {
  assert.throws(
    () =>
      checkMigration(inventory, (path) =>
        path === bank.source ? original.replace("should('be.enabled')", "should('be.disabled')") : read(path),
      ),
    /Source changed/,
  );
  const incomplete = structuredClone(inventory);
  incomplete.files.find((file) => file.id === 'F004').tests[0].coverageChecklist = [];
  assert.throws(() => checkMigration(incomplete, read), /Missing pilot checklist/);
  const moved = structuredClone(inventory);
  moved.files
    .find((file) => file.id === 'F074')
    .tests.splice(
      8,
      2,
      ...moved.files
        .find((file) => file.id === 'F074')
        .tests.slice(8, 10)
        .reverse(),
    );
  assert.throws(() => checkMigration(moved, read), /Moved migration ID/);
  const rewrittenIds = structuredClone(inventory);
  const attachments = rewrittenIds.files.find((file) => file.id === 'F074');
  attachments.tests.forEach((entry, index) => {
    entry.id = `F074-T${String(index + 1).padStart(3, '0')}`;
  });
  rewrittenIds.sourceOrderOverrides.F074 = attachments.tests.map((entry) => entry.id);
  assert.throws(() => checkMigration(rewrittenIds, read), /Stable source order changed/);
  const alphabetized = structuredClone(inventory);
  alphabetized.files.sort((a, b) => a.source.localeCompare(b.source));
  assert.throws(() => checkMigration(alphabetized, read), /Source IDs changed/);
  for (const mutate of [
    (copy) => {
      copy.files[0].tests[1].id = copy.files[0].tests[0].id;
    },
    (copy) => {
      copy.files[0].tests.pop();
    },
  ]) {
    const changed = structuredClone(inventory);
    mutate(changed);
    assert.throws(() => checkMigration(changed, read), /Invalid test IDs|Inventory total is inconsistent/);
  }
  const customized = inventory.files.find((file) => file.id === 'F003');
  const changedHelper = read(customized.source).replace(
    "cy.wait('@uploadIdFile').its('response.statusCode').should('eq', 201)",
    "cy.wait('@uploadIdFile').its('response.statusCode').should('eq', 202)",
  );
  assert.notEqual(changedHelper, read(customized.source), 'Helper test must actually change its source');
  assert.throws(
    () => checkMigration(inventory, (path) => (path === customized.source ? changedHelper : read(path))),
    /Source changed/,
  );
});

test('implementation requires exact Cypress pointer and Playwright discovery backlink', () => {
  const implemented = implementedInventory();
  assert.throws(() => checkMigration(implemented, read), /Missing or stale Cypress pointer/);
  const entries = checkMigration(implemented, withPointerRead);
  assert.equal(entries.length, 1);
  const discovered = [
    {
      file: bank.target,
      title: first.title,
      titlePath: first.proposedTitlePath,
      annotations: [
        { type: 'migration-id', description: first.id },
        { type: 'cypress-source', description: bank.source },
      ],
    },
  ];
  assert.doesNotThrow(() => checkDiscovery(entries, discovered));
  assert.throws(() => checkDiscovery(entries, [{ ...discovered[0], annotations: [] }]), /Expected one migration ID/);
  assert.throws(() => checkDiscovery(entries, [{ ...discovered[0], titlePath: ['different'] }]), /Wrong target title/);
  assert.throws(() => checkDiscovery(entries, [{ ...discovered[0], skipped: true }]), /Unexpected skip/);
  const report = {
    suites: [
      {
        title: 'bankaccount.spec.ts',
        file: bank.target,
        suites: [
          {
            title: 'BankAccount',
            suites: [
              {
                title: 'Display',
                specs: [{ title: first.title, file: bank.target, tests: [{ annotations: discovered[0].annotations }] }],
              },
            ],
          },
        ],
      },
    ],
  };
  assert.doesNotThrow(() => checkDiscovery(entries, flattenDiscovery(report)));
  const rootDir = resolve(import.meta.dirname, '../../packages/fyllut/playwright/e2e');
  const relativeFile = relative(rootDir, resolve(import.meta.dirname, '../..', bank.target));
  const listed = structuredClone(report);
  listed.config = { rootDir };
  listed.suites[0].file = relativeFile;
  listed.suites[0].suites[0].suites[0].specs[0].file = relativeFile;
  assert.doesNotThrow(() => checkDiscovery(entries, flattenDiscovery(listed)));
  assert.throws(
    () => flattenDiscovery({ ...report, errors: [{ message: 'Collection failed' }] }),
    /discovery reported errors/,
  );
  assert.throws(
    () =>
      checkDiscovery(
        entries,
        flattenDiscovery({
          ...report,
          suites: report.suites.map((suite) => ({ ...suite, suites: [...suite.suites, ...suite.suites] })),
        }),
      ),
    /Unexpected number of Playwright tests/,
  );
  const verified = structuredClone(implemented);
  verified.files.find((file) => file.id === 'F004').tests[0].status = 'verified';
  assert.throws(() => checkMigration(verified, withPointerRead), /Coverage review missing/);
});

test('pilot pointer and normalized discovery match the agreed F004-T005 format', () => {
  const expected = bank.tests.find((entry) => entry.id === 'F004-T005');
  const exactPointer = `// Playwright: ${expected.id} | ${bank.target} | ${expected.proposedTitlePath.join(' > ')}`;
  const source = original.replace(
    "    it('should validate invalid account number'",
    `    ${exactPointer}\n    it('should validate invalid account number'`,
  );
  const registered = structuredClone(inventory);
  registered.files.find((file) => file.id === 'F004').tests[4].status = 'implemented';
  const entries = checkMigration(registered, (path) => (path === bank.source ? source : read(path)));
  assert.equal(entries.length, 1);
  assert.doesNotThrow(() =>
    checkDiscovery(entries, [
      {
        file: bank.target,
        titlePath: expected.proposedTitlePath,
        annotations: [
          { type: 'migration-id', description: expected.id },
          { type: 'cypress-source', description: bank.source },
        ],
      },
    ]),
  );
  assert.throws(
    () =>
      checkMigration(registered, (path) =>
        path === bank.source
          ? source.replace(exactPointer, exactPointer.replace('BankAccount > Validation >', 'BankAccount > Display >'))
          : read(path),
      ),
    /Missing or stale Cypress pointer/,
  );
});
