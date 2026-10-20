import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

describe('built error contract', () => {
  it('shares ResponseError with consuming packages instead of bundling a separate constructor', () => {
    // Native imports exercise the production package boundary, without Vitest source aliases.
    execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `
          import assert from 'node:assert/strict';
          import { paramValidation } from './dist/index.js';
          import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';

          let error;
          paramValidation.formPath({}, {}, (value) => { error = value; }, '&');
          assert.ok(error instanceof ResponseError);
          assert.equal(error.errorCode, 'BAD_REQUEST');
        `,
      ],
      { cwd: fileURLToPath(new URL('../../..', import.meta.url)), encoding: 'utf8' },
    );
  });
});
