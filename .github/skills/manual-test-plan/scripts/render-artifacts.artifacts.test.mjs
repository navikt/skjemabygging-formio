import assert from 'node:assert/strict';
import { test } from 'vitest';
import { makePlan, render } from './test-helpers.mjs';

test('rejects obsolete artifact manifests instead of attempting legacy cleanup', () => {
  const run = render(makePlan(false));
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    run.write('manifest.json', JSON.stringify({ manifestVersion: 2, files: [] }));
    const rerun = run.rerun();
    assert.equal(rerun.status, 1);
    assert.match(rerun.stderr, /supported manifestVersion/);
  } finally {
    run.cleanup();
  }
});

test('still accepts a manifest written with the legacy schemaVersion field', () => {
  const run = render(makePlan(false));
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    const manifest = JSON.parse(run.read('manifest.json'));
    const { manifestVersion, ...rest } = manifest;
    run.write('manifest.json', JSON.stringify({ schemaVersion: 3, ...rest }));
    const rerun = run.rerun();
    assert.equal(rerun.status, 0, rerun.stderr);
    assert.match(run.read('manifest.json'), /"manifestVersion": 1/);
  } finally {
    run.cleanup();
  }
});

test('keeps a manually printed PDF on rerender without claiming it is current', () => {
  const run = render(makePlan(true));
  try {
    assert.equal(run.result.status, 0);
    const manualPdf = '%PDF-1.7\nManually printed plan\n%%EOF\n';
    run.write('test-plan.pdf', manualPdf);
    const rerun = run.rerun();
    assert.equal(rerun.status, 0, rerun.stderr);
    assert.equal(run.read('test-plan.pdf'), manualPdf);
    assert.match(rerun.stdout, /unmanaged test-plan\.pdf exists; rerendering did not update it/);
    assert.doesNotMatch(run.read('manifest.json'), /test-plan\.pdf/);
  } finally {
    run.cleanup();
  }
});

test('refuses to remove a PDF tracked by an older manifest', () => {
  const run = render(makePlan(true));
  try {
    assert.equal(run.result.status, 0);
    const pdf = '%PDF-1.7\nOld plan\n%%EOF\n';
    run.write('test-plan.pdf', pdf);
    const manifest = JSON.parse(run.read('manifest.json'));
    manifest.files.push({ path: 'test-plan.pdf', sha256: 'a'.repeat(64) });
    run.write('manifest.json', JSON.stringify(manifest));
    const rerun = run.rerun();
    assert.equal(rerun.status, 1);
    assert.match(rerun.stderr, /move it outside the output directory before rerendering/);
    assert.equal(run.read('test-plan.pdf'), pdf);
    assert.equal(run.read('manifest.json'), JSON.stringify(manifest));
  } finally {
    run.cleanup();
  }
});

test('renders HTML, the issue, or both for a developer plan on request', () => {
  const run = render(makePlan(false));
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    assert.ok(run.exists('github-issue.md'));
    assert.ok(!run.exists('index.html'));

    const html = run.invoke('--format', 'html');
    assert.equal(html.status, 0, html.stderr);
    assert.ok(run.exists('index.html'));
    assert.ok(!run.exists('github-issue.md'));
    assert.match(html.stdout, /index\.html\?print=1/);

    const both = run.invoke('--format', 'both');
    assert.equal(both.status, 0, both.stderr);
    assert.ok(run.exists('index.html'));
    assert.ok(run.exists('github-issue.md'));
    const manifestPaths = JSON.parse(run.read('manifest.json')).files.map(({ path }) => path);
    assert.ok(manifestPaths.includes('index.html') && manifestPaths.includes('github-issue.md'));
  } finally {
    run.cleanup();
  }
});

test.each(['issue', 'both'])('rejects --format %s for a plan with non-developers', (format) => {
  const run = render(makePlan(true));
  try {
    const result = run.invoke('--format', format);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /only support --format html/);
    assert.ok(!run.exists('github-issue.md'));
  } finally {
    run.cleanup();
  }
});

test('rejects an unknown --format', () => {
  const run = render(makePlan(false));
  try {
    const result = run.invoke('--format', 'pdf');
    assert.equal(result.status, 1);
    assert.match(result.stderr, /--format must be issue, html, or both/);
  } finally {
    run.cleanup();
  }
});
