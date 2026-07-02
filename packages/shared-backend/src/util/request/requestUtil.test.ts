import { Request } from 'express';
import { describe, expect, it } from 'vitest';
import requestUtil from './requestUtil';

const mockRequest = ({
  params = {},
  headers = {},
  body = {},
}: {
  params?: Record<string, string | string[] | undefined>;
  headers?: Record<string, string | string[] | undefined>;
  body?: Record<string, unknown>;
}) =>
  ({
    params,
    headers,
    body,
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

  describe('getBodyValue', () => {
    it('returns the value for an existing body field', () => {
      expect(requestUtil.getBodyValue(mockRequest({ body: { submission: 'payload' } }), 'submission')).toBe('payload');
    });

    it('throws when the body field is missing', () => {
      expect(() => requestUtil.getBodyValue(mockRequest({ body: {} }), 'submission')).toThrow(
        'Missing body value "submission"',
      );
    });

    it('returns undefined when the optional body field is missing', () => {
      expect(requestUtil.getBodyValue(mockRequest({ body: {} }), 'submission', true)).toBeUndefined();
    });
  });

  describe('header token helpers', () => {
    it('returns AzureAccessToken from headers', () => {
      expect(requestUtil.getAzureAccessToken(mockRequest({ headers: { AzureAccessToken: 'azure-token' } }))).toBe(
        'azure-token',
      );
    });

    it('returns PdfAccessToken from headers', () => {
      expect(requestUtil.getPdfAccessToken(mockRequest({ headers: { PdfAccessToken: 'pdf-token' } }))).toBe(
        'pdf-token',
      );
    });

    it('returns MergePdfToken from headers', () => {
      expect(requestUtil.getMergePdfToken(mockRequest({ headers: { MergePdfToken: 'merge-token' } }))).toBe(
        'merge-token',
      );
    });

    it('throws when PdfAccessToken header is missing', () => {
      expect(() => requestUtil.getPdfAccessToken(mockRequest({ headers: {} }))).toThrow(
        'Could not find PdfAccessToken in request headers',
      );
    });
  });
});
