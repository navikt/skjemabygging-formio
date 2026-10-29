import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, test } from 'vitest';
import { validateSources } from './render/validate-sources.mjs';
import { makePlan, render } from './test-helpers.mjs';

let repository;
let base;
let head;
const git = (...args) => execFileSync('git', ['-C', repository, ...args], { encoding: 'utf8' }).trim();
const commit = () => {
  git('add', '.');
  git(
    '-c',
    'user.name=Test',
    '-c',
    'user.email=test@example.invalid',
    '-c',
    'commit.gpgsign=false',
    '-c',
    'core.hooksPath=/dev/null',
    'commit',
    '--quiet',
    '-m',
    'Test fixture',
  );
  return git('rev-parse', 'HEAD');
};
const sourcePlan = () => {
  const plan = makePlan(false);
  plan.source.commitSha = head;
  plan.testCases[0].journeyCheck = {
    status: 'source-mapped',
    route: 'Mapped route',
    note: 'Committed source, not a browser observation',
    evidence: ['src/input.ts:1-3'],
  };
  return plan;
};

beforeAll(() => {
  repository = mkdtempSync(join(tmpdir(), 'plan-source-test-'));
  git('init', '--quiet');
  mkdirSync(join(repository, 'src'));
  writeFileSync(join(repository, 'src/input.ts'), 'first\nsecond\nthird\n');
  writeFileSync(join(repository, 'Dockerfile'), 'FROM test\n');
  base = commit();
  writeFileSync(join(repository, 'another.txt'), 'Another committed file\n');
  head = commit();
  writeFileSync(join(repository, 'src/input.ts'), 'Uncommitted replacement\n');
});
afterAll(() => rmSync(repository, { recursive: true }));

test('checks exact committed content rather than the current working-tree file', () => {
  const plan = sourcePlan();
  plan.behaviorAnalysis[0].evidence = [`Dockerfile:1 (${base})`, 'src/input.ts:1,3'];
  assert.doesNotThrow(() => validateSources(plan, repository));
});

test.each([
  ['src/input.ts:0', /outside/],
  ['src/input.ts:3-2', /outside/],
  ['src/input.ts:1-4', /outside/],
  ['src/input.ts:2 (not-a-commit)', /invalid source citation/],
  ['src/missing.ts:1', /file is unavailable/],
  ['src:1', /must identify a committed file/],
  ['/src/input.ts:1', /repository-relative/],
  ['../src/input.ts:1', /repository-relative/],
])('rejects invalid citation %s', (citation, message) => {
  const plan = sourcePlan();
  plan.testCases[0].journeyCheck.evidence = [citation];
  assert.throws(() => validateSources(plan, repository), message);
});

test('requires a committed citation for a source-mapped route but not a browser observation', () => {
  const plan = sourcePlan();
  plan.testCases[0].journeyCheck.evidence = ['Form revision 7'];
  assert.throws(() => validateSources(plan, repository), /requires a committed file\/line citation/);
  plan.testCases[0].journeyCheck.status = 'verified';
  assert.doesNotThrow(() => validateSources(plan, repository));
});

test('reports missing committed objects without fetching or substituting local files', () => {
  const plan = sourcePlan();
  plan.source.commitSha = '0'.repeat(40);
  assert.throws(() => validateSources(plan, repository), /unavailable.*fetch the committed object/);
});

test('requires a Git repository', () => {
  assert.throws(() => validateSources(sourcePlan(), join(repository, 'missing')), /available Git repository/);
});

test('verifies that related PR revisions are included in the primary head', () => {
  const plan = sourcePlan();
  plan.source.relatedPullRequests = [{ number: 42, commitSha: base }];
  assert.doesNotThrow(() => validateSources(plan, repository));
  plan.source.commitSha = base;
  plan.source.relatedPullRequests[0].commitSha = head;
  assert.throws(() => validateSources(plan, repository), /could not establish.*ancestor/);
});

test('the renderer exposes source validation through --source-repo', () => {
  const run = render(sourcePlan());
  try {
    const result = run.invoke('--source-repo', repository);
    assert.equal(result.status, 0, result.stderr);
    const missing = run.invoke('--source-repo');
    assert.equal(missing.status, 1);
    assert.match(missing.stderr, /requires a repository path/);
  } finally {
    run.cleanup();
  }
});
