import { FyllutHttp, FyllutHttpHeaders } from '@navikt/skjemadigitalisering-shared-frontend';
import { describe, expect, it } from 'vitest';
import createFormDataService from './createFormDataService';

describe('createFormDataService', () => {
  it('builds fyllut endpoints and keeps application context at the host boundary', async () => {
    const requests: Array<{ url: string; headers?: FyllutHttpHeaders }> = [];
    const get: FyllutHttp['get'] = async <T>(url: string, headers?: FyllutHttpHeaders) => {
      requests.push({ url, headers });
      return [] as T;
    };
    const service = createFormDataService({
      http: {
        get,
        post: async <T>() => undefined as T,
        put: async <T>() => undefined as T,
        delete: async <T>() => undefined as T,
        postFile: async <T>() => undefined as T,
        MimeType: { PDF: 'application/pdf' },
        isAuthenticationError: () => false,
      },
      backendBaseUrl: '/fyllut',
      innsendingsId: 'application-123',
    });

    await service.getActivities({ dailyTravel: true });
    await service.getRegisterData({
      sourceId: 'activities',
      queryParams: { status: 'active value' },
    });
    await service.getRegisterData({ sourceId: 'none' });
    await service.getCodeList('currencies');
    await service.getCodeList('areaCodes');
    await service.getNavUnits();

    expect(requests).toEqual([
      {
        url: '/fyllut/api/send-inn/activities?dagligreise=true',
        headers: { 'x-innsendingsid': 'application-123' },
      },
      {
        url: '/fyllut/api/register-data/activities?status=active+value',
        headers: undefined,
      },
      {
        url: '/fyllut/api/common-codes/currencies',
        headers: undefined,
      },
      {
        url: '/fyllut/api/common-codes/area-codes',
        headers: undefined,
      },
      {
        url: '/fyllut/api/enhetsliste',
        headers: undefined,
      },
    ]);
  });

  it('reuses code list requests for the lifetime of the service', async () => {
    const requests: string[] = [];
    const get: FyllutHttp['get'] = async <T>(url: string) => {
      requests.push(url);
      return [] as T;
    };
    const service = createFormDataService({
      http: {
        get,
        post: async <T>() => undefined as T,
        put: async <T>() => undefined as T,
        delete: async <T>() => undefined as T,
        postFile: async <T>() => undefined as T,
        MimeType: { PDF: 'application/pdf' },
        isAuthenticationError: () => false,
      },
      backendBaseUrl: '/fyllut',
    });

    const firstCurrencyRequest = service.getCodeList('currencies');
    const secondCurrencyRequest = service.getCodeList('currencies');
    await Promise.all([firstCurrencyRequest, secondCurrencyRequest]);
    await service.getCodeList('currencies');
    await service.getCodeList('areaCodes');

    expect(secondCurrencyRequest).toBe(firstCurrencyRequest);
    expect(requests).toEqual(['/fyllut/api/common-codes/currencies', '/fyllut/api/common-codes/area-codes']);
  });

  it('retries a code list request after failure', async () => {
    let requestCount = 0;
    const get: FyllutHttp['get'] = async <T>() => {
      requestCount += 1;
      if (requestCount === 1) {
        throw new Error('Unavailable');
      }
      return [] as T;
    };
    const service = createFormDataService({
      http: {
        get,
        post: async <T>() => undefined as T,
        put: async <T>() => undefined as T,
        delete: async <T>() => undefined as T,
        postFile: async <T>() => undefined as T,
        MimeType: { PDF: 'application/pdf' },
        isAuthenticationError: () => false,
      },
      backendBaseUrl: '/fyllut',
    });

    await expect(service.getCodeList('currencies')).rejects.toThrow('Unavailable');
    await expect(service.getCodeList('currencies')).resolves.toEqual([]);

    expect(requestCount).toBe(2);
  });
});
