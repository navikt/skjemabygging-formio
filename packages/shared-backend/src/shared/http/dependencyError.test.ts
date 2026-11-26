import { HttpResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  copyDependencyErrorFields,
  fetchFromDependency,
  getDependencyErrorFields,
  markDependencyError,
} from './dependencyError';

const url = 'https://pdf.example.test/api/pdf/123?secret=value';

describe('dependencyError', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['NETWORK_ERROR', new TypeError('fetch failed')],
    ['TIMEOUT', new DOMException('The operation was aborted due to timeout', 'TimeoutError')],
    ['TIMEOUT', Object.assign(new Error('request timed out'), { code: 'ERR_JWKS_TIMEOUT' })],
    ['ERROR_RESPONSE', new HttpResponseError('INTERNAL_SERVER_ERROR', 'Server Error')],
    ['ERROR_RESPONSE', Object.assign(new Error('Feil ved autentisering'), { http_status: 401 })],
  ])('classifies the error as %s and uses the host name as dependency', (errorType, error) => {
    expect(getDependencyErrorFields(markDependencyError(error, url))).toEqual({
      errorType,
      dependency: 'pdf.example.test',
    });
  });

  it.each([
    ['a bug in our own code', new Error('Unexpected')],
    ['an abort', new DOMException('This operation was aborted', 'AbortError')],
  ])('does not mark %s', (_case, error) => {
    expect(getDependencyErrorFields(markDependencyError(error, url))).toEqual({});
  });

  it('keeps the fields set closest to the failing call', () => {
    const error = markDependencyError(new TypeError('fetch failed'), 'https://first.example.test');

    markDependencyError(error, 'https://second.example.test');

    expect(getDependencyErrorFields(error)).toEqual({ errorType: 'NETWORK_ERROR', dependency: 'first.example.test' });
  });

  it.each([undefined, '', 'not a url'])('does not mark the error when the url is %j', (invalidUrl) => {
    expect(getDependencyErrorFields(markDependencyError(new Error('Failed'), invalidUrl))).toEqual({});
  });

  it('ignores fields outside the fixed set of error types', () => {
    expect(getDependencyErrorFields({ errorType: 'Request /x failed', dependency: 'pdf' })).toEqual({});
  });

  it('copies the fields to a wrapping error', () => {
    const wrapped = copyDependencyErrorFields(markDependencyError(new TypeError('fetch failed'), url), new Error());

    expect(getDependencyErrorFields(wrapped)).toEqual({ errorType: 'NETWORK_ERROR', dependency: 'pdf.example.test' });
  });

  it('marks errors thrown by fetch', async () => {
    const networkError = new TypeError('fetch failed');
    vi.spyOn(global, 'fetch').mockRejectedValue(networkError);

    await expect(fetchFromDependency(url)).rejects.toBe(networkError);
    expect(getDependencyErrorFields(networkError)).toEqual({
      errorType: 'NETWORK_ERROR',
      dependency: 'pdf.example.test',
    });
  });
});
