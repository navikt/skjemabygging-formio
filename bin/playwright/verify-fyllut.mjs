import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isPortFree } from '../lib/managed-test-stack.mjs';
import { flattenDiscovery } from './check-migration.mjs';
import { checkBuild } from './test-epoch.mjs';

const root = resolve(import.meta.dirname, '../..');
const cli = resolve(root, 'packages/fyllut/node_modules/@playwright/test/cli.js');
assert(existsSync(cli), 'DEPENDENCIES_REQUIRED: run pnpm install --frozen-lockfile before verification');
checkBuild('built');
const output = resolve(root, 'packages/fyllut/.runtime/playwright', `verify-${Date.now()}-${process.pid}`);
mkdirSync(output, { recursive: true });
const exclusiveOutput = resolve(output, 'exclusive');
mkdirSync(exclusiveOutput, { recursive: true });
const exclusive = spawnSync(
  process.execPath,
  [cli, 'test', '--config', 'packages/fyllut/playwright.technical.config.ts', '--grep', 'exclusive-declaration'],
  {
    cwd: root,
    encoding: 'utf8',
    timeout: 30000,
    env: {
      ...process.env,
      FYLLUT_PLAYWRIGHT_MODE: 'built',
      FYLLUT_PLAYWRIGHT_OUTPUT_DIR: exclusiveOutput,
      FYLLUT_PLAYWRIGHT_EXCLUSIVE: 'true',
    },
  },
);
assert.equal(exclusive.status, 1, 'Exclusive declaration was not rejected');
const exclusiveReport = JSON.parse(readFileSync(resolve(exclusiveOutput, 'results.json'), 'utf8'));
assert(
  exclusiveReport.errors.some((error) => /forbidOnly/.test(error.message)),
  'Wrong exclusive-declaration failure',
);
assert(!existsSync(resolve(exclusiveOutput, 'epochs')), 'Exclusive collection started a stack');
const empty = spawnSync(
  process.execPath,
  [resolve(import.meta.dirname, 'run-fyllut.mjs'), '--list', '--grep', '__no_such_migration_case__'],
  { cwd: root, encoding: 'utf8', timeout: 30000 },
);
assert.equal(empty.status, 1, 'Empty selection passed');
assert.match(`${empty.stdout}${empty.stderr}`, /No tests found|EMPTY_SELECTION/);
const cases = [
  ['unknown-variant', 'Could not select mock variant', false],
  ['missing-route', 'EVIDENCE_MISSING_ROUTE', true],
  ['wrong-json-variant', 'EVIDENCE_WRONG_VARIANT', true],
  ['wrong-middleware-variant', 'EVIDENCE_WRONG_VARIANT', true],
  ['body-mismatch', 'EVIDENCE_BODY_MISMATCH', true],
  ['reset-before', 'CONTROLLED_RESET_FAILURE', false],
  ['restore-after', 'CONTROLLED_RESTORE_FAILURE', true],
  ['test-and-restore', 'CONTROLLED_TEST_FAILURE', true],
  ['poison', 'CONTROLLED_RESTORE_FAILURE', true],
  ['cleanup', 'CONTROLLED_PROCESS_CLEANUP_FAILURE', true],
  ['startup-collision', 'STACK_PORT_COLLISION', false],
  ['concurrent-owner', undefined, true],
  ['late-request', undefined, false],
  ['teardown-mismatch', 'EVIDENCE_BODY_MISMATCH', true],
  ['teardown-valid', undefined, true],
  ['download-response', undefined, true],
  ['missing-static-form', 'STATIC_PDF_PAGE_REQUIRED', true],
];
const summary = [
  { id: 'exclusive-declaration', innerExit: exclusive.status, verified: true },
  { id: 'empty-selection', innerExit: empty.status, verified: true },
];
for (const [id, expectedError, actionExpected] of cases) {
  const paired = ['poison', 'cleanup'].includes(id);
  const directory = resolve(output, id);
  mkdirSync(directory, { recursive: true });
  const child = spawnSync(
    process.execPath,
    [
      cli,
      'test',
      '--config',
      'packages/fyllut/playwright.technical.config.ts',
      '--grep',
      paired ? `(?:^| )${id}-(?:first|next)(?: |$)` : `(?:^| )${id}(?: |$)`,
    ],
    {
      cwd: root,
      env: { ...process.env, FYLLUT_PLAYWRIGHT_MODE: 'built', FYLLUT_PLAYWRIGHT_OUTPUT_DIR: directory },
      encoding: 'utf8',
      timeout: 180000,
      maxBuffer: 10 * 1024 * 1024,
    },
  );
  writeFileSync(resolve(directory, 'runner.log'), `${child.stdout ?? ''}${child.stderr ?? ''}`);
  assert(!child.error, `${id}: inner runner failed to execute: ${child.error}`);
  assert.equal(child.signal, null, `${id}: unexpected inner signal`);
  assert.equal(child.status, expectedError ? 1 : 0, `${id}: unexpected exit; see ${directory}`);
  const report = JSON.parse(readFileSync(resolve(directory, 'results.json'), 'utf8'));
  const tests = flattenDiscovery(report);
  const expectedIds = paired ? [`${id}-first`, `${id}-next`] : [id];
  assert.deepEqual(
    tests.map((test) => test.annotations.find((annotation) => annotation.type === 'technical-id')?.description),
    expectedIds,
  );
  for (const [index, test] of tests.entries()) {
    assert.equal(test.expectedStatus, 'passed', `${id}: expected-failure declarations are not allowed`);
    assert.equal(test.results.length, 1, `${id}: missing result or retry`);
    const result = test.results[0];
    assert.equal(result.retry, 0);
    const code = paired && index === 1 ? 'PREVIOUS_EPOCH_FAILED' : expectedError;
    assert.equal(result.status, code ? 'failed' : 'passed', `${id}: wrong failure category`);
    const errors = (result.errors ?? []).map((error) => error.message).join('\n');
    if (code) assert(errors.includes(code), `${id}: missing structured reason ${code}`);
    if (id === 'test-and-restore') assert(errors.includes('CONTROLLED_RESTORE_FAILURE'), 'Lost teardown error');
    if (['body-mismatch', 'teardown-mismatch'].includes(id))
      assert(errors.includes('bunntekst.lowerMiddle'), 'Lost exact mismatch path');
    if (id.startsWith('teardown-')) {
      assert(result.attachments.some((attachment) => attachment.name === 'teardown-request'));
    }
    if (id === 'download-response') {
      assert(result.attachments.some((attachment) => attachment.name === 'held-download-rejected'));
    }
    const action = result.attachments?.some((attachment) => attachment.name === 'action-started') ?? false;
    assert.equal(action, index === 0 && actionExpected, `${id}: incorrect user-action ordering`);
    if (id === 'startup-collision') {
      assert(
        result.attachments.some((attachment) => attachment.name === 'foreign-survived'),
        'Foreign service was not verified alive',
      );
    }
  }
  const epochs = readdirSync(resolve(directory, 'epochs'));
  if (paired) assert.equal(epochs.length, 1, 'A second epoch started after failed cleanup');
  for (const epoch of epochs) {
    const manifest = JSON.parse(readFileSync(resolve(directory, 'epochs', epoch, 'manifest.json'), 'utf8'));
    assert(manifest.stoppedAt, `${id}: no confirmed stop for ${epoch}`);
    if (['teardown-mismatch', 'teardown-valid'].includes(id)) {
      assert(manifest.quiescedAt, `${id}: application was not stopped before final evidence`);
      const snapshot = JSON.parse(readFileSync(resolve(directory, 'epochs', epoch, 'mock-evidence.json'), 'utf8'));
      assert.equal(snapshot.records.length, 2, `${id}: late request missing from final snapshot`);
      assert.equal(snapshot.records[1].validation, id === 'teardown-mismatch' ? 'failed' : 'passed');
    }
    for (const pid of manifest.pids) {
      assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' }, `${id}: child ${pid} survived`);
    }
  }
  for (const port of [3440, 3441, 3442, 3443]) assert(await isPortFree(port), `${id}: port ${port} leaked`);
  summary.push({ id, innerExit: child.status, expectedError: expectedError ?? null, verified: true });
  writeFileSync(resolve(output, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log(`Verified technical control: ${id}`);
}
console.log(`PLAYWRIGHT_VERIFICATION_ARTIFACTS=${output}`);
