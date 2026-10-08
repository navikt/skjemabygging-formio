import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'vitest';

test('finds the default token file relative to the tool from another working directory', () => {
  const directory = mkdtempSync(join(tmpdir(), 'forms-api-common-test-'));
  try {
    const toolDirectory = join(directory, 'bin', 'forms-api');
    const envDirectory = join(directory, 'packages', 'bygger-backend');
    mkdirSync(toolDirectory, { recursive: true });
    mkdirSync(envDirectory, { recursive: true });
    copyFileSync(resolve(import.meta.dirname, 'common.mjs'), join(toolDirectory, 'common.mjs'));
    writeFileSync(join(envDirectory, '.env'), 'FORMS_API_ACCESS_TOKEN=fixture-token\n');
    const moduleUrl = pathToFileURL(join(toolDirectory, 'common.mjs')).href;
    const result = spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '--eval',
        `import { getToken } from '${moduleUrl}'; if (getToken() !== 'fixture-token') process.exit(1);`,
      ],
      {
        cwd: tmpdir(),
        env: { ...process.env, FORMS_API_ACCESS_TOKEN: '' },
        encoding: 'utf8',
      },
    );
    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(directory, { recursive: true });
  }
});
