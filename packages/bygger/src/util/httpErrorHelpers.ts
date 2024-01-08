class HttpError extends Error {
  readonly httpStatus: number;

  constructor(message: string, httpStatus: number) {
    super(message);
    this.httpStatus = httpStatus;
  }
}

const parseResponseBody = async (response: Response): Promise<string> => {
  const contentType = response.headers.get('content-type');
  return contentType?.includes('application/json') ? JSON.stringify(await response.json()) : await response.text();
};

export const responseAsError = async (response: Response): Promise<HttpError> => {
  const body = await parseResponseBody(response);
  return new HttpError(body, response.status);
};
