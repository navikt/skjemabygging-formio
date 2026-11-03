import {
  http as baseHttp,
  FetchHeader,
  IntegrationHttp,
  IntegrationHttpHeaders,
} from '@navikt/skjemadigitalisering-shared-frontend';

// The HTTP client types its `Accept` header as its own MimeType enum, while IntegrationHttp only requires the
// header's runtime string value. Callers always pass a valid MimeType value, so this cast bridges the two types
// without changing behavior.
const toFetchHeader = (headers?: IntegrationHttpHeaders): FetchHeader | undefined => headers as FetchHeader | undefined;

const createIntegrationHttp = (http: typeof baseHttp): IntegrationHttp => ({
  get: (url, headers) => http.get(url, toFetchHeader(headers)),
  post: (url, body, headers) => http.post(url, body, toFetchHeader(headers)),
  put: (url, body, headers) => http.put(url, body, toFetchHeader(headers)),
  delete: (url, body, headers) => http.delete(url, body, toFetchHeader(headers)),
  postFile: (url, body, headers) => http.postFile(url, body, toFetchHeader(headers)),
  MimeType: http.MimeType,
  isAuthenticationError: http.isAuthenticationError,
});

export default createIntegrationHttp;
