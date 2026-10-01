import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
import { test } from 'vitest';

const script = resolve(import.meta.dirname, 'create-issue.mjs');

test('dry run shows the full rendered issue body without publishing', () => {
  const directory = mkdtempSync(join(tmpdir(), 'create-issue-test-'));
  const bodyPath = join(directory, 'issue.md');
  const ghPath = join(directory, 'gh');
  const body = '# Hele testplanen\n\n- [ ] Rydd opp etter testing\n';
  writeFileSync(bodyPath, body);
  writeFileSync(
    ghPath,
    '#!/bin/sh\nif [ "$*" = "repo view --json nameWithOwner" ]; then echo \'{"nameWithOwner":"navikt/skjemabygging-formio"}\'; else exit 1; fi\n',
    { mode: 0o755 },
  );
  try {
    const result = spawnSync(process.execPath, [script, '--title', 'Testplan', '--body', bodyPath], {
      encoding: 'utf8',
      env: { ...process.env, PATH: `${directory}${delimiter}${process.env.PATH}` },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /--- Proposed issue body ---\n# Hele testplanen\n\n- \[ \] Rydd opp etter testing/);
    assert.match(result.stdout, /--- End proposed issue body ---/);
    assert.equal(readFileSync(bodyPath, 'utf8'), body);
  } finally {
    rmSync(directory, { recursive: true });
  }
});

test('rejects a symbolic link body and honors --repo', () => {
  const directory = mkdtempSync(join(tmpdir(), 'create-issue-test-'));
  const bodyPath = join(directory, 'issue.md');
  const linkPath = join(directory, 'link.md');
  writeFileSync(bodyPath, 'Innhold\n');
  symlinkSync(bodyPath, linkPath);
  try {
    const link = spawnSync(
      process.execPath,
      [script, '--title', 'Testplan', '--body', linkPath, '--repo', 'navikt/x'],
      {
        encoding: 'utf8',
      },
    );
    assert.notEqual(link.status, 0);
    assert.match(link.stderr, /symbolic link/);

    const dryRun = spawnSync(
      process.execPath,
      [script, '--title', 'Testplan', '--body', bodyPath, '--repo', 'navikt/skjemabygging-formio'],
      { encoding: 'utf8' },
    );
    assert.equal(dryRun.status, 0, dryRun.stderr);
    assert.match(dryRun.stdout, /Repository: navikt\/skjemabygging-formio/);

    const invalid = spawnSync(process.execPath, [script, '--title', 'Testplan', '--body', bodyPath, '--repo', 'oops'], {
      encoding: 'utf8',
    });
    assert.notEqual(invalid.status, 0);
    assert.match(invalid.stderr, /owner\/name/);
  } finally {
    rmSync(directory, { recursive: true });
  }
});
