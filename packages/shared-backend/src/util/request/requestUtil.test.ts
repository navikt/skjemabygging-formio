import { Request } from 'express';
import { describe, expect, it } from 'vitest';
import requestUtil from './requestUtil';

const mockRequest = (params: Record<string, string | string[] | undefined>) =>
  ({
    params,
  }) as unknown as Request;

describe('requestUtil', () => {
  describe('getStringParam', () => {
    it('returns the value for a single string route param', () => {
      expect(requestUtil.getStringParam(mockRequest({ formPath: 'form-path' }), 'formPath')).toBe('form-path');
    });

    it('throws when the route param is missing', () => {
      expect(() => requestUtil.getStringParam(mockRequest({ formPath: undefined }), 'formPath')).toThrow(
        'Missing route param "formPath"',
      );
    });

    it('throws when the route param is an array', () => {
      expect(() => requestUtil.getStringParam(mockRequest({ formPath: ['a', 'b'] }), 'formPath')).toThrow(
        'Route param "formPath" must be a single string value',
      );
    });

    it('returns undefined when the optional route param is missing', () => {
      expect(requestUtil.getStringParam(mockRequest({ fileId: undefined }), 'fileId', true)).toBeUndefined();
    });
  });
});
