import { mockRequest, mockResponse } from '../../test/testHelpers';
import publishResource, { isValidResource } from './publish-resource';

vi.mock('../../services/index.ts', () => {
  return { backendInstance: { publishResource: vi.fn() } };
});

describe('publish-resource', () => {
  describe('PUT handler', () => {
    it('accepts valid resource name', async () => {
      const req = mockRequest({
        params: { resourceName: 'mottaksadresser' },
        body: { token: 'test-token', resource: '{}' },
      });
      const res = mockResponse();
      const next = vi.fn();
      await publishResource(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it('rejects invalid resource name', async () => {
      const req = mockRequest({
        params: { resourceName: 'random-resource-name' },
        body: { token: 'test-token', resource: '{}' },
      });
      const res = mockResponse();
      const next = vi.fn();
      await publishResource(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('isValidResource', () => {
    it('mottaksadresser is valid', () => {
      expect(isValidResource('mottaksadresser')).toBe(true);
    });

    describe('global-translations', () => {
      it('global-translations without language code is not valid', () => {
        expect(isValidResource('global-translations')).toBe(false);
      });

      it('en is valid', () => {
        expect(isValidResource('global-translations-en')).toBe(true);
      });

      it('pl is valid', () => {
        expect(isValidResource('global-translations-pl')).toBe(true);
      });

      it('nn-NO is valid', () => {
        expect(isValidResource('global-translations-nn-NO')).toBe(true);
      });

      it('accepts only language codes as postfix', () => {
        expect(isValidResource('global-translations-randomstring')).toBe(false);
      });
    });
  });
});
