import { url, http } from "@navikt/skjemadigitalisering-shared-components";

const getDefaultHeaders = () => {
  const submissionMethod = url.getUrlParam(window.location.search, "sub");
  if (Object.values(http.SubmissionMethodType).includes(submissionMethod)) {
    return {
      "Fyllut-Submission-Method": submissionMethod,
    }
  }
  return {};
}

const get = async <T>(url: string, headers?: http.FetchHeader): Promise<T> => {
  try {
    return http.get(url, {
      ...getDefaultHeaders(),
      ...headers,
    });
  } catch (e) {
    if (e instanceof http.UnauthenticatedError) {
      redirectUnauthenticated();
    }

    throw e;
  }
};

const put = async <T>(url: string, body: object, headers?: http.FetchHeader): Promise<T> => {
  try {
    return http.put(url, body, {
      ...getDefaultHeaders(),
      ...headers,
    });
  } catch (e) {
    if (e instanceof http.UnauthenticatedError) {
      redirectUnauthenticated();
    }

    throw e;
  }
};

const post = async <T>(url: string, body: object, headers?: http.FetchHeader): Promise<T> => {
  try {
    return http.post(url, body, {
      ...getDefaultHeaders(),
      ...headers,
    });
  } catch (e) {
    if (e instanceof http.UnauthenticatedError) {
      redirectUnauthenticated();
    }

    throw e;
  }
};

const redirectUnauthenticated = () => {
  const {pathname, search, origin} = window.location;
  const loginUrl = `${origin}/fyllut/oauth2/login?redirect=${pathname}${search}`;

  window.location.replace(loginUrl);
};

const httpFyllut = {
  ...http,
  getDefaultHeaders,
  get,
  post,
  put,
}

export default httpFyllut;