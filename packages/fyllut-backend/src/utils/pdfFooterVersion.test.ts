import { describe, expect, it } from 'vitest';
import { createPdfFooterVersion } from './pdfFooterVersion';

describe('createPdfFooterVersion', () => {
  const gitSha = '1234567890abcdef';
  const monorepoGitSha = 'abcdef1234567890';

  it.each([
    [
      'uses a publication id for a published form',
      { status: 'published', publicationId: 'publication-123', revision: 7 },
      { envSlug: 'dev' },
      'dev/abcdef1/publication-123',
    ],
    [
      'falls back directly to the forms commit when a published form lacks a publication id',
      { status: 'published', revision: 7 },
      { envSlug: 'preprod' },
      'preprod/abcdef1/forms@1234567',
    ],
    [
      'uses the revision instead of a stale publication id for a pending form',
      { status: 'pending', publicationId: 'stale-publication', revision: 42 },
      { envSlug: 'preprod-alt' },
      'preprod-alt/abcdef1/rev42',
    ],
    [
      'uses the revision for an unpublished form',
      { status: 'unpublished', revision: 3 },
      { envSlug: 'delingslenke' },
      'delingslenke/abcdef1/rev3',
    ],
    ['uses local when the environment slug is unset', { status: 'draft' }, {}, 'local/abcdef1/forms@1234567'],
    [
      'omits the environment prefix when the production slug is empty',
      { status: 'published', publicationId: 'publication-456' },
      { envSlug: '' },
      'abcdef1/publication-456',
    ],
  ] as const)('%s', (_description, form, options, expectedFooterVersion) => {
    expect(
      createPdfFooterVersion(form, {
        gitSha,
        monorepoGitSha,
        ...options,
      }),
    ).toBe(expectedFooterVersion);
  });
});
