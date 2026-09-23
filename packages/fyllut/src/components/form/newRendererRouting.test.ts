import { matchRoutes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { shouldUseNewRenderer } from './newRendererRouting';

describe('shouldUseNewRenderer', () => {
  it.each(['/fyllut/test-form/pdf', '/fyllut/test-form/pdf/', '/fyllut/test-form/pdf/?lang=en&sub=paper'])(
    'preserves the static PDF route for %s even with wildcard allowlisting',
    (pathname) => {
      const match = matchRoutes([{ path: '/:formPath/*' }], pathname, '/fyllut')?.[0];
      expect(match).toBeDefined();

      for (const newRenderForms of [['test-form'], ['*']]) {
        expect(
          shouldUseNewRenderer({
            formPath: match?.params.formPath,
            routePath: match?.params['*'],
            newRenderForms,
          }),
        ).toBe(false);
      }
    },
  );

  it.each([undefined, '', 'first-page', 'first-page/', 'oppsummering', 'paabegynt'])(
    'uses the new renderer for an allowlisted form on route %s',
    (routePath) => {
      expect(shouldUseNewRenderer({ formPath: 'test-form', routePath, newRenderForms: ['test-form'] })).toBe(true);
    },
  );

  it('keeps non-allowlisted forms and missing form paths on the legacy renderer', () => {
    expect(shouldUseNewRenderer({ formPath: 'test-form', newRenderForms: [] })).toBe(false);
    expect(shouldUseNewRenderer({ formPath: 'test-form', newRenderForms: ['another-form'] })).toBe(false);
    expect(shouldUseNewRenderer({ newRenderForms: ['*'] })).toBe(false);
  });
});
