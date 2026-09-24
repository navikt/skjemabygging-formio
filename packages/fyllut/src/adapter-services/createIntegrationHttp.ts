import { FetchHeader, FetchOptions } from '@navikt/skjemadigitalisering-shared-components';
import { IntegrationHttp, IntegrationHttpHeaders } from '@navikt/skjemadigitalisering-shared-frontend';

interface SharedComponentsHttp {
  get: <T>(url: string, headers?: FetchHeader, opts?: FetchOptions) => Promise<T>;
  post: <T>(url: string, body: object, headers?: FetchHeader, opts?: FetchOptions) => Promise<T>;
  put: <T>(url: string, body: object, headers?: FetchHeader, opts?: FetchOptions) => Promise<T>;
  delete: <T>(url: string, body?: object, headers?: FetchHeader, opts?: FetchOptions) => Promise<T>;
  postFile: <T>(url: string, body: FormData, headers?: FetchHeader, opts?: FetchOptions) => Promise<T>;
  MimeType: { PDF: string };
  isAuthenticationError: (error: unknown) => boolean;
}

// shared-components types its `Accept` header as its own MimeType enum, while IntegrationHttp (owned by
// shared-frontend, which must stay independent of the Formio-coupled shared-components package) only
// requires the header's runtime string value. Callers always pass a valid MimeType value, so this cast
// bridges the two type systems at the fyllut boundary without changing behavior.
const toFetchHeader = (headers?: IntegrationHttpHeaders): FetchHeader | undefined => headers as FetchHeader | undefined;

const createIntegrationHttp = (http: SharedComponentsHttp): IntegrationHttp => ({
  get: (url, headers) => http.get(url, toFetchHeader(headers)),
  post: (url, body, headers) => http.post(url, body, toFetchHeader(headers)),
  put: (url, body, headers) => http.put(url, body, toFetchHeader(headers)),
  delete: (url, body, headers) => http.delete(url, body, toFetchHeader(headers)),
  postFile: (url, body, headers) => http.postFile(url, body, toFetchHeader(headers)),
  MimeType: http.MimeType,
  isAuthenticationError: http.isAuthenticationError,
});

export default createIntegrationHttp;
