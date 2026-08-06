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
      'dev/publication-123 (abcdef1)',
    ],
    [
      'falls back directly to the forms commit when a published form lacks a publication id',
      { status: 'published', revision: 7 },
      { envSlug: 'preprod' },
      'preprod/forms@1234567 (abcdef1)',
    ],
    [
      'uses the revision instead of a stale publication id for a pending form',
      { status: 'pending', publicationId: 'stale-publication', revision: 42 },
      { envSlug: 'preprod-alt' },
      'preprod-alt/rev42 (abcdef1)',
    ],
    [
      'uses the revision for an unpublished form',
      { status: 'unpublished', revision: 3 },
      { envSlug: 'delingslenke' },
      'delingslenke/rev3 (abcdef1)',
    ],
    ['uses local when the environment slug is unset', { status: 'draft' }, {}, 'local/forms@1234567 (abcdef1)'],
    [
      'omits the environment prefix when the production slug is empty',
      { status: 'published', publicationId: 'publication-456' },
      { envSlug: '' },
      'publication-456 (abcdef1)',
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
