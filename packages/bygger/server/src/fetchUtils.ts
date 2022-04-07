import fetch, { RequestInfo, RequestInit, Response } from "node-fetch";

export class HttpError extends Error {
  private response: Response;

  constructor(fetchResponse: Response) {
    super(`${fetchResponse.status} ${fetchResponse.statusText} fetching: ${fetchResponse.url}`);
    this.name = this.constructor.name;
    this.response = fetchResponse;
  }
}

export async function fetchWithErrorHandling(url: RequestInfo, options: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    console.error(`Fetch ${options.method || "GET"} ${url} failed with status: `, res.status);
    console.error(`${options.method} body`, options.body);
    throw new HttpError(res);
  }
  if (res.status === 204) {
    return {
      status: "OK",
      data: null,
    };
  }
  return {
    status: "OK",
    data: await res.json(),
  };
}

export function stringTobase64(str: string) {
  return Buffer.from(str).toString("base64");
}
