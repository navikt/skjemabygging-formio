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

test('current 89-file register passes with 795 planned tests and 38 reviewed pilot checklists', () => {
  assert.equal(checkMigration(inventory, read).length, 0);
  assert.equal(inventory.files.length, 89);
  assert.equal(inventory.staticTestDeclarations, 795);
  const pilots = inventory.files.filter((file) => ['F004', 'F017', 'F061', 'F073', 'F086'].includes(file.id));
  assert.equal(
    pilots.reduce((count, file) => count + file.tests.length, 0),
    38,
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
      ['F087', 1],
      ['F088', 5],
      ['F089', 1],
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
