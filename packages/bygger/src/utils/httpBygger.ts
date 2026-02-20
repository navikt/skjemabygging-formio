import { FetchHeader, FetchOptions, http, NavFormioJs } from '@navikt/skjemadigitalisering-shared-components';

const get = async <T>(url: string, headers?: FetchHeader, opts?: FetchOptions): Promise<T> => {
  try {
    return await http.get(url, headers, opts);
  } catch (e) {
    if (e instanceof http.UnauthenticatedError) {
      handleUnauthenticated();
    }
    throw e;
  }
};

const put = async <T>(url: string, body: object, headers?: FetchHeader, opts?: FetchOptions): Promise<T> => {
  try {
    return await http.put(url, body, headers, opts);
  } catch (e) {
    if (e instanceof http.UnauthenticatedError) {
      handleUnauthenticated();
    }
    throw e;
  }
};

const post = async <T>(url: string, body: object, headers?: FetchHeader, opts?: FetchOptions): Promise<T> => {
  try {
    return await http.post(url, body, headers, opts);
  } catch (e) {
    if (e instanceof http.UnauthenticatedError) {
      handleUnauthenticated();
    }
    throw e;
  }
};

const handleUnauthenticated = () => {
  NavFormioJs.Formio.setToken('');
};

const httpBygger = {
  ...http,
  get,
  post,
  put,
};

export default httpBygger;
