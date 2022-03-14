import {getSubmissionMethod} from "../util/submission";

enum MimeType {
  JSON = "application/json",
  TEXT = "text/plain",
  PDF = "application/pdf",
}

enum SubmissionType {
  DIGITAL = "DIGITAL",
  PAPER = "PAPER",
}

interface FetchHeader {
  "Content-Type"?: MimeType;
  Accept?: MimeType;
  "Fyllut-Submission-Method"?: SubmissionType;
}

class HttpError extends Error {
  status?: number;
  unauthorized?: boolean;
}

const defaultHeaders = (headers?: FetchHeader) => {
  const submissionMethod = getSubmissionMethod(window.location.search);
  return {
    "Fyllut-Submission-Method": submissionMethod || SubmissionType.PAPER,
    "Content-Type": MimeType.JSON,
    Accept: MimeType.JSON,
    ...headers
  }
}

const get = async <T>(url: string, headers?: FetchHeader): Promise<T> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: defaultHeaders(headers),
  });

  return await handleResponse(response);
};

const post = async <T>(url: string, body: object, headers?: FetchHeader): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: defaultHeaders(headers),
    body: JSON.stringify(body),
  });

  return await handleResponse(response);
};

const put = async <T>(url: string, body: object, headers?: FetchHeader): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: defaultHeaders(headers),
    body: JSON.stringify(body),
  });

  return await handleResponse(response);
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      const {pathname, search, origin} = window.location;
      const loginUrl = `${origin}/fyllut/oauth2/login?redirect=${pathname}${search}`;
      console.log(`Redirecting to ${loginUrl}`);
      window.location.replace(loginUrl);
      const err = new HttpError(response.statusText);
      err.status = response.status;
      err.unauthorized = true;
      throw err;
    }

    let errorMessage;
    if (isResponseType(response, MimeType.JSON)) {
      const responseJson = await response.json();
      if (responseJson.message) {
        errorMessage = responseJson.message;
      }
    } else if (isResponseType(response, MimeType.TEXT)) {
      errorMessage = await response.text();
    }

    throw new HttpError(errorMessage || response.statusText);
  }

  if (isResponseType(response, MimeType.JSON)) {
    return response.json();
  } else if (isResponseType(response, MimeType.TEXT)) {
    return await response.text();
  } else if (isResponseType(response, MimeType.PDF)){
    return await response.blob();
  } else {
    return response;
  }
};

const isResponseType = (response: Response, mimeType: MimeType) => {
  const contentType = response.headers.get("Content-Type");
  return contentType && contentType.includes(mimeType);
}

const http = {
  get,
  post,
  put,
  MimeType,
  HttpError,
  SubmissionType,
}

export default http;