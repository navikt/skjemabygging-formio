import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
import { test } from 'vitest';

const script = resolve(import.meta.dirname, 'publish-pages.mjs');

const createHarness = (pageUrl = 'https://navikt.github.io/skjemabygging-formio/manual-tests/pr-123-test') => {
  const directory = mkdtempSync(join(tmpdir(), 'publish-pages-test-'));
  const binDirectory = join(directory, 'bin');
  const artifactDirectory = join(directory, 'artifacts');
  mkdirSync(binDirectory);
  mkdirSync(artifactDirectory);
  writeFileSync(
    join(binDirectory, 'gh'),
    '#!/bin/sh\ncase "$*" in\n  "repo view --json nameWithOwner") echo \'{"nameWithOwner":"navikt/skjemabygging-formio"}\' ;;\n  "api repos/navikt/skjemabygging-formio/branches/gh-pages") echo \'{}\' ;;\n  "api repos/navikt/skjemabygging-formio/pages") echo \'{"html_url":"https://navikt.github.io/skjemabygging-formio/"}\' ;;\nesac\n',
    { mode: 0o755 },
  );
  writeFileSync(
    join(binDirectory, 'git'),
    '#!/bin/sh\nif [ "$*" = "remote get-url origin" ]; then echo "https://github.com/navikt/skjemabygging-formio.git"; fi\n',
    { mode: 0o755 },
  );
  const content = '<html>Test $&</html>';
  writeFileSync(join(artifactDirectory, 'index.html'), content);
  const slack = `Detaljerte instruksjoner: ${pageUrl}`;
  writeFileSync(join(artifactDirectory, 'slack-canvas.md'), slack);
  writeFileSync(
    join(artifactDirectory, 'manifest.json'),
    JSON.stringify({
      schemaVersion: 3,
      slug: 'pr-123-test',
      pageUrl,
      files: [
        { path: 'index.html', sha256: createHash('sha256').update(content).digest('hex') },
        { path: 'slack-canvas.md', sha256: createHash('sha256').update(slack).digest('hex') },
      ],
    }),
  );
  return {
    directory,
    run: (...args) =>
      spawnSync(process.execPath, [script, '--artifacts', artifactDirectory, ...args], {
        env: { ...process.env, PATH: `${binDirectory}${delimiter}${process.env.PATH}` },
        encoding: 'utf8',
      }),
  };
};

test('publisher derives the destination from the rendered slug', () => {
  const harness = createHarness();
  try {
    const valid = harness.run();
    assert.equal(valid.status, 0, valid.stderr);
    assert.match(
      valid.stdout,
      /Page URL: https:\/\/navikt.github.io\/skjemabygging-formio\/manual-tests\/pr-123-test\//,
    );
    const wrongDestination = harness.run('--destination', 'manual-tests/pr-123');
    assert.equal(wrongDestination.status, 1);
    assert.match(wrongDestination.stderr, /--destination is not supported/);
  } finally {
    rmSync(harness.directory, { recursive: true });
  }
});

test('publisher rejects a page URL that would make Slack links point elsewhere', () => {
  const harness = createHarness('https://navikt.github.io/skjemabygging-formio/manual-tests/pr-123');
  try {
    const result = harness.run();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /artifact page URL must match/);
  } finally {
    rmSync(harness.directory, { recursive: true });
  }
});
