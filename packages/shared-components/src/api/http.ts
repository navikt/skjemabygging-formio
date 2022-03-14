enum MimeType {
  JSON = "application/json",
  TEXT = "text/plain",
  PDF = "application/pdf",
}

enum SubmissionMethodType {
  DIGITAL = "digital",
  PAPER = "paper",
}

interface FetchHeader {
  "Content-Type"?: MimeType;
  Accept?: MimeType;
  "Fyllut-Submission-Method"?: SubmissionMethodType;
}

class HttpError extends Error {}
class UnauthenticatedError extends Error {}

const defaultHeaders = (headers?: FetchHeader) => {
  return {
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
      throw new UnauthenticatedError(response.statusText);
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
  UnauthenticatedError,
  SubmissionMethodType,
}

export default http;