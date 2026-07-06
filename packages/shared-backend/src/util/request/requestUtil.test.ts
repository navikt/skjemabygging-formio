import { Request } from 'express';
import { describe, expect, it } from 'vitest';
import requestUtil from './requestUtil';

const mockRequest = ({
  params = {},
  query = {},
}: {
  params?: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
}) =>
  ({
    params,
    query,
  }) as unknown as Request;

describe('requestUtil', () => {
  describe('getStringParam', () => {
    it('returns the value for a single string route param', () => {
      expect(requestUtil.getStringParam(mockRequest({ params: { formPath: 'form-path' } }), 'formPath')).toBe(
        'form-path',
      );
    });

    it('throws when the route param is missing', () => {
      expect(() => requestUtil.getStringParam(mockRequest({ params: { formPath: undefined } }), 'formPath')).toThrow(
        'Missing route param "formPath"',
      );
    });

    it('throws when the route param is an array', () => {
      expect(() => requestUtil.getStringParam(mockRequest({ params: { formPath: ['a', 'b'] } }), 'formPath')).toThrow(
        'Route param "formPath" must be a single string value',
      );
    });

    it('returns undefined when the optional route param is missing', () => {
      expect(
        requestUtil.getStringParam(mockRequest({ params: { fileId: undefined } }), 'fileId', true),
      ).toBeUndefined();
    });
  });

  describe('getStringQuery', () => {
    it('returns the value for a single string query param', () => {
      expect(requestUtil.getStringQuery(mockRequest({ query: { properties: 'sokerFornavn' } }), 'properties')).toBe(
        'sokerFornavn',
      );
    });

    it('throws when the query param is missing', () => {
      expect(() => requestUtil.getStringQuery(mockRequest({ query: {} }), 'properties')).toThrow(
        'Missing query param "properties"',
      );
    });

    it('returns undefined when the optional query param is missing', () => {
      expect(requestUtil.getStringQuery(mockRequest({ query: {} }), 'properties', true)).toBeUndefined();
    });

    it('returns undefined when the optional query param is not a string', () => {
      expect(
        requestUtil.getStringQuery(
          mockRequest({ query: { properties: ['sokerFornavn', 'sokerEtternavn'] } }),
          'properties',
          true,
        ),
      ).toBeUndefined();
    });
  });
});
