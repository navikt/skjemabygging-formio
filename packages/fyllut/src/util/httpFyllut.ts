import { FetchHeader, FetchOptions, http, url } from '@navikt/skjemadigitalisering-shared-components';

const getDefaultHeaders = () => {
  let submissionMethod = url.getUrlParam(window.location.search, 'sub');

  if (submissionMethod) {
    submissionMethod = submissionMethod.toUpperCase();
  }

  if (submissionMethod in http.SubmissionMethodType) {
    return {
      'Fyllut-Submission-Method': http.SubmissionMethodType[submissionMethod],
    };
  }
  return {};
};

const get = async <T>(url: string, headers?: FetchHeader, opts?: FetchOptions): Promise<T> => {
  try {
    return await http.get(
      url,
      {
        ...getDefaultHeaders(),
        ...headers,
      },
      opts,
    );
  } catch (e) {
    if (e instanceof http.UnauthenticatedError) {
      redirectUnauthenticated();
    }

    throw e;
  }
};

const put = async <T>(url: string, body: object, headers?: FetchHeader, opts?: FetchOptions): Promise<T> => {
  try {
    return await http.put(
      url,
      body,
      {
        ...getDefaultHeaders(),
        ...headers,
      },
      opts,
    );
  } catch (e) {
    if (e instanceof http.UnauthenticatedError) {
      redirectUnauthenticated();
    }

    throw e;
  }
};

const post = async <T>(url: string, body: object, headers?: FetchHeader, opts?: FetchOptions): Promise<T> => {
  try {
    return await http.post(
      url,
      body,
      {
        ...getDefaultHeaders(),
        ...headers,
      },
      opts,
    );
  } catch (e) {
    if (e instanceof http.UnauthenticatedError) {
      redirectUnauthenticated();
    }

    throw e;
  }
};

const redirectUnauthenticated = () => {
  if (process.env.NODE_ENV !== 'development') {
    const { pathname, search, origin } = window.location;

    const loginUrl = `${origin}/fyllut/oauth2/login?redirect=${pathname}${search}`;

    window.location.replace(loginUrl);
  }
};

const httpFyllut = {
  ...http,
  getDefaultHeaders,
  get,
  post,
  put,
};

export default httpFyllut;
